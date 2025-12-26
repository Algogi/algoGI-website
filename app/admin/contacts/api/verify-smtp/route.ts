import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { verifySMTP } from '@/lib/utils/email-validation';
import { getDb } from '@/lib/firebase/config';
import { FieldValue } from 'firebase-admin/firestore';
import { sendVerificationReportEmail } from '@/lib/email/verification-report';

/**
 * Background processing function for bulk SMTP re-verification
 */
async function processBulkSMTPVerification(
  emails: string[],
  adminEmail: string,
  jobId: string
): Promise<void> {
  try {
    const db = getDb();
    
    // Find contacts by email
    const emailToContactId = new Map<string, string>();
    const FIRESTORE_IN_LIMIT = 30;
    
    for (let i = 0; i < emails.length; i += FIRESTORE_IN_LIMIT) {
      const emailChunk = emails.slice(i, i + FIRESTORE_IN_LIMIT).map(e => e.toLowerCase());
      if (emailChunk.length === 0) continue;
      
      const snapshot = await db
        .collection('contacts')
        .where('email', 'in', emailChunk)
        .where('status', '==', 'verified') // Only re-verify verified contacts
        .get();
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.email) {
          emailToContactId.set(data.email.toLowerCase(), doc.id);
        }
      });
    }

    // Update job status to processing
    await db.collection('verification_jobs').doc(jobId).update({
      status: 'processing',
      startedAt: FieldValue.serverTimestamp(),
    });

    // SMTP verify emails with progress tracking
    const smtpTimeout = parseInt(process.env.SMTP_VERIFICATION_TIMEOUT || '10000', 10);
    const validEmails: string[] = [];
    const invalidEmails: string[] = [];
    const rateLimitDelay = parseInt(process.env.SMTP_RATE_LIMIT_DELAY || '2000', 10);

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      
      // Update progress every email
      db.collection('verification_jobs').doc(jobId).update({
        processed: i + 1,
        currentEmail: email,
      }).catch((err) => {
        console.error('Error updating progress:', err);
      });

      try {
        const smtpResult = await verifySMTP(email, smtpTimeout);
        
        if (smtpResult.valid) {
          validEmails.push(email.toLowerCase());
        } else {
          invalidEmails.push(email.toLowerCase());
        }
      } catch (error: any) {
        console.error(`SMTP verification error for ${email}:`, error);
        invalidEmails.push(email.toLowerCase());
      }

      // Rate limiting between SMTP checks
      if (i < emails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, rateLimitDelay));
      }
    }

    // Update contact statuses
    const validContactIds: string[] = [];
    validEmails.forEach((email) => {
      const contactId = emailToContactId.get(email);
      if (contactId) {
        validContactIds.push(contactId);
      }
    });

    const invalidContactIds: string[] = [];
    invalidEmails.forEach((email) => {
      const contactId = emailToContactId.get(email);
      if (contactId) {
        invalidContactIds.push(contactId);
      }
    });

    // Batch update valid contacts (keep as verified)
    for (let i = 0; i < validContactIds.length; i += 500) {
      const batch = db.batch();
      const chunk = validContactIds.slice(i, i + 500);
      
      chunk.forEach((contactId) => {
        const contactRef = db.collection('contacts').doc(contactId);
        batch.update(contactRef, {
          status: 'verified',
          updatedAt: FieldValue.serverTimestamp(),
        });
      });
      
      await batch.commit();
    }

    // Batch update invalid contacts (change to invalid)
    for (let i = 0; i < invalidContactIds.length; i += 500) {
      const batch = db.batch();
      const chunk = invalidContactIds.slice(i, i + 500);
      
      chunk.forEach((contactId) => {
        const contactRef = db.collection('contacts').doc(contactId);
        batch.update(contactRef, {
          status: 'invalid',
          updatedAt: FieldValue.serverTimestamp(),
        });
      });
      
      await batch.commit();
    }

    // Update job status to completed
    await db.collection('verification_jobs').doc(jobId).update({
      status: 'completed',
      completedAt: FieldValue.serverTimestamp(),
      processed: emails.length,
      results: {
        valid: validEmails.length,
        invalid: invalidEmails.length,
      },
    });

    // Send email report
    await sendVerificationReportEmail(adminEmail, {
      total: emails.length,
      valid: validEmails.length,
      invalid: invalidEmails.length,
    });
  } catch (error: any) {
    console.error('Error in background SMTP verification processing:', error);
    
    // Update job status to failed
    try {
      const db = getDb();
      await db.collection('verification_jobs').doc(jobId).update({
        status: 'failed',
        completedAt: FieldValue.serverTimestamp(),
        error: error.message || 'Unknown error',
      });
    } catch (updateError) {
      console.error('Error updating job status:', updateError);
    }
    
    // Try to send error notification email
    try {
      await sendVerificationReportEmail(adminEmail, {
        total: emails.length,
        valid: 0,
        invalid: emails.length,
      });
    } catch (emailError) {
      console.error('Failed to send error notification email:', emailError);
    }
  }
}

/**
 * POST /admin/contacts/api/verify-smtp
 * SMTP re-verify a single verified contact
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email, contactId } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!contactId || typeof contactId !== 'string') {
      return NextResponse.json(
        { error: 'Contact ID is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const contactDoc = await db.collection('contacts').doc(contactId).get();
    
    if (!contactDoc.exists) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 }
      );
    }

    const contactData = contactDoc.data();
    if (contactData?.status !== 'verified' && contactData?.status !== 'verified_generic') {
      return NextResponse.json(
        { error: 'Contact must be verified to re-verify with SMTP' },
        { status: 400 }
      );
    }

    // Perform SMTP verification
    const smtpTimeout = parseInt(process.env.SMTP_VERIFICATION_TIMEOUT || '10000', 10);
    const smtpResult = await verifySMTP(email, smtpTimeout);

    // Update contact status based on SMTP result
    const newStatus = smtpResult.valid ? (contactData?.status === 'verified_generic' ? 'verified_generic' : 'verified') : 'invalid';
    await db.collection('contacts').doc(contactId).update({
      status: newStatus,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      valid: smtpResult.valid,
      reason: smtpResult.reason,
      status: newStatus,
    });
  } catch (error: any) {
    console.error('Error SMTP re-verifying email:', error);
    return NextResponse.json(
      { error: 'Failed to re-verify email', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /admin/contacts/api/verify-smtp
 * SMTP re-verify multiple verified contacts (bulk)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { emails } = body;

    if (!Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'Emails array is required' },
        { status: 400 }
      );
    }

    if (emails.length > 1000) {
      return NextResponse.json(
        { error: 'Maximum 1000 emails per batch' },
        { status: 400 }
      );
    }

    const db = getDb();
    const adminEmail = (session as any)?.email || (session as any)?.user?.email;
    
    if (!adminEmail) {
      return NextResponse.json(
        { error: 'Admin email not found in session' },
        { status: 400 }
      );
    }

    // Find verified contacts by email
    const emailToContactId = new Map<string, string>();
    const FIRESTORE_IN_LIMIT = 30;
    
    for (let i = 0; i < emails.length; i += FIRESTORE_IN_LIMIT) {
      const emailChunk = emails.slice(i, i + FIRESTORE_IN_LIMIT).map(e => e.toLowerCase());
      if (emailChunk.length === 0) continue;
      
      const snapshot = await db
        .collection('contacts')
        .where('email', 'in', emailChunk)
        .get();
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.email && (data.status === 'verified' || data.status === 'verified_generic')) {
          emailToContactId.set(data.email.toLowerCase(), doc.id);
        }
      });
    }

    // Filter to only verified contacts
    const verifiedEmails = emails.filter(email => 
      emailToContactId.has(email.toLowerCase())
    );

    if (verifiedEmails.length === 0) {
      return NextResponse.json(
        { error: 'No verified contacts found to re-verify' },
        { status: 400 }
      );
    }

    // Set status to 'verifying' for all found contacts
    const contactIds: string[] = [];
    verifiedEmails.forEach((email) => {
      const contactId = emailToContactId.get(email.toLowerCase());
      if (contactId) {
        contactIds.push(contactId);
      }
    });

    // Update statuses in batches of 500
    for (let i = 0; i < contactIds.length; i += 500) {
      const batch = db.batch();
      const chunk = contactIds.slice(i, i + 500);
      
      chunk.forEach((contactId) => {
        const contactRef = db.collection('contacts').doc(contactId);
        batch.update(contactRef, {
          status: 'verifying',
          updatedAt: FieldValue.serverTimestamp(),
        });
      });
      
      await batch.commit();
    }

    // Create verification job for progress tracking
    const jobRef = db.collection('verification_jobs').doc();
    const jobId = jobRef.id;
    await jobRef.set({
      id: jobId,
      total: verifiedEmails.length,
      processed: 0,
      status: 'pending',
      adminEmail,
      jobType: 'smtp_bulk',
      source: 'verified_contacts',
      campaignId: null,
      createdAt: FieldValue.serverTimestamp(),
      startedAt: null,
      completedAt: null,
      currentEmail: null,
      results: null,
      error: null,
    });

    // Trigger background processing (non-blocking)
    Promise.resolve().then(() => {
      processBulkSMTPVerification(verifiedEmails, adminEmail, jobId).catch((error) => {
        console.error('Background SMTP verification failed:', error);
      });
    });

    // Return immediately with job ID for progress tracking
    return NextResponse.json({
      success: true,
      message: 'SMTP re-verification started',
      total: verifiedEmails.length,
      jobId,
    });
  } catch (error: any) {
    console.error('Error starting SMTP re-verification:', error);
    return NextResponse.json(
      { error: 'Failed to start SMTP re-verification', details: error.message },
      { status: 500 }
    );
  }
}

