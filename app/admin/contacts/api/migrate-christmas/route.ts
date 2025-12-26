import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/firebase/config';
import { FieldValue } from 'firebase-admin/firestore';
import { ContactInput, ContactSource } from '@/lib/types/contact';
import { ChristmasSubmission } from '@/lib/christmas/admin-types';

/**
 * POST /admin/contacts/api/migrate-christmas
 * Migrate existing Christmas quiz submissions to contacts collection
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    // Fetch all Christmas submissions
    const submissionsSnapshot = await db
      .collection('christmas_submissions')
      .get();

    const submissions: ChristmasSubmission[] = submissionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChristmasSubmission[];

    if (submissions.length === 0) {
      return NextResponse.json({
        success: true,
        summary: {
          total: 0,
          migrated: 0,
          skipped: 0,
          errors: 0,
        },
      });
    }

    // Get existing contacts to avoid duplicates
    const existingContactsSnapshot = await db
      .collection('contacts')
      .get();
    
    const existingEmails = new Set<string>();
    existingContactsSnapshot.docs.forEach((doc) => {
      const email = doc.data().email;
      if (email) {
        existingEmails.add(email.toLowerCase());
      }
    });

    let migrated = 0;
    let skipped = 0;
    let errors = 0;
    const errorDetails: string[] = [];

    // Process submissions in batches
    const batch = db.batch();
    let batchCount = 0;

    for (const submission of submissions) {
      try {
        // Check if contact already exists
        const emailLower = submission.email.toLowerCase();
        if (existingEmails.has(emailLower)) {
          skipped++;
          continue;
        }

        // Create contact from submission
        const contact: ContactInput = {
          email: emailLower,
          firstName: submission.firstName,
          lastName: submission.lastName,
          company: submission.company,
          source: 'christmas-quiz' as ContactSource,
          status: 'pending',
          engagementScore: 0,
          segments: [],
          metadata: {
            q1: submission.q1,
            q2: submission.q2,
            q3: submission.q3,
            q4: submission.q4,
            q5: submission.q5,
            companyWebsite: submission.companyWebsite,
            phone: submission.phone,
          },
        };

        // Auto-assign segments based on q1 (AI tool preference)
        if (submission.q1) {
          const q1Lower = submission.q1.toLowerCase();
          if (q1Lower.includes('chatgpt')) {
            contact.segments = contact.segments || [];
            contact.segments.push('christmas-quiz-chatgpt');
          } else if (q1Lower.includes('claude')) {
            contact.segments = contact.segments || [];
            contact.segments.push('christmas-quiz-claude');
          } else if (q1Lower.includes('gemini')) {
            contact.segments = contact.segments || [];
            contact.segments.push('christmas-quiz-gemini');
          } else if (q1Lower.includes('perplexity')) {
            contact.segments = contact.segments || [];
            contact.segments.push('christmas-quiz-perplexity');
          }
        }

        // Add to batch
        const docRef = db.collection('contacts').doc();
        batch.set(docRef, {
          ...contact,
          createdAt: submission.submittedAt || FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });

        existingEmails.add(emailLower); // Track in this batch
        migrated++;
        batchCount++;

        // Commit batch every 500 contacts (Firestore limit)
        if (batchCount >= 500) {
          await batch.commit();
          batchCount = 0;
        }
      } catch (error: any) {
        errors++;
        errorDetails.push(`Error migrating ${submission.email}: ${error.message}`);
        if (errorDetails.length > 10) {
          errorDetails.shift(); // Keep only last 10 errors
        }
      }
    }

    // Commit remaining batch
    if (batchCount > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: submissions.length,
        migrated,
        skipped,
        errors,
        errorDetails: errors > 0 ? errorDetails : undefined,
      },
    });
  } catch (error: any) {
    console.error('Error migrating Christmas submissions:', error);
    return NextResponse.json(
      { error: 'Failed to migrate submissions', details: error.message },
      { status: 500 }
    );
  }
}

