import { createHash } from 'crypto';

/**
 * Hash an email address using SHA-256
 * Used for creating unique cookie names without exposing the email
 */
export function hashEmail(email: string): string {
  const normalizedEmail = email.toLowerCase().trim();
  return createHash('sha256').update(normalizedEmail).digest('hex');
}

