import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase/config';
import { PrizeStatistics, PrizeWinner } from '@/lib/christmas/admin-types';
import { calculatePercentage, getPrizeDisplayName, getGameDisplayName } from '@/lib/christmas/admin-utils';
import { PRIZES } from '@/lib/christmas/prizes';
import { ChristmasGamePlay } from '@/lib/christmas/admin-types';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    
    // Fetch all game plays
    const gamePlaysSnapshot = await db
      .collection('christmas_game_plays')
      .where('campaign', '==', 'christmas_2025')
      .get();

    const gamePlays: ChristmasGamePlay[] = gamePlaysSnapshot.docs.map((doc) => {
      const data = doc.data();
      const origin = request.nextUrl.origin || 'http://localhost:3000';
      const badgeUrl = data.badgeToken ? `${origin}/christmas/badge/${data.badgeToken}` : undefined;
      
      return {
        id: doc.id,
        ...data,
        badgeUrl,
      } as ChristmasGamePlay;
    });

    // Group game plays by prize
    const prizeGroups: Record<string, ChristmasGamePlay[]> = {};
    gamePlays.forEach((play) => {
      if (!prizeGroups[play.prizeId]) {
        prizeGroups[play.prizeId] = [];
      }
      prizeGroups[play.prizeId].push(play);
    });

    // Build prize statistics
    const statistics: PrizeStatistics[] = PRIZES.map((prize) => {
      const winners: PrizeWinner[] = (prizeGroups[prize.id] || []).map((play) => ({
        id: play.id,
        email: play.email,
        gameName: play.gameName,
        playedAt: play.playedAt,
        badgeToken: play.badgeToken,
        redeemed: play.redeemed || false,
        fulfilled: play.fulfilled || false,
      }));

      const winCount = winners.length;
      const totalPlays = gamePlays.length;

      return {
        prizeId: prize.id,
        prizeName: prize.name,
        prizeType: prize.type,
        description: prize.description,
        probability: prize.probability,
        winCount,
        winPercentage: totalPlays > 0 ? calculatePercentage(winCount, totalPlays) : 0,
        expectedPercentage: prize.probability * 100,
        winners,
      };
    });

    return NextResponse.json(statistics);
  } catch (error: any) {
    console.error('Error fetching prize statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prize statistics' },
      { status: 500 }
    );
  }
}


