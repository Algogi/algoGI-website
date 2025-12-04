"use client";

import { motion } from "framer-motion";
import HomeHero from "@/components/hero/home-hero";
import ServicesOverview from "@/components/sections/services-overview";
import CaseStudyStrip from "@/components/sections/case-study-strip";
import TechnologiesSection from "@/components/sections/technologies-section";
import HowWeWork from "@/components/sections/how-we-work";
import LeadCaptureForm from "@/components/forms/lead-capture-form";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <ServicesOverview />
      <HowWeWork />
      <TechnologiesSection />
      <CaseStudyStrip />
      <section className="section-padding bg-gradient-to-br from-dark-surface dark:from-dark-surface from-light-surface via-dark-bg dark:via-dark-bg via-light-bg to-dark-surface dark:to-dark-surface to-light-surface relative overflow-hidden">
        <div className="absolute inset-0 grid-background opacity-10" />
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
            {/* Left side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                  <span className="text-gradient">Start Your</span>{" "}
                  <span className="text-gray-900 dark:text-white">AI Transformation</span>
                </h2>
                <p className="text-xl text-gray-300 dark:text-gray-300 text-gray-700 mb-6 leading-relaxed">
                  From first commit to global rollout, we ship software that actually ships.
                </p>
                <p className="text-lg text-gray-400 dark:text-gray-400 text-gray-600 leading-relaxed">
                  Tell us what you&apos;re building. Get a clear plan in your inbox. Share a bit about your product, your timeline, and what &apos;success&apos; looks like.
                </p>
              </div>

              {/* Trust indicators */}
              <div className="grid grid-cols-2 gap-6 pt-8 border-t border-neon-blue/20 dark:border-neon-blue/20 border-neon-light-blue/30">
                <div>
                  <div className="text-3xl font-bold text-neon-blue dark:text-neon-blue text-neon-light-blue mb-2">24h</div>
                  <div className="text-sm text-gray-400 dark:text-gray-400 text-gray-600">Response Time</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-neon-purple dark:text-neon-purple text-neon-light-purple mb-2">100+</div>
                  <div className="text-sm text-gray-400 dark:text-gray-400 text-gray-600">Projects Delivered</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-neon-cyan dark:text-neon-cyan text-neon-light-blue mb-2">50+</div>
                  <div className="text-sm text-gray-400 dark:text-gray-400 text-gray-600">AI Solutions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-neon-blue dark:text-neon-blue text-neon-light-blue mb-2">5★</div>
                  <div className="text-sm text-gray-400 dark:text-gray-400 text-gray-600">Client Satisfaction</div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="relative pt-8">
                <div className="absolute top-0 left-0 w-32 h-32 border border-neon-blue/20 dark:border-neon-blue/20 border-neon-light-blue/30 rounded-lg rotate-12" />
                <div className="absolute top-8 left-8 w-24 h-24 border border-neon-purple/20 dark:border-neon-purple/20 border-neon-light-purple/30 rounded-lg -rotate-12" />
              </div>
            </motion.div>

            {/* Right side - Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <LeadCaptureForm />
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

