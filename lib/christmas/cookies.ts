import { cookies } from 'next/headers';
import { hashEmail } from './email-hash';
import { ChristmasCookie } from './types';

const COOKIE_PREFIX = 'christmas-2025-';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 365 days in seconds

/**
 * Get the cookie name for a given email
 */
export function getCookieName(email: string): string {
  const emailHash = hashEmail(email);
  return `${COOKIE_PREFIX}${emailHash}`;
}

/**
 * Check if a user has already played (server-side)
 */
export async function checkHasPlayed(email: string): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieName = getCookieName(email);
  const cookie = cookieStore.get(cookieName);
  return !!cookie;
}

/**
 * Set the Christmas cookie (server-side)
 */
export async function setChristmasCookie(email: string): Promise<void> {
  const cookieStore = await cookies();
  const cookieName = getCookieName(email);
  const emailHash = hashEmail(email);
  
  const cookieValue: ChristmasCookie = {
    emailHash,
    timestamp: Date.now(),
    email, // Store email for reference
  };

  cookieStore.set(cookieName, JSON.stringify(cookieValue), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * Get the Christmas cookie (server-side)
 */
export async function getChristmasCookie(email: string): Promise<ChristmasCookie | null> {
  const cookieStore = await cookies();
  const cookieName = getCookieName(email);
  const cookie = cookieStore.get(cookieName);

  if (!cookie) {
    return null;
  }

  try {
    return JSON.parse(cookie.value) as ChristmasCookie;
  } catch {
    return null;
  }
}

