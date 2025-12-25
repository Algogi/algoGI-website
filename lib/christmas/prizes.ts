import { Prize } from './types';

/**
 * Prize definitions with probabilities
 */
export const PRIZES: Prize[] = [
  {
    id: 'gift-100',
    name: '$100 Amazon Gift Card',
    description: 'You have won a chance to win: $100 Amazon Gift Card. Winners will be announced on January 5th, 2026 on our website and through email.',
    type: 'grand',
    probability: 0.01, // 1%
  },
  {
    id: 'gift-50',
    name: '$50 Amazon Gift Card',
    description: 'You have won a chance to win: $50 Amazon Gift Card. Winners will be announced on January 5th, 2026 on our website and through email.',
    type: 'offer',
    probability: 0.02, // 2%
  },
  {
    id: 'gift-20',
    name: '$20 Amazon Gift Card',
    description: 'You have won a chance to win: $20 Amazon Gift Card. Winners will be announced on January 5th, 2026 on our website and through email.',
    type: 'offer',
    probability: 0.05, // 5%
  },
  {
    id: 'gift-10',
    name: '$10 Amazon Gift Card',
    description: 'You have won a chance to win: $10 Amazon Gift Card. Winners will be announced on January 5th, 2026 on our website and through email.',
    type: 'offer',
    probability: 0.10, // 10%
  },
  {
    id: 'fun-badge',
    name: 'Festive Badge',
    description: 'You earned a festive badge! Share your achievement!',
    type: 'fun',
    probability: 0.32, // 32%
  },
  {
    id: 'fun-better-luck',
    name: 'Better luck next time with the gift card',
    description: 'Better luck next time with the gift card',
    type: 'fun',
    probability: 0.50, // 50% (remaining probability)
  },
];

/**
 * Select a prize based on weighted random selection
 */
export function selectPrize(diceRoll?: number): Prize {
  // If dice roll provided, use it to influence prize selection
  // Higher dice roll = better chance at better prizes
  let random = Math.random();
  
  if (diceRoll !== undefined) {
    // Adjust random based on dice roll (1-6)
    // Higher roll increases chance of better prizes
    const diceMultiplier = (diceRoll - 1) / 5; // 0 to 1
    random = random * (1 - diceMultiplier * 0.3); // Reduce random by up to 30% for higher rolls
  }

  // Calculate cumulative probabilities
  let cumulative = 0;
  for (const prize of PRIZES) {
    cumulative += prize.probability;
    if (random <= cumulative) {
      return prize;
    }
  }

  // Fallback to last prize (shouldn't happen, but safety)
  return PRIZES[PRIZES.length - 1];
}

/**
 * Get prize by ID
 */
export function getPrizeById(id: string): Prize | undefined {
  return PRIZES.find(p => p.id === id);
}

/**
 * Calculate prize based on game result
 */
export function calculatePrizeForGame(
  gameName: string,
  score?: number,
  diceRoll?: number
): Prize {
  switch (gameName) {
    case 'dice':
      return selectPrize(diceRoll);
    case 'wheel':
      // Wheel has predefined segments, but we'll use weighted random
      return selectPrize();
    case 'snow-catch':
      // Higher score = better prize chance
      const scoreMultiplier = score ? Math.min(score / 20, 1) : 0;
      return selectPrize(Math.floor(scoreMultiplier * 6) + 1);
    case 'tree-ornament':
      // Completion = good prize chance
      return selectPrize(4);
    default:
      return selectPrize();
  }
}
