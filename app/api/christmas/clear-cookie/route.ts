import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/firebase/config';

/**
 * Development-only endpoint to clear Christmas cookies and game play records
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    // Find Christmas cookie and get email before deleting
    const christmasCookie = allCookies.find(
      (cookie) => cookie.name.startsWith('christmas-2025-')
    );

    let userEmail = '';
    if (christmasCookie) {
      try {
        const cookieData = JSON.parse(christmasCookie.value);
        userEmail = cookieData.email || '';
      } catch (error) {
        console.error('Error parsing cookie data:', error);
      }
    }

    // Delete game play records and submission from Firestore if email is available
    if (userEmail) {
      try {
        const db = getDb();
        
        // Delete game play records
        const gamePlays = await db
          .collection('christmas_game_plays')
          .where('email', '==', userEmail)
          .where('campaign', '==', 'christmas_2025')
          .get();

        // Delete all game play records for this email (this also deletes badge tokens)
        const gamePlayDeletePromises = gamePlays.docs.map((doc) => doc.ref.delete());
        await Promise.all(gamePlayDeletePromises);

        console.log(`Deleted ${gamePlays.docs.length} game play record(s) and badge tokens for ${userEmail}`);

        // Delete submission record
        const submissions = await db
          .collection('christmas_submissions')
          .where('email', '==', userEmail)
          .where('campaign', '==', 'christmas_2025')
          .get();

        const submissionDeletePromises = submissions.docs.map((doc) => doc.ref.delete());
        await Promise.all(submissionDeletePromises);

        console.log(`Deleted ${submissions.docs.length} submission record(s) for ${userEmail}`);
      } catch (dbError) {
        console.error('Error deleting records:', dbError);
        // Continue with cookie deletion even if DB deletion fails
      }
    }
    
    // Clear all cookies that start with christmas-2025-
    allCookies.forEach((cookie) => {
      if (cookie.name.startsWith('christmas-2025-')) {
        cookieStore.delete(cookie.name);
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Christmas cookies, game play records, and submissions cleared',
      deletedGamePlays: userEmail ? 'yes' : 'no',
      deletedSubmissions: userEmail ? 'yes' : 'no',
    });
  } catch (error) {
    console.error('Error clearing cookies:', error);
    return NextResponse.json(
      { error: 'Failed to clear cookies' },
      { status: 500 }
    );
  }
}

