"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import AlgogiLogo from "@/components/logo/algogi-logo";
import ThemeToggle from "@/components/theme/theme-toggle";
import { logAnalyticsEvent, AnalyticsEvents } from "@/lib/firebase/analytics";

export default function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();
  const pathname = usePathname();

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll detection with requestAnimationFrame for smooth performance
  useEffect(() => {
    let ticking = false;
    const scrollThreshold = 100;

    const updateScrollState = () => {
      setIsScrolled(window.scrollY > scrollThreshold);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    };

    // Check initial scroll position
    updateScrollState();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Theme-aware background colors
  const getBackgroundColor = () => {
    if (!isScrolled) {
      // Match hero section background when not scrolled to prevent white strip
      // Hero uses bg-dark-bg which is #0a0a0a in dark mode
      return theme === "light" 
        ? "rgba(255, 255, 255, 0.01)" // Nearly transparent but prevents white strip
        : "rgba(10, 10, 10, 0.01)"; // Nearly transparent but matches hero background
    }
    // Dock state - theme-aware with glassy transparency and accent color (default to dark if theme not loaded)
    return theme === "light" 
      ? "rgba(255, 255, 255, 0.6)" // Glassy white with more transparency
      : "rgba(10, 10, 10, 0.6)"; // Glassy dark with more transparency
  };

  // Theme-aware border color
  const getBorderColor = () => {
    return theme === "light" 
      ? "border-gray-200/40" 
      : "border-gray-500/20";
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/case-studies", label: "Portfolio" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
    { href: "/careers", label: "Careers" },
    // { href: "/contact", label: "Contact" },
  ];

  const handleLinkClick = (href: string, label: string) => {
    logAnalyticsEvent(AnalyticsEvents.LINK_CLICK, {
      link_text: label,
      link_destination: href,
      link_location: "header",
    });
  };

  const handleCTAClick = () => {
    logAnalyticsEvent(AnalyticsEvents.CTA_CLICK, {
      cta_text: "Contact Us",
      cta_location: "header",
      cta_destination: "/contact",
    });
  };

  return (
    <>
      <motion.header 
        className="sticky top-0 z-50 w-full"
        style={{ 
          backgroundColor: "transparent",
          marginTop: 0,
          paddingTop: 0,
        }}
        animate={{
          top: isMobile ? "0rem" : (isScrolled ? "1rem" : "0rem"),
          backgroundColor: "transparent",
        }}
        transition={{
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {/* Outer wrapper - reduce width on scroll, add padding before scroll */}
        <motion.div
          className={isMobile ? "w-full relative" : "mx-auto relative"}
          style={{ willChange: "max-width, padding" }}
          animate={{
            maxWidth: isMobile ? "100%" : (isScrolled ? "72rem" : "80rem"), // Full width on mobile, reduce by 10% on desktop scroll
            paddingLeft: isMobile ? "0rem" : (isScrolled ? "0rem" : "2rem"), // No padding on mobile for full width
            paddingRight: isMobile ? "0rem" : (isScrolled ? "0rem" : "2rem"), // No padding on mobile for full width
          }}
          transition={{
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <motion.div
            className={`relative rounded-b-2xl md:rounded-2xl ${isScrolled ? "backdrop-blur-xl" : ""}`}
            style={{ 
              willChange: "transform, background-color", 
              backgroundColor: "transparent",
              backgroundImage: isScrolled && theme === "light" 
                ? "linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0.6) 100%)"
                : undefined
            }}
            animate={{
              backgroundColor: theme === "light" && isScrolled ? "transparent" : getBackgroundColor(),
              boxShadow: "none",
            }}
            transition={{
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {/* Accent color overlay - only visible when scrolled */}
            {isScrolled && (
              <div 
                className="absolute inset-0 rounded-b-2xl md:rounded-2xl pointer-events-none"
                style={{
                  background: theme === "light"
                    ? "linear-gradient(135deg, rgba(74, 58, 255, 0.12) 0%, rgba(176, 38, 255, 0.12) 100%)"
                    : "linear-gradient(135deg, rgba(74, 58, 255, 0.2) 0%, rgba(176, 38, 255, 0.2) 100%)",
                  opacity: 0.3
                }}
              />
            )}

            {/* Border - only show when scrolled */}
            {isScrolled && (
              <motion.div
                className={`absolute inset-0 border rounded-b-2xl md:rounded-2xl pointer-events-none ${getBorderColor()}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
            )}

            <nav className="relative z-10">
          <motion.div 
            className="flex items-center justify-between p-2 sm:p-3 lg:p-4"
            style={{ willChange: "min-height" }}
            animate={{
              minHeight: isScrolled ? "56px" : "67px", // 20% bigger before scroll (56px * 1.2 = 67.2px)
            }}
            transition={{
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center"
            >
              <Link 
                href="/" 
                className="flex items-center group relative"
              >
                <div className="relative px-2 py-1">
                  <AlgogiLogo className="w-auto h-8 sm:h-9 md:h-10 group-hover:scale-105 transition-all duration-300" />
                  <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/5 rounded-lg transition-all duration-300 -z-10 blur-sm" />
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link, index) => {
                const isActive = pathname === link.href || 
                  (link.href !== "/" && pathname.startsWith(link.href));
                
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => handleLinkClick(link.href, link.label)}
                      className={`relative font-semibold transition-colors duration-300 group ${
                        !isScrolled && theme === "light"
                          ? "text-gray-900 hover:text-brand-primary"
                          : "text-logo-color hover:text-brand-primary"
                      }`}
                    >
                      {link.label}
                      <motion.span
                        className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-brand-primary via-accent to-brand-primary transition-all duration-300 ${
                          isActive ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                        style={{
                          backgroundImage: isActive 
                            ? "linear-gradient(to right, #4A3AFF, #b026ff, #4A3AFF)"
                            : undefined
                        }}
                        initial={false}
                      />
                    </Link>
                  </motion.div>
                );
              })}
              <ThemeToggle />
              <Link href="/contact" onClick={handleCTAClick} className="btn-primary h-8 sm:h-9 md:h-10 flex items-center justify-center p-3 sm:p-4 md:p-5 text-sm sm:text-base">
                Contact Us
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <ThemeToggle />
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg text-logo-color hover:text-brand-primary hover:bg-brand-primary/10 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                <motion.svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isMobileMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </motion.svg>
              </motion.button>
            </div>
          </motion.div>
        </nav>
          </motion.div>
        </motion.div>
      </motion.header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-y-0 right-0 z-[70] w-80 bg-[rgba(30,30,30,0.95)] backdrop-blur-xl border-l border-gray-500/20 md:hidden shadow-2xl"
          >
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between min-h-[80px] px-6 py-4 border-b border-gray-500/20">
                <Link 
                  href="/" 
                  className="flex items-center group relative"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="relative px-2 py-1">
                    <AlgogiLogo className="h-12 w-auto transition-all duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/5 rounded-lg transition-all duration-300 -z-10 blur-sm" />
                  </div>
                </Link>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg text-logo-color hover:text-brand-primary hover:bg-brand-primary/10 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 px-6 py-6 space-y-2 overflow-y-auto">
                {navLinks.map((link, index) => {
                  const isActive = pathname === link.href || 
                    (link.href !== "/" && pathname.startsWith(link.href));
                  
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={link.href}
                        className={`font-semibold transition-colors py-3 px-4 block relative rounded-lg ${
                          isActive 
                            ? "text-brand-primary bg-brand-primary/10" 
                            : "text-logo-color hover:text-brand-primary hover:bg-brand-primary/5"
                        }`}
                        onClick={() => {
                          handleLinkClick(link.href, link.label);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-primary rounded-r" />
                        )}
                        {link.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Sidebar Footer */}
              <div className="border-t border-gray-500/20 px-6 py-4">
                <Link
                  href="/contact"
                  className="btn-primary text-center block"
                  onClick={() => {
                    handleCTAClick();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

