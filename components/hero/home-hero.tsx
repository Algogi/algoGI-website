"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, Network, Cpu, Sparkles } from "lucide-react";
import Tiles3DBackground from "./3d-tiles-background";
import SplitText from "@/components/animations/split-text";
import GlitchText from "@/components/animations/glitch-text";
import Card3D from "@/components/animations/3d-card";
import ParallaxSection from "@/components/animations/parallax-section";

export default function HomeHero() {
  return (
    <section className="relative section-padding bg-dark-bg overflow-hidden min-h-screen flex items-center grid-background -mt-20 pt-24">
      {/* Dark overlay for more prominence */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black pointer-events-none z-0" />
      <Tiles3DBackground />
      {/* Subtle radial gradient for depth */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(74, 58, 255, 0.05) 50%, transparent 100%)' }} />
      {/* Gradient fade at top to blend with header */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-dark-bg to-transparent pointer-events-none z-20" />
      <div className="container-custom relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Algo + GI - Mobile First (above content) */}
            <ParallaxSection speed={0.3} className="lg:order-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="relative h-full flex items-center justify-center"
              >
                {/* Animated "Algo + GI" Text - Horizontal on mobile, Vertical on desktop */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center justify-center gap-4 md:gap-6"
                >
                  <motion.div
                    className="flex flex-row lg:flex-col items-center justify-center gap-4 md:gap-6"
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Algo */}
                    <motion.span
                      className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extrabold relative"
                      variants={{
                        hidden: { opacity: 0, y: -80, x: 20, scale: 0.7 },
                        visible: {
                          opacity: 1,
                          x: 0,
                          y: 0,
                          scale: 1,
                          transition: {
                            duration: 1,
                            delay: 0.2,
                            ease: [0.22, 1, 0.36, 1],
                          },
                        },
                      }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="text-gradient bg-clip-text text-transparent">
                        AlgoGI
                      </span>
                    </motion.span>
{/* 
                  
                    <motion.span
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-400 relative"
                      variants={{
                        hidden: { opacity: 0, scale: 0 },
                        visible: {
                          opacity: 1,
                          scale: 1,
                          transition: {
                            duration: 0.6,
                            delay: 0.5,
                            ease: [0.22, 1, 0.36, 1],
                          },
                        },
                      }}
                    >
                      +
                    </motion.span> */}

                    {/* GI */}
                    {/* <motion.span
                      className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extrabold relative"
                      variants={{
                        hidden: { opacity: 0, y: 80, x: 20, scale: 0.7 },
                        visible: {
                          opacity: 1,
                          x: 0,
                          y: 0,
                          scale: 1,
                          transition: {
                            duration: 1,
                            delay: 0.8,
                            ease: [0.22, 1, 0.36, 1],
                          },
                        },
                      }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="text-gradient bg-clip-text text-transparent">
                        Applied General Intelligence
                      </span>
                    </motion.span> */}
                  </motion.div>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4, duration: 0.8 }}
                    className="text-base sm:text-lg md:text-xl lg:text-2xl text-logo-color mt-0 lg:mt-6 font-medium tracking-wide text-center"
                  >
                    Practical AI systems engineered for business execution
                  </motion.p>
                </motion.div>
              </motion.div>
            </ParallaxSection>

            {/* Hero Content - Mobile Second (below Algo + GI) */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative lg:order-1"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="absolute -top-20 -left-20 w-72 h-72 bg-brand-primary/10 rounded-full blur-3xl"
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 1 }}
                className="absolute -bottom-20 -right-20 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl"
              />
              
              <div className="relative z-10">

                <h1 className="hero-title text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-white">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="block"
                  >
                    Engineering <span className="text-gradient">Applied Intelligence</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="block"
                  >
                    for Real Business Outcomes
                  </motion.div>
                </h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  className="text-base md:text-lg text-logo-color mb-8 leading-relaxed max-w-2xl"
                >
                  We design and deploy Applied General Intelligence systems - AI-powered automations, analytics, and agents that improve revenue, operations, and decision-making today, not someday.
                </motion.p>

                <motion.ul
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3, duration: 0.8 }}
                  className="space-y-3 mb-8 text-base text-logo-color"
                >
                  <li className="flex items-start">
                    <span className="text-logo-color mr-3 mt-1">•</span>
                    <span>Applied intelligence systems for revenue, marketing, and operations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-logo-color mr-3 mt-1">•</span>
                    <span>AI agents developed for specific business workflows, not experiments</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-logo-color mr-3 mt-1">•</span>
                    <span>Data-driven automation that improves over time</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-logo-color mr-3 mt-1">•</span>
                    <span>From strategy and architecture to production deployment</span>
                  </li>
                </motion.ul>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4, duration: 0.8 }}
                  className="flex flex-col sm:flex-row gap-6"
                >
                  <Link href="/contact" className="btn-primary">
                    Start Your AI Transformation
                  </Link>
                  <Link href="/services" className="btn-secondary text-[#201F54] border-[#201F54] hover:border-[#201F54]/80 hover:text-[#201F54]/90 dark:text-logo-color dark:border-logo-color dark:hover:border-logo-color/80 dark:hover:text-logo-color/90">
                    Explore Our Solutions
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

