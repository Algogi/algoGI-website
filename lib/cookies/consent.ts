"use client";

/**
 * Cookie consent preferences structure
 */
export interface CookieConsent {
  essential: boolean; // always true, non-optional
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

const CONSENT_STORAGE_KEY = "cookie-consent";

/**
 * Get current consent preferences from localStorage
 */
export function getConsent(): CookieConsent | null {
  if (typeof window === "undefined") {
    return null; // Server-side, return null
  }

  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const consent = JSON.parse(stored) as CookieConsent;
    // Validate structure
    if (
      typeof consent.essential === "boolean" &&
      typeof consent.analytics === "boolean" &&
      typeof consent.marketing === "boolean" &&
      typeof consent.timestamp === "number"
    ) {
      return consent;
    }
    return null;
  } catch (error) {
    console.error("Error reading consent from localStorage:", error);
    return null;
  }
}

/**
 * Save consent preferences to localStorage
 * Dispatches a 'consent-changed' event to notify listeners
 */
export function setConsent(consent: Partial<CookieConsent>): void {
  if (typeof window === "undefined") {
    return; // Server-side, skip
  }

  try {
    const fullConsent: CookieConsent = {
      essential: true, // Always true
      analytics: consent.analytics ?? false,
      marketing: consent.marketing ?? false,
      timestamp: Date.now(),
    };

    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(fullConsent));
    
    // Dispatch consent change event for dynamic analytics initialization
    window.dispatchEvent(new CustomEvent("consent-changed", {
      detail: fullConsent,
    }));
  } catch (error) {
    console.error("Error saving consent to localStorage:", error);
  }
}

/**
 * Check if user has given consent (any consent exists)
 */
export function hasConsent(): boolean {
  return getConsent() !== null;
}

/**
 * Check if consent is required (no consent exists yet)
 */
export function requiresConsent(): boolean {
  return !hasConsent();
}

/**
 * Check if analytics consent is granted
 */
export function hasAnalyticsConsent(): boolean {
  const consent = getConsent();
  return consent?.analytics === true;
}

/**
 * Check if marketing consent is granted
 */
export function hasMarketingConsent(): boolean {
  const consent = getConsent();
  return consent?.marketing === true;
}

/**
 * Clear consent (for testing or user preference reset)
 */
export function clearConsent(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    // Dispatch consent change event
    window.dispatchEvent(new CustomEvent("consent-changed"));
  } catch (error) {
    console.error("Error clearing consent from localStorage:", error);
  }
}

/**
 * Check if user is likely in EU region based on timezone
 * This is a simple heuristic - for production, consider using a geolocation service
 */
export function isEURegion(): boolean {
  if (typeof window === "undefined") {
    return false; // Server-side, default to non-EU
  }

  try {
    // EU timezones (simplified list)
    const euTimezones = [
      "Europe/", // All European timezones
    ];

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Check if timezone starts with Europe/
    return euTimezones.some(tz => timezone.startsWith(tz));
  } catch (error) {
    // If timezone detection fails, default to non-EU (less restrictive)
    return false;
  }
}

