"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { useInView } from "react-intersection-observer";
import { Linkedin, Twitter, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import AlgogiLogo from "@/components/logo/algogi-logo";

export default function SiteFooter() {
  const [email, setEmail] = useState("");
  const [agreedToMarketing, setAgreedToMarketing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const [logoRef, logoInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, agreedToMarketing }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Thank you for subscribing!",
        });
        setEmail("");
        setAgreedToMarketing(false);
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "Failed to subscribe. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61576218601719#", label: "Facebook" },
    { icon: Instagram, href: "https://instagram.com/algogi_", label: "Instagram" },
    { icon: Linkedin, href: "https://www.linkedin.com/company/algogi/", label: "LinkedIn" },
  ];

  const footerLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/case-studies", label: "Portfolio" },
    { href: "/about", label: "About" },
  ];

  const services = [
    "Custom AI & Generative AI Solutions",
    "AI Strategy & Consulting",
    "AI-Driven Automation & Workflow Optimization",
    "AI-Powered Virtual Employees & Chatbots",
    "AI Model Training, Monitoring & Optimization",
    "AI Data Analytics & Insights",
  ];

  return (
    <footer className="bg-dark-bg border-t border-brand-blue/20 relative overflow-hidden">
      <div className="absolute inset-0 grid-background opacity-10" />
      <div className="container-custom py-16 relative z-10">
        {/* Email Section - Separate CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 pb-12 border-b border-gray-700"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Get in Touch
            </h3>
            <p className="text-gray-400 mb-6">
              Have a question or want to discuss your project? Reach out to us via email.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <a
                href="mailto:info@algogi.com"
                className="btn-primary flex items-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Email Us: info@algogi.com
              </a>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          {/* Left Column - Company Info & Newsletter */}
          <div className="space-y-8">
            {/* Logo */}
            <div ref={logoRef}>
              <AlgogiLogo 
                className="h-12 w-auto mb-2" 
                animateOnMount={logoInView}
                enableHover={true}
                enableSvgAnimation={true}
              />
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-white font-bold mb-4 text-lg">Subscribe to Our Newsletter</h4>
              <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="@"
                  required
                  className="w-full px-4 py-3 bg-dark-card border border-gray-600 rounded-lg focus:ring-2 focus:ring-neon-blue focus:border-neon-blue outline-none text-white placeholder-gray-500 transition-all"
                />
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="marketing-consent"
                    checked={agreedToMarketing}
                    onChange={(e) => setAgreedToMarketing(e.target.checked)}
                    required
                    className="mt-1 w-4 h-4 rounded border-gray-600 bg-dark-card text-neon-blue focus:ring-neon-blue focus:ring-offset-dark-bg"
                  />
                  <label htmlFor="marketing-consent" className="text-sm text-gray-400 leading-relaxed">
                    I agree to receive marketing emails from AlgoGI Technologies.
                  </label>
                </div>
                <motion.button
                  type="submit"
                  disabled={isSubmitting || !agreedToMarketing}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-3 bg-neon-gradient text-dark-bg font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] relative overflow-hidden"
                >
                  <span className="relative z-10">{isSubmitting ? "Sending..." : "Send"}</span>
                </motion.button>
                {submitStatus.type && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-xs ${
                      submitStatus.type === "success"
                        ? "text-neon-cyan"
                        : "text-red-400"
                    }`}
                  >
                    {submitStatus.message}
                  </motion.p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-500 text-gray-500">
                  We only send interesting and relevant emails
                </p>
              </form>
            </div>

            {/* Footer Navigation Links */}
            <div className="flex flex-wrap gap-4 text-sm">
              {footerLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-gray-400 hover:text-neon-blue transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Middle Column - Services */}
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Services</h4>
            <ul className="space-y-3 mb-8">
              {services.map((service, index) => (
                <li key={index}>
                  <Link
                    href="/services"
                    className="text-gray-400 hover:text-neon-blue transition-colors duration-300 text-sm leading-relaxed block"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Social Media Icons */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-dark-card border border-gray-600 flex items-center justify-center hover:border-neon-blue hover:bg-neon-blue/10 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 text-gray-400 hover:text-neon-blue transition-colors" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Right Column - Contact Info & Social Media */}
          <div className="space-y-8">
            {/* USA Contact */}
            <div>
              <h4 className="text-white font-bold mb-4 text-lg">USA</h4>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-neon-blue" />
                  <a href="tel:+15402688778" className="hover:text-neon-blue transition-colors">
                    +1 540 268 8778
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-neon-blue flex-shrink-0" />
                  <a href="mailto:info@algogi.com" className="hover:text-neon-blue transition-colors">
                    info@algogi.com
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-neon-blue mt-1 flex-shrink-0" />
                  <span>
                    131 CONTINENTAL DRIVE, SUITE 305 NEWARK, New Castle, DE -19713
                  </span>
                </div>
              </div>
            </div>

            {/* India Contact */}
            <div>
              <h4 className="text-white font-bold mb-4 text-lg">India</h4>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-neon-blue" />
                  <a href="tel:+918770170371" className="hover:text-neon-blue transition-colors">
                    +91 877 017 0371
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-neon-blue flex-shrink-0" />
                  <a href="mailto:info@algogi.com" className="hover:text-neon-blue transition-colors">
                    info@algogi.com
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-neon-blue mt-1 flex-shrink-0" />
                  <span>
                    JBR Tech Park, Plot No. 77, 6th Rd, EPIP Zone, Whitefield, Bengaluru, Karnataka 560066
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 dark:border-gray-700 border-gray-300 pt-8">
          <p className="text-sm text-gray-500 dark:text-gray-500 text-gray-500 text-center">
            All Rights reserved to AlgoGI Tech LLP 2025
          </p>
        </div>
      </div>
    </footer>
  );
}

