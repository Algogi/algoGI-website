"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface GlitchTextProps {
  text: string;
  className?: string;
  trigger?: boolean;
}

export default function GlitchText({
  text,
  className = "",
  trigger = false,
}: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (trigger) {
      const interval = setInterval(() => {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 200);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [trigger]);

  return (
    <motion.span
      className={`relative inline-block ${className}`}
      animate={
        isGlitching
          ? {
              x: [0, -2, 2, -2, 2, 0],
              textShadow: [
                "0 0 5px #00f0ff",
                "2px 0 0 #ff00ff, -2px 0 0 #00ffff",
                "0 0 5px #00f0ff",
              ],
            }
          : {}
      }
      transition={{ duration: 0.3 }}
    >
      {text}
      {isGlitching && (
        <>
          <motion.span
            className="absolute inset-0 text-neon-pink dark:text-neon-pink text-neon-light-pink opacity-75"
            animate={{ x: [0, 2, -2, 0] }}
            transition={{ duration: 0.1, repeat: 3 }}
          >
            {text}
          </motion.span>
          <motion.span
            className="absolute inset-0 text-neon-cyan dark:text-neon-cyan text-neon-light-blue opacity-75"
            animate={{ x: [0, -2, 2, 0] }}
            transition={{ duration: 0.1, repeat: 3 }}
          >
            {text}
          </motion.span>
        </>
      )}
    </motion.span>
  );
}

