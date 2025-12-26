import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/firebase/config';
import { FieldValue } from 'firebase-admin/firestore';
import { ContactStatus } from '@/lib/types/contact';

/**
 * POST /admin/contacts/api/update-status
 * Update contact status (single or bulk)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contactIds, status } = body;

    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { error: 'Contact IDs array is required' },
        { status: 400 }
      );
    }

    if (
      !status ||
      !['pending', 'verifying', 'verified', 'verified_generic', 'bounced', 'unsubscribed', 'invalid'].includes(status)
    ) {
      return NextResponse.json(
        { error: 'Valid status is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    let updated = 0;
    let errors = 0;

    // Update contacts in batches of 500
    for (let i = 0; i < contactIds.length; i += 500) {
      const batch = db.batch();
      const chunk = contactIds.slice(i, i + 500);

      for (const contactId of chunk) {
        try {
          const contactRef = db.collection('contacts').doc(contactId);
          batch.update(contactRef, {
            status,
            updatedAt: FieldValue.serverTimestamp(),
          });
        } catch (error) {
          errors++;
        }
      }

      try {
        await batch.commit();
        updated += chunk.length;
      } catch (error) {
        errors += chunk.length;
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      errors,
    });
  } catch (error: any) {
    console.error('Error updating contact status:', error);
    return NextResponse.json(
      { error: 'Failed to update contact status', details: error.message },
      { status: 500 }
    );
  }
}

