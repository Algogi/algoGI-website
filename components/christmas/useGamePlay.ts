"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface GamePlayStatus {
  hasPlayed: boolean;
  gameName: string | null;
  prizeId?: string;
  score?: number;
  badgeToken?: string | null;
  badgeUrl?: string | null;
  characterId?: string | null;
}

export function useGamePlay(gameId: string) {
  const router = useRouter();
  const [gameStatus, setGameStatus] = useState<GamePlayStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    fetch('/api/christmas/game-play', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.hasPlayed && data.gameName !== gameId) {
          // User played a different game, redirect back
          router.push('/christmas/games');
        } else {
          // Explicitly set badgeUrl to null if no game play to ensure clean state
          const status: GamePlayStatus = {
            hasPlayed: data.hasPlayed || false,
            gameName: data.gameName || null,
            prizeId: data.prizeId || undefined,
            score: data.score || undefined,
            badgeToken: data.badgeToken || null,
            badgeUrl: data.badgeUrl || null,
            characterId: data.characterId || null,
          };
          setGameStatus(status);
        }
        setCheckingStatus(false);
      })
      .catch(error => {
        console.error('Error checking game status:', error);
        // Reset to clean state on error
        setGameStatus({
          hasPlayed: false,
          gameName: null,
          badgeUrl: null,
          badgeToken: null,
          characterId: null,
        });
        setCheckingStatus(false);
      });
  }, [gameId, router]);

  const recordGamePlay = async (prizeId: string, score?: number) => {
    // Prevent duplicate submissions
    if (isSubmittingRef.current) {
      console.warn('Game play submission already in progress, ignoring duplicate call');
      return { success: false, badgeUrl: null };
    }
    
    if (gameStatus?.hasPlayed) {
      console.warn('User has already played, ignoring duplicate call');
      return { success: false, badgeUrl: null };
    }

    try {
      isSubmittingRef.current = true;
      
      const response = await fetch('/api/christmas/game-play', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameName: gameId,
          prizeId,
          score,
        }),
      });

      const data = await response.json();
      console.log('API response data:', data);
      
      if (data.alreadyPlayed) {
        // User already played, redirect
        router.push('/christmas/games');
        isSubmittingRef.current = false;
        return { success: false, badgeUrl: null };
      }
      
      // Update game status with badge URL if available
      if (data.badgeUrl) {
        console.log('Updating game status with badgeUrl:', data.badgeUrl);
        setGameStatus(prev => prev ? { ...prev, badgeUrl: data.badgeUrl, badgeToken: data.badgeToken, hasPlayed: true, gameName: gameId, prizeId, score } : {
          hasPlayed: true,
          gameName: gameId,
          prizeId,
          score,
          badgeUrl: data.badgeUrl,
          badgeToken: data.badgeToken,
        });
      } else {
        console.error('No badgeUrl in API response:', data);
      }
      
      isSubmittingRef.current = false;
      return { success: data.success || true, badgeUrl: data.badgeUrl || null };
    } catch (error) {
      console.error('Error recording game play:', error);
      isSubmittingRef.current = false;
      return { success: false, badgeUrl: null };
    }
  };

  return {
    gameStatus,
    checkingStatus,
    hasPlayed: gameStatus?.hasPlayed || false,
    recordGamePlay,
  };
}

