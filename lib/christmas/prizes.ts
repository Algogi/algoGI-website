import { Prize } from './types';

/**
 * Prize definitions with probabilities
 */
export const PRIZES: Prize[] = [
  {
    id: 'grand',
    name: '$100 Amazon Gift Card',
    description: 'Congratulations! You won the chance to win the grand prize! Winner will be announced January 10, 2025.',
    type: 'grand',
    probability: 0.01, // 1%
  },
  {
    id: 'offer-50',
    name: '50% Off First Project',
    description: 'Get 50% off your first AlgoGI project! Contact us to redeem.',
    type: 'offer',
    probability: 0.05, // 5%
  },
  {
    id: 'offer-audit',
    name: 'Free AI Audit',
    description: 'Get a free AI strategy audit for your business!',
    type: 'offer',
    probability: 0.10, // 10%
  },
  {
    id: 'offer-20',
    name: '20% Discount',
    description: 'Enjoy 20% off all AlgoGI services!',
    type: 'offer',
    probability: 0.15, // 15%
  },
  {
    id: 'fun-nice-try',
    name: 'Free Consultation',
    description: 'Get a free consultation with our team to discuss how we can help your business!',
    type: 'fun',
    probability: 0.30, // 30%
  },
  {
    id: 'fun-badge',
    name: 'Festive Badge',
    description: 'You earned a festive badge! Share your achievement!',
    type: 'fun',
    probability: 0.39, // 39% (remaining probability)
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
