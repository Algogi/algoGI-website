import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/firebase/config';
import { FieldValue } from 'firebase-admin/firestore';
import { Segment, SegmentInput, SegmentUpdate, SegmentPreview, SegmentCriteria, CampaignStatus } from '@/lib/types/segment';
import { Contact } from '@/lib/types/contact';
import { EmailBlock } from '@/lib/types/email';
import { matchesRule, getFieldValue } from '@/lib/utils/segment-matcher';

/**
 * GET /admin/campaigns/api
 * List all campaigns (formerly segments) with filters
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
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
    const search = searchParams.get('search') || '';

    // If preview mode, return preview of contacts matching criteria
    if (preview && criteriaJson) {
      try {
        const criteria: SegmentCriteria = JSON.parse(criteriaJson);
        const preview = await previewCampaign(criteria);
        return NextResponse.json(preview);
      } catch (error: any) {
        return NextResponse.json(
          { error: 'Invalid criteria', details: error.message },
          { status: 400 }
        );
      }
    }

    const db = getDb();
    let query = db.collection('contact_segments').orderBy('createdAt', 'desc');

    if (status) {
      query = query.where('status', '==', status) as any;
    }

    const snapshot = await query.get();

    let campaigns: Segment[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        criteria: data.criteria,
        contactCount: data.contactCount || data.totalContacts || 0,
        // Campaign fields
        subject: data.subject ?? "",
        fromEmail: data.fromEmail ?? "",
        replyTo: data.replyTo ?? "",
        templateId: data.templateId,
        content: data.content,
        htmlContent: data.htmlContent,
        textContent: data.textContent,
        status: data.status || 'draft',
        isActive: data.isActive || false,
        smtpVerified: data.smtpVerified || false,
        smtpVerifiedAt: data.smtpVerifiedAt,
        totalContacts: data.totalContacts || data.contactCount || 0,
        sentContacts: data.sentContacts || 0,
        emailsPerHour: data.emailsPerHour,
        startedAt: data.startedAt,
        pausedAt: data.pausedAt,
        completedAt: data.completedAt,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        createdBy: data.createdBy,
      };
    });

    // Client-side search
    if (search) {
      campaigns = campaigns.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.subject?.toLowerCase().includes(search.toLowerCase()) ||
          c.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = campaigns.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedCampaigns = campaigns.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedCampaigns,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error: any) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /admin/campaigns/api
 * Create a new campaign (formerly segment)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      criteria,
      // Campaign fields
      subject,
      fromEmail,
      replyTo,
      templateId,
      content,
      htmlContent,
      textContent,
      status,
      contactIds,
      autoAddContacts,
    } = body;

    if (!name || !criteria) {
      return NextResponse.json(
        { error: 'Name and criteria are required' },
        { status: 400 }
      );
    }

    // Preview to get contact count
    const preview = await previewCampaign(criteria);

    const db = getDb();
    const now = new Date().toISOString();
    
    // Use eligibleCount (verified contacts) for totalContacts, as those are the ones we can send to
    const eligibleCount = (preview as any).eligibleCount || preview.contactCount;
    
    const campaignData: any = {
      name,
      description: description || undefined,
      criteria,
      contactCount: preview.contactCount, // Total matching contacts
      // Campaign fields (optional)
      subject: subject || undefined,
      fromEmail: fromEmail || undefined,
      replyTo: replyTo || undefined,
      templateId: templateId || undefined,
      content: content || undefined,
      htmlContent: htmlContent || undefined,
      textContent: textContent || undefined,
      status: status || 'draft',
      isActive: false,
      smtpVerified: false,
      totalContacts: eligibleCount, // Only verified contacts can be sent to
      sentContacts: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: session.email || '',
    };

    // Remove undefined fields (Firestore doesn't accept undefined values)
    const cleanedCampaignData = Object.fromEntries(
      Object.entries(campaignData).filter(([_, value]) => value !== undefined)
    );

    const docRef = await db.collection('contact_segments').add(cleanedCampaignData);

    return NextResponse.json({
      id: docRef.id,
      ...cleanedCampaignData,
      contactCount: preview.contactCount,
    });
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /admin/campaigns/api
 * Update a campaign (formerly segment)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: SegmentUpdate & { id: string } & {
      subject?: string;
      fromEmail?: string;
      replyTo?: string;
      templateId?: string;
      content?: EmailBlock[];
      htmlContent?: string;
      textContent?: string;
      status?: CampaignStatus;
      isActive?: boolean;
      smtpVerified?: boolean;
      smtpVerifiedAt?: string;
      totalContacts?: number;
      sentContacts?: number;
      emailsPerHour?: number;
      startedAt?: string;
      pausedAt?: string;
      completedAt?: string;
    } = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const docRef = db.collection('contact_segments').doc(body.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Campaign not found' },
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
      const preview = await previewCampaign(body.criteria);
      updateData.contactCount = preview.contactCount;
      // Use eligibleCount (verified contacts) for totalContacts
      const eligibleCount = (preview as any).eligibleCount || preview.contactCount;
      updateData.totalContacts = eligibleCount;
    }
    
    // Campaign fields
    if (body.subject !== undefined) updateData.subject = body.subject;
    if (body.fromEmail !== undefined) updateData.fromEmail = body.fromEmail;
    if (body.replyTo !== undefined) updateData.replyTo = body.replyTo;
    if (body.templateId !== undefined) updateData.templateId = body.templateId;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.htmlContent !== undefined) updateData.htmlContent = body.htmlContent;
    if (body.textContent !== undefined) updateData.textContent = body.textContent;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.smtpVerified !== undefined) updateData.smtpVerified = body.smtpVerified;
    if (body.smtpVerifiedAt !== undefined) updateData.smtpVerifiedAt = body.smtpVerifiedAt;
    if (body.totalContacts !== undefined) updateData.totalContacts = body.totalContacts;
    if (body.sentContacts !== undefined) updateData.sentContacts = body.sentContacts;
    if (body.emailsPerHour !== undefined) updateData.emailsPerHour = body.emailsPerHour;
    if (body.startedAt !== undefined) updateData.startedAt = body.startedAt;
    if (body.pausedAt !== undefined) updateData.pausedAt = body.pausedAt;
    if (body.completedAt !== undefined) updateData.completedAt = body.completedAt;

    // Remove undefined fields
    const cleanedUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    await docRef.update(cleanedUpdateData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /admin/campaigns/api
 * Delete a campaign (formerly segment)
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
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    const db = getDb();
    await db.collection('contact_segments').doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Preview contacts matching campaign criteria
 */
async function previewCampaign(criteria: SegmentCriteria): Promise<SegmentPreview> {
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

  // Filter to only eligible contacts (verified, non-unsubscribed) for sending
  const eligibleContacts = filtered.filter(
    (c) => c.status === 'verified' && c.status !== 'unsubscribed' && c.email
  );

  return {
    criteria,
    contactCount: filtered.length, // Total matching contacts
    eligibleCount: eligibleContacts.length, // Eligible for sending
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
