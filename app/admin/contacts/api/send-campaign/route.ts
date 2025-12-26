import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/firebase/config';
import { FieldValue } from 'firebase-admin/firestore';
import { matchesRule, getFieldValue } from '@/lib/utils/segment-matcher';
import { getBaseUrl } from '@/lib/email/base-url';
import { enqueueSendBatches } from '@/lib/campaigns/send-queue';

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

    // Filter to only verified (including generic), non-unsubscribed contacts
    const eligibleContacts = contacts.filter(
      (contact) =>
        (contact.status === 'verified' || contact.status === 'verified_generic') &&
        contact.status !== 'unsubscribed' &&
        contact.email
    );

    if (eligibleContacts.length === 0) {
      return NextResponse.json(
        { error: 'No eligible contacts found' },
        { status: 400 }
      );
    }

    // Rate limiting: enqueue paced batches instead of immediate send
    const maxPerHour = 500;
    const contactsToQueue = eligibleContacts.slice(0, maxPerHour);

    const baseUrl = getBaseUrl();
    const sliceSize = Math.max(1, Math.min(50, Math.ceil(contactsToQueue.length / 6)));
    const now = Date.now();
    const payloads = [];

    for (let i = 0; i < contactsToQueue.length; i += sliceSize) {
      payloads.push({
        campaignId: `campaign_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        contactIds: contactsToQueue.slice(i, i + sliceSize).map((c) => c.id),
        subject,
        fromEmail: from || process.env.SMTP_FROM_EMAIL || "",
        replyTo: from || process.env.SMTP_FROM_EMAIL || "",
        htmlContent: emailBody,
        textContent: emailBody,
        runAfter: new Date(now + (Math.floor(i / sliceSize) * 10 * 60 * 1000)),
      });
    }

    await enqueueSendBatches(payloads);

    return NextResponse.json({
      success: true,
      enqueued: payloads.length,
      total: eligibleContacts.length,
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

