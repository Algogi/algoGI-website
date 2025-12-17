"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initFirebaseAnalytics } from "@/lib/firebase/client";
import { logAnalyticsEvent, AnalyticsEvents } from "@/lib/firebase/analytics";

/**
 * Firebase Analytics Provider
 * Initializes Firebase Analytics and tracks page views
 */
export default function FirebaseAnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Initialize Firebase Analytics on mount
  useEffect(() => {
    initFirebaseAnalytics();
  }, []);

  // Track page views on route changes
  useEffect(() => {
    if (pathname) {
      logAnalyticsEvent(AnalyticsEvents.PAGE_VIEW, {
        page_path: pathname,
        page_title: document.title,
      });
    }
  }, [pathname]);

  return <>{children}</>;
}


