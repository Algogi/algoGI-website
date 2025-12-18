"use client";

import { logEvent, setUserProperties, setUserId, Analytics } from "firebase/analytics";
import { getFirebaseAnalytics } from "./client";
import { hasAnalyticsConsent } from "@/lib/cookies/consent";

/**
 * Log a custom event to Firebase Analytics
 * Only logs if user has granted analytics consent
 */
export async function logAnalyticsEvent(
  eventName: string,
  eventParams?: Record<string, any>
): Promise<void> {
  // Check consent before attempting to log
  if (!hasAnalyticsConsent()) {
    return; // User hasn't consented to analytics
  }

  try {
    const analytics = await getFirebaseAnalytics();
    if (analytics) {
      logEvent(analytics, eventName, eventParams);
    }
  } catch (error) {
    console.error("Error logging analytics event:", error);
  }
}

/**
 * Set user ID for analytics
 * Only sets if user has granted analytics consent
 */
export async function setAnalyticsUserId(userId: string | null): Promise<void> {
  // Check consent before attempting to set user ID
  if (!hasAnalyticsConsent()) {
    return; // User hasn't consented to analytics
  }

  try {
    const analytics = await getFirebaseAnalytics();
    if (analytics && userId) {
      setUserId(analytics, userId);
    }
  } catch (error) {
    console.error("Error setting analytics user ID:", error);
  }
}

/**
 * Set user properties for analytics
 * Only sets if user has granted analytics consent
 */
export async function setAnalyticsUserProperties(
  properties: Record<string, any>
): Promise<void> {
  // Check consent before attempting to set properties
  if (!hasAnalyticsConsent()) {
    return; // User hasn't consented to analytics
  }

  try {
    const analytics = await getFirebaseAnalytics();
    if (analytics) {
      setUserProperties(analytics, properties);
    }
  } catch (error) {
    console.error("Error setting analytics user properties:", error);
  }
}

/**
 * Common event names for consistency
 */
export const AnalyticsEvents = {
  // Page views
  PAGE_VIEW: "page_view",
  
  // User actions
  BUTTON_CLICK: "button_click",
  FORM_SUBMIT: "form_submit",
  LINK_CLICK: "link_click",
  
  // Contact & Lead generation
  CONTACT_FORM_SUBMIT: "contact_form_submit",
  LEAD_FORM_START: "lead_form_start",
  LEAD_FORM_SUBMIT: "lead_form_submit",
  NEWSLETTER_SUBSCRIBE: "newsletter_subscribe",
  
  // Career related
  JOB_APPLICATION_START: "job_application_start",
  JOB_APPLICATION_SUBMIT: "job_application_submit",
  JOB_VIEW: "job_view",
  
  // Downloads
  FILE_DOWNLOAD: "file_download",
  CASE_STUDY_DOWNLOAD: "case_study_download",
  
  // Engagement
  SERVICE_VIEW: "service_view",
  BLOG_VIEW: "blog_view",
  PORTFOLIO_VIEW: "portfolio_view",
  
  // CTA clicks
  CTA_CLICK: "cta_click",
  FLOATING_CTA_CLICK: "floating_cta_click",
} as const;

