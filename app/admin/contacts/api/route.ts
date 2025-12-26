import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDb } from '@/lib/firebase/config';
import { FieldValue } from 'firebase-admin/firestore';
import { Contact, ContactStats, ContactInput } from '@/lib/types/contact';

/**
 * GET /admin/contacts/api
 * Fetch contacts with pagination, search, and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const source = searchParams.get('source') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const db = getDb();
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db.collection('contacts');

    // Firestore composite index issue: When filtering by status/source and ordering,
    // we need a composite index. To avoid this, we'll fetch all and filter/sort client-side
    // when filters are applied. Otherwise, use server-side ordering.
    const hasFilters = !!(status || source);

    if (hasFilters) {
      // When filters are applied, fetch all and do client-side filtering/sorting
      // to avoid composite index requirements
      query = db.collection('contacts');
    } else {
      // No filters - can use server-side ordering
      if (sortBy === 'email' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
        query = query.orderBy(sortBy, sortOrder as 'asc' | 'desc');
      } else {
        // Default sort
        query = query.orderBy('createdAt', 'desc');
      }
    }

    // Fetch all matching contacts (Firestore doesn't support full-text search)
    const snapshot = await query.get();
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

    // Client-side filtering
    if (status) {
      contacts = contacts.filter((contact) => contact.status === status);
    }
    if (source) {
      contacts = contacts.filter((contact) => contact.source === source);
    }

    // Client-side search filtering
    if (search) {
      const searchLower = search.toLowerCase();
      contacts = contacts.filter(
        (contact) =>
          contact.email.toLowerCase().includes(searchLower) ||
          contact.firstName?.toLowerCase().includes(searchLower) ||
          contact.lastName?.toLowerCase().includes(searchLower) ||
          contact.company?.toLowerCase().includes(searchLower)
      );
    }

    // Client-side sorting
    // If filters are applied, always sort client-side to avoid index issues
    // Otherwise, if sortBy is not a simple field, sort client-side
    if (hasFilters || (sortBy !== 'email' && sortBy !== 'createdAt' && sortBy !== 'updatedAt')) {
      contacts.sort((a, b) => {
        const aVal = (a as any)[sortBy] || '';
        const bVal = (b as any)[sortBy] || '';
        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
      });
    }

    const total = contacts.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedContacts = contacts.slice(startIndex, endIndex);
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      data: paginatedContacts,
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error: any) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /admin/contacts/api/stats
 * Get contact statistics
 */
export async function PUT(request: NextRequest) {
  // This endpoint is called via PUT from the frontend
  // Consider creating a separate /stats route in the future
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();
    const snapshot = await db.collection('contacts').get();

    const stats: ContactStats = {
      total: snapshot.size,
      verified: 0,
      pending: 0,
      bounced: 0,
      unsubscribed: 0,
      invalid: 0,
      verifiedPercentage: 0,
      bounceRate: 0,
      readyToSend: 0,
    };

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const status = data.status || 'pending';
      
      stats[status as keyof ContactStats]++;
      
      if (status === 'verified' && status !== 'unsubscribed') {
        stats.readyToSend++;
      }
    });

    stats.verifiedPercentage = stats.total > 0 
      ? (stats.verified / stats.total) * 100 
      : 0;
    stats.bounceRate = stats.total > 0 
      ? (stats.bounced / stats.total) * 100 
      : 0;

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching contact stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /admin/contacts/api
 * Create a single contact
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ContactInput = await request.json();

    // Validate required fields
    if (!body.email || typeof body.email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailLower = body.email.toLowerCase().trim();
    if (!emailRegex.test(emailLower)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check for duplicate email
    const existingContact = await db
      .collection('contacts')
      .where('email', '==', emailLower)
      .limit(1)
      .get();

    if (!existingContact.empty) {
      return NextResponse.json(
        { error: 'Contact with this email already exists' },
        { status: 409 }
      );
    }

    // Prepare contact data
    const contactData: ContactInput = {
      email: emailLower,
      firstName: body.firstName?.trim() || undefined,
      lastName: body.lastName?.trim() || undefined,
      company: body.company?.trim() || undefined,
      status: body.status || 'pending',
      source: body.source || 'manual',
      segments: body.segments || [],
      engagementScore: body.engagementScore || 0,
      metadata: body.metadata || undefined,
    };

    // Create contact in Firestore
    const docRef = db.collection('contacts').doc();
    await docRef.set({
      ...contactData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Fetch the created contact to return with timestamps
    const createdDoc = await docRef.get();
    const createdData = createdDoc.data();

    const createdContact: Contact = {
      id: docRef.id,
      email: createdData!.email,
      firstName: createdData!.firstName,
      lastName: createdData!.lastName,
      company: createdData!.company,
      status: createdData!.status || 'pending',
      source: createdData!.source || 'manual',
      segments: createdData!.segments || [],
      engagementScore: createdData!.engagementScore || 0,
      lastSent: createdData!.lastSent?.toDate?.() || null,
      createdAt: createdData!.createdAt?.toDate?.() || new Date(),
      updatedAt: createdData!.updatedAt?.toDate?.() || new Date(),
      metadata: createdData!.metadata,
    };

    return NextResponse.json(createdContact, { status: 201 });
  } catch (error: any) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { error: 'Failed to create contact', details: error.message },
      { status: 500 }
    );
  }
}

