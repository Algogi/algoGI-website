import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase/config';
import { DashboardStats, PrizeDistribution, GamePopularity } from '@/lib/christmas/admin-types';
import { calculatePercentage, calculateConversionRate, getGameDisplayName, getPrizeDisplayName } from '@/lib/christmas/admin-utils';
import { PRIZES } from '@/lib/christmas/prizes';
import { getPrizeById } from '@/lib/christmas/prizes';
import { ChristmasSubmission, ChristmasGamePlay } from '@/lib/christmas/admin-types';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    
    // Fetch all submissions from Christmas submissions collection
    const submissionsSnapshot = await db
      .collection('christmas_submissions')
      .orderBy('submittedAt', 'desc')
      .limit(10)
      .get();

    const recentSubmissions: ChristmasSubmission[] = submissionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChristmasSubmission[];

    // Fetch all game plays
    // Note: Removed orderBy to avoid Firestore index requirement - sorting is done client-side
    const gamePlaysSnapshot = await db
      .collection('christmas_game_plays')
      .where('campaign', '==', 'christmas_2025')
      .limit(100) // Get more than needed, then sort client-side
      .get();

    const allGamePlaysSnapshot = await db
      .collection('christmas_game_plays')
      .where('campaign', '==', 'christmas_2025')
      .get();

    // Sort by playedAt descending and take top 10
    const sortedGamePlays = gamePlaysSnapshot.docs
      .sort((a, b) => {
        const getTimestamp = (data: any): number => {
          const playedAt = data.playedAt;
          if (!playedAt) return 0;
          if (playedAt.toDate && typeof playedAt.toDate === 'function') {
            return playedAt.toDate().getTime();
          }
          if (playedAt.seconds !== undefined || playedAt._seconds !== undefined) {
            const seconds = playedAt.seconds || playedAt._seconds || 0;
            const nanoseconds = playedAt.nanoseconds || playedAt._nanoseconds || 0;
            return seconds * 1000 + nanoseconds / 1000000;
          }
          if (playedAt instanceof Date) {
            return playedAt.getTime();
          }
          const date = new Date(playedAt);
          return isNaN(date.getTime()) ? 0 : date.getTime();
        };
        const aDate = getTimestamp(a.data());
        const bDate = getTimestamp(b.data());
        return bDate - aDate;
      })
      .slice(0, 10);

    const recentGamePlays: ChristmasGamePlay[] = sortedGamePlays.map((doc) => {
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

    const allGamePlays: ChristmasGamePlay[] = allGamePlaysSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChristmasGamePlay[];

    // Get total counts
    let totalSubmissions = recentSubmissions.length;
    if (recentSubmissions.length === 10) {
      // If we got 10, there might be more - get full count
      const allSubmissionsSnapshot = await db
        .collection('christmas_submissions')
        .get();
      totalSubmissions = allSubmissionsSnapshot.size;
    }
    
    const totalGamePlays = allGamePlays.length;
    const totalPrizesWon = totalGamePlays; // All game plays result in prizes
    const conversionRate = calculateConversionRate(totalSubmissions, totalGamePlays);

    // Prize distribution
    const prizeCounts: Record<string, number> = {};
    allGamePlays.forEach((play) => {
      prizeCounts[play.prizeId] = (prizeCounts[play.prizeId] || 0) + 1;
    });

    const prizeDistribution: PrizeDistribution[] = PRIZES.map((prize) => {
      const count = prizeCounts[prize.id] || 0;
      return {
        prizeId: prize.id,
        prizeName: prize.name,
        prizeType: prize.type,
        count,
        percentage: totalGamePlays > 0 ? calculatePercentage(count, totalGamePlays) : 0,
        expectedPercentage: prize.probability * 100,
      };
    });

    // Game popularity
    const gameCounts: Record<string, { count: number; totalScore: number; scoreCount: number }> = {};
    allGamePlays.forEach((play) => {
      if (!gameCounts[play.gameName]) {
        gameCounts[play.gameName] = { count: 0, totalScore: 0, scoreCount: 0 };
      }
      gameCounts[play.gameName].count++;
      if (play.score !== null && play.score !== undefined) {
        gameCounts[play.gameName].totalScore += play.score;
        gameCounts[play.gameName].scoreCount++;
      }
    });

    const topGames: GamePopularity[] = Object.entries(gameCounts)
      .map(([gameName, stats]) => ({
        gameName,
        gameDisplayName: getGameDisplayName(gameName),
        playCount: stats.count,
        averageScore: stats.scoreCount > 0 ? Math.round((stats.totalScore / stats.scoreCount) * 100) / 100 : undefined,
        prizeWinRate: 100,
      }))
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, 5);

    const stats: DashboardStats = {
      totalSubmissions,
      totalGamePlays,
      totalPrizesWon,
      conversionRate,
      prizeDistribution,
      recentSubmissions,
      recentGamePlays,
      topGames,
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

