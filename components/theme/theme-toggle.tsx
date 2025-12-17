"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { logAnalyticsEvent, AnalyticsEvents } from "@/lib/firebase/analytics";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update light class when theme changes
  useEffect(() => {
    if (!mounted) return;
    
    const html = document.documentElement;
    if (theme === "light") {
      html.classList.add("light");
    } else {
      html.classList.remove("light");
    }
  }, [theme, mounted]);

  if (!mounted) {
    return null;
  }

  const handleThemeToggle = () => {
    const previousTheme = theme || "dark";
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    
    // Track theme toggle
    logAnalyticsEvent(AnalyticsEvents.THEME_TOGGLE, {
      new_theme: newTheme,
      previous_theme: previousTheme,
      page_path: typeof window !== "undefined" ? window.location.pathname : "",
    });
    
    // Immediately update the light class
    const html = document.documentElement;
    if (newTheme === "light") {
      html.classList.add("light");
    } else {
      html.classList.remove("light");
    }
  };

  return (
    <motion.button
      onClick={handleThemeToggle}
      className="relative p-2 rounded-lg bg-dark-surface border border-neon-blue/20 hover:border-neon-blue transition-all duration-300 group"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{
          rotate: theme === "dark" ? 0 : 180,
          opacity: theme === "dark" ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Moon className="w-5 h-5 text-neon-blue" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          rotate: theme === "dark" ? -180 : 0,
          opacity: theme === "dark" ? 0 : 1,
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <Sun className="w-5 h-5 text-yellow-400" />
      </motion.div>
    </motion.button>
  );
}

