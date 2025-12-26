import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/firebase/config';
import { FieldValue } from 'firebase-admin/firestore';
import { getPlunkClient } from '@/lib/plunk/client';
import { matchesRule, getFieldValue } from '@/lib/utils/segment-matcher';
import { getBaseUrl } from '@/lib/email/base-url';

/**
 * POST /admin/contacts/api/send-campaign
 * Send a campaign to a segment or list of contacts
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { segmentId, contactIds, subject, body: emailBody, from } = body;

    if (!subject || !emailBody) {
      return NextResponse.json(
        { error: 'Subject and body are required' },
        { status: 400 }
      );
    }

    if (!segmentId && (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0)) {
      return NextResponse.json(
        { error: 'Either segmentId or contactIds array is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    let contacts: any[] = [];

    // Get contacts from segment or contact IDs
    if (segmentId) {
      // Get segment
      const segmentDoc = await db.collection('contact_segments').doc(segmentId).get();
      if (!segmentDoc.exists) {
        return NextResponse.json(
          { error: 'Segment not found' },
          { status: 404 }
        );
      }

      const segment = segmentDoc.data();
      const criteria = segment?.criteria;

      // Get all contacts and filter by criteria using shared segment matcher
      const allContactsSnapshot = await db.collection('contacts').get();
      contacts = allContactsSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((contact) => {
          // Apply segment criteria using shared matching logic
          if (criteria?.rules) {
            const logic = criteria.logic || 'AND';
            if (logic === 'AND') {
              return criteria.rules.every((rule: any) => matchesRule(contact, rule));
            } else {
              return criteria.rules.some((rule: any) => matchesRule(contact, rule));
            }
          }
          return true;
        });
    } else {
      // Get contacts by IDs
      const contactDocs = await Promise.all(
        contactIds.map((id: string) => db.collection('contacts').doc(id).get())
      );
      contacts = contactDocs
        .filter((doc) => doc.exists)
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
    }

    // Filter to only verified, non-unsubscribed contacts
    const eligibleContacts = contacts.filter(
      (contact) =>
        contact.status === 'verified' &&
        contact.status !== 'unsubscribed' &&
        contact.email
    );

    if (eligibleContacts.length === 0) {
      return NextResponse.json(
        { error: 'No eligible contacts found' },
        { status: 400 }
      );
    }

    // Rate limiting: Max 500 per hour for warm-up
    // In production, implement proper rate limiting with Redis or similar
    const maxPerHour = 500;
    const emailsToSend = eligibleContacts.slice(0, maxPerHour);

    // Generate campaign ID for tracking
    const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Get base URL for tracking links
    const baseUrl = getBaseUrl();

    // Send emails via Plunk with tracking
    const plunk = getPlunkClient();
    const recipients = emailsToSend.map((c) => c.email);
    
    // Prepare contacts data for personalization
    const contactsData = emailsToSend.map((c) => ({
      email: c.email,
      firstName: c.firstName,
      lastName: c.lastName,
      company: c.company,
    }));
    
    const sendResult = await plunk.sendCampaignWithTracking(
      recipients,
      subject,
      emailBody,
      campaignId,
      baseUrl,
      from,
      contactsData
    );

    // Update lastSent timestamps for successfully sent emails
    const now = new Date();
    const batch = db.batch();
    let updateCount = 0;

    for (const contact of emailsToSend) {
      if (sendResult.sent > 0) {
        const contactRef = db.collection('contacts').doc(contact.id);
        batch.update(contactRef, {
          lastSent: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        updateCount++;
      }
    }

    if (updateCount > 0) {
      // Commit in batches of 500 (Firestore limit)
      for (let i = 0; i < updateCount; i += 500) {
        const batchChunk = db.batch();
        const chunk = emailsToSend.slice(i, i + 500);
        chunk.forEach((contact) => {
          const contactRef = db.collection('contacts').doc(contact.id);
          batchChunk.update(contactRef, {
            lastSent: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
        });
        await batchChunk.commit();
      }
    }

    return NextResponse.json({
      success: true,
      sent: sendResult.sent,
      failed: sendResult.failed,
      total: eligibleContacts.length,
      errors: sendResult.errors,
    });
  } catch (error: any) {
    console.error('Error sending campaign:', error);
    return NextResponse.json(
      { error: 'Failed to send campaign', details: error.message },
      { status: 500 }
    );
  }
}

// Segment matching logic is now centralized in lib/utils/segment-matcher.ts
// Removed duplicate functions - using shared matchesRule and getFieldValue

