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
      <section className="section-padding bg-gradient-to-br from-dark-surface via-dark-bg to-dark-surface relative overflow-hidden">
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
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  <span className="text-gradient">Start Your</span>{" "}
                  <span className="text-white">AI Transformation</span>
                </h2>
                <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                  From first commit to global rollout, we ship software that actually ships.
                </p>
                <p className="text-lg text-gray-400 leading-relaxed">
                  Tell us what you're building. Get a clear plan in your inbox. Share a bit about your product, your timeline, and what 'success' looks like.
                </p>
              </div>

              {/* Trust indicators */}
              <div className="grid grid-cols-2 gap-6 pt-8 border-t border-neon-blue/20">
                <div>
                  <div className="text-3xl font-bold text-neon-blue mb-2">24h</div>
                  <div className="text-sm text-gray-400">Response Time</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-neon-purple mb-2">100+</div>
                  <div className="text-sm text-gray-400">Projects Delivered</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-neon-cyan mb-2">50+</div>
                  <div className="text-sm text-gray-400">AI Solutions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-neon-blue mb-2">5★</div>
                  <div className="text-sm text-gray-400">Client Satisfaction</div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="relative pt-8">
                <div className="absolute top-0 left-0 w-32 h-32 border border-neon-blue/20 rounded-lg rotate-12" />
                <div className="absolute top-8 left-8 w-24 h-24 border border-neon-purple/20 rounded-lg -rotate-12" />
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

