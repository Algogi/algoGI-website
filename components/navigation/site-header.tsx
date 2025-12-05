"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AlgogiLogo from "@/components/logo/algogi-logo";
import ThemeToggle from "@/components/theme/theme-toggle";

export default function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/case-studies", label: "Portfolio" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-[rgba(128,128,128,0.4)] backdrop-blur-xl relative border-b border-gray-500/20">
        {/* Seamless gradient transition to hero section */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-primary/30 to-transparent" />
        <div className="absolute -bottom-[1px] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent blur-[0.5px]" />
        {/* Subtle shadow that blends with hero */}
        <div className="absolute inset-0 shadow-[0_2px_20px_-5px_rgba(74,58,255,0.1)] pointer-events-none" />
        {/* Gradient fade at bottom for seamless blend */}
        <div className="absolute -bottom-4 left-0 right-0 h-4 bg-gradient-to-b from-[rgba(128,128,128,0.4)] to-transparent pointer-events-none" />
        <nav className="container-custom relative z-10">
          <div className="flex items-center justify-between min-h-[80px] py-3">
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
                  <AlgogiLogo className="h-12 sm:h-14 md:h-16 w-auto transition-all duration-300 group-hover:scale-105" />
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
                      className={`relative font-semibold transition-colors duration-300 group ${
                        isActive 
                          ? "text-brand-primary" 
                          : "text-gray-200 hover:text-brand-primary"
                      }`}
                    >
                      {link.label}
                      <motion.span
                        className={`absolute bottom-0 left-0 h-0.5 bg-brand-primary transition-all duration-300 ${
                          isActive ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                        initial={false}
                      />
                    </Link>
                  </motion.div>
                );
              })}
              <ThemeToggle />
              <Link href="/contact" className="btn-primary">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <ThemeToggle />
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg text-gray-200 hover:text-brand-primary hover:bg-brand-primary/10 focus:outline-none focus:ring-2 focus:ring-brand-primary"
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
          </div>
        </nav>
      </header>

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
                  className="p-2 rounded-lg text-gray-200 hover:text-brand-primary hover:bg-brand-primary/10 focus:outline-none focus:ring-2 focus:ring-brand-primary"
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
                            : "text-gray-200 hover:text-brand-primary hover:bg-brand-primary/5"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
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
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

