import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase/config';
import { ChristmasGamePlay, PaginatedResponse, FilterOptions } from '@/lib/christmas/admin-types';
import { filterGamePlays, paginate, getPrizeDisplayName, getGameDisplayName } from '@/lib/christmas/admin-utils';
import { getPrizeById } from '@/lib/christmas/prizes';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
    const sortBy = searchParams.get('sortBy') || 'playedAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    
    // Build filters
    const filters: Record<string, any> = {};
    const gameName = searchParams.get('gameName');
    if (gameName) filters.gameName = gameName;
    const prizeId = searchParams.get('prizeId');
    if (prizeId) filters.prizeId = prizeId;
    
    const filterOptions: FilterOptions = {
      search,
      page,
      pageSize,
      sortBy,
      sortOrder,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
    };
    
    // Fetch all game plays from the Christmas campaign
    // Note: Removed orderBy to avoid Firestore index requirement - sorting is done client-side
    const gamePlaysSnapshot = await db
      .collection('christmas_game_plays')
      .where('campaign', '==', 'christmas_2025')
      .get();

    const allGamePlays: ChristmasGamePlay[] = gamePlaysSnapshot.docs.map((doc) => {
      const data = doc.data();
      const prize = getPrizeById(data.prizeId);
      const origin = request.nextUrl.origin || 'http://localhost:3000';
      const badgeUrl = data.badgeToken ? `${origin}/christmas/badge/${data.badgeToken}` : undefined;
      
      return {
        id: doc.id,
        ...data,
        prize,
        badgeUrl,
      } as ChristmasGamePlay;
    });

    // Apply client-side filtering and pagination
    // Note: For large datasets, consider implementing server-side filtering with Firestore queries
    const filtered = filterGamePlays(allGamePlays, filterOptions);
    const total = filtered.length;
    const paginated = paginate(filtered, page, pageSize);
    const totalPages = Math.ceil(total / pageSize);

    const response: PaginatedResponse<ChristmasGamePlay> = {
      data: paginated,
      total,
      page,
      pageSize,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching game plays:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game plays' },
      { status: 500 }
    );
  }
}

