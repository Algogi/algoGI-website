import { getPrizeById } from './prizes';
import { ChristmasSubmission, ChristmasGamePlay, FilterOptions } from './admin-types';

/**
 * Calculate percentage with zero-division protection
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0 || !Number.isFinite(value) || !Number.isFinite(total)) {
    return 0;
  }
  return Math.round((value / total) * 100 * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate conversion rate from submissions to game plays
 */
export function calculateConversionRate(totalSubmissions: number, totalGamePlays: number): number {
  if (totalSubmissions === 0 || !Number.isFinite(totalSubmissions) || !Number.isFinite(totalGamePlays)) {
    return 0;
  }
  return Math.round((totalGamePlays / totalSubmissions) * 100 * 100) / 100; // Round to 2 decimal places
}

/**
 * Get display name for a game by its ID
 */
export function getGameDisplayName(gameName: string): string {
  const gameDisplayNames: Record<string, string> = {
    'dice': 'Dice Roll',
    'wheel': 'Spin the Wheel',
    'snow-catch': 'Catch the Snowflakes',
    'tree-ornament': 'Match the Characters',
  };
  
  return gameDisplayNames[gameName] || gameName;
}

/**
 * Get display name for a prize by its ID
 */
export function getPrizeDisplayName(prizeId: string): string {
  const prize = getPrizeById(prizeId);
  return prize?.name || prizeId;
}

/**
 * Format Firestore timestamp to date-only string (YYYY-MM-DD)
 * Handles both Firestore Timestamp objects and Date objects
 */
export function formatDateOnly(timestamp: any): string {
  if (!timestamp) {
    return '';
  }

  let date: Date;

  // Handle Firestore Timestamp
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    date = timestamp.toDate();
  }
  // Handle Firestore Timestamp with seconds/nanoseconds
  else if (timestamp.seconds !== undefined || timestamp._seconds !== undefined) {
    const seconds = timestamp.seconds || timestamp._seconds || 0;
    const nanoseconds = timestamp.nanoseconds || timestamp._nanoseconds || 0;
    date = new Date(seconds * 1000 + nanoseconds / 1000000);
  }
  // Handle Date object
  else if (timestamp instanceof Date) {
    date = timestamp;
  }
  // Handle string or number
  else {
    date = new Date(timestamp);
  }

  // Validate date
  if (isNaN(date.getTime())) {
    return '';
  }

  // Format as YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Format Firestore timestamp to readable date/time string
 * Handles both Firestore Timestamp objects and Date objects
 */
export function formatTimestamp(timestamp: any): string {
  if (!timestamp) {
    return 'N/A';
  }

  let date: Date;

  // Handle Firestore Timestamp
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    date = timestamp.toDate();
  }
  // Handle Firestore Timestamp with seconds/nanoseconds
  else if (timestamp.seconds !== undefined || timestamp._seconds !== undefined) {
    const seconds = timestamp.seconds || timestamp._seconds || 0;
    const nanoseconds = timestamp.nanoseconds || timestamp._nanoseconds || 0;
    date = new Date(seconds * 1000 + nanoseconds / 1000000);
  }
  // Handle Date object
  else if (timestamp instanceof Date) {
    date = timestamp;
  }
  // Handle string or number
  else {
    date = new Date(timestamp);
  }

  // Validate date
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  // Format as readable date/time
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Filter submissions based on filter options
 */
export function filterSubmissions(
  submissions: ChristmasSubmission[],
  options: FilterOptions
): ChristmasSubmission[] {
  let filtered = [...submissions];

  // Apply search filter
  if (options.search) {
    const searchLower = options.search.toLowerCase();
    filtered = filtered.filter((sub) => {
      const searchableText = [
        sub.firstName,
        sub.lastName,
        sub.email,
        sub.company,
        sub.companyWebsite,
        sub.phone,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchableText.includes(searchLower);
    });
  }

  // Apply additional filters
  if (options.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      filtered = filtered.filter((sub) => {
        const subValue = (sub as any)[key];
        if (value === undefined || value === null) return true;
        return String(subValue).toLowerCase() === String(value).toLowerCase();
      });
    });
  }

  // Apply sorting
  const sortBy = options.sortBy || 'submittedAt';
  const sortOrder = options.sortOrder || 'desc';

  filtered.sort((a, b) => {
    let aValue: any = (a as any)[sortBy];
    let bValue: any = (b as any)[sortBy];

    // Handle timestamps
    if (sortBy === 'submittedAt' || sortBy.includes('At')) {
      aValue = getTimestampValue(aValue);
      bValue = getTimestampValue(bValue);
    }

    // Handle string comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sortOrder === 'asc' ? comparison : -comparison;
    }

    // Handle number comparison
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Fallback
    const aStr = String(aValue || '');
    const bStr = String(bValue || '');
    const comparison = aStr.localeCompare(bStr);
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return filtered;
}

/**
 * Helper to extract timestamp value for sorting
 */
function getTimestampValue(timestamp: any): number {
  if (!timestamp) return 0;

  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().getTime();
  }
  if (timestamp.seconds !== undefined || timestamp._seconds !== undefined) {
    const seconds = timestamp.seconds || timestamp._seconds || 0;
    const nanoseconds = timestamp.nanoseconds || timestamp._nanoseconds || 0;
    return seconds * 1000 + nanoseconds / 1000000;
  }
  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }
  const date = new Date(timestamp);
  return isNaN(date.getTime()) ? 0 : date.getTime();
}

/**
 * Paginate an array
 */
export function paginate<T>(array: T[], page: number, pageSize: number): T[] {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return array.slice(startIndex, endIndex);
}

/**
 * Export submissions to CSV format
 */
export function exportSubmissionsToCSV(submissions: ChristmasSubmission[]): string {
  const headers = [
    'ID',
    'First Name',
    'Last Name',
    'Email',
    'Company',
    'Company Website',
    'Phone',
    'Q1: AI Tool',
    'Q2: AI Status',
    'Q3: Team Size',
    'Q4: Automation Potential',
    'Q5: Free Analysis',
    'Submitted At',
    'Campaign',
    'Source',
  ];

  const rows = submissions.map((sub) => {
    const formatTimestampForCSV = (timestamp: any): string => {
      if (!timestamp) return '';
      let date: Date;
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else if (timestamp.seconds !== undefined || timestamp._seconds !== undefined) {
        const seconds = timestamp.seconds || timestamp._seconds || 0;
        const nanoseconds = timestamp.nanoseconds || timestamp._nanoseconds || 0;
        date = new Date(seconds * 1000 + nanoseconds / 1000000);
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        date = new Date(timestamp);
      }
      if (isNaN(date.getTime())) return '';
      return date.toISOString();
    };

    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      // If contains comma, quote, or newline, wrap in quotes and escape quotes
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    return [
      escapeCSV(sub.id),
      escapeCSV(sub.firstName),
      escapeCSV(sub.lastName),
      escapeCSV(sub.email),
      escapeCSV(sub.company),
      escapeCSV(sub.companyWebsite || ''),
      escapeCSV(sub.phone || ''),
      escapeCSV(sub.q1 || ''),
      escapeCSV(sub.q2 || ''),
      escapeCSV(sub.q3 || ''),
      escapeCSV(sub.q4 || ''),
      escapeCSV(sub.q5 || ''),
      escapeCSV(formatTimestampForCSV(sub.submittedAt)),
      escapeCSV(sub.campaign || ''),
      escapeCSV(sub.source || ''),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Download CSV content as a file (client-side only)
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // This function should only be called on the client side
  if (typeof window === 'undefined') {
    console.warn('downloadCSV can only be called on the client side');
    return;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Filter game plays based on filter options
 */
export function filterGamePlays(
  gamePlays: ChristmasGamePlay[],
  options: FilterOptions
): ChristmasGamePlay[] {
  let filtered = [...gamePlays];

  // Apply search filter
  if (options.search) {
    const searchLower = options.search.toLowerCase();
    filtered = filtered.filter((play) => {
      const searchableText = [
        play.email,
        play.gameName,
        play.prizeId,
        play.prize?.name,
        getGameDisplayName(play.gameName),
        getPrizeDisplayName(play.prizeId),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchableText.includes(searchLower);
    });
  }

  // Apply additional filters
  if (options.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      filtered = filtered.filter((play) => {
        const playValue = (play as any)[key];
        if (value === undefined || value === null) return true;
        return String(playValue).toLowerCase() === String(value).toLowerCase();
      });
    });
  }

  // Apply sorting
  const sortBy = options.sortBy || 'playedAt';
  const sortOrder = options.sortOrder || 'desc';

  filtered.sort((a, b) => {
    let aValue: any = (a as any)[sortBy];
    let bValue: any = (b as any)[sortBy];

    // Handle timestamps
    if (sortBy === 'playedAt' || sortBy.includes('At')) {
      aValue = getTimestampValue(aValue);
      bValue = getTimestampValue(bValue);
    }

    // Handle string comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sortOrder === 'asc' ? comparison : -comparison;
    }

    // Handle number comparison
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Handle null/undefined values
    if (aValue === null || aValue === undefined) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    if (bValue === null || bValue === undefined) {
      return sortOrder === 'asc' ? 1 : -1;
    }

    // Fallback
    const aStr = String(aValue || '');
    const bStr = String(bValue || '');
    const comparison = aStr.localeCompare(bStr);
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return filtered;
}

/**
 * Export game plays to CSV format
 */
export function exportGamePlaysToCSV(gamePlays: ChristmasGamePlay[]): string {
  const headers = [
    'ID',
    'Email',
    'Game Name',
    'Game Display Name',
    'Prize ID',
    'Prize Name',
    'Score',
    'Badge Token',
    'Character ID',
    'Played At',
    'Campaign',
    'IP Address',
    'Badge URL',
    'Redeemed',
    'Fulfilled',
  ];

  const rows = gamePlays.map((play) => {
    const formatTimestampForCSV = (timestamp: any): string => {
      if (!timestamp) return '';
      let date: Date;
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else if (timestamp.seconds !== undefined || timestamp._seconds !== undefined) {
        const seconds = timestamp.seconds || timestamp._seconds || 0;
        const nanoseconds = timestamp.nanoseconds || timestamp._nanoseconds || 0;
        date = new Date(seconds * 1000 + nanoseconds / 1000000);
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        date = new Date(timestamp);
      }
      if (isNaN(date.getTime())) return '';
      return date.toISOString();
    };

    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      // If contains comma, quote, or newline, wrap in quotes and escape quotes
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    return [
      escapeCSV(play.id),
      escapeCSV(play.email),
      escapeCSV(play.gameName),
      escapeCSV(getGameDisplayName(play.gameName)),
      escapeCSV(play.prizeId),
      escapeCSV(getPrizeDisplayName(play.prizeId)),
      escapeCSV(play.score !== null && play.score !== undefined ? play.score : ''),
      escapeCSV(play.badgeToken || ''),
      escapeCSV(play.characterId || ''),
      escapeCSV(formatTimestampForCSV(play.playedAt)),
      escapeCSV(play.campaign || ''),
      escapeCSV(play.ipAddress || ''),
      escapeCSV(play.badgeUrl || ''),
      escapeCSV(play.redeemed ? 'Yes' : 'No'),
      escapeCSV(play.fulfilled ? 'Yes' : 'No'),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Export prize winners to CSV format
 */
export function exportPrizeWinnersToCSV(statistics: any[]): string {
  const headers = [
    'Prize ID',
    'Prize Name',
    'Prize Type',
    'Winner ID',
    'Email',
    'Game Name',
    'Game Display Name',
    'Played At',
    'Badge Token',
    'Redeemed',
    'Fulfilled',
  ];

  const rows: string[] = [];
  
  statistics.forEach((stat) => {
    stat.winners.forEach((winner: any) => {
      const formatTimestampForCSV = (timestamp: any): string => {
        if (!timestamp) return '';
        let date: Date;
        if (timestamp.toDate && typeof timestamp.toDate === 'function') {
          date = timestamp.toDate();
        } else if (timestamp.seconds !== undefined || timestamp._seconds !== undefined) {
          const seconds = timestamp.seconds || timestamp._seconds || 0;
          const nanoseconds = timestamp.nanoseconds || timestamp._nanoseconds || 0;
          date = new Date(seconds * 1000 + nanoseconds / 1000000);
        } else if (timestamp instanceof Date) {
          date = timestamp;
        } else {
          date = new Date(timestamp);
        }
        if (isNaN(date.getTime())) return '';
        return date.toISOString();
      };

      const escapeCSV = (value: any): string => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      rows.push([
        escapeCSV(stat.prizeId),
        escapeCSV(stat.prizeName),
        escapeCSV(stat.prizeType),
        escapeCSV(winner.id),
        escapeCSV(winner.email),
        escapeCSV(winner.gameName),
        escapeCSV(getGameDisplayName(winner.gameName)),
        escapeCSV(formatTimestampForCSV(winner.playedAt)),
        escapeCSV(winner.badgeToken || ''),
        escapeCSV(winner.redeemed ? 'Yes' : 'No'),
        escapeCSV(winner.fulfilled ? 'Yes' : 'No'),
      ].join(','));
    });
  });

  return [headers.join(','), ...rows].join('\n');
}