"use client";

import { useEffect, useRef } from "react";
import { hasAnalyticsConsent } from "@/lib/cookies/consent";
import { firebaseConfig } from "@/lib/firebase/client-config";

/**
 * Google Analytics Loader
 * Conditionally loads Google Analytics gtag scripts based on user consent.
 * Listens for consent changes to load scripts dynamically.
 * 
 * NOTE: If NEXT_PUBLIC_GA_MEASUREMENT_ID matches Firebase's measurementId,
 * this loader is skipped to prevent double tracking, as Firebase Analytics
 * already sends data to GA4 automatically.
 */
export default function GoogleAnalyticsLoader() {
  const scriptsLoaded = useRef(false);

  useEffect(() => {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    if (!measurementId) {
      return; // No GA measurement ID configured
    }

    // Skip loading if measurementId matches Firebase's (prevents double tracking)
    // Firebase Analytics already sends data to GA4 using its measurementId
    if (measurementId === firebaseConfig.measurementId) {
      return; // Firebase Analytics already handles this measurementId
    }

    const loadScripts = () => {
      // Check consent before loading scripts
      if (!hasAnalyticsConsent()) {
        return; // User hasn't consented to analytics
      }

      // Don't load if already loaded
      if (scriptsLoaded.current) {
        return;
      }

      // Load gtag script
      const script1 = document.createElement("script");
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script1);

      // Initialize gtag
      const script2 = document.createElement("script");
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${measurementId}', {
          page_path: window.location.pathname,
        });
      `;
      document.head.appendChild(script2);

      scriptsLoaded.current = true;
    };

    // Load on mount if consent already granted
    loadScripts();

    // Listen for consent changes
    window.addEventListener("consent-changed", loadScripts);

    return () => {
      window.removeEventListener("consent-changed", loadScripts);
    };
  }, []);

  return null;
}

