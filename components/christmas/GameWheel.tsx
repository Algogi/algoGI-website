"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { calculatePrizeForGame, PRIZES } from '@/lib/christmas/prizes';
import { trackGameStart, trackGameComplete } from '@/lib/analytics/ga4';
import FullPageGameWrapper from './FullPageGameWrapper';
import { useGamePlay } from './useGamePlay';
import { useRouter } from 'next/navigation';

const WHEEL_SEGMENTS = [
  { label: '$100 Gift Card', prizeId: 'grand', color: '#F59E0B' },
  { label: '50% Off', prizeId: 'offer-50', color: '#10B981' },
  { label: 'Free AI Audit', prizeId: 'offer-audit', color: '#3B82F6' },
  { label: '20% Discount', prizeId: 'offer-20', color: '#8B5CF6' },
  { label: 'Free Consultation', prizeId: 'fun-nice-try', color: '#EF4444' },
  { label: 'Festive Badge', prizeId: 'fun-badge', color: '#EC4899' },
];

export default function GameWheel() {
  const router = useRouter();
  const { gameStatus, checkingStatus, hasPlayed, recordGamePlay } = useGamePlay('wheel');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If user already played this game, redirect to prize page
    if (gameStatus?.hasPlayed && gameStatus.gameName === 'wheel') {
      router.push('/christmas/prize');
    }
  }, [gameStatus, router]);

  const spinWheel = async () => {
    if (isSpinning || hasPlayed) return;

    setIsSpinning(true);
    trackGameStart('wheel');

    // Calculate prize first
    const wonPrize = calculatePrizeForGame('wheel');
    trackGameComplete('wheel', wonPrize.id);

    // Find the segment index for this prize
    const segmentIndex = WHEEL_SEGMENTS.findIndex(seg => seg.prizeId === wonPrize.id);
    const targetSegment = segmentIndex >= 0 ? segmentIndex : 0;

    // Calculate rotation: multiple full spins + position to target segment
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    const targetRotation = 360 * 5 + (360 - targetSegment * segmentAngle - segmentAngle / 2);
    const finalRotation = rotation + targetRotation;

    setRotation(finalRotation);

    // Wait for animation to complete
    setTimeout(async () => {
      setIsSpinning(false);

      // Record game play
      const result = await recordGamePlay(wonPrize.id);
      if (result.success && result.badgeUrl) {
        // Redirect to prize page
        router.push('/christmas/prize');
      }
    }, 4000);
  };


  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl christmas-subtitle">Loading game...</div>
      </div>
    );
  }

  const segmentAngle = 360 / WHEEL_SEGMENTS.length;

  return (
    <FullPageGameWrapper gameName="Spin the Wheel">
      <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center">🎡 Spin the Wheel</h3>
      <p className="text-gray-400 text-center mb-8 text-lg md:text-xl">
        Spin for a chance to win amazing prizes!
      </p>

      <div className="flex flex-col items-center justify-center">
        <div className="relative mb-8">
          {/* Wheel Container */}
          <div className="relative w-80 h-80 md:w-96 md:h-96">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
              <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[30px] border-l-transparent border-r-transparent border-t-red-500"></div>
            </div>

            {/* Wheel */}
            <motion.div
              ref={wheelRef}
              className="relative w-full h-full rounded-full overflow-hidden border-4 border-white/20 shadow-2xl"
              animate={{ rotate: rotation }}
              transition={{ duration: 4, ease: "easeOut" }}
            >
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {WHEEL_SEGMENTS.map((segment, index) => {
                  const startAngle = (index * segmentAngle - 90) * (Math.PI / 180);
                  const endAngle = ((index + 1) * segmentAngle - 90) * (Math.PI / 180);
                  const largeArc = segmentAngle > 180 ? 1 : 0;

                  const x1 = 100 + 100 * Math.cos(startAngle);
                  const y1 = 100 + 100 * Math.sin(startAngle);
                  const x2 = 100 + 100 * Math.cos(endAngle);
                  const y2 = 100 + 100 * Math.sin(endAngle);

                  return (
                    <g key={index}>
                      <path
                        d={`M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`}
                        fill={segment.color}
                        stroke="white"
                        strokeWidth="2"
                      />
                    </g>
                  );
                })}
              </svg>
            </motion.div>
          </div>
        </div>

        <Button
          onClick={spinWheel}
          disabled={isSpinning || hasPlayed}
          className="bg-red-500 border-2 border-red-500 text-white hover:bg-red-600 hover:border-red-400 text-lg md:text-xl px-8 md:px-12 py-4 md:py-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSpinning ? 'Spinning...' : hasPlayed ? 'Already Played' : 'Spin the Wheel!'}
        </Button>
      </div>

    </FullPageGameWrapper>
  );
}
