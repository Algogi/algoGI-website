"use client";

import { motion } from "framer-motion";

interface GlowingChristmasTreeProps {
  position?: 'left' | 'right';
  useAbsolute?: boolean;
}

export default function GlowingChristmasTree({ position = 'right', useAbsolute = false }: GlowingChristmasTreeProps) {
  const positioningClass = useAbsolute 
    ? 'absolute inset-0 w-full h-full'
    : `fixed ${position === 'right' ? 'right-0' : 'left-0'} top-0 bottom-0 w-1/2 md:w-2/5 lg:w-1/3 xl:w-1/4`;
  
  return (
    <div className={`${positioningClass} flex items-center justify-center pointer-events-none z-0 opacity-25 dark:opacity-15`}>
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Glow effect layers */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Outer glow */}
          <motion.div
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute w-full h-full max-w-[1000px] max-h-[1000px] rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(22, 163, 74, 0.25) 0%, rgba(220, 38, 38, 0.12) 50%, transparent 70%)',
            }}
          />
          {/* Inner glow */}
          <motion.div
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [0.9, 1, 0.9],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="absolute w-4/5 h-4/5 max-w-[800px] max-h-[800px] rounded-full blur-2xl"
            style={{
              background: 'radial-gradient(circle, rgba(34, 197, 94, 0.35) 0%, rgba(239, 68, 68, 0.18) 50%, transparent 70%)',
            }}
          />
        </div>

        {/* Christmas Tree SVG - Much Larger, positioned on side */}
        <svg
          width="400"
          height="480"
          viewBox="0 0 200 240"
          className={`relative z-10 w-full h-full max-w-[700px] max-h-[900px] ${position === 'right' ? 'translate-x-1/4' : '-translate-x-1/4'}`}
          style={{ filter: 'drop-shadow(0 0 40px rgba(34, 197, 94, 0.5))' }}
        >
        {/* Tree trunk */}
        <rect
          x="90"
          y="200"
          width="20"
          height="40"
          fill="#8B4513"
          className="dark:fill-[#654321]"
        />

        {/* Tree layers (from top to bottom, small to large) */}
        {/* Top layer (smallest) */}
        <path
          d="M 100 50 L 60 90 L 140 90 Z"
          fill="#16A34A"
          className="dark:fill-[#22C55E]"
          style={{ filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.6))' }}
        />

        {/* Middle layer */}
        <path
          d="M 100 90 L 50 140 L 150 140 Z"
          fill="#15803D"
          className="dark:fill-[#16A34A]"
          style={{ filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.6))' }}
        />

        {/* Bottom layer (largest) */}
        <path
          d="M 100 140 L 40 200 L 160 200 Z"
          fill="#16A34A"
          className="dark:fill-[#22C55E]"
          style={{ filter: 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.6))' }}
        />

        {/* Star on top */}
        <g transform="translate(100, 20)">
          <motion.g
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <path
              d="M 0 -15 L 4 -4 L 15 -4 L 6 2 L 9 13 L 0 7 L -9 13 L -6 2 L -15 -4 L -4 -4 Z"
              fill="#F59E0B"
              className="dark:fill-[#FBBF24]"
              style={{ filter: 'drop-shadow(0 0 15px rgba(245, 158, 11, 0.9))' }}
            />
          </motion.g>
        </g>

        {/* Ornaments - Red */}
        <motion.circle
          cx="70"
          cy="120"
          r="6"
          fill="#DC2626"
          className="dark:fill-[#EF4444]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0,
          }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(220, 38, 38, 0.8))' }}
        />
        <motion.circle
          cx="130"
          cy="100"
          r="6"
          fill="#DC2626"
          className="dark:fill-[#EF4444]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(220, 38, 38, 0.8))' }}
        />
        <motion.circle
          cx="85"
          cy="70"
          r="5"
          fill="#DC2626"
          className="dark:fill-[#EF4444]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(220, 38, 38, 0.8))' }}
        />

        {/* Ornaments - Gold */}
        <motion.circle
          cx="115"
          cy="130"
          r="5"
          fill="#F59E0B"
          className="dark:fill-[#FBBF24]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.7,
          }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.8))' }}
        />
        <motion.circle
          cx="100"
          cy="80"
          r="5"
          fill="#F59E0B"
          className="dark:fill-[#FBBF24]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.2,
          }}
          style={{ filter: 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.8))' }}
        />
      </svg>
      </div>
    </div>
  );
}

