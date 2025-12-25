import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase/config';
import { isTokenExpired } from '@/lib/christmas/badge-token';
import { getPrizeById } from '@/lib/christmas/prizes';
import { getCharacterById } from '@/lib/christmas/characters';

/**
 * Get prize badge information by token
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Check if token is expired (only in production, allow in dev for testing)
    if (process.env.NODE_ENV === 'production' && isTokenExpired()) {
      return NextResponse.json(
        { error: 'This badge link has expired. The campaign ended on January 10, 2026.' },
        { status: 410 } // Gone
      );
    }

    // Find game play by badge token
    const db = getDb();
    const gamePlays = await db
      .collection('christmas_game_plays')
      .where('badgeToken', '==', token)
      .where('campaign', '==', 'christmas_2025')
      .limit(1)
      .get();

    if (gamePlays.empty) {
      return NextResponse.json(
        { error: 'Invalid badge token' },
        { status: 404 }
      );
    }

    const playData = gamePlays.docs[0].data();

    // Check if token has expired (individual expiration check)
    // Only check in production, allow in dev for testing
    if (process.env.NODE_ENV === 'production' && playData.expiresAt) {
      let expirationDate: Date;
      // Handle Firestore Timestamp with toDate method
      if (playData.expiresAt.toDate && typeof playData.expiresAt.toDate === 'function') {
        expirationDate = playData.expiresAt.toDate();
      }
      // Handle Firestore Timestamp with seconds/nanoseconds (serialized format)
      else if (playData.expiresAt.seconds !== undefined || playData.expiresAt._seconds !== undefined) {
        const seconds = playData.expiresAt.seconds || playData.expiresAt._seconds || 0;
        const nanoseconds = playData.expiresAt.nanoseconds || playData.expiresAt._nanoseconds || 0;
        expirationDate = new Date(seconds * 1000 + nanoseconds / 1000000);
      }
      // Handle Date object or other formats
      else {
        expirationDate = playData.expiresAt instanceof Date ? playData.expiresAt : new Date(playData.expiresAt);
      }
      if (new Date() >= expirationDate) {
        return NextResponse.json(
          { error: 'This badge link has expired. The campaign ended on January 10, 2026.' },
          { status: 410 }
        );
      }
    }

    // Get prize information
    const prize = getPrizeById(playData.prizeId);
    if (!prize) {
      return NextResponse.json(
        { error: 'Prize not found' },
        { status: 404 }
      );
    }

    // Get character information
    const character = playData.characterId ? getCharacterById(playData.characterId) : null;

    return NextResponse.json({
      success: true,
      prize: {
        id: prize.id,
        name: prize.name,
        description: prize.description,
        type: prize.type,
      },
      character: character ? {
        id: character.id,
        name: character.name,
        emoji: character.emoji,
        description: character.description,
      } : null,
      gameName: playData.gameName,
      score: playData.score,
      playedAt: playData.playedAt,
    });
  } catch (error: any) {
    console.error('Error fetching badge:', error);
    return NextResponse.json(
      { error: 'Failed to fetch badge information' },
      { status: 500 }
    );
  }
}

