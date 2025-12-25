'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { christmasFormSchema } from './schema';
import { setChristmasCookie, checkHasPlayed, getCookieName } from '@/lib/christmas/cookies';
import { getDb } from '@/lib/firebase/config';
import { FieldValue } from 'firebase-admin/firestore';
import type { ChristmasFormInput } from './schema';

/**
 * Check if user has already played (server-side)
 */
export async function checkChristmasCookie(email: string): Promise<boolean> {
  return await checkHasPlayed(email);
}

/**
 * Submit Christmas form and set cookie
 */
export async function submitChristmasForm(formData: FormData) {
  try {
    // Extract form data
    const rawData: Record<string, string> = {};
    formData.forEach((value, key) => {
      rawData[key] = value.toString();
    });

    // Validate with Zod (includes email format and work email validation)
    let validatedData;
    try {
      validatedData = christmasFormSchema.parse(rawData);
    } catch (zodError: any) {
      const errors = zodError.errors || [];
      const firstError = errors[0];
      return {
        success: false,
        error: firstError ? `${firstError.path.join('.')}: ${firstError.message}` : 'Validation failed. Please check all required fields.',
      };
    }

    // Check if user has already played
    const hasPlayed = await checkHasPlayed(validatedData.email);
    if (hasPlayed) {
      return {
        success: false,
        error: 'You have already participated in this campaign. Each email can only participate once.',
      };
    }

    // Set cookie
    try {
      await setChristmasCookie(validatedData.email);
    } catch (cookieError) {
      console.error('Error setting cookie:', cookieError);
      return {
        success: false,
        error: 'Failed to set session cookie. Please try again.',
      };
    }

    // Save to Christmas submissions collection
    try {
      const db = getDb();
      await db.collection('christmas_submissions').add({
        ...validatedData,
        campaign: 'christmas_2025',
        submittedAt: FieldValue.serverTimestamp(),
        source: 'christmas_campaign',
      });
    } catch (dbError) {
      console.error('Error saving Christmas submission to Firestore:', dbError);
      // In development, still allow redirect even if DB fails
      if (process.env.NODE_ENV === 'production') {
        return {
          success: false,
          error: 'Failed to save your information. Please try again.',
        };
      }
      // In dev, continue even if DB fails
    }

    // Note: Analytics tracking (lead_generated) will be done client-side
    // after redirect, as server actions can't directly call client-side analytics

    // Redirect to games page
    redirect('/christmas/games');
  } catch (error: any) {
    // Handle redirect errors first (these are expected when redirect works)
    // Next.js redirect() throws a special error that should be re-thrown
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error; // Re-throw redirect errors - Next.js will handle them
    }
    
    // Don't log redirect errors - they're expected behavior
    if (error?.name === 'ZodError') {
      const errors = error.errors || [];
      const firstError = errors[0];
      return {
        success: false,
        error: firstError ? `${firstError.path.join('.')}: ${firstError.message}` : 'Validation failed. Please check all required fields.',
      };
    }

    // Only log actual errors, not redirects
    console.error('Error submitting Christmas form:', error);
    return {
      success: false,
      error: error?.message || 'Failed to submit form. Please try again.',
    };
  }
}

