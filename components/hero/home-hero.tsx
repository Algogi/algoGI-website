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
      <Tiles3DBackground />
      {/* Gradient fade at top to blend with header */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-dark-bg to-transparent pointer-events-none z-20" />
      <div className="container-custom relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="absolute -top-20 -left-20 w-72 h-72 bg-neon-blue/10 rounded-full blur-3xl"
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 1 }}
                className="absolute -bottom-20 -right-20 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl"
              />
              
              <div className="relative z-10">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="text-lg md:text-xl font-semibold text-gray-400 mb-3"
                >
                  AlgoGI: Algorithmic General Intelligence
                </motion.h2>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-white">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="block"
                  >
                    Engineering Tomorrow&apos;s
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="block"
                  >
                    <span className="text-gradient">Intelligence Today</span>
                  </motion.div>
                </h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  className="text-base md:text-lg text-gray-400 mb-8 leading-relaxed max-w-2xl"
                >
                  We fuse algorithms with general intelligence to create AI agents that learn, adapt, and transform your business. From smart automation to scalable AI platforms, AlgoGI delivers future-capable solutions that drive real impact.
                </motion.p>

                <motion.ul
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3, duration: 0.8 }}
                  className="space-y-3 mb-8 text-base text-gray-300"
                >
                  <li className="flex items-start">
                    <span className="text-neon-blue mr-3 mt-1">•</span>
                    <span>Neural network architectures and deep learning systems</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-neon-blue mr-3 mt-1">•</span>
                    <span>General intelligence agents that reason and adapt</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-neon-blue mr-3 mt-1">•</span>
                    <span>Algorithmic solutions that learn from data and experience</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-neon-blue mr-3 mt-1">•</span>
                    <span>From neural networks to production AI systems</span>
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
                  <Link href="/services" className="btn-secondary">
                    Explore Our Solutions
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            <ParallaxSection speed={0.3}>
              <Card3D className="relative h-[500px] lg:h-[600px]">
                <div className="relative h-full bg-gradient-to-br from-dark-card to-dark-surface rounded-3xl p-8 border border-neon-blue/30 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5 opacity-50" />
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="relative z-10 h-full flex flex-col items-center justify-center space-y-8"
                  >
                    <motion.div
                      animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="flex justify-center relative"
                    >
                      <Brain className="w-24 h-24 text-neon-blue" />
                      <motion.div
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Network className="w-32 h-32 text-neon-purple/40" />
                      </motion.div>
                    </motion.div>
                    
                    <div className="grid grid-cols-3 gap-4 w-full">
                      {[
                        { Icon: Cpu, label: "Algorithms", color: "neon-blue" },
                        { Icon: Brain, label: "Intelligence", color: "neon-purple" },
                        { Icon: Sparkles, label: "AI Systems", color: "neon-cyan" },
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1 + index * 0.2, duration: 0.6 }}
                          whileHover={{ scale: 1.1, y: -10 }}
                          className={`neon-card text-center group`}
                        >
                          <div className="flex justify-center mb-3 group-hover:scale-125 transition-transform duration-300">
                            <item.Icon className={`w-10 h-10 text-${item.color}`} />
                          </div>
                          <div className={`text-sm font-semibold text-${item.color}`}>
                            {item.label}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.6, duration: 1 }}
                      className="absolute inset-0 pointer-events-none"
                    >
                      <div className="absolute top-10 left-10 w-32 h-32 border border-neon-blue/30 rounded-lg rotate-12" />
                      <div className="absolute bottom-10 right-10 w-24 h-24 border border-neon-purple/30 rounded-lg -rotate-12" />
                    </motion.div>
                  </motion.div>
                </div>
              </Card3D>
            </ParallaxSection>
          </div>
        </div>
      </div>
    </section>
  );
}

