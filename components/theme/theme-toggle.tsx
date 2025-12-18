"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = theme === "dark";

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
    return (
      <div className="w-12 h-6 rounded-full bg-gray-300 dark:bg-gray-700" />
    );
  }

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    
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
      className="relative w-12 h-6 rounded-full p-1 transition-all duration-300 focus:outline-none"
      style={{
        background: isDark
          ? "linear-gradient(135deg, rgba(74, 58, 255, 0.3) 0%, rgba(176, 38, 255, 0.3) 100%)"
          : "linear-gradient(135deg, rgba(255, 193, 7, 0.3) 0%, rgba(255, 152, 0, 0.3) 100%)",
        border: isDark
          ? "1px solid rgba(74, 58, 255, 0.4)"
          : "1px solid rgba(255, 193, 7, 0.4)",
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      {/* Toggle track background */}
      <div 
        className="absolute inset-0 rounded-full backdrop-blur-sm"
        style={{
          backgroundColor: isDark 
            ? "rgba(10, 10, 10, 0.5)" 
            : "rgba(255, 255, 255, 0.5)",
        }}
      />
      
      {/* Toggle thumb */}
      <motion.div
        className="relative w-4 h-4 rounded-full flex items-center justify-center shadow-lg"
        animate={{
          x: isDark ? 0 : 24,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        style={{
          background: isDark
            ? "linear-gradient(135deg, #4A3AFF 0%, #b026ff 100%)"
            : "linear-gradient(135deg, #FFC107 0%, #FF9800 100%)",
        }}
      >
        {/* Icon inside thumb */}
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Moon className="w-2.5 h-2.5 text-white" fill="currentColor" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <Sun className="w-2.5 h-2.5 text-white" fill="currentColor" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
}

