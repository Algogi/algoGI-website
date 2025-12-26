import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { verifyEmailMXOnly, verifyEmailBatch } from '@/lib/utils/email-validation';
import { VerificationResult } from '@/lib/types/contact';
import { getDb } from '@/lib/firebase/config';
import { FieldValue } from 'firebase-admin/firestore';
import { sendVerificationReportEmail } from '@/lib/email/verification-report';

/**
 * POST /admin/contacts/api/verify
 * Verify a single email address (MX-only, no SMTP)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Use MX-only verification (no SMTP)
    const result = await verifyEmailMXOnly(email);

    const verificationResult: VerificationResult = {
      email,
      valid: result.valid,
      reason: result.reasons.join('; ') || undefined,
      mxRecords: result.details.mx ? [] : undefined,
    };

    return NextResponse.json(verificationResult);
  } catch (error: any) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { error: 'Failed to verify email', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Background processing function for bulk email verification
 * This runs asynchronously after the API returns
 */
async function processBulkVerification(
  emails: string[],
  adminEmail: string,
  jobId: string
): Promise<void> {
  try {
    const db = getDb();
    
    // Find contacts by email (Firestore 'in' query supports max 30 values)
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

    // Verify emails in batches with progress tracking
    let processedCount = 0;
    const results = await verifyEmailBatch(emails, (progress) => {
      processedCount = progress.completed;
      // Update progress on every email for better UX (especially for small batches)
      db.collection('verification_jobs').doc(jobId).update({
        processed: progress.completed,
        currentEmail: progress.current || null,
      }).catch((err) => {
        console.error('Error updating progress:', err);
      });
    });

    // Update contact statuses in Firestore
    const validEmails = new Set(
      results.valid.map((r) => r.email.toLowerCase())
    );
    const invalidEmails = new Set(
      results.invalid.map((r) => r.email.toLowerCase())
    );
    const needsVerificationEmails = new Set(
      results.needsVerification.map((r) => r.email.toLowerCase())
    );

    // Update valid contacts to 'verified'
    const validContactIds: string[] = [];
    validEmails.forEach((email) => {
      const contactId = emailToContactId.get(email);
      if (contactId) {
        validContactIds.push(contactId);
      }
    });

    // Update invalid contacts to 'invalid'
    const invalidContactIds: string[] = [];
    invalidEmails.forEach((email) => {
      const contactId = emailToContactId.get(email);
      if (contactId) {
        invalidContactIds.push(contactId);
      }
    });

    // Update needsVerification contacts to 'pending' (for manual review)
    const needsVerificationContactIds: string[] = [];
    needsVerificationEmails.forEach((email) => {
      const contactId = emailToContactId.get(email);
      if (contactId) {
        needsVerificationContactIds.push(contactId);
      }
    });

    // Batch update valid contacts
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

    // Batch update invalid contacts
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

    // Batch update needsVerification contacts to 'pending'
    for (let i = 0; i < needsVerificationContactIds.length; i += 500) {
      const batch = db.batch();
      const chunk = needsVerificationContactIds.slice(i, i + 500);
      
      chunk.forEach((contactId) => {
        const contactRef = db.collection('contacts').doc(contactId);
        batch.update(contactRef, {
          status: 'pending',
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
        valid: results.valid.length,
        invalid: results.invalid.length,
        needsVerification: results.needsVerification.length,
      },
    });

    // Send email report
    await sendVerificationReportEmail(adminEmail, {
      total: emails.length,
      valid: results.valid.length,
      invalid: results.invalid.length,
    });
  } catch (error: any) {
    console.error('Error in background verification processing:', error);
    
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
 * PUT /admin/contacts/api/verify
 * Verify multiple email addresses (bulk verification)
 * Sets status to 'verifying' immediately and processes in background
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
    const adminEmail = session.email || session.user?.email;
    
    if (!adminEmail) {
      return NextResponse.json(
        { error: 'Admin email not found in session' },
        { status: 400 }
      );
    }

    // Find contacts by email and set status to 'verifying'
    const emailToContactId = new Map<string, string>();
    const FIRESTORE_IN_LIMIT = 30;
    
    // Find all contacts first
    for (let i = 0; i < emails.length; i += FIRESTORE_IN_LIMIT) {
      const emailChunk = emails.slice(i, i + FIRESTORE_IN_LIMIT).map(e => e.toLowerCase());
      if (emailChunk.length === 0) continue;
      
      const snapshot = await db
        .collection('contacts')
        .where('email', 'in', emailChunk)
        .get();
      
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        if (data.email) {
          emailToContactId.set(data.email.toLowerCase(), doc.id);
        }
      });
    }

    // Set status to 'verifying' for all found contacts
    const contactIds: string[] = [];
    emails.forEach((email) => {
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
      total: emails.length,
      processed: 0,
      status: 'pending',
      adminEmail,
      createdAt: FieldValue.serverTimestamp(),
      startedAt: null,
      completedAt: null,
      currentEmail: null,
      results: null,
      error: null,
    });

    // Trigger background processing (non-blocking)
    // Use Promise.resolve().then() to start background work without blocking response
    Promise.resolve().then(() => {
      processBulkVerification(emails, adminEmail, jobId).catch((error) => {
        console.error('Background verification failed:', error);
      });
    });

    // Return immediately with job ID for progress tracking
    return NextResponse.json({
      success: true,
      message: 'Verification started',
      total: emails.length,
      jobId,
    });
  } catch (error: any) {
    console.error('Error starting bulk verification:', error);
    return NextResponse.json(
      { error: 'Failed to start verification', details: error.message },
      { status: 500 }
    );
  }
}

