"use client";

import { motion } from 'framer-motion';

interface FestiveBadgeProps {
  prizeName: string;
  prizeDescription: string;
  character?: { id: string; name: string; emoji: string; description: string } | null;
  badgeUrl?: string | null;
}

export default function FestiveBadge({ 
  prizeName, 
  prizeDescription, 
  character
}: FestiveBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center space-y-6"
    >
      <motion.div
        animate={{
          boxShadow: [
            '0 0 30px rgba(251, 191, 36, 0.4), 0 0 60px rgba(220, 38, 38, 0.3)',
            '0 0 40px rgba(251, 191, 36, 0.6), 0 0 80px rgba(34, 197, 94, 0.4)',
            '0 0 30px rgba(251, 191, 36, 0.4), 0 0 60px rgba(220, 38, 38, 0.3)',
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center bg-gradient-to-br from-orange-400 via-yellow-300 to-green-400 rounded-full border-4 border-yellow-400 shadow-2xl"
      >
        {/* Decorative sparkles around badge */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => {
            const angle = (i * 360) / 8;
            const radius = 140;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            return (
              <motion.div
                key={i}
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="absolute text-yellow-300 text-xl"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                ✨
              </motion.div>
            );
          })}
        </div>

        <div className="text-center px-4 relative z-10">
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-7xl md:text-9xl mb-3 drop-shadow-lg"
          >
            {character?.emoji || '🎁'}
          </motion.div>
          <div className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg" style={{ textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)' }}>
            {prizeName}
          </div>
        </div>
      </motion.div>

      <div className="text-center space-y-4 max-w-lg">
        <p className="text-yellow-600 text-lg md:text-xl leading-relaxed drop-shadow-sm font-medium" style={{ textShadow: '0 1px 3px rgba(255, 255, 255, 0.8)' }}>
          {prizeDescription}
        </p>
      </div>
    </motion.div>
  );
}
