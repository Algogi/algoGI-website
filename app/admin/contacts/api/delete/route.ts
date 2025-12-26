import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/firebase/config';

/**
 * POST /admin/contacts/api/delete
 * Bulk delete contacts by ID
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contactIds } = body as { contactIds?: string[] };

    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { error: 'contactIds array is required' },
        { status: 400 }
      );
    }

    if (contactIds.length > 1000) {
      return NextResponse.json(
        { error: 'Maximum 1000 contacts per delete request' },
        { status: 400 }
      );
    }

    const db = getDb();
    let deleted = 0;
    let errors = 0;

    for (let i = 0; i < contactIds.length; i += 500) {
      const batch = db.batch();
      const chunk = contactIds.slice(i, i + 500);

      chunk.forEach((contactId) => {
        const ref = db.collection('contacts').doc(contactId);
        batch.delete(ref);
      });

      try {
        await batch.commit();
        deleted += chunk.length;
      } catch (error) {
        console.error('Error deleting contacts chunk:', error);
        errors += chunk.length;
      }
    }

    return NextResponse.json({
      success: errors === 0,
      deleted,
      errors,
    });
  } catch (error: any) {
    console.error('Error deleting contacts:', error);
    return NextResponse.json(
      { error: 'Failed to delete contacts', details: error.message },
      { status: 500 }
    );
  }
}


