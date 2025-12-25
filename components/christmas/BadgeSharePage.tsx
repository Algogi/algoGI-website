"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FestiveBadge from './FestiveBadge';
import ChristmasBackground from './ChristmasBackground';
import { Prize } from '@/lib/christmas/types';
import { getCharacterById } from '@/lib/christmas/characters';

interface BadgeSharePageProps {
  token: string;
}

export default function BadgeSharePage({ token }: BadgeSharePageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prize, setPrize] = useState<Prize | null>(null);
  const [gameName, setGameName] = useState<string | null>(null);
  const [character, setCharacter] = useState<{ id: string; name: string; emoji: string; description: string } | null>(null);

  useEffect(() => {
    fetch(`/api/christmas/badge/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to load badge');
        }
        return res.json();
      })
      .then((data) => {
        if (data.success && data.prize) {
          setPrize(data.prize);
          setGameName(data.gameName);
          if (data.character) {
            setCharacter(data.character);
          } else if (data.characterId) {
            // Fallback: fetch character by ID
            const char = getCharacterById(data.characterId);
            if (char) {
              setCharacter({
                id: char.id,
                name: char.name,
                emoji: char.emoji,
                description: char.description,
              });
            }
          }
        } else {
          throw new Error('Invalid badge data');
        }
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to load badge');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen christmas-page-bg relative overflow-hidden">
        <ChristmasBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Loading badge...</div>
        </div>
      </div>
    );
  }

  if (error || !prize) {
    return (
      <div className="min-h-screen christmas-page-bg relative overflow-hidden flex items-center justify-center">
        <ChristmasBackground />
        <div className="relative z-10 text-center max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-8 border-2 border-red-500/50"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Badge Not Found</h2>
            <p className="text-gray-300 mb-6">{error || 'This badge link is invalid or has expired.'}</p>
            <Button
              onClick={() => router.push('/christmas')}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Christmas Campaign
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen christmas-page-bg relative overflow-hidden">
      <ChristmasBackground />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex items-center justify-center p-4"
            >
              {/* Decorative stars in background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                    className="absolute text-yellow-300"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      fontSize: `${12 + Math.random() * 8}px`,
                    }}
                  >
                    ✨
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative bg-gradient-to-br from-green-50/95 via-yellow-50/95 to-green-50/95 backdrop-blur-lg rounded-3xl p-6 md:p-10 max-w-3xl w-full border-4 border-yellow-400 shadow-2xl"
                style={{
                  boxShadow: '0 0 50px rgba(251, 191, 36, 0.6), 0 0 100px rgba(34, 197, 94, 0.4), 0 0 150px rgba(251, 191, 36, 0.3)',
                }}
              >
                {/* Corner decorations */}
                <div className="absolute top-2 left-2 text-2xl text-blue-400 opacity-80">❄️</div>
                <div className="absolute top-2 right-2 text-2xl text-blue-400 opacity-80">❄️</div>
                <div className="absolute bottom-2 left-2 text-2xl text-blue-400 opacity-80">❄️</div>
                <div className="absolute bottom-2 right-2 text-2xl text-blue-400 opacity-80">❄️</div>

                <div className="text-center space-y-8">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="text-7xl md:text-9xl mb-2"
                  >
                    🎄
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl md:text-5xl font-bold text-yellow-500 mb-8 drop-shadow-lg"
                    style={{ textShadow: '0 2px 10px rgba(251, 191, 36, 0.5), 0 4px 20px rgba(251, 191, 36, 0.3)' }}
                  >
                    Congratulations!
                  </motion.h2>

                  <div className="flex justify-center py-6">
                    <FestiveBadge
                      prizeName={prize.name}
                      prizeDescription={prize.description}
                      character={character}
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

