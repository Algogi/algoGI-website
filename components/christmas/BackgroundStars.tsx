"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { PerformanceMode } from "@/lib/christmas/use-performance-mode";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

interface BackgroundStarsProps {
  performanceMode?: PerformanceMode;
}

export default function BackgroundStars({ performanceMode = 'high' }: BackgroundStarsProps) {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    // Determine star count based on performance mode
    const getStarCount = (): number => {
      switch (performanceMode) {
        case 'high':
          return 18;
        case 'medium':
          return 12;
        case 'low':
          return 6;
        case 'minimal':
          return 3;
        default:
          return 18;
      }
    };

    const starCount = getStarCount();
    const newStars: Star[] = Array.from({ length: starCount }, (_, i) => ({
      id: i,
      // Keep stars within 5% to 95% to prevent edge clipping (accounting for star size ~15px radius and scale animation up to 1.3x)
      x: Math.random() * 90 + 5, // Percentage of viewport width (5% to 95%)
      y: Math.random() * 90 + 5, // Percentage of viewport height (5% to 95%)
      size: Math.random() * 0.8 + 0.4, // Scale between 0.4 and 1.2
      delay: Math.random() * 2, // Random delay for animation
      duration: Math.random() * 2 + 3, // Duration between 3-5 seconds
    }));
    setStars(newStars);
  }, [performanceMode]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            transform: 'translate(-50%, -50%) translateZ(0)',
            opacity: 0.3,
            willChange: performanceMode === 'high' || performanceMode === 'medium' ? 'transform, opacity' : 'opacity',
            contain: 'layout style paint',
          }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            // Simplify animations for lower modes: remove scale in low/minimal, keep only opacity
            ...(performanceMode === 'low' || performanceMode === 'minimal'
              ? {}
              : { scale: [star.size, star.size * 1.3, star.size] }),
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: star.delay,
          }}
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 30 30"
            style={{ filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.6))' }}
          >
            <g transform="translate(15, 15)">
              <path
                d="M 0 -15 L 4 -4 L 15 -4 L 6 2 L 9 13 L 0 7 L -9 13 L -6 2 L -15 -4 L -4 -4 Z"
                fill="#F59E0B"
                className="dark:fill-[#FBBF24]"
              />
            </g>
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

