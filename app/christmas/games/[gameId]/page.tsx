import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import GameDice from '@/components/christmas/GameDice';
import GameWheel from '@/components/christmas/GameWheel';
import GameSnowCatch from '@/components/christmas/GameSnowCatch';
import GameMatchCharacters from '@/components/christmas/GameMatchCharacters';
import ChristmasBackground from '@/components/christmas/ChristmasBackground';

const GAMES: Record<string, { component: React.ComponentType; name: string }> = {
  dice: { component: GameDice, name: 'Dice Roll' },
  wheel: { component: GameWheel, name: 'Spin the Wheel' },
  'snow-catch': { component: GameSnowCatch, name: 'Snow Catch' },
  'tree-ornament': { component: GameMatchCharacters, name: 'Match the Characters' },
};

export default async function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  
  // Check if user has cookie
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const hasCookie = allCookies.some(
    (cookie) => cookie.name.startsWith('christmas-2025-')
  );

  if (!hasCookie) {
    redirect('/christmas');
  }

  // Check if game exists
  const game = GAMES[gameId];
  if (!game) {
    redirect('/christmas/games');
  }

  const GameComponent = game.component;

  return (
    <div className="min-h-screen christmas-page-bg relative overflow-hidden">
      <ChristmasBackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl">
          <GameComponent />
        </div>
      </div>
    </div>
  );
}
