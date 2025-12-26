import { NextRequest, NextResponse } from "next/server";
import { sendCampaignBatch } from "@/lib/campaigns/campaign-sender";
import {
  claimDueQueueItems,
  markQueueItemCompleted,
  markQueueItemFailed,
} from "@/lib/campaigns/send-queue";
import { enqueueSendBatch } from "@/lib/campaigns/send-queue";
import { checkDomainLimits, incrementDomainUsage } from "@/lib/campaigns/domain-limits";
import { getDb } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";

const MAX_ITEMS_PER_RUN = 10;
const DOMAIN_BACKOFF_MINUTES = 30;

export async function POST(request: NextRequest) {
  try {
    // Optional cron auth
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await claimDueQueueItems(MAX_ITEMS_PER_RUN);
    if (items.length === 0) {
      return NextResponse.json({ success: true, processed: 0 });
    }

    const db = getDb();
    const results = [];

    for (const item of items) {
      try {
        // Fetch contacts to compute domain limits
        const contactDocs = await Promise.all(
          item.contactIds.map((id) => db.collection("contacts").doc(id).get())
        );

        const contacts = contactDocs
          .filter((doc) => doc.exists)
          .map((doc) => ({ id: doc.id, ...(doc.data() as any) }))
          .filter((c) => c.email);

        // Build domain counts
        const domainCounts = new Map<string, number>();
        contacts.forEach((c) => {
          const domain = String(c.email).split("@")[1]?.toLowerCase();
          if (!domain) return;
          domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
        });

        const { allowed, blocked } = await checkDomainLimits(domainCounts);

        const allowedUsage = new Map<string, number>();
        const toSendIds: string[] = [];
        const delayedIds: string[] = [];

        contacts.forEach((c) => {
          const domain = String(c.email).split("@")[1]?.toLowerCase();
          if (!domain) return;
          const maxForDomain = allowed.get(domain) || 0;
          const used = allowedUsage.get(domain) || 0;
          if (used < maxForDomain) {
            toSendIds.push(c.id);
            allowedUsage.set(domain, used + 1);
          } else {
            delayedIds.push(c.id);
          }
        });

        // If nothing can be sent now, reschedule this item
        if (toSendIds.length === 0) {
          const runAfter = new Date(Date.now() + DOMAIN_BACKOFF_MINUTES * 60 * 1000);
          await markQueueItemFailed(
            item.id,
            item.attempts || 1,
            "Domain caps reached, rescheduling"
          );
          await db.collection("send_queue").doc(item.id).update({
            status: "pending",
            runAfter,
            error: "Deferred due to domain caps",
            updatedAt: FieldValue.serverTimestamp(),
          });
          results.push({ id: item.id, deferred: true, reason: "domain caps" });
          continue;
        }

        // If some contacts are delayed, enqueue them separately
        if (delayedIds.length > 0) {
          await enqueueSendBatch({
            campaignId: item.campaignId,
            contactIds: delayedIds,
            subject: item.subject,
            fromEmail: item.fromEmail,
            replyTo: item.replyTo,
            htmlContent: item.htmlContent,
            textContent: item.textContent,
            runAfter: new Date(Date.now() + DOMAIN_BACKOFF_MINUTES * 60 * 1000),
          });
        }

        const result = await sendCampaignBatch(item.campaignId, toSendIds, {
          subject: item.subject,
          fromEmail: item.fromEmail,
          replyTo: item.replyTo,
          htmlContent: item.htmlContent,
          textContent: item.textContent,
        });

        await markQueueItemCompleted(item.id, result);

        // Update domain usage counters for the sent slice
        if (toSendIds.length > 0) {
          const sentDomains = new Map<string, number>();
          contacts
            .filter((c) => toSendIds.includes(c.id))
            .forEach((c) => {
              const domain = String(c.email).split("@")[1]?.toLowerCase();
              if (!domain) return;
              sentDomains.set(domain, (sentDomains.get(domain) || 0) + 1);
            });
          await incrementDomainUsage(sentDomains);
        }

        // Pause campaign if failure ratio is too high
        if (result.sent > 0 && result.failed / result.sent > 0.2) {
          await db.collection("contact_segments").doc(item.campaignId).update({
            status: "paused",
            isActive: false,
            pauseReason: "High failure rate",
            updatedAt: FieldValue.serverTimestamp(),
          });
        }

        results.push({
          id: item.id,
          sent: result.sent,
          failed: result.failed,
          deferred: delayedIds.length,
          blockedDomains: Array.from(blocked.keys()),
        });
      } catch (error: any) {
        await markQueueItemFailed(item.id, item.attempts || 1, error.message || "Unknown error");
        results.push({ id: item.id, error: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      processed: items.length,
      results,
    });
  } catch (error: any) {
    console.error("Error processing send queue:", error);
    return NextResponse.json(
      { error: "Send queue processing failed", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}

