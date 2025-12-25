"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PrizeDisplay from '@/components/christmas/PrizeDisplay';
import { Prize } from '@/lib/christmas/types';
import { getPrizeById } from '@/lib/christmas/prizes';
import { getCharacterById } from '@/lib/christmas/characters';
import ChristmasBackground from '@/components/christmas/ChristmasBackground';

export default function PrizePageClient() {
  const router = useRouter();
  const [prize, setPrize] = useState<Prize | null>(null);
  const [badgeUrl, setBadgeUrl] = useState<string | null>(null);
  const [character, setCharacter] = useState<{ id: string; name: string; emoji: string; description: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch game play status
    fetch('/api/christmas/game-play', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (!data.hasPlayed || !data.prizeId) {
          // User hasn't played yet, redirect to games
          router.push('/christmas/games');
          return;
        }

        // Get prize information
        const wonPrize = getPrizeById(data.prizeId);
        if (!wonPrize) {
          router.push('/christmas/games');
          return;
        }

        setPrize(wonPrize);
        setBadgeUrl(data.badgeUrl || null);

        // Get character information
        if (data.characterId) {
          const char = getCharacterById(data.characterId);
          if (char) {
            setCharacter({
              id: char.id,
              name: char.name,
              emoji: char.emoji,
              description: char.description,
            });
          }
        }

        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching prize:', error);
        router.push('/christmas/games');
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen christmas-page-bg relative overflow-hidden">
        <ChristmasBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Loading your prize...</div>
        </div>
      </div>
    );
  }

  if (!prize) {
    return null;
  }

  return (
    <div className="min-h-screen christmas-page-bg relative overflow-hidden">
      <ChristmasBackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl">
          <PrizeDisplay 
            prize={prize} 
            badgeUrl={badgeUrl} 
            character={character} 
          />
        </div>
      </div>
    </div>
  );
}

