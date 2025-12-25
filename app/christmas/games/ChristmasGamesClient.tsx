"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trackGA4Event } from '@/lib/analytics/ga4';

export default function ChristmasGamesClient() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has already won a prize
    fetch('/api/christmas/game-play', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        // If user has already played and won a prize, redirect to prize page
        if (data.hasPlayed && data.prizeId) {
          router.push('/christmas/prize');
          return;
        }
        
        // Track games page view only if user hasn't won yet
        trackGA4Event('christmas_games_start', {
          page_path: '/christmas/games',
        });
      })
      .catch(error => {
        console.error('Error checking game status:', error);
        // On error, still track the page view
        trackGA4Event('christmas_games_start', {
          page_path: '/christmas/games',
        });
      });
  }, [router]);

  return null;
}

