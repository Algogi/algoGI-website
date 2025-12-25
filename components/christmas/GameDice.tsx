"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { calculatePrizeForGame } from '@/lib/christmas/prizes';
import { trackGameStart, trackGameComplete } from '@/lib/analytics/ga4';
import { useRouter } from 'next/navigation';
import FullPageGameWrapper from './FullPageGameWrapper';
import { useGamePlay } from './useGamePlay';

export default function GameDice() {
  const router = useRouter();
  const { gameStatus, checkingStatus, hasPlayed, recordGamePlay } = useGamePlay('dice');
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    // If user already played this game, redirect to prize page
    if (gameStatus?.hasPlayed && gameStatus.gameName === 'dice') {
      if (gameStatus.score) {
        setResult(gameStatus.score);
      }
      // Redirect to prize page if already played
      router.push('/christmas/prize');
    }
  }, [gameStatus, router]);

  const rollDice = async () => {
    if (isRolling || hasPlayed) return;

    setIsRolling(true);
    trackGameStart('dice');

    // Simulate rolling animation
    setTimeout(async () => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setResult(roll);
      setIsRolling(false);

      // Calculate prize based on roll
      const wonPrize = calculatePrizeForGame('dice', undefined, roll);
      trackGameComplete('dice', wonPrize.id, roll);

      // Use the recordGamePlay function from the hook instead of direct API call
      const result = await recordGamePlay(wonPrize.id, roll);
      if (result.success && result.badgeUrl) {
        // Redirect to prize page
        router.push('/christmas/prize');
      }
    }, 1500);
  };


  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl christmas-subtitle">Loading game...</div>
      </div>
    );
  }

  return (
    <FullPageGameWrapper gameName="Dice Roll">
      <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center">🎲 Roll the Dice</h3>
      <p className="text-gray-400 text-center mb-8 text-lg md:text-xl">
        Roll for a chance to win! Higher rolls = better prizes!
      </p>

      <div className="flex flex-col items-center justify-center min-h-[300px]">
        {!hasPlayed ? (
          <motion.div
            animate={isRolling ? { rotate: [0, 360, 0], scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 1.5, repeat: isRolling ? Infinity : 0 }}
            className="text-9xl md:text-[12rem] mb-8"
          >
            🎲
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="text-9xl md:text-[12rem] mb-8"
          >
            {result === 1 && '⚀'}
            {result === 2 && '⚁'}
            {result === 3 && '⚂'}
            {result === 4 && '⚃'}
            {result === 5 && '⚄'}
            {result === 6 && '⚅'}
          </motion.div>
        )}

        {result && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl md:text-4xl font-bold text-white mb-6"
          >
            You rolled: {result}
          </motion.p>
        )}

        <Button
          onClick={rollDice}
          disabled={isRolling || hasPlayed}
          className="christmas-button-primary text-lg md:text-xl px-8 md:px-12 py-4 md:py-6"
        >
          {isRolling ? 'Rolling...' : hasPlayed ? 'Already Played' : 'Roll Dice!'}
        </Button>
      </div>

    </FullPageGameWrapper>
  );
}

