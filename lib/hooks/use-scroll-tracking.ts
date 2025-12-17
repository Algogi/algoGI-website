"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackScrollDepth, logAnalyticsEvent, AnalyticsEvents } from "@/lib/firebase/analytics";

export function useScrollTracking() {
  const pathname = usePathname();
  const trackedDepths = useRef<Set<number>>(new Set());
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Reset tracking on pathname change
    trackedDepths.current.clear();
    startTimeRef.current = Date.now();

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercentage = Math.round((scrollTop / (documentHeight - windowHeight)) * 100);

      // Track milestones: 25%, 50%, 75%, 100%
      const milestones = [25, 50, 75, 100];
      milestones.forEach((milestone) => {
        if (scrollPercentage >= milestone && !trackedDepths.current.has(milestone)) {
          trackedDepths.current.add(milestone);
          trackScrollDepth(milestone, pathname);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // Track time on page when component unmounts or pathname changes
  useEffect(() => {
    return () => {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 5) {
        // Only track if user spent more than 5 seconds
        logAnalyticsEvent(AnalyticsEvents.TIME_ON_PAGE, {
          page_path: pathname,
          time_seconds: timeSpent,
        });
      }
    };
  }, [pathname]);
}

