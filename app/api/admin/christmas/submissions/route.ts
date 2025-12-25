import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase/config';
import { ChristmasSubmission, PaginatedResponse, FilterOptions } from '@/lib/christmas/admin-types';
import { filterSubmissions, paginate } from '@/lib/christmas/admin-utils';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
    const sortBy = searchParams.get('sortBy') || 'submittedAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    
    // Build filters
    const filters: Record<string, any> = {};
    const company = searchParams.get('company');
    if (company) filters.company = company;
    
    const filterOptions: FilterOptions = {
      search,
      page,
      pageSize,
      sortBy,
      sortOrder,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    };
    
    // Fetch all form submissions from the Christmas submissions collection
    const submissionsSnapshot = await db
      .collection('christmas_submissions')
      .orderBy('submittedAt', 'desc')
      .get();

    const allSubmissions: ChristmasSubmission[] = submissionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChristmasSubmission[];

    // Apply client-side filtering and pagination
    // Note: For large datasets, consider implementing server-side filtering with Firestore queries
    const filtered = filterSubmissions(allSubmissions, filterOptions);
    const total = filtered.length;
    const paginated = paginate(filtered, page, pageSize);
    const totalPages = Math.ceil(total / pageSize);

    const response: PaginatedResponse<ChristmasSubmission> = {
      data: paginated,
      total,
      page,
      pageSize,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching form submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch form submissions' },
      { status: 500 }
    );
  }
}

