import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/firebase/config';
import { SegmentCriteria } from '@/lib/types/segment';
import { Contact } from '@/lib/types/contact';
import { matchesRule } from '@/lib/utils/segment-matcher';

/**
 * GET /admin/contacts/api/segments/[segmentId]/contacts
 * Get all contacts for a segment with verification breakdown
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ segmentId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { segmentId } = await params;

    if (!segmentId) {
      return NextResponse.json(
        { error: 'Segment ID is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    
    // Get segment
    const segmentDoc = await db.collection('contact_segments').doc(segmentId).get();
    if (!segmentDoc.exists) {
      return NextResponse.json(
        { error: 'Segment not found' },
        { status: 404 }
      );
    }

    const segmentData = segmentDoc.data();
    const criteria: SegmentCriteria = segmentData?.criteria;

    if (!criteria) {
      return NextResponse.json(
        { error: 'Segment criteria not found' },
        { status: 400 }
      );
    }

    // Get all contacts
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

    // Calculate verification breakdown
    const verificationStats = {
      total: filtered.length,
      verified: filtered.filter((c) => c.status === 'verified').length,
      pending: filtered.filter((c) => c.status === 'pending').length,
      verifying: filtered.filter((c) => c.status === 'verifying').length,
      invalid: filtered.filter((c) => c.status === 'invalid').length,
      bounced: filtered.filter((c) => c.status === 'bounced').length,
      unsubscribed: filtered.filter((c) => c.status === 'unsubscribed').length,
    };

    // Get unverified contacts (for bulk verify) - exclude verified, unsubscribed, and verifying
    const unverifiedContacts = filtered.filter(
      (c) => c.status !== 'verified' && c.status !== 'unsubscribed' && c.status !== 'verifying'
    );

    return NextResponse.json({
      contacts: filtered,
      verificationStats,
      unverifiedContacts: unverifiedContacts.map((c) => ({
        id: c.id,
        email: c.email,
        status: c.status,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching segment contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch segment contacts', details: error.message },
      { status: 500 }
    );
  }
}

// Segment matching logic is now centralized in lib/utils/segment-matcher.ts
// Using shared matchesRule function

