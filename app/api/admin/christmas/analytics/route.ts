import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/firebase/config';
import { ChristmasAnalytics, PrizeDistribution, GamePopularity, QuestionAnalytics, QuestionResponse, TimeBasedStats, DailyStat, HourlyStat, ConversionFunnel, QuestionnaireAbandonment, QuestionViewStats } from '@/lib/christmas/admin-types';
import { calculatePercentage, getGameDisplayName, getPrizeDisplayName, formatDateOnly } from '@/lib/christmas/admin-utils';
import { PRIZES } from '@/lib/christmas/prizes';
import { ChristmasSubmission, ChristmasGamePlay } from '@/lib/christmas/admin-types';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    
    // Fetch all submissions from Christmas submissions collection
    const submissionsSnapshot = await db
      .collection('christmas_submissions')
      .get();

    const submissions: ChristmasSubmission[] = submissionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChristmasSubmission[];

    // Fetch all game plays
    const gamePlaysSnapshot = await db
      .collection('christmas_game_plays')
      .where('campaign', '==', 'christmas_2025')
      .get();

    const gamePlays: ChristmasGamePlay[] = gamePlaysSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChristmasGamePlay[];

    // Fetch game stats
    const gameStatsSnapshot = await db
      .collection('christmas_game_stats')
      .where('campaign', '==', 'christmas_2025')
      .get();

    const totalSubmissions = submissions.length;
    const totalGamePlays = gamePlays.length;
    const conversionRate = totalSubmissions > 0 
      ? calculatePercentage(totalGamePlays, totalSubmissions)
      : 0;

    // Prize distribution
    const prizeCounts: Record<string, number> = {};
    gamePlays.forEach((play) => {
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
    gamePlays.forEach((play) => {
      if (!gameCounts[play.gameName]) {
        gameCounts[play.gameName] = { count: 0, totalScore: 0, scoreCount: 0 };
      }
      gameCounts[play.gameName].count++;
      if (play.score !== null && play.score !== undefined) {
        gameCounts[play.gameName].totalScore += play.score;
        gameCounts[play.gameName].scoreCount++;
      }
    });

    const gamePopularity: GamePopularity[] = Object.entries(gameCounts).map(([gameName, stats]) => ({
      gameName,
      gameDisplayName: getGameDisplayName(gameName),
      playCount: stats.count,
      averageScore: stats.scoreCount > 0 ? Math.round((stats.totalScore / stats.scoreCount) * 100) / 100 : undefined,
      prizeWinRate: 100, // All game plays result in prizes
    }));

    // Question analytics
    const questionAnalytics: QuestionAnalytics[] = [
      {
        questionId: 'q1',
        questionText: 'Which AI tool do you currently use most often?',
        responses: [],
        totalResponses: 0,
      },
      {
        questionId: 'q2',
        questionText: 'AI is currently:',
        responses: [],
        totalResponses: 0,
      },
      {
        questionId: 'q3',
        questionText: 'Team size:',
        responses: [],
        totalResponses: 0,
      },
      {
        questionId: 'q4',
        questionText: 'Realistically, how much of your current work could be automated with AI over the next 24 months?',
        responses: [],
        totalResponses: 0,
      },
      {
        questionId: 'q5',
        questionText: 'Would you like a free AI Tools Analysis Report tailored to your business?',
        responses: [],
        totalResponses: 0,
      },
    ];

    questionAnalytics.forEach((qa) => {
      const answerCounts: Record<string, number> = {};
      submissions.forEach((sub) => {
        const answer = (sub as any)[qa.questionId];
        if (answer) {
          answerCounts[answer] = (answerCounts[answer] || 0) + 1;
        }
      });

      const responses: QuestionResponse[] = Object.entries(answerCounts).map(([answer, count]) => ({
        answer,
        count,
        percentage: calculatePercentage(count, submissions.length),
      }));

      qa.responses = responses.sort((a, b) => b.count - a.count);
      qa.totalResponses = submissions.filter((sub) => (sub as any)[qa.questionId]).length;
    });

    // Time-based stats
    const dailyStats: Record<string, { submissions: number; gamePlays: number }> = {};
    const hourlyStats: Record<number, { submissions: number; gamePlays: number }> = {};

    submissions.forEach((sub) => {
      const date = sub.submittedAt?.toDate ? sub.submittedAt.toDate() : new Date(sub.submittedAt);
      const dateStr = formatDateOnly(sub.submittedAt);
      const hour = date.getHours();

      if (!dailyStats[dateStr]) {
        dailyStats[dateStr] = { submissions: 0, gamePlays: 0 };
      }
      dailyStats[dateStr].submissions++;

      if (!hourlyStats[hour]) {
        hourlyStats[hour] = { submissions: 0, gamePlays: 0 };
      }
      hourlyStats[hour].submissions++;
    });

    gamePlays.forEach((play) => {
      const date = play.playedAt?.toDate ? play.playedAt.toDate() : new Date(play.playedAt);
      const dateStr = formatDateOnly(play.playedAt);
      const hour = date.getHours();

      if (!dailyStats[dateStr]) {
        dailyStats[dateStr] = { submissions: 0, gamePlays: 0 };
      }
      dailyStats[dateStr].gamePlays++;

      if (!hourlyStats[hour]) {
        hourlyStats[hour] = { submissions: 0, gamePlays: 0 };
      }
      hourlyStats[hour].gamePlays++;
    });

    const dailySubmissions: DailyStat[] = Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        submissions: stats.submissions,
        gamePlays: stats.gamePlays,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const hourlySubmissions: HourlyStat[] = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      submissions: hourlyStats[hour]?.submissions || 0,
      gamePlays: hourlyStats[hour]?.gamePlays || 0,
    }));

    const peakHour = hourlySubmissions.reduce((max, stat, index) => 
      stat.submissions > hourlySubmissions[max].submissions ? index : max, 0
    );

    const peakDay = dailySubmissions.reduce((max, stat, index) =>
      stat.submissions > dailySubmissions[max].submissions ? index : max, 0
    );

    const timeBasedStats: TimeBasedStats = {
      dailySubmissions,
      hourlySubmissions,
      peakHour,
      peakDay: dailySubmissions[peakDay]?.date || '',
    };

    // Conversion funnel
    const conversionFunnel: ConversionFunnel = {
      submissions: totalSubmissions,
      gamePlays: totalGamePlays,
      prizeWins: totalGamePlays, // All game plays result in prizes
      dropOffRate: totalSubmissions > 0 
        ? calculatePercentage(totalSubmissions - totalGamePlays, totalSubmissions)
        : 0,
      winRate: 100, // All game plays result in prizes
    };

    // Fetch abandonment events
    const abandonmentSnapshot = await db
      .collection('christmas_analytics_events')
      .where('eventType', '==', 'questionnaire_abandoned')
      .where('campaign', '==', 'christmas_2025')
      .get();

    const abandonmentCounts: Record<string, { count: number; step: number; questionId?: string; stepType: string }> = {};
    abandonmentSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const key = `${data.step}_${data.questionId || 'none'}`;
      if (!abandonmentCounts[key]) {
        abandonmentCounts[key] = {
          count: 0,
          step: data.step,
          questionId: data.questionId || undefined,
          stepType: data.stepType || 'unknown',
        };
      }
      abandonmentCounts[key].count++;
    });

    const totalAbandonments = abandonmentSnapshot.docs.length;
    const questionnaireAbandonment: QuestionnaireAbandonment[] = Object.values(abandonmentCounts)
      .map((item) => ({
        step: item.step,
        questionId: item.questionId,
        stepType: item.stepType,
        count: item.count,
        percentage: totalAbandonments > 0 ? calculatePercentage(item.count, totalAbandonments) : 0,
      }))
      .sort((a, b) => a.step - b.step);

    // Fetch question view events
    const questionViewSnapshot = await db
      .collection('christmas_analytics_events')
      .where('eventType', '==', 'question_view')
      .where('campaign', '==', 'christmas_2025')
      .get();

    const questionViewCounts: Record<string, { viewCount: number; step: number; questionId?: string; stepType: string; uniqueSessions: Set<string> }> = {};
    questionViewSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const key = `${data.step}_${data.questionId || 'none'}`;
      if (!questionViewCounts[key]) {
        questionViewCounts[key] = {
          viewCount: 0,
          step: data.step,
          questionId: data.questionId || undefined,
          stepType: data.stepType || 'unknown',
          uniqueSessions: new Set(),
        };
      }
      questionViewCounts[key].viewCount++;
      // Use document ID as a proxy for unique session (in a real scenario, you'd track session IDs)
      questionViewCounts[key].uniqueSessions.add(doc.id);
    });

    const totalQuestionViews = questionViewSnapshot.docs.length;
    const questionViewStats: QuestionViewStats[] = Object.values(questionViewCounts)
      .map((item) => ({
        step: item.step,
        questionId: item.questionId,
        stepType: item.stepType,
        viewCount: item.viewCount,
        uniqueViews: item.uniqueSessions.size,
      }))
      .sort((a, b) => a.step - b.step);

    // Calculate abandonment rate (abandonments / (abandonments + submissions))
    const totalUsers = totalAbandonments + totalSubmissions;
    const abandonmentRate = totalUsers > 0 
      ? calculatePercentage(totalAbandonments, totalUsers)
      : 0;

    const analytics: ChristmasAnalytics = {
      totalSubmissions,
      totalGamePlays,
      conversionRate,
      prizeDistribution,
      gamePopularity,
      questionAnalytics,
      timeBasedStats,
      conversionFunnel,
      questionnaireAbandonment,
      questionViewStats,
      totalAbandonments,
      totalQuestionViews,
      abandonmentRate,
    };

    return NextResponse.json(analytics);
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

