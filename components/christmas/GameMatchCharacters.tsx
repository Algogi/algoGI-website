"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { calculatePrizeForGame } from '@/lib/christmas/prizes';
import { trackGameStart, trackGameComplete } from '@/lib/analytics/ga4';
import FullPageGameWrapper from './FullPageGameWrapper';
import { useGamePlay } from './useGamePlay';
import { CHRISTMAS_CHARACTERS } from '@/lib/christmas/characters';
import { useRouter } from 'next/navigation';

interface Card {
  id: string;
  characterId: string;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

export default function GameMatchCharacters() {
  const router = useRouter();
  const { gameStatus, checkingStatus, hasPlayed, recordGamePlay } = useGamePlay('tree-ornament');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matches, setMatches] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    // If user already played this game, redirect to prize page
    if (gameStatus?.hasPlayed && gameStatus.gameName === 'tree-ornament') {
      router.push('/christmas/prize');
    }
  }, [gameStatus, router]);

  const initializeGame = () => {
    // Select 6 random characters (will create 12 cards - 6 pairs)
    const selectedCharacters = CHRISTMAS_CHARACTERS
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);

    // Create pairs of cards
    const newCards: Card[] = [];
    selectedCharacters.forEach((char, index) => {
      // Create two cards for each character
      newCards.push({
        id: `card-${index}-1`,
        characterId: char.id,
        emoji: char.emoji,
        flipped: false,
        matched: false,
      });
      newCards.push({
        id: `card-${index}-2`,
        characterId: char.id,
        emoji: char.emoji,
        flipped: false,
        matched: false,
      });
    });

    // Shuffle cards
    const shuffled = newCards.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedCards([]);
    setMatches(0);
    setGameStarted(true);
    trackGameStart('tree-ornament');
  };

  const handleCardClick = (cardId: string) => {
    if (flippedCards.length >= 2 || hasPlayed) return;

    const card = cards.find(c => c.id === cardId);
    if (!card || card.flipped || card.matched) return;

    // Flip the card
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, flipped: true } : c
    ));

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    // Check for match when two cards are flipped
    if (newFlipped.length === 2) {
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.characterId === secondCard.characterId) {
        // Match found!
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.characterId === firstCard.characterId ? { ...c, matched: true, flipped: true } : c
          ));
          setMatches(prev => {
            const newMatches = prev + 1;
            // Check if all matches found
            if (newMatches === 6) {
              setTimeout(async () => {
                const wonPrize = calculatePrizeForGame('tree-ornament');
                trackGameComplete('tree-ornament', wonPrize.id);

                // Use the recordGamePlay function from the hook instead of direct API call
                const result = await recordGamePlay(wonPrize.id);
                if (result.success && result.badgeUrl) {
                  // Redirect to prize page
                  router.push('/christmas/prize');
                }
              }, 500);
            }
            return newMatches;
          });
          setFlippedCards([]);
        }, 500);
      } else {
        // No match - flip back
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            newFlipped.includes(c.id) ? { ...c, flipped: false } : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
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
    <FullPageGameWrapper gameName="Match the Characters">
      <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 text-center">🎄 Match the Characters</h3>
      <p className="text-gray-400 text-center mb-6">
        Find matching pairs of Christmas characters!
      </p>

      <div className="flex flex-col items-center justify-center">
        {!gameStarted && !hasPlayed && (
          <Button
            onClick={initializeGame}
            className="bg-gradient-to-r from-red-500 to-green-500 text-white hover:from-red-600 hover:to-green-600 text-xl px-8 py-4 mb-8"
          >
            Start Game!
          </Button>
        )}

        {gameStarted && (
          <>
            <div className="mb-6 text-center">
              <p className="text-2xl font-bold text-white mb-2">
                Matches: {matches} / 6
              </p>
              {matches === 6 && (
                <p className="text-green-400 font-bold text-xl">All matches found! 🎉</p>
              )}
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-w-2xl">
              {cards.map((card) => (
                <motion.button
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  disabled={card.matched || flippedCards.length >= 2}
                  className={`
                    w-20 h-20 md:w-24 md:h-24 rounded-xl border-2 transition-all
                    ${card.matched 
                      ? 'bg-green-500 border-green-400 cursor-default' 
                      : card.flipped 
                        ? 'bg-blue-500 border-blue-400' 
                        : 'bg-gray-700 border-gray-600 hover:border-gray-500 cursor-pointer'
                    }
                    flex items-center justify-center text-4xl md:text-5xl
                  `}
                  whileHover={!card.matched && !card.flipped ? { scale: 1.05 } : {}}
                  whileTap={!card.matched && !card.flipped ? { scale: 0.95 } : {}}
                >
                  {card.flipped || card.matched ? card.emoji : '?'}
                </motion.button>
              ))}
            </div>
          </>
        )}

        {hasPlayed && !gameStarted && (
          <div className="text-center">
            <p className="text-xl text-gray-400">Thanks for playing!</p>
          </div>
        )}
      </div>

    </FullPageGameWrapper>
  );
}

