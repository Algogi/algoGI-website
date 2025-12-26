import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/firebase/config';
import { FieldValue } from 'firebase-admin/firestore';
import { ContactInput, ContactSource } from '@/lib/types/contact';

/**
 * POST /admin/contacts/api/import
 * Import contacts from CSV/JSON
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contacts: contactsData, source: sourceData } = body;

    if (!contactsData) {
      return NextResponse.json(
        { error: 'Contacts data is required' },
        { status: 400 }
      );
    }

    let contacts: ContactInput[];
    const source = (sourceData as ContactSource) || 'csv-import';

    // Handle both array and JSON string
    if (typeof contactsData === 'string') {
      try {
        contacts = JSON.parse(contactsData);
      } catch (error: any) {
        return NextResponse.json(
          { error: 'Invalid contacts data', details: error.message },
          { status: 400 }
        );
      }
    } else if (Array.isArray(contactsData)) {
      contacts = contactsData;
    } else {
      return NextResponse.json(
        { error: 'Contacts must be an array' },
        { status: 400 }
      );
    }

    if (contacts.length === 0) {
      return NextResponse.json(
        { error: 'No contacts to import' },
        { status: 400 }
      );
    }

    const db = getDb();
    const BATCH_SIZE = 10000; // Process in batches of 10,000
    const totalContacts = contacts.length;
    let totalAdded = 0;
    let totalSkipped = 0;
    let totalErrors = 0;
    const errorDetails: string[] = [];

    // Process contacts in batches
    for (let batchStart = 0; batchStart < totalContacts; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, totalContacts);
      const batchContacts = contacts.slice(batchStart, batchEnd);
      
      // Get existing emails for this batch
      // Firestore 'IN' query supports max 30 values
      const existingEmails = new Set<string>();
      const emailChunks: string[][] = [];
      const FIRESTORE_IN_LIMIT = 30;
      
      for (let i = 0; i < batchContacts.length; i += FIRESTORE_IN_LIMIT) {
        const chunk = batchContacts.slice(i, i + FIRESTORE_IN_LIMIT)
          .map((c) => c.email?.toLowerCase())
          .filter(Boolean) as string[];
        if (chunk.length > 0) {
          emailChunks.push(chunk);
        }
      }

      for (const emailChunk of emailChunks) {
        if (emailChunk.length === 0) continue;
        const snapshot = await db
          .collection('contacts')
          .where('email', 'in', emailChunk)
          .get();
        
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (data.email) {
            existingEmails.add(data.email.toLowerCase());
          }
        });
      }

      // Process contacts in this batch
      const contactsToAdd: ContactInput[] = [];
      const batchDuplicateCheck = new Set<string>();

      for (const contact of batchContacts) {
        // Validate email
        if (!contact.email || typeof contact.email !== 'string') {
          totalErrors++;
          if (errorDetails.length < 10) {
            errorDetails.push(`Invalid email: ${JSON.stringify(contact)}`);
          }
          continue;
        }

        const emailLower = contact.email.toLowerCase().trim();
        
        // Check for duplicates in current batch
        if (batchDuplicateCheck.has(emailLower)) {
          totalSkipped++;
          continue;
        }
        batchDuplicateCheck.add(emailLower);

        // Check for existing contacts
        if (existingEmails.has(emailLower)) {
          totalSkipped++;
          continue;
        }

        // Validate email format (basic)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailLower)) {
          totalErrors++;
          if (errorDetails.length < 10) {
            errorDetails.push(`Invalid email format: ${emailLower}`);
          }
          continue;
        }

        contactsToAdd.push({
          ...contact,
          email: emailLower,
          source: contact.source || source,
          status: contact.status || 'pending',
          engagementScore: contact.engagementScore || 0,
          segments: contact.segments || [],
        });
      }

      // Batch write to Firestore (500 per Firestore batch)
      for (let i = 0; i < contactsToAdd.length; i += 500) {
        const chunk = contactsToAdd.slice(i, i + 500);
        const firestoreBatch = db.batch();
        
        for (const contact of chunk) {
          const docRef = db.collection('contacts').doc();
          firestoreBatch.set(docRef, {
            ...contact,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
          totalAdded++;
        }

        // Commit Firestore batch
        await firestoreBatch.commit();
      }

      // Add newly added emails to existing set for next batch duplicate checking
      contactsToAdd.forEach((c) => {
        existingEmails.add(c.email.toLowerCase());
      });
    }

    return NextResponse.json({
      success: true,
      summary: {
        added: totalAdded,
        skipped: totalSkipped,
        errors: totalErrors,
        total: totalContacts,
        errorDetails: totalErrors > 0 ? errorDetails : undefined,
      },
    });
  } catch (error: any) {
    console.error('Error importing contacts:', error);
    return NextResponse.json(
      { error: 'Failed to import contacts', details: error.message },
      { status: 500 }
    );
  }
}

