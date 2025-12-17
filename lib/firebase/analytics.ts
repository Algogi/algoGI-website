"use client";

import { logEvent, setUserProperties, setUserId, Analytics } from "firebase/analytics";
import { getFirebaseAnalytics } from "./client";

/**
 * Log a custom event to Firebase Analytics
 */
export async function logAnalyticsEvent(
  eventName: string,
  eventParams?: Record<string, any>
): Promise<void> {
  const trackingResults = {
    firebaseAnalytics: false,
    gtag: false,
    firestore: false,
  };

  // 1. Send to Firebase Analytics (GA4)
  try {
    const analytics = await getFirebaseAnalytics();
    if (analytics) {
      logEvent(analytics, eventName, eventParams);
      trackingResults.firebaseAnalytics = true;
    }
  } catch (error) {
    console.error("Error logging to Firebase Analytics:", error);
  }

  // 2. Send to Google Analytics via gtag() (redundancy)
  try {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag('event', eventName, {
        ...eventParams,
        event_category: eventParams?.event_category || 'custom',
        event_label: eventParams?.event_label || eventName,
      });
      trackingResults.gtag = true;
    }
  } catch (error) {
    console.error("Error logging to gtag:", error);
  }

  // 3. Dispatch custom event for debug panel (only in browser)
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("analytics:event", {
          detail: { eventName, params: eventParams, trackingResults },
        })
      );
    }
  } catch (error) {
    console.error("Error dispatching analytics event:", error);
  }

  // 4. Save to Firestore (non-blocking, fire and forget)
  try {
    if (typeof window !== "undefined") {
      // Non-blocking: don't await, let it run in background
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName,
          params: eventParams || {},
          pagePath: window.location.pathname,
          userAgent: navigator.userAgent,
          trackingResults,
        }),
      }).catch((error) => {
        // Silently fail - don't break user experience
        console.error("Error saving analytics to Firestore:", error);
      });
    }
  } catch (error) {
    // Silently fail - don't break user experience
    console.error("Error initiating Firestore save:", error);
  }
}

/**
 * Set user ID for analytics
 */
export async function setAnalyticsUserId(userId: string | null): Promise<void> {
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
 */
export async function setAnalyticsUserProperties(
  properties: Record<string, any>
): Promise<void> {
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
  LEAD_FORM_SUBMIT: "lead_form_submit",
  NEWSLETTER_SUBSCRIBE: "newsletter_subscribe",
  
  // Career related
  JOB_APPLICATION_START: "job_application_start",
  JOB_APPLICATION_SUBMIT: "job_application_submit",
  JOB_VIEW: "job_view",
  
  // Downloads
  FILE_DOWNLOAD: "file_download",
  CASE_STUDY_DOWNLOAD: "case_study_download",
  DOWNLOAD_START: "download_start",
  DOWNLOAD_COMPLETE: "download_complete",
  
  // Engagement
  SERVICE_VIEW: "service_view",
  BLOG_VIEW: "blog_view",
  PORTFOLIO_VIEW: "portfolio_view",
  CASE_STUDY_VIEW: "case_study_view",
  
  // CTA clicks
  CTA_CLICK: "cta_click",
  FLOATING_CTA_CLICK: "floating_cta_click",
  CONTACT_BUTTON_CLICK: "contact_button_click",
  FLOATING_CTA_VIEW: "floating_cta_view",
  
  // Navigation
  NAVIGATION_CLICK: "navigation_click",
  FOOTER_LINK_CLICK: "footer_link_click",
  EXTERNAL_LINK_CLICK: "external_link_click",
  
  // Modals
  MODAL_OPEN: "modal_open",
  MODAL_CLOSE: "modal_close",
  MODAL_DOWNLOAD_CLICK: "modal_download_click",
  
  // Engagement metrics
  SCROLL_DEPTH: "scroll_depth",
  TIME_ON_PAGE: "time_on_page",
  
  // Theme
  THEME_TOGGLE: "theme_toggle",
  
  // Chat widget
  CHAT_WIDGET_OPEN: "chat_widget_open",
  CHAT_WIDGET_MESSAGE_SENT: "chat_widget_message_sent",
} as const;

/**
 * Helper function to track link clicks
 */
export async function trackLinkClick(
  url: string,
  text: string,
  location: string,
  isExternal: boolean = false
): Promise<void> {
  const eventName = isExternal 
    ? AnalyticsEvents.EXTERNAL_LINK_CLICK 
    : location === "footer" 
    ? AnalyticsEvents.FOOTER_LINK_CLICK 
    : AnalyticsEvents.NAVIGATION_CLICK;
  
  await logAnalyticsEvent(eventName, {
    link_text: text,
    link_url: url,
    link_location: location,
    page_path: typeof window !== "undefined" ? window.location.pathname : "",
  });
}

/**
 * Helper function to track CTA button clicks
 */
export async function trackCTAClick(
  text: string,
  location: string,
  destination: string
): Promise<void> {
  await logAnalyticsEvent(AnalyticsEvents.CTA_CLICK, {
    cta_text: text,
    cta_location: location,
    cta_destination: destination,
    page_path: typeof window !== "undefined" ? window.location.pathname : "",
  });
}

/**
 * Helper function to track modal open/close
 */
export async function trackModalOpen(
  modalType: string,
  contentId?: string
): Promise<void> {
  await logAnalyticsEvent(AnalyticsEvents.MODAL_OPEN, {
    modal_type: modalType,
    modal_content_id: contentId || "",
    page_path: typeof window !== "undefined" ? window.location.pathname : "",
  });
}

export async function trackModalClose(
  modalType: string,
  contentId?: string,
  timeSpent?: number
): Promise<void> {
  await logAnalyticsEvent(AnalyticsEvents.MODAL_CLOSE, {
    modal_type: modalType,
    modal_content_id: contentId || "",
    time_spent: timeSpent || 0,
    page_path: typeof window !== "undefined" ? window.location.pathname : "",
  });
}

/**
 * Helper function to track scroll depth
 */
export async function trackScrollDepth(
  percentage: number,
  path?: string
): Promise<void> {
  await logAnalyticsEvent(AnalyticsEvents.SCROLL_DEPTH, {
    scroll_percentage: percentage,
    page_path: path || (typeof window !== "undefined" ? window.location.pathname : ""),
  });
}

