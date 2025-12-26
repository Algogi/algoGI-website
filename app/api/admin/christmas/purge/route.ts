import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase/config';
import { getSession } from '@/lib/auth/session';

/**
 * DELETE endpoint to purge all Christmas campaign data
 * Requires admin authentication
 */
export async function DELETE(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify email domain
    if (!session.email.endsWith('@algogi.com')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = getDb();
    const results = {
      gamePlays: 0,
      submissions: 0,
      gameStats: 0,
    };

    // Delete all game plays
    const gamePlaysSnapshot = await db
      .collection('christmas_game_plays')
      .where('campaign', '==', 'christmas_2025')
      .get();

    const gamePlayDeletePromises = gamePlaysSnapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(gamePlayDeletePromises);
    results.gamePlays = gamePlaysSnapshot.docs.length;

    // Delete all submissions
    const submissionsSnapshot = await db
      .collection('christmas_submissions')
      .where('campaign', '==', 'christmas_2025')
      .get();

    const submissionDeletePromises = submissionsSnapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(submissionDeletePromises);
    results.submissions = submissionsSnapshot.docs.length;

    // Delete all game stats
    const gameStatsSnapshot = await db
      .collection('christmas_game_stats')
      .where('campaign', '==', 'christmas_2025')
      .get();

    const gameStatsDeletePromises = gameStatsSnapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(gameStatsDeletePromises);
    results.gameStats = gameStatsSnapshot.docs.length;

    return NextResponse.json({
      success: true,
      message: 'Christmas campaign data purged successfully',
      deleted: results,
      totalDeleted: results.gamePlays + results.submissions + results.gameStats,
    });
  } catch (error: any) {
    console.error('Error purging Christmas campaign data:', error);
    return NextResponse.json(
      { error: 'Failed to purge Christmas campaign data', details: error.message },
      { status: 500 }
    );
  }
}


