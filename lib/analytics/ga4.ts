"use client";

import { hasAnalyticsConsent } from '@/lib/cookies/consent';
import { logAnalyticsEvent } from '@/lib/firebase/analytics';

/**
 * Track GA4 event using gtag (if available) or fallback to Firebase Analytics
 */
export function trackGA4Event(eventName: string, params: Record<string, any> = {}): void {
  // Check consent first
  if (!hasAnalyticsConsent()) {
    return;
  }

  // Add campaign parameter
  const eventParams = {
    ...params,
    campaign: 'christmas_2025',
  };

  // Try gtag first (GA4)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, eventParams);
  }

  // Also track with Firebase Analytics (which sends to GA4)
  logAnalyticsEvent(eventName, eventParams);
}

/**
 * Track Christmas campaign start
 */
export function trackChristmasStart(): void {
  trackGA4Event('christmas_start', {
    page_path: '/christmas',
  });
}

/**
 * Track question progress
 */
export function trackQuestionProgress(step: number, questionNumber: number): void {
  trackGA4Event('question_progress', {
    step,
    question_number: questionNumber,
  });
}

/**
 * Track form submission
 */
export function trackFormSubmit(): void {
  trackGA4Event('form_submit', {
    form_name: 'christmas_questionnaire',
  });
}

/**
 * Track lead generation
 */
export function trackLeadGenerated(): void {
  trackGA4Event('lead_generated', {
    campaign: 'christmas_2025',
    source: 'christmas_questionnaire',
  });
}

/**
 * Track game start
 */
export function trackGameStart(gameName: string): void {
  trackGA4Event('game_start', {
    game_name: gameName,
  });
}

/**
 * Track game completion
 */
export function trackGameComplete(gameName: string, prizeId: string, score?: number): void {
  trackGA4Event('game_complete', {
    game_name: gameName,
    prize_id: prizeId,
    prize_type: prizeId.split('-')[0], // 'grand', 'offer', 'fun'
    score: score || null,
  });
}

/**
 * Track questionnaire abandonment
 * Fired when user leaves the page without completing the questionnaire
 */
export function trackQuestionnaireAbandoned(
  step: number,
  questionId?: string,
  stepType?: string,
  totalSteps?: number
): void {
  const progressPercent = totalSteps ? Math.round((step / totalSteps) * 100) : 0;
  
  trackGA4Event('questionnaire_abandoned', {
    step,
    question_id: questionId || null,
    step_type: stepType || 'unknown',
    total_steps: totalSteps || 12,
    progress_percent: progressPercent,
  });

  // Also store in Firestore for admin analytics
  if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
    fetch('/api/analytics/christmas-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'questionnaire_abandoned',
        step,
        questionId,
        stepType,
        totalSteps,
        progressPercent,
      }),
    }).catch((err) => {
      // Silently fail - analytics shouldn't break the app
      console.error('Failed to store abandonment event:', err);
    });
  }
}

/**
 * Track question view
 * Fired when user views a specific question/step in the questionnaire
 */
export function trackQuestionView(
  step: number,
  questionId?: string,
  stepType?: string
): void {
  trackGA4Event('question_view', {
    step,
    question_id: questionId || null,
    step_type: stepType || 'unknown',
  });

  // Also store in Firestore for admin analytics
  if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
    fetch('/api/analytics/christmas-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'question_view',
        step,
        questionId,
        stepType,
        totalSteps: 12,
        progressPercent: Math.round((step / 12) * 100),
      }),
    }).catch((err) => {
      // Silently fail - analytics shouldn't break the app
      console.error('Failed to store question view event:', err);
    });
  }
}

