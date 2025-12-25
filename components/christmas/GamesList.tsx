"use client";

import { useEffect, useState } from 'react';
import GameCard from './GameCard';

interface GameStatus {
  gameName: string;
  hasPlayed: boolean;
}

export default function GamesList() {
  const [gameStatuses, setGameStatuses] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameStatuses = async () => {
      try {
        const response = await fetch('/api/christmas/game-play');
        const data = await response.json();
        
        if (data.games) {
          const statusMap: Record<string, boolean> = {};
          data.games.forEach((game: GameStatus) => {
            statusMap[game.gameName] = game.hasPlayed;
          });
          setGameStatuses(statusMap);
        }
      } catch (error) {
        console.error('Error fetching game statuses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameStatuses();
  }, []);

  const GAMES = [
    {
      id: 'dice',
      name: 'Dice Roll',
      description: 'Roll the dice and win prizes!',
      icon: '🎲',
      color: 'blue',
    },
    {
      id: 'wheel',
      name: 'Spin the Wheel',
      description: 'Spin for a chance to win!',
      icon: '🎡',
      color: 'purple',
    },
    {
      id: 'snow-catch',
      name: 'Catch the Snowflakes',
      description: 'Click on falling snowflakes!',
      icon: '❄️',
      color: 'cyan',
    },
    {
      id: 'tree-ornament',
      name: 'Match the Characters',
      description: 'Match pairs of Christmas characters!',
      icon: '🎄',
      color: 'green',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl christmas-subtitle">Loading games...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {GAMES.map((game) => (
        <GameCard
          key={game.id}
          id={game.id}
          name={game.name}
          description={game.description}
          icon={game.icon}
          color={game.color}
          disabled={gameStatuses[game.id] || false}
        />
      ))}
    </div>
  );
}
