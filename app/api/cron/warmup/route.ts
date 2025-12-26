import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase/config';
import { getPlunkClient } from '@/lib/plunk/client';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * GET /api/cron/warmup
 * Iterate active warmup campaigns and send paced warmup emails
 * Configure in Vercel Cron: https://vercel.com/docs/cron-jobs
 * Vercel Cron sends GET requests with x-vercel-cron header
 */
async function handleCron(request: NextRequest) {
  try {
    // Verify Vercel cron header (sent automatically by Vercel Cron)
    const cronHeader = request.headers.get('x-vercel-cron');
    const cronSecret = process.env.CRON_SECRET;
    
    // If CRON_SECRET is set, require either Vercel's cron header or the secret
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      const isValidVercelCron = cronHeader === '1';
      const isValidSecret = authHeader === `Bearer ${cronSecret}`;
      
      if (!isValidVercelCron && !isValidSecret) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const db = getDb();

    const warmupSnap = await db
      .collection('warmup_settings')
      .where('active', '==', true)
      .get();

    if (warmupSnap.empty) {
      return NextResponse.json({ success: true, message: 'No active warmups', sent: 0 });
    }

    const plunk = getPlunkClient();
    const results: any[] = [];

    for (const warmupDoc of warmupSnap.docs) {
      const warmupId = warmupDoc.id;
      const settings = warmupDoc.data() as any;

      // Prefer configured contacts; fallback to engagement-based selection
      let contacts: any[] = [];
      if (settings?.contactIds && Array.isArray(settings.contactIds) && settings.contactIds.length > 0) {
        const contactDocs = await Promise.all(
          settings.contactIds.slice(0, 200).map((id: string) => db.collection('contacts').doc(id).get())
        );
        contacts = contactDocs
          .filter((doc) => doc.exists)
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
      } else {
        const contactsSnapshot = await db
          .collection('contacts')
          .where('status', '==', 'verified')
          .where('engagementScore', '>=', 3)
          .orderBy('engagementScore', 'desc')
          .orderBy('lastSent', 'asc')
          .limit(200)
          .get();
        contacts = contactsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      const eligibleContacts = contacts.filter(
        (contact: any) => contact.status !== 'unsubscribed' && contact.email
      );

      if (eligibleContacts.length === 0) {
        results.push({ warmupId, sent: 0, failed: 0, total: 0 });
        continue;
      }

      // Rate limit: Max 500 per hour, but we're doing 200 per day per warmup
      const maxPerBatch = 200;
      const contactsToSend = eligibleContacts.slice(0, maxPerBatch);

      const templates = [
        {
          subject: 'Checking in from AlgoGI',
          body: `
            <h1>Hello from AlgoGI</h1>
            <p>We’re keeping this inbox warm and will only send you relevant updates.</p>
            <p>If you ever want fewer emails, you can adjust preferences on our site.</p>
          `,
        },
        {
          subject: 'Thanks for staying connected',
          body: `
            <h1>Thanks for being here</h1>
            <p>We periodically check in to keep deliverability healthy.</p>
            <p>More product news and case studies are coming soon.</p>
          `,
        },
        {
          subject: 'Quick hello from AlgoGI',
          body: `
            <h1>Quick hello</h1>
            <p>Just a light touch to keep our line open.</p>
            <p>Reply anytime if there’s a topic you want us to cover.</p>
          `,
        },
      ];

      const template =
        settings?.subject && settings?.body
          ? { subject: settings.subject, body: settings.body }
          : templates[Math.floor(Math.random() * templates.length)];

      const fromEmail =
        settings?.fromEmail ||
        process.env.EMAIL_NEWSLETTER ||
        process.env.SMTP_FROM_EMAIL ||
        'newsletters@algogi.com';

      const recipients = contactsToSend.map((c: any) => c.email);

      const chunkSize = 25;
      let totalSent = 0;
      let totalFailed = 0;

      for (let i = 0; i < recipients.length; i += chunkSize) {
        const chunk = recipients.slice(i, i + chunkSize);
        const sendResult = await plunk.sendCampaign(
          chunk,
          template.subject,
          template.body,
          fromEmail
        );
        totalSent += sendResult.sent;
        totalFailed += sendResult.failed;

        const jitterMs = 500 + Math.floor(Math.random() * 2000);
        await new Promise((resolve) => setTimeout(resolve, jitterMs));
      }

      // Update lastSent timestamps
      const batch = db.batch();
      for (const contact of contactsToSend) {
        const contactRef = db.collection('contacts').doc(contact.id);
        batch.update(contactRef, {
          lastSent: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      await batch.commit();

      // Persist warmup stats
      await db.collection('warmup_stats').doc(warmupId).set(
        {
          lastRunAt: FieldValue.serverTimestamp(),
          lastRunSent: totalSent,
          lastRunFailed: totalFailed,
          lastRunTotal: contactsToSend.length,
          lastRunSubject: template.subject,
          lastRunFrom: fromEmail,
          runCount: FieldValue.increment(1),
          totalSent: FieldValue.increment(totalSent),
          totalFailed: FieldValue.increment(totalFailed),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      results.push({
        warmupId,
        sent: totalSent,
        failed: totalFailed,
        total: contactsToSend.length,
      });
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error('Error in warm-up cron:', error);
    return NextResponse.json(
      { error: 'Warm-up failed', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleCron(request);
}

export async function POST(request: NextRequest) {
  return handleCron(request);
}

