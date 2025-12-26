import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/firebase/config';
import { FieldValue } from 'firebase-admin/firestore';
import { Segment } from '@/lib/types/segment';

/**
 * GET /admin/contacts/api/segments/[segmentId]/emails
 * Get all campaigns attached to a segment
 * NOTE: In the unified system, campaigns (contact_segments) can reference other segments
 * This endpoint returns campaigns that are associated with the given segment
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
    
    // Get the segment to verify it exists
    const segmentDoc = await db.collection('contact_segments').doc(segmentId).get();
    if (!segmentDoc.exists) {
      return NextResponse.json(
        { error: 'Segment not found' },
        { status: 404 }
      );
    }

    // Get campaigns associated with this segment
    const segmentData = segmentDoc.data();
    const associatedCampaignIds = segmentData?.associatedCampaignIds || [];

    if (associatedCampaignIds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch all associated campaigns
    const campaignDocs = await Promise.all(
      associatedCampaignIds.map((id: string) => db.collection('contact_segments').doc(id).get())
    );

    const campaigns: Segment[] = campaignDocs
      .filter((doc) => doc.exists)
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          criteria: data.criteria,
          contactCount: data.contactCount || 0,
          subject: data.subject,
          fromEmail: data.fromEmail,
          replyTo: data.replyTo,
          templateId: data.templateId,
          content: data.content,
          htmlContent: data.htmlContent,
          textContent: data.textContent,
          status: data.status || 'draft',
          isActive: data.isActive || false,
          totalContacts: data.totalContacts || data.contactCount || 0,
          sentContacts: data.sentContacts || 0,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          createdBy: data.createdBy,
          // Legacy fields for backward compatibility
          scheduledAt: data.scheduledAt,
          sentAt: data.sentAt,
        };
      });

    return NextResponse.json(campaigns);
  } catch (error: any) {
    console.error('Error fetching segment emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch segment emails', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /admin/contacts/api/segments/[segmentId]/emails
 * Attach a campaign to a segment
 * NOTE: In the unified system, this creates an association between a segment and a campaign
 * The campaign can then be sent to the segment's contacts
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ segmentId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { segmentId } = await params;
    const body = await request.json();
    const { emailCampaignId } = body;

    if (!emailCampaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    
    // Verify segment exists
    const segmentDoc = await db.collection('contact_segments').doc(segmentId).get();
    if (!segmentDoc.exists) {
      return NextResponse.json(
        { error: 'Segment not found' },
        { status: 404 }
      );
    }

    // Verify campaign exists
    const campaignDoc = await db.collection('contact_segments').doc(emailCampaignId).get();
    if (!campaignDoc.exists) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // In the unified system, we can store associations in the segment document
    // Add the campaign ID to the segment's associated campaigns array
    const segmentData = segmentDoc.data();
    const associatedCampaigns = segmentData?.associatedCampaignIds || [];
    
    if (associatedCampaigns.includes(emailCampaignId)) {
      return NextResponse.json(
        { error: 'Campaign already attached to this segment' },
        { status: 400 }
      );
    }

    await db.collection('contact_segments').doc(segmentId).update({
      associatedCampaignIds: FieldValue.arrayUnion(emailCampaignId),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Return the campaign data
    const campaignData = campaignDoc.data();
    return NextResponse.json({
      id: campaignDoc.id,
      ...campaignData,
    });
  } catch (error: any) {
    console.error('Error attaching campaign to segment:', error);
    return NextResponse.json(
      { error: 'Failed to attach campaign to segment', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /admin/contacts/api/segments/[segmentId]/emails
 * Detach a campaign from a segment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ segmentId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { segmentId } = await params;
    const { searchParams } = new URL(request.url);
    const emailCampaignId = searchParams.get('emailCampaignId');

    if (!emailCampaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    
    // Verify segment exists
    const segmentDoc = await db.collection('contact_segments').doc(segmentId).get();
    if (!segmentDoc.exists) {
      return NextResponse.json(
        { error: 'Segment not found' },
        { status: 404 }
      );
    }

    // Remove the campaign ID from the segment's associated campaigns array
    await db.collection('contact_segments').doc(segmentId).update({
      associatedCampaignIds: FieldValue.arrayRemove(emailCampaignId),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error detaching campaign from segment:', error);
    return NextResponse.json(
      { error: 'Failed to detach campaign from segment', details: error.message },
      { status: 500 }
    );
  }
}

