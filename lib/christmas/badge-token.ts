import { randomBytes } from 'crypto';

/**
 * Generate a unique token for sharing a prize badge
 */
export function generateBadgeToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Check if a date is after January 10, 2026
 * Returns true if current date is >= January 11, 2026 00:00 UTC
 */
export function isTokenExpired(): boolean {
  const expirationDate = new Date('2026-01-11T00:00:00Z'); // January 11, 2026 00:00 UTC (expires after Jan 10)
  const now = new Date();
  // Only expire if we're past the expiration date
  return now >= expirationDate;
}

/**
 * Get expiration date for badge tokens
 */
export function getExpirationDate(): Date {
  return new Date('2026-01-11T00:00:00Z');
}

