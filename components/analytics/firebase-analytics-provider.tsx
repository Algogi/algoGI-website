"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initFirebaseAnalytics } from "@/lib/firebase/client";
import { logAnalyticsEvent, AnalyticsEvents } from "@/lib/firebase/analytics";
import { hasAnalyticsConsent } from "@/lib/cookies/consent";

/**
 * Firebase Analytics Provider
 * Initializes Firebase Analytics and tracks page views
 * Only initializes if user has granted analytics consent
 * Listens for consent changes to initialize dynamically
 */
export default function FirebaseAnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Initialize Firebase Analytics on mount or when consent changes
  useEffect(() => {
    const initializeIfConsented = () => {
      if (hasAnalyticsConsent()) {
        initFirebaseAnalytics();
      }
    };

    // Initialize on mount
    initializeIfConsented();

    // Listen for consent changes
    window.addEventListener("consent-changed", initializeIfConsented);

    return () => {
      window.removeEventListener("consent-changed", initializeIfConsented);
    };
  }, []);

  // Track page views on route changes (only if consent granted)
  useEffect(() => {
    if (pathname && hasAnalyticsConsent()) {
      logAnalyticsEvent(AnalyticsEvents.PAGE_VIEW, {
        page_path: pathname,
        page_title: document.title,
      });
    }
  }, [pathname]);

  return <>{children}</>;
}

