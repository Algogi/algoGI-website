import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/firebase/config';
import { FieldValue } from 'firebase-admin/firestore';
import { Segment, SegmentInput, SegmentUpdate, SegmentPreview, SegmentCriteria } from '@/lib/types/segment';
import { Contact } from '@/lib/types/contact';
import { matchesRule } from '@/lib/utils/segment-matcher';

/**
 * GET /admin/contacts/api/segments
 * List all segments
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const preview = searchParams.get('preview') === 'true';
    const criteriaJson = searchParams.get('criteria');

    // If preview mode, return preview of contacts matching criteria
    if (preview && criteriaJson) {
      try {
        const criteria: SegmentCriteria = JSON.parse(criteriaJson);
        const preview = await previewSegment(criteria);
        return NextResponse.json(preview);
      } catch (error: any) {
        return NextResponse.json(
          { error: 'Invalid criteria', details: error.message },
          { status: 400 }
        );
      }
    }

    const db = getDb();
    const snapshot = await db.collection('contact_segments').orderBy('createdAt', 'desc').get();

    const segments: Segment[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        criteria: data.criteria,
        contactCount: data.contactCount || 0,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      };
    });

    return NextResponse.json(segments);
  } catch (error: any) {
    console.error('Error fetching segments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch segments', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /admin/contacts/api/segments
 * Create a new segment
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: SegmentInput = await request.json();

    if (!body.name || !body.criteria) {
      return NextResponse.json(
        { error: 'Name and criteria are required' },
        { status: 400 }
      );
    }

    // Preview to get contact count
    const preview = await previewSegment(body.criteria);

    const db = getDb();
    const docRef = await db.collection('contact_segments').add({
      name: body.name,
      description: body.description || '',
      criteria: body.criteria,
      contactCount: preview.contactCount,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      id: docRef.id,
      ...body,
      contactCount: preview.contactCount,
    });
  } catch (error: any) {
    console.error('Error creating segment:', error);
    return NextResponse.json(
      { error: 'Failed to create segment', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /admin/contacts/api/segments
 * Update a segment
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: SegmentUpdate & { id: string } = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Segment ID is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const docRef = db.collection('contact_segments').doc(body.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Segment not found' },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (body.name) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.criteria) {
      updateData.criteria = body.criteria;
      // Recalculate contact count
      const preview = await previewSegment(body.criteria);
      updateData.contactCount = preview.contactCount;
    }

    await docRef.update(updateData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating segment:', error);
    return NextResponse.json(
      { error: 'Failed to update segment', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /admin/contacts/api/segments
 * Delete a segment
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Segment ID is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    await db.collection('contact_segments').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting segment:', error);
    return NextResponse.json(
      { error: 'Failed to delete segment', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Preview contacts matching segment criteria
 */
async function previewSegment(criteria: SegmentCriteria): Promise<SegmentPreview> {
  const db = getDb();
  const snapshot = await db.collection('contacts').get();

  let contacts: Contact[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      company: data.company,
      status: data.status || 'pending',
      source: data.source || 'manual',
      segments: data.segments || [],
      engagementScore: data.engagementScore || 0,
      lastSent: data.lastSent?.toDate?.() || null,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
      metadata: data.metadata,
    };
  });

  // Apply criteria filters
  const logic = criteria.logic || 'AND';
  const filtered = contacts.filter((contact) => {
    if (logic === 'AND') {
      return criteria.rules.every((rule) => matchesRule(contact, rule));
    } else {
      return criteria.rules.some((rule) => matchesRule(contact, rule));
    }
  });

  return {
    criteria,
    contactCount: filtered.length,
    sampleContacts: filtered.slice(0, 10).map((c) => ({
      id: c.id,
      email: c.email,
      firstName: c.firstName,
      lastName: c.lastName,
      company: c.company,
      status: c.status,
    })),
  };
}

// Segment matching logic is now centralized in lib/utils/segment-matcher.ts
// Using shared matchesRule function

