import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase/config';
import { getPlunkClient } from '@/lib/plunk/client';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * POST /api/cron/warmup
 * Daily warm-up scheduler - sends to most engaged contacts
 * Configure in Vercel Cron: https://vercel.com/docs/cron-jobs
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret if configured
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = getDb();

    // Get most engaged contacts (engagementScore >= 3, verified, not unsubscribed)
    const contactsSnapshot = await db
      .collection('contacts')
      .where('status', '==', 'verified')
      .where('engagementScore', '>=', 3)
      .orderBy('engagementScore', 'desc')
      .orderBy('lastSent', 'asc') // Prioritize contacts who haven't been sent to recently
      .limit(200) // Start with 200 per day
      .get();

    if (contactsSnapshot.empty) {
      return NextResponse.json({
        success: true,
        message: 'No contacts to warm up',
        sent: 0,
      });
    }

    const contacts = contactsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter out unsubscribed (double check)
    const eligibleContacts = contacts.filter(
      (contact: any) => contact.status !== 'unsubscribed' && contact.email
    );

    if (eligibleContacts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No eligible contacts',
        sent: 0,
      });
    }

    // Rate limit: Max 500 per hour, but we're doing 200 per day for warm-up
    const maxPerBatch = 200;
    const contactsToSend = eligibleContacts.slice(0, maxPerBatch);

    // Send warm-up email (you can customize this)
    const plunk = getPlunkClient();
    const subject = 'Warm-up email from AlgoGI';
    const body = `
      <h1>Hello from AlgoGI</h1>
      <p>This is a warm-up email to maintain sender reputation.</p>
      <p>Thank you for being part of our community!</p>
    `;

    const recipients = contactsToSend.map((c: any) => c.email);
    const sendResult = await plunk.sendCampaign(
      recipients,
      subject,
      body
    );

    // Update lastSent timestamps
    const batch = db.batch();
    let updateCount = 0;

    for (const contact of contactsToSend) {
      const contactRef = db.collection('contacts').doc(contact.id);
      batch.update(contactRef, {
        lastSent: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      updateCount++;
    }

    // Commit in batches of 500
    if (updateCount > 0) {
      for (let i = 0; i < updateCount; i += 500) {
        const batchChunk = db.batch();
        const chunk = contactsToSend.slice(i, i + 500);
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
      total: contactsToSend.length,
    });
  } catch (error: any) {
    console.error('Error in warm-up cron:', error);
    return NextResponse.json(
      { error: 'Warm-up failed', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/warmup
 * Manual trigger for testing (admin only)
 */
export async function GET(request: NextRequest) {
  // For testing purposes, you can call this endpoint manually
  // In production, use POST with cron secret
  return POST(request);
}

