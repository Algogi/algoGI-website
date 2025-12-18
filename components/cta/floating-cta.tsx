"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { MessageSquare, X } from "lucide-react";
import { logAnalyticsEvent, AnalyticsEvents } from "@/lib/firebase/analytics";

export default function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Show CTA after user scrolls down 300px
    const handleScroll = () => {
      if (window.scrollY > 300 && !isDismissed) {
        setIsVisible(true);
      } else if (window.scrollY <= 300) {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  const handleCTAClick = () => {
    logAnalyticsEvent(AnalyticsEvents.FLOATING_CTA_CLICK, {
      cta_text: "Get Started",
      cta_location: "floating",
      cta_destination: "/contact",
    });
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8"
        >
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-2xl p-4 md:p-6 border shadow-2xl backdrop-blur-md bg-dark-card/95 dark:bg-light-card/95 border-neon-blue/30 dark:border-neon-light-blue/30"
            >
              <button
                onClick={handleDismiss}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-700 dark:bg-gray-300 hover:bg-gray-600 dark:hover:bg-gray-400 flex items-center justify-center transition-colors z-10"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4 text-white dark:text-gray-900" />
              </button>
              
              <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-neon-blue/10 dark:bg-neon-light-blue/20 border border-neon-blue/30 dark:border-neon-light-blue/40 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 md:w-7 md:h-7 text-neon-blue dark:text-neon-light-blue" />
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left min-w-0">
                  <p className="text-sm md:text-base font-semibold text-white dark:text-gray-900 mb-1">
                    Ready to get started?
                  </p>
                  <p className="text-xs md:text-sm text-gray-400 dark:text-gray-600">
                    Let&apos;s discuss your AI project
                  </p>
                </div>
                
                <Link
                  href="/contact"
                  className="btn-primary text-sm md:text-base px-4 md:px-6 py-2 md:py-3 whitespace-nowrap flex-shrink-0"
                  onClick={handleCTAClick}
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
            
            {/* Pulse animation */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-neon-blue/20 dark:bg-neon-light-blue/30 blur-xl -z-10"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

