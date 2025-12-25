/**
 * Christmas characters for festive badges
 */
export interface ChristmasCharacter {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const CHRISTMAS_CHARACTERS: ChristmasCharacter[] = [
  {
    id: 'santa',
    name: 'Santa Claus',
    emoji: '🎅',
    description: 'The jolly gift-giver himself!',
  },
  {
    id: 'elf',
    name: 'Christmas Elf',
    emoji: '🧝',
    description: 'Santa\'s helpful workshop assistant!',
  },
  {
    id: 'reindeer',
    name: 'Rudolph',
    emoji: '🦌',
    description: 'The red-nosed reindeer!',
  },
  {
    id: 'snowman',
    name: 'Frosty',
    emoji: '⛄',
    description: 'The magical snowman!',
  },
  {
    id: 'gingerbread',
    name: 'Gingerbread',
    emoji: '🍪',
    description: 'Sweet and festive!',
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    emoji: '❄️',
    description: 'Unique and beautiful!',
  },
  {
    id: 'candy-cane',
    name: 'Candy Cane',
    emoji: '🍭',
    description: 'Sweet and striped!',
  },
  {
    id: 'ornament',
    name: 'Ornament',
    emoji: '🎄',
    description: 'A festive decoration!',
  },
  {
    id: 'bell',
    name: 'Jingle Bell',
    emoji: '🔔',
    description: 'Ring in the holidays!',
  },
  {
    id: 'gift',
    name: 'Gift Box',
    emoji: '🎁',
    description: 'A special present!',
  },
];

/**
 * Get a random Christmas character
 */
export function getRandomCharacter(): ChristmasCharacter {
  const randomIndex = Math.floor(Math.random() * CHRISTMAS_CHARACTERS.length);
  return CHRISTMAS_CHARACTERS[randomIndex];
}

/**
 * Get a character by ID
 */
export function getCharacterById(id: string): ChristmasCharacter | undefined {
  return CHRISTMAS_CHARACTERS.find(char => char.id === id);
}

