import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getDb } from '@/lib/firebase/config';
import ChristmasBackground from '@/components/christmas/ChristmasBackground';
import GamesList from '@/components/christmas/GamesList';
import ChristmasGamesClient from './ChristmasGamesClient';

export default async function GamesPage() {
  // Check if user has cookie
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const christmasCookie = allCookies.find(
    (cookie) => cookie.name.startsWith('christmas-2025-')
  );

  if (!christmasCookie) {
    redirect('/christmas');
  }

  // Check if user has already won a prize
  try {
    let userEmail = '';
    try {
      const cookieData = JSON.parse(christmasCookie.value);
      userEmail = cookieData.email || '';
    } catch {
      // Invalid cookie, redirect to start
      redirect('/christmas');
    }

    if (userEmail) {
      const db = getDb();
      const gamePlays = await db
        .collection('christmas_game_plays')
        .where('email', '==', userEmail)
        .where('campaign', '==', 'christmas_2025')
        .limit(1)
        .get();

      if (!gamePlays.empty) {
        const playData = gamePlays.docs[0].data();
        // If user has already played and won a prize, redirect to prize page
        if (playData.prizeId) {
          redirect('/christmas/prize');
        }
      }
    }
  } catch (error) {
    // On error, continue to show games page
    console.error('Error checking game play status:', error);
  }

  return (
    <>
      <ChristmasGamesClient />
      <div className="min-h-screen christmas-page-bg relative overflow-hidden">
        <ChristmasBackground />
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-6xl">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 md:mb-12 text-center christmas-title leading-loose pb-2">
              🎮 Christmas Games 🎮
            </h1>
            <GamesList />
          </div>
        </div>
      </div>
    </>
  );
}
