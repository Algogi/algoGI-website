import { getDb } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";
import { getPlunkTransporter } from "@/lib/email/send-email";
import { replacePersonalizationTags, replacePersonalizationTagsInHTML, ContactData } from "@/lib/email/personalization";
import { wrapAllLinksForTracking, addCampaignFooter } from "@/lib/email/render-email";

/**
 * Send a batch of emails for a campaign
 */
export async function sendCampaignBatch(
  campaignId: string,
  contactIds: string[],
  campaign: {
    subject: string; // From campaign (not template)
    fromEmail: string; // From campaign (not template)
    replyTo?: string; // From campaign (not template)
    htmlContent: string; // From template or campaign content
    textContent: string; // From template or campaign content
  }
): Promise<{ sent: number; failed: number }> {
  const db = getDb();
  
  // Get contacts
  const contactDocs = await Promise.all(
    contactIds.map((id) => db.collection("contacts").doc(id).get())
  );

  const contacts = contactDocs
    .filter((doc) => doc.exists)
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    .filter((c: any) => c.status === "verified" && c.email);

  if (contacts.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const recipients = contacts.map((c: any) => c.email as string);
  let sent = 0;
  let failed = 0;

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  // Initialize or update analytics
  const analyticsDoc = await db.collection("email_analytics").doc(campaignId).get();
  
  if (!analyticsDoc.exists) {
    // Initialize analytics
    const analyticsData = {
      campaignId,
      totalSent: 0,
      totalDelivered: 0,
      totalOpened: 0,
      uniqueOpened: 0,
      totalClicked: 0,
      uniqueClicked: 0,
      totalBounced: 0,
      totalUnsubscribed: 0,
      openRate: 0,
      clickRate: 0,
      bounceRate: 0,
      recipientAnalytics: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.collection("email_analytics").doc(campaignId).set(analyticsData);
  }

  try {
    if (!process.env.PLUNK_API_KEY) {
      throw new Error("PLUNK_API_KEY is not configured for Plunk SMTP");
    }

    const transporter = getPlunkTransporter();

    // Send via Plunk SMTP (no fallback)
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      const contact = contacts[i];

      try {
        const contactAny: any = contact;
        const contactData: ContactData = {
          firstName: contactAny.firstName || "",
          lastName: contactAny.lastName || "",
          email: contactAny.email || recipient,
          company: contactAny.company || "",
        };
        const personalizedSubject = replacePersonalizationTags(campaign.subject, contactData);

        let personalizedHtml = replacePersonalizationTagsInHTML(campaign.htmlContent, contactData);

        const recipientId = recipient.replace(/[^a-zA-Z0-9]/g, "_");

        let htmlWithTracking = wrapAllLinksForTracking(
          personalizedHtml,
          campaignId,
          recipientId,
          baseUrl
        );

        htmlWithTracking = addCampaignFooter(
          htmlWithTracking,
          recipient,
          campaignId,
          recipientId,
          baseUrl
        );

        await transporter.sendMail({
          from: `"AlgoGI" <${campaign.fromEmail}>`,
          to: recipient,
          replyTo: campaign.replyTo || campaign.fromEmail,
          subject: personalizedSubject,
          html: htmlWithTracking,
          text: campaign.textContent,
        });

        sent++;
      } catch (error) {
        console.error(`Failed to send email to ${recipient}:`, error);
        failed++;
      }
    }

    // Update analytics with sent emails
    if (sent > 0) {
      const currentAnalytics = await db.collection("email_analytics").doc(campaignId).get();
      const analytics = currentAnalytics.data();
      const recipientAnalytics = analytics?.recipientAnalytics || [];
      
      // Add new recipients to analytics
      const newRecipients = contacts.slice(0, sent).map((contact: any) => ({
        email: contact.email,
        opened: false,
        clicked: false,
        clickedLinks: [],
        bounced: false,
        unsubscribed: false,
      }));
      
      // Merge with existing (avoid duplicates)
      const existingEmails = new Set(recipientAnalytics.map((r: any) => r.email));
      const uniqueNewRecipients = newRecipients.filter((r) => !existingEmails.has(r.email));
      const updatedRecipientAnalytics = [...recipientAnalytics, ...uniqueNewRecipients];
      
      const totalSent = updatedRecipientAnalytics.length;
      
      await db.collection("email_analytics").doc(campaignId).update({
        recipientAnalytics: updatedRecipientAnalytics,
        totalSent,
        totalDelivered: totalSent, // Assume delivered if sent successfully
        updatedAt: new Date().toISOString(),
      });
    }

    // Update contact lastSent timestamps
    const batch = db.batch();
    let updateCount = 0;

    for (const contact of contacts.slice(0, sent)) {
      const contactRef = db.collection("contacts").doc(contact.id);
      batch.update(contactRef, {
        lastSent: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      updateCount++;

      if (updateCount >= 500) {
        await batch.commit();
        updateCount = 0;
      }
    }

    if (updateCount > 0) {
      await batch.commit();
    }

    // Update campaign sentContacts count
    await db.collection("contact_segments").doc(campaignId).update({
      sentContacts: FieldValue.increment(sent),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { sent, failed };
  } catch (error: any) {
    console.error("Error sending campaign batch:", error);
    throw error;
  }
}

