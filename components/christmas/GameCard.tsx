"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { trackGA4Event } from "@/lib/analytics/ga4";

interface GameCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  disabled?: boolean;
}

export default function GameCard({ id, name, description, icon, color, disabled }: GameCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (disabled) return;
    
    // Track game card click
    trackGA4Event('christmas_game_card_click', {
      game_name: id,
    });
    
    router.push(`/christmas/games/${id}`);
  };

  return (
    <motion.div
      whileHover={disabled ? {} : { scale: 1.05, y: -5 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      className="h-full"
    >
      <Card
        className={`h-full cursor-pointer transition-all ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-gray-800 border-gray-700'
            : `bg-gray-900 border-gray-800 hover:border-${color}-500 hover:shadow-lg hover:shadow-${color}-500/20`
        }`}
        onClick={handleClick}
      >
        <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
          <div className={`text-6xl md:text-7xl mb-4 ${disabled ? 'opacity-50' : ''}`}>
            {icon}
          </div>
          <h3 className={`text-2xl md:text-3xl font-bold mb-3 ${
            disabled ? 'text-gray-500' : 'text-white'
          }`}>
            {name}
          </h3>
          <p className={`text-base md:text-lg ${
            disabled ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {disabled ? 'Already Played' : description}
          </p>
          {!disabled && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-4 text-sm text-gray-500"
            >
              Click to play →
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}


