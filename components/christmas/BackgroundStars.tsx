"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export default function BackgroundStars() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    // Generate 18 stars at random positions
    const starCount = 18;
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
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            transform: 'translate(-50%, -50%)',
            opacity: 0.3,
          }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [star.size, star.size * 1.3, star.size],
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

