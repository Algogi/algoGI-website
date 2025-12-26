import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";
import { getEmailTransporter, getSenderEmail } from "@/lib/email/send-email";
import { getPlunkClient } from "@/lib/plunk/client";
import { renderEmailBlocksToHTML, addTrackingPixel, htmlToText, wrapTrackingLink, addCampaignFooter, wrapAllLinksForTracking } from "@/lib/email/render-email";
import { replacePersonalizationTags, ContactData } from "@/lib/email/personalization";

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
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : "http://localhost:3000";
      
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
        .filter((contact) => {
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
        .map((contact) => contact.email)
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
          .map((doc) => doc.data()?.email)
          .filter((email) => email && doc.data()?.status === "verified" && doc.data()?.status !== "unsubscribed");
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
              .filter((contact) => {
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
              .map((contact) => contact.email)
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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : "http://localhost:3000";
    
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

    // Update campaign status
    await db.collection("contact_segments").doc(campaignId).update({
      status: "sending",
      updatedAt: FieldValue.serverTimestamp(),
    });

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
      recipientAnalytics: recipients.map((email) => ({
        email,
        opened: false,
        clicked: false,
        clickedLinks: [],
        bounced: false,
        unsubscribed: false,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection("email_analytics").doc(campaignId).set(analyticsData);

    // Send emails
    const fromEmail = campaign.fromEmail || getSenderEmail("newsletter");
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Require Plunk for all marketing campaigns
    if (!process.env.PLUNK_API_KEY) {
      throw new Error("PLUNK_API_KEY is required for campaign sending");
    }

    const plunk = getPlunkClient();
    
    // Build contacts data array for personalization
    // If contactsMap is empty, fetch contact data for all recipients
    const contactsData: Array<{ email: string; firstName?: string; lastName?: string; company?: string }> = [];
    
    for (const recipient of recipients) {
      let contactData: ContactData | undefined = contactsMap.get(recipient);
      if (!contactData) {
        // Try to fetch from database
        const contactQuery = await db.collection("contacts").where("email", "==", recipient).limit(1).get();
        if (!contactQuery.empty) {
          const contactDoc = contactQuery.docs[0].data();
          contactData = {
            firstName: contactDoc.firstName || "",
            lastName: contactDoc.lastName || "",
            email: contactDoc.email || "",
            company: contactDoc.company || "",
          };
        } else {
          // Use email as fallback
          contactData = { email: recipient };
        }
      }
      
      contactsData.push({
        email: contactData.email || recipient,
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        company: contactData.company,
      });
    }
    
    // Use Plunk with personalization support
    const sendResult = await plunk.sendCampaignWithTracking(
      recipients,
      campaign.subject || "",
      baseHtmlContent,
      campaignId,
      baseUrl,
      fromEmail,
      contactsData
    );
    
    results.sent = sendResult.sent;
    results.failed = sendResult.failed;
    results.errors = sendResult.errors || [];

    // Update campaign and analytics
    await db.collection("contact_segments").doc(campaignId).update({
      status: "sent",
      sentAt: new Date().toISOString(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await db.collection("email_analytics").doc(campaignId).update({
      totalSent: results.sent,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors,
    });
  } catch (error: any) {
    console.error("Error sending email campaign:", error);
    return NextResponse.json(
      { error: "Failed to send email campaign", details: error.message },
      { status: 500 }
    );
  }
}

