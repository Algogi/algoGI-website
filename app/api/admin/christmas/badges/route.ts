import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase/config';
import { BadgeInfo } from '@/lib/christmas/admin-types';
import { getPrizeDisplayName } from '@/lib/christmas/admin-utils';
import { getPrizeById } from '@/lib/christmas/prizes';
import { isTokenExpired } from '@/lib/christmas/badge-token';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const token = searchParams.get('token');
    
    // Fetch all game plays (which contain badge tokens)
    // Note: Removed orderBy to avoid Firestore index requirement - sorting is done client-side
    let query = db
      .collection('christmas_game_plays')
      .where('campaign', '==', 'christmas_2025');

    // If searching by token, filter by badgeToken
    if (token) {
      query = db
        .collection('christmas_game_plays')
        .where('campaign', '==', 'christmas_2025')
        .where('badgeToken', '==', token);
    }

    const gamePlaysSnapshot = await query.get();
    
    // Sort by playedAt descending client-side
    const sortedDocs = gamePlaysSnapshot.docs.sort((a, b) => {
      const aDate = a.data().playedAt?.toDate ? a.data().playedAt.toDate().getTime() : 0;
      const bDate = b.data().playedAt?.toDate ? b.data().playedAt.toDate().getTime() : 0;
      return bDate - aDate;
    });

    const badges: BadgeInfo[] = sortedDocs
      .map((doc) => {
        const data = doc.data();
        const origin = request.nextUrl.origin || 'http://localhost:3000';
        const badgeUrl = data.badgeToken ? `${origin}/christmas/badge/${data.badgeToken}` : '';
        
        // Check if token is expired
        // Badge is valid only if both global campaign and individual badge haven't expired
        let isValid = true;
        
        // Check global campaign expiration (only in production, allow in dev for testing)
        if (process.env.NODE_ENV === 'production' && isTokenExpired()) {
          isValid = false;
        }
        
        // Check individual badge expiration
        if (isValid && data.expiresAt) {
          let expirationDate: Date;
          // Handle Firestore Timestamp with toDate method
          if (data.expiresAt.toDate && typeof data.expiresAt.toDate === 'function') {
            expirationDate = data.expiresAt.toDate();
          }
          // Handle Firestore Timestamp with seconds/nanoseconds (serialized format)
          else if (data.expiresAt.seconds !== undefined || data.expiresAt._seconds !== undefined) {
            const seconds = data.expiresAt.seconds || data.expiresAt._seconds || 0;
            const nanoseconds = data.expiresAt.nanoseconds || data.expiresAt._nanoseconds || 0;
            expirationDate = new Date(seconds * 1000 + nanoseconds / 1000000);
          }
          // Handle Date object or other formats
          else {
            expirationDate = data.expiresAt instanceof Date ? data.expiresAt : new Date(data.expiresAt);
          }
          isValid = new Date() < expirationDate;
        }

        return {
          token: data.badgeToken || '',
          email: data.email || '',
          prizeId: data.prizeId || '',
          prizeName: getPrizeDisplayName(data.prizeId),
          characterId: data.characterId || undefined,
          createdAt: data.playedAt,
          expiresAt: data.expiresAt,
          badgeUrl,
          viewCount: 0, // Could be tracked separately if needed
          isValid,
        };
      })
      .filter((badge) => {
        // Client-side search filtering
        if (search && !token) {
          const searchLower = search.toLowerCase();
          return (
            badge.token.toLowerCase().includes(searchLower) ||
            badge.email.toLowerCase().includes(searchLower) ||
            badge.prizeName.toLowerCase().includes(searchLower)
          );
        }
        return true;
      });

    return NextResponse.json(badges);
  } catch (error: any) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
}

