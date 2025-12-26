import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";
import { calculateEmailsPerHour } from "@/lib/campaigns/warmup-calculator";
import { matchesRule } from "@/lib/utils/segment-matcher";
import { enqueueSendBatches } from "@/lib/campaigns/send-queue";

/**
 * POST /api/cron/campaign-warmup
 * Hourly cron job that sends emails for active campaigns with warming up
 * Configure in Vercel Cron: https://vercel.com/docs/cron-jobs
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret if configured
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();

    // Get all active campaigns
    const activeCampaignsSnapshot = await db
      .collection("contact_segments")
      .where("status", "==", "active")
      .where("isActive", "==", true)
      .get();

    if (activeCampaignsSnapshot.empty) {
      return NextResponse.json({
        success: true,
        message: "No active campaigns",
        processed: 0,
      });
    }

    const results = [];

    for (const campaignDoc of activeCampaignsSnapshot.docs) {
      const campaign = campaignDoc.data();
      const campaignId = campaignDoc.id;

      try {
        // Check if campaign is completed
        if (campaign.sentContacts >= campaign.totalContacts) {
          await db.collection("contact_segments").doc(campaignId).update({
            status: "completed",
            completedAt: new Date().toISOString(),
            isActive: false,
            updatedAt: FieldValue.serverTimestamp(),
          });
          continue;
        }

        // Pull recent analytics to make the rate engagement-aware
        const analyticsDoc = await db.collection("email_analytics").doc(campaignId).get();
        const analyticsData = analyticsDoc.exists ? analyticsDoc.data() : null;
        const emailsPerHour =
          campaign.emailsPerHour ||
          calculateEmailsPerHour(
            campaign.totalContacts,
            campaign.sentContacts || 0,
            campaign.startedAt || new Date().toISOString(),
            undefined,
            {
              openRate: analyticsData?.openRate ?? 0,
              bounceRate: analyticsData?.bounceRate ?? 0,
            }
          );

        // Get campaign contacts
        let contacts: any[] = [];

        if (campaign.contactIds && campaign.contactIds.length > 0) {
          // Manual selection
          const contactDocs = await Promise.all(
            campaign.contactIds
              .slice(campaign.sentContacts || 0, (campaign.sentContacts || 0) + emailsPerHour)
              .map((contactId: string) => db.collection("contacts").doc(contactId).get())
          );
          contacts = contactDocs
            .filter((doc) => doc.exists)
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
        } else if (campaign.criteria) {
          // Rule-based selection
          const allContactsSnapshot = await db.collection("contacts").get();
          const allContacts = allContactsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const logic = campaign.criteria.logic || "AND";
          const matchingContacts = allContacts.filter((contact) => {
            if (logic === "AND") {
              return campaign.criteria.rules.every((rule: any) =>
                matchesRule(contact, rule)
              );
            } else {
              return campaign.criteria.rules.some((rule: any) =>
                matchesRule(contact, rule)
              );
            }
          });

          // Filter to only verified contacts with an email
          const eligibleContacts = matchingContacts.filter(
            (c: any) => c.status === "verified" && c.email
          );

          // Get next batch (skip already sent)
          const startIndex = campaign.sentContacts || 0;
          contacts = eligibleContacts.slice(startIndex, startIndex + emailsPerHour);
        }

        if (contacts.length === 0) {
          // No more contacts to send
          await db.collection("contact_segments").doc(campaignId).update({
            status: "completed",
            completedAt: new Date().toISOString(),
            isActive: false,
            updatedAt: FieldValue.serverTimestamp(),
          });
          continue;
        }

        // Enqueue emails into paced batches (~10-minute slices)
        const contactIds = contacts.map((c) => c.id);
        const sliceSize = Math.max(1, Math.min(50, Math.ceil(emailsPerHour / 6)));
        const now = Date.now();
        const payloads = [];

        for (let i = 0; i < contactIds.length; i += sliceSize) {
          const runAfter = new Date(now + (Math.floor(i / sliceSize) * 10 * 60 * 1000));
          payloads.push({
            campaignId,
            contactIds: contactIds.slice(i, i + sliceSize),
            subject: campaign.subject,
            fromEmail: campaign.fromEmail,
            replyTo: campaign.replyTo,
            htmlContent: campaign.htmlContent || "",
            textContent: campaign.textContent || "",
            runAfter,
          });
        }

        const enqueued = await enqueueSendBatches(payloads);

        // Update nextSendTime so UI can show pacing
        const lastRunAfter = payloads.length > 0 ? payloads[payloads.length - 1].runAfter : null;
        await db.collection("contact_segments").doc(campaignId).update({
          nextSendTime: lastRunAfter,
          updatedAt: FieldValue.serverTimestamp(),
        });

        results.push({
          campaignId,
          campaignName: campaign.name,
          enqueued,
          emailsPerHour,
        });
      } catch (error: any) {
        console.error(`Error processing campaign ${campaignId}:`, error);
        results.push({
          campaignId,
          campaignName: campaign.name,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: activeCampaignsSnapshot.size,
      results,
    });
  } catch (error: any) {
    console.error("Error in campaign warmup cron:", error);
    return NextResponse.json(
      { error: "Warmup failed", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/campaign-warmup
 * Manual trigger for testing (admin only)
 */
export async function GET(request: NextRequest) {
  // For testing purposes, you can call this endpoint manually
  // In production, use POST with cron secret
  return POST(request);
}

