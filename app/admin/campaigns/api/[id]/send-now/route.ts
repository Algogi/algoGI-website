import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";
import { calculateEmailsPerHour } from "@/lib/campaigns/warmup-calculator";
import { sendCampaignBatch } from "@/lib/campaigns/campaign-sender";
import { matchesRule } from "@/lib/utils/segment-matcher";
import { renderEmailBlocksToHTML, htmlToText } from "@/lib/email/render-email";

/**
 * POST /admin/campaigns/api/[id]/send-now
 * Manually trigger sending emails for a campaign immediately
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: campaignId } = await params;
    const db = getDb();
    const campaignDoc = await db.collection("contact_segments").doc(campaignId).get();

    if (!campaignDoc.exists) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const campaign = campaignDoc.data();
    if (!campaign) {
      return NextResponse.json({ error: "Campaign data not found" }, { status: 404 });
    }

    // Validate campaign has required fields
    if (!campaign.subject || !campaign.fromEmail) {
      return NextResponse.json(
        { error: "Campaign must have subject and fromEmail to send" },
        { status: 400 }
      );
    }

    // Always re-render content with tags preserved to avoid sample pre-fill
    let htmlContent = "";
    let textContent = "";

    if (campaign.content && Array.isArray(campaign.content) && campaign.content.length > 0) {
      htmlContent = renderEmailBlocksToHTML(campaign.content, undefined, undefined, true);
      textContent = htmlToText(htmlContent);
    } else if (campaign.htmlContent) {
      htmlContent = campaign.htmlContent;
      textContent = campaign.textContent || htmlToText(htmlContent);
    } else {
      return NextResponse.json(
        { error: "Campaign must have email content to send" },
        { status: 400 }
      );
    }


    // Check if campaign is completed
    const totalContacts = campaign.totalContacts || campaign.contactCount || 0;
    const sentContacts = campaign.sentContacts || 0;

    if (sentContacts >= totalContacts) {
      return NextResponse.json({
        success: true,
        message: "Campaign already completed",
        sent: 0,
        failed: 0,
        totalSent: sentContacts,
        totalContacts,
      });
    }

    // Calculate emails to send
    // For manual send, use emailsPerHour or calculate a reasonable batch size
    let emailsToSend = campaign.emailsPerHour || 10; // Default to 10 for testing

    if (!campaign.emailsPerHour && campaign.startedAt) {
      // Calculate based on warmup logic
      emailsToSend = calculateEmailsPerHour(
        totalContacts,
        sentContacts,
        campaign.startedAt
      );
    }

    // Cap at remaining contacts
    const remainingContacts = totalContacts - sentContacts;
    emailsToSend = Math.min(emailsToSend, remainingContacts);

    // Get campaign contacts
    let contacts: any[] = [];

    if (campaign.contactIds && campaign.contactIds.length > 0) {
      // Manual selection
      const contactDocs = await Promise.all(
        campaign.contactIds
          .slice(sentContacts, sentContacts + emailsToSend)
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

      // Filter to only verified, non-unsubscribed contacts
      const eligibleContacts = matchingContacts.filter(
        (c) => c.status === "verified" && c.status !== "unsubscribed" && c.email
      );

      // Get next batch (skip already sent)
      const startIndex = sentContacts;
      contacts = eligibleContacts.slice(startIndex, startIndex + emailsToSend);
    }

    if (contacts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No eligible contacts to send",
        sent: 0,
        failed: 0,
        totalSent: sentContacts,
        totalContacts,
      });
    }

    // Send emails
    const contactIds = contacts.map((c) => c.id);
    const sendResult = await sendCampaignBatch(campaignId, contactIds, {
      subject: campaign.subject,
      fromEmail: campaign.fromEmail,
      replyTo: campaign.replyTo,
      htmlContent,
      textContent,
    });

    // Check if campaign is now complete
    const newSentCount = sentContacts + sendResult.sent;
    const isComplete = newSentCount >= totalContacts;

    if (isComplete) {
      await db.collection("contact_segments").doc(campaignId).update({
        status: "completed",
        completedAt: new Date().toISOString(),
        isActive: false,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({
      success: true,
      sent: sendResult.sent,
      failed: sendResult.failed,
      totalSent: newSentCount,
      totalContacts,
      isComplete,
      message: `Sent ${sendResult.sent} email(s). ${newSentCount}/${totalContacts} total sent.`,
    });
  } catch (error: any) {
    console.error("Error sending campaign emails:", error);
    return NextResponse.json(
      { error: "Failed to send emails", details: error.message },
      { status: 500 }
    );
  }
}

