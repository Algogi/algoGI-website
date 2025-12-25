"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { calculatePrizeForGame } from '@/lib/christmas/prizes';
import { trackGameStart, trackGameComplete } from '@/lib/analytics/ga4';
import FullPageGameWrapper from './FullPageGameWrapper';
import { useGamePlay } from './useGamePlay';
import { useRouter } from 'next/navigation';

interface Snowflake {
  id: number;
  x: number;
  y: number;
  caught: boolean;
}

export default function GameSnowCatch() {
  const router = useRouter();
  const { gameStatus, checkingStatus, hasPlayed, recordGamePlay } = useGamePlay('snow-catch');
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const [score, setScore] = useState(0);
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const snowflakeIdRef = useRef(0);

  useEffect(() => {
    // If user already played this game, redirect to prize page
    if (gameStatus?.hasPlayed && gameStatus.gameName === 'snow-catch') {
      if (gameStatus.score !== undefined) {
        setScore(gameStatus.score);
      }
      router.push('/christmas/prize');
    }
  }, [gameStatus, router]);

  useEffect(() => {
    if (!isPlaying) return;

    // Timer countdown
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Spawn snowflakes
    const spawnInterval = setInterval(() => {
      if (gameAreaRef.current) {
        const newSnowflake: Snowflake = {
          id: snowflakeIdRef.current++,
          x: Math.random() * (gameAreaRef.current.clientWidth - 40),
          y: -20,
          caught: false,
        };
        setSnowflakes((prev) => [...prev, newSnowflake]);
      }
    }, 500);

    // Animate snowflakes falling
    const animateInterval = setInterval(() => {
      setSnowflakes((prev) =>
        prev
          .filter((flake) => !flake.caught && flake.y < (gameAreaRef.current?.clientHeight || 400))
          .map((flake) => ({
            ...flake,
            y: flake.y + 2,
          }))
      );
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearInterval(spawnInterval);
      clearInterval(animateInterval);
    };
  }, [isPlaying]);

  const catchSnowflake = (id: number) => {
    if (!isPlaying) return;
    setSnowflakes((prev) =>
      prev.map((flake) => (flake.id === id ? { ...flake, caught: true } : flake))
    );
    setScore((prev) => prev + 1);
  };

  const startGame = () => {
    if (hasPlayed) return;
    setIsPlaying(true);
    setTimeLeft(5);
    setScore(0);
    setSnowflakes([]);
    trackGameStart('snow-catch');
  };

  const endGame = async () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Calculate prize based on score
    const wonPrize = calculatePrizeForGame('snow-catch', score);
    trackGameComplete('snow-catch', wonPrize.id, score);

    // Use the recordGamePlay function from the hook instead of direct API call
    const result = await recordGamePlay(wonPrize.id, score);
    if (result.success && result.badgeUrl) {
      // Redirect to prize page
      router.push('/christmas/prize');
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl christmas-subtitle">Loading game...</div>
      </div>
    );
  }

  return (
    <FullPageGameWrapper gameName="Catch the Snowflakes">
      <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center">❄️ Catch the Snowflakes</h3>
      <p className="text-gray-400 text-center mb-6">
        Click on falling snowflakes! You have 5 seconds!
      </p>

      <div className="flex flex-col items-center justify-center">
        {isPlaying && (
          <div className="mb-4 text-center">
            <p className="text-3xl font-bold text-white mb-2">Time: {timeLeft}s</p>
            <p className="text-xl text-gray-300">Score: {score}</p>
          </div>
        )}

        <div
          ref={gameAreaRef}
          className="relative w-full h-64 bg-gray-800 rounded-lg border-2 border-gray-700 overflow-hidden mb-6"
          style={{ minHeight: '256px' }}
        >
          {snowflakes.map((flake) => (
            <motion.div
              key={flake.id}
              initial={{ y: -20 }}
              animate={{ y: flake.y }}
              className={`absolute w-8 h-8 cursor-pointer ${flake.caught ? 'opacity-0' : ''}`}
              style={{ left: `${flake.x}px` }}
              onClick={() => catchSnowflake(flake.id)}
            >
              ❄️
            </motion.div>
          ))}
        </div>

        {!isPlaying && !hasPlayed && (
          <Button
            onClick={startGame}
            className="bg-gradient-to-r from-red-500 to-green-500 text-white hover:from-red-600 hover:to-green-600"
          >
            Start Game!
          </Button>
        )}

        {hasPlayed && (
          <div className="text-center">
            <p className="text-xl font-bold text-white mb-2">Final Score: {score}</p>
            <p className="text-gray-400">Thanks for playing!</p>
          </div>
        )}
      </div>

    </FullPageGameWrapper>
  );
}

