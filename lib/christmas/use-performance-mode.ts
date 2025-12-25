"use client";

import { useState, useEffect } from "react";

export type PerformanceMode = "high" | "medium" | "low" | "minimal";

/**
 * Detects device capabilities and returns appropriate performance mode
 * for Christmas background animations.
 * 
 * Detection logic:
 * - prefers-reduced-motion → minimal
 * - Mobile (width < 768) → start at low
 * - Hardware concurrency (< 4 cores) → reduce by one level
 * - Device memory if available (< 4GB) → reduce by one level
 * - Final mode: lowest of all checks
 */
export function usePerformanceMode(): PerformanceMode {
  const [mode, setMode] = useState<PerformanceMode>("high");

  useEffect(() => {
    const detectPerformanceMode = (): PerformanceMode => {
      // Check for reduced motion preference (highest priority)
      if (typeof window !== "undefined" && window.matchMedia) {
        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        if (prefersReducedMotion) {
          return "minimal";
        }
      }

      // Start with high performance
      let detectedMode: PerformanceMode = "high";

      // Check if mobile device
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        detectedMode = "low";
      }

      // Check hardware concurrency (CPU cores)
      const hardwareConcurrency = navigator.hardwareConcurrency || 4;
      if (hardwareConcurrency < 4) {
        // Reduce by one level
        const modeMap: Record<PerformanceMode, PerformanceMode> = {
          high: "medium",
          medium: "low",
          low: "minimal",
          minimal: "minimal",
        };
        detectedMode = modeMap[detectedMode];
      }




      
      // Check device memory if available (experimental API)
      const deviceMemory = (navigator as any).deviceMemory;
      if (deviceMemory !== undefined && deviceMemory < 4) {
        // Reduce by one level
        const modeMap: Record<PerformanceMode, PerformanceMode> = {
          high: "medium",
          medium: "low",
          low: "minimal",
          minimal: "minimal",
        };
        detectedMode = modeMap[detectedMode];
      }

      return detectedMode;
    };

    setMode(detectPerformanceMode());

    // Listen for resize events to re-detect on orientation change
    const handleResize = () => {
      setMode(detectPerformanceMode());
    };

    // Listen for reduced motion preference changes
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleReducedMotionChange = () => {
      setMode(detectPerformanceMode());
    };

    window.addEventListener("resize", handleResize);
    mediaQuery.addEventListener("change", handleReducedMotionChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      mediaQuery.removeEventListener("change", handleReducedMotionChange);
    };
  }, []);

  return mode;
}

