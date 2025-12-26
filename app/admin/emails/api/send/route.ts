import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";
import { getEmailTransporter, getSenderEmail } from "@/lib/email/send-email";
import { getPlunkClient } from "@/lib/plunk/client";
import { renderEmailBlocksToHTML, addTrackingPixel, htmlToText, wrapTrackingLink, addCampaignFooter, wrapAllLinksForTracking } from "@/lib/email/render-email";
import { replacePersonalizationTags, ContactData } from "@/lib/email/personalization";
import { getBaseUrl } from "@/lib/email/base-url";
import { enqueueSendBatches } from "@/lib/campaigns/send-queue";

// Helper for safe debug logging (do not remove until post-fix verification)
function logDebug(payload: Record<string, any>) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/1252d299-855b-4eb2-84f9-fd45e411a67a',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      ...payload,
      sessionId:'debug-session',
      timestamp:Date.now()
    })
  }).catch(()=>{});
  // #endregion
}

// Helper function to get field value from contact object
function getFieldValue(contact: any, field: string): any {
  const parts = field.split(".");
  let value: any = contact;
  
  for (const part of parts) {
    if (value && typeof value === "object") {
      value = value[part];
    } else {
      return undefined;
    }
  }
  
  return value;
}

// Helper function to check if contact matches a rule
function matchesRule(contact: any, rule: any): boolean {
  const fieldValue = getFieldValue(contact, rule.field);
  
  switch (rule.operator) {
    case "equals":
      return String(fieldValue) === String(rule.value);
    case "not_equals":
      return String(fieldValue) !== String(rule.value);
    case "contains":
      return String(fieldValue).toLowerCase().includes(String(rule.value).toLowerCase());
    case "not_contains":
      return !String(fieldValue).toLowerCase().includes(String(rule.value).toLowerCase());
    case "in":
      return Array.isArray(rule.value) && rule.value.includes(fieldValue);
    case "not_in":
      return Array.isArray(rule.value) && !rule.value.includes(fieldValue);
    case "greater_than":
      return Number(fieldValue) > Number(rule.value);
    case "less_than":
      return Number(fieldValue) < Number(rule.value);
    case "exists":
      return fieldValue !== undefined && fieldValue !== null;
    case "not_exists":
      return fieldValue === undefined || fieldValue === null;
    default:
      return false;
  }
}

/**
 * POST /admin/emails/api/send
 * Send email campaign immediately
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { campaignId, testEmail, segmentId, testContent, testSubject, testFromEmail } = body;

    // Handle test email with direct content (no campaign save required)
    if (testEmail && testContent) {
      const baseUrl = getBaseUrl();
      
      // Generate test subject if not provided
      const subject = testSubject || `Test Email - ${new Date().toLocaleString()}`;
      const fromEmail = testFromEmail || getSenderEmail("newsletter");
      
      // Render email HTML from blocks (with sample personalization for preview)
      const htmlContent = renderEmailBlocksToHTML(testContent, baseUrl);
      const personalizedSubject = replacePersonalizationTags(subject, { email: testEmail });
      const textContent = htmlToText(htmlContent);
      
      // Send test email
      const emailTransporter = getEmailTransporter();
      try {
        await emailTransporter.sendMail({
          from: `"AlgoGI" <${fromEmail}>`,
          to: testEmail,
          subject: personalizedSubject,
          text: textContent,
          html: htmlContent,
          replyTo: fromEmail,
        });
        
        return NextResponse.json({
          success: true,
          sent: 1,
          failed: 0,
          message: `Test email sent to ${testEmail}`,
        });
      } catch (error: any) {
        console.error("Error sending test email:", error);
        return NextResponse.json(
          { error: "Failed to send test email", details: error.message },
          { status: 500 }
        );
      }
    }

    if (!campaignId) {
      return NextResponse.json({ error: "Campaign ID is required" }, { status: 400 });
    }

    const db = getDb();
    const campaignDoc = await db.collection("contact_segments").doc(campaignId).get();

    if (!campaignDoc.exists) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const campaign = { id: campaignDoc.id, ...campaignDoc.data() } as any;

    // Get recipients
    let recipients: string[] = [];
    
    if (testEmail) {
      recipients = [testEmail];
    } else if (segmentId) {
      // Send to specific segment (overrides campaign recipient settings)
      const segmentDoc = await db.collection("contact_segments").doc(segmentId).get();
      if (!segmentDoc.exists) {
        return NextResponse.json({ error: "Segment not found" }, { status: 404 });
      }
      
      const segment = segmentDoc.data();
      const criteria = segment?.criteria;
      
      // Get all contacts and filter by segment criteria
      const allContactsSnapshot = await db.collection("contacts").get();
      const matchingContacts = allContactsSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((contact: any) => {
          if (contact.status !== "verified" || contact.status === "unsubscribed") {
            return false;
          }
          
          // Apply segment criteria
          if (criteria?.rules) {
            const logic = criteria.logic || "AND";
            if (logic === "AND") {
              return criteria.rules.every((rule: any) => matchesRule(contact, rule));
            } else {
              return criteria.rules.some((rule: any) => matchesRule(contact, rule));
            }
          }
          return true;
        });
      
      recipients = matchingContacts
        .map((contact: any) => contact.email)
        .filter((email) => email);
    } else {
      if (campaign.recipientType === "manual" && campaign.recipientEmails) {
        recipients = campaign.recipientEmails;
      } else if (campaign.recipientType === "contacts" && campaign.recipientIds) {
        const contactDocs = await Promise.all(
          campaign.recipientIds.map((id: string) => db.collection("contacts").doc(id).get())
        );
        recipients = contactDocs
          .filter((doc) => doc.exists)
          .map((doc) => doc.data())
          .filter(
            (data: any) =>
              data?.status === "verified" &&
              data?.status !== "unsubscribed" &&
              data?.email
          )
          .map((data: any) => data.email as string);
      } else if (campaign.recipientType === "segments" && campaign.recipientIds) {
        // Get contacts from segments
        for (const segId of campaign.recipientIds) {
          const segmentDoc = await db.collection("contact_segments").doc(segId).get();
          if (segmentDoc.exists) {
            const segment = segmentDoc.data();
            const criteria = segment?.criteria;
            
            const allContactsSnapshot = await db.collection("contacts").get();
            const matchingContacts = allContactsSnapshot.docs
              .map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }))
              .filter((contact: any) => {
                if (contact.status !== "verified" || contact.status === "unsubscribed") {
                  return false;
                }
                
                if (criteria?.rules) {
                  const logic = criteria.logic || "AND";
                  if (logic === "AND") {
                    return criteria.rules.every((rule: any) => matchesRule(contact, rule));
                  } else {
                    return criteria.rules.some((rule: any) => matchesRule(contact, rule));
                  }
                }
                return true;
              });
            
            const segmentEmails = matchingContacts
              .map((contact: any) => contact.email)
              .filter((email) => email);
            recipients.push(...segmentEmails);
          }
        }
      }
    }

    if (recipients.length === 0) {
      return NextResponse.json({ error: "No recipients found" }, { status: 400 });
    }

    // Render email HTML (base template - will be personalized per recipient)
    const baseUrl = getBaseUrl();
    
    // Get contacts for personalization
    const contactsMap = new Map<string, ContactData>();
    if (campaign.recipientType === "contacts" && campaign.recipientIds) {
      const contactDocs = await Promise.all(
        campaign.recipientIds.map((id: string) => db.collection("contacts").doc(id).get())
      );
      contactDocs.forEach((doc) => {
        if (doc.exists) {
          const contactData = doc.data();
          if (contactData?.email) {
            contactsMap.set(contactData.email, {
              firstName: contactData.firstName || "",
              lastName: contactData.lastName || "",
              email: contactData.email || "",
              company: contactData.company || "",
            });
          }
        }
      });
    } else if (campaign.recipientType === "segments" && campaign.recipientIds) {
      // For segments, we'll fetch contacts as we send
      // This is handled in the sending loop below
    }
    
    // Base HTML content (re-render with tags preserved when blocks exist)
    const baseHtmlContent =
      (campaign.content && Array.isArray(campaign.content) && campaign.content.length > 0
        ? renderEmailBlocksToHTML(campaign.content, baseUrl, undefined, true)
        : campaign.htmlContent || "");


    // Debug: capture inputs to Plunk personalization path (hypotheses A/B)
    logDebug({
      runId: 'pre-run',
      hypothesisId: 'A',
      location: 'app/admin/emails/api/send/route.ts:plunk-prep',
      message: 'Prepared campaign send inputs',
      data: {
        recipients: recipients.slice(0, 5), // limited for safety
        contactsDataSample: contactsMap.size > 0 ? Array.from(contactsMap.values()).slice(0, 2) : [],
        baseHtmlHasTags: /\{\{[^}]+\}\}/.test(baseHtmlContent),
        subjectHasTags: /\{\{[^}]+\}\}/.test(campaign.subject || ""),
        recipientCount: recipients.length
      }
    });

    // Collect contact IDs for queueing (verified + not unsubscribed)
    const contactIds: string[] = [];
    const FIRESTORE_IN_LIMIT = 30;
    for (let i = 0; i < recipients.length; i += FIRESTORE_IN_LIMIT) {
      const chunk = recipients.slice(i, i + FIRESTORE_IN_LIMIT);
      const snapshot = await db
        .collection("contacts")
        .where("email", "in", chunk)
        .get();

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.status === "verified" && data.status !== "unsubscribed" && data.email) {
          contactIds.push(doc.id);
        }
      });
    }

    if (contactIds.length === 0) {
      return NextResponse.json(
        { error: "No eligible contacts to enqueue" },
        { status: 400 }
      );
    }

    // Enqueue paced batches (10-minute slices)
    const sliceSize = Math.max(1, Math.min(50, Math.ceil(contactIds.length / 6)));
    const now = Date.now();
    const payloads = [];
    for (let i = 0; i < contactIds.length; i += sliceSize) {
      payloads.push({
        campaignId,
        contactIds: contactIds.slice(i, i + sliceSize),
        subject: campaign.subject || "",
        fromEmail: campaign.fromEmail || getSenderEmail("newsletter"),
        replyTo: campaign.replyTo || campaign.fromEmail || getSenderEmail("newsletter"),
        htmlContent: baseHtmlContent,
        textContent: campaign.textContent || htmlToText(baseHtmlContent),
        runAfter: new Date(now + (Math.floor(i / sliceSize) * 10 * 60 * 1000)),
      });
    }

    const enqueued = await enqueueSendBatches(payloads);

    // Mark campaign active and set next send time
    await db.collection("contact_segments").doc(campaignId).update({
      status: "active",
      isActive: true,
      nextSendTime: payloads[payloads.length - 1]?.runAfter || new Date(),
      updatedAt: FieldValue.serverTimestamp(),
      startedAt: campaign.startedAt || new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      enqueued,
      totalRecipients: recipients.length,
      eligibleContacts: contactIds.length,
    });
  } catch (error: any) {
    console.error("Error sending email campaign:", error);
    return NextResponse.json(
      { error: "Failed to send email campaign", details: error.message },
      { status: 500 }
    );
  }
}

