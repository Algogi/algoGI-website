"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Target, CheckCircle2, Sparkles, TrendingUp, Users, Globe, Shield, Zap, Code } from "lucide-react";

export default function AboutPage() {
  const strengths = [
    { icon: Code, text: "Full-stack software and AI development capabilities" },
    { icon: Users, text: "Agile teams with extensive domain expertise" },
    { icon: TrendingUp, text: "Successful track record across startups and enterprises" },
    { icon: Shield, text: "Secure, scalable, and compliant solutions" },
    { icon: Zap, text: "Transparent collaboration and long-term partnerships" },
  ];

  const milestones = [
    { value: "20+", label: "AI-powered projects completed", icon: TrendingUp },
    { value: "10+", label: "Industries served", icon: Globe },
    { value: "95%", label: "Client retention rate", icon: CheckCircle2 },
    { value: "5+", label: "Global countries", icon: Globe },
  ];

  const culturePoints = [
    {
      title: "Diverse Expertise",
      description: "Our team comprises professionals from varied backgrounds, each contributing unique skills and perspectives.",
      icon: Users,
    },
    {
      title: "Collaboration",
      description: "We value open communication, mutual respect, and a commitment to helping each other grow.",
      icon: Users,
    },
    {
      title: "Support",
      description: "Managers and team leads are always available to guide you as you integrate into our projects and culture.",
      icon: Shield,
    },
  ];

  return (
    <div className="bg-dark-bg relative overflow-hidden">
      <div className="absolute inset-0 grid-background opacity-10" />
      
      {/* Hero Section */}
      <section className="section-padding relative z-10">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              <span className="text-gradient">Innovation Driven</span>{" "}
              <span className="text-gray-900 dark:text-white">By AI-Powered Engineering</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 dark:text-gray-300 leading-relaxed max-w-4xl mx-auto mb-10">
              We are a fervent group of software innovators, engineers, and designers-creating future-capable solutions for companies worldwide. With profound technical expertise in artificial intelligence, product design, and full-cycle development, we drive complex challenges to intelligent, scalable systems.
            </p>
            <Link
              href="/contact"
              className="btn-primary text-lg px-8 py-4 inline-block transform hover:scale-105 transition-transform duration-200"
            >
              Let&apos;s Build the Future Together
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative z-10">
        <div className="h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
      </div>

      {/* Our Vision */}
      <section className="section-padding relative z-10">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="p-3 rounded-xl bg-neon-blue/10 border border-neon-blue/30">
                <Target className="w-8 h-8 text-neon-blue" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Our Vision</h2>
            </div>
            <div className="text-center">
              <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-6 font-medium">
                Empowering businesses to transform with intelligent digital solutions.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed max-w-3xl mx-auto">
                We imagine a future where AI-powered technology delivers frictionless, smart, and meaningful experiences. Our goal is to drive that change-one solution at a time.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative z-10">
        <div className="h-px bg-gradient-to-r from-transparent via-neon-purple/20 to-transparent" />
      </div>

      {/* Our Strengths */}
      <section className="section-padding relative z-10 bg-dark-bg">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-4">
              Our <span className="text-gradient">Strengths</span>
            </h2>
            <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
              What sets us apart in delivering exceptional AI solutions
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {strengths.map((strength, index) => {
                const Icon = strength.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="neon-card p-8 rounded-xl border border-neon-blue/30 hover:border-neon-blue/50 transition-all group hover:shadow-[0_0_30px_rgba(0,240,255,0.1)]"
                  >
                    <div className="mb-5">
                      <div className="w-12 h-12 rounded-lg bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center group-hover:bg-neon-blue/20 transition-colors">
                        <Icon className="w-6 h-6 text-neon-blue" />
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed text-base">{strength.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative z-10">
        <div className="h-px bg-gradient-to-r from-transparent via-neon-purple/20 to-transparent" />
      </div>

      {/* Why AlgoGI? */}
      <section className="section-padding relative z-10">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-5xl mx-auto"
          >
            <div className="neon-card p-10 md:p-14 rounded-2xl border border-neon-purple/30 relative overflow-hidden bg-gradient-to-br from-neon-purple/10 dark:from-dark-card via-neon-blue/15 dark:via-dark-surface/50 to-neon-purple/10 dark:to-dark-card">
              <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/5 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 rounded-xl bg-neon-purple/10 border border-neon-purple/30">
                    <Sparkles className="w-8 h-8 text-neon-purple" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    Why <span className="text-gradient">AlgoGI?</span>
                  </h2>
                </div>
                <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-6 font-semibold">
                  We don&apos;t only develop products-we develop Solutions
                </p>
                <div className="space-y-4">
                  <p className="text-lg text-gray-400 leading-relaxed">
                    With a solid background in AI and software development, we provide the optimal combination of innovation, pace, and stability to turn your digital concepts into reality. We don&apos;t just build products-we craft tailored AI solutions.
                  </p>
                  <p className="text-lg text-gray-400 leading-relaxed">
                    Combining deep tech expertise with speed and stability, we collaborate closely from concept to deployment, ensuring scalable, future-ready outcomes that align with your business goals and drive real impact.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative z-10">
        <div className="h-px bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent" />
      </div>

      {/* Milestones & Metrics */}
      <section className="section-padding relative z-10 bg-gradient-to-b from-neon-cyan/5 dark:from-dark-bg via-neon-blue/10 dark:via-dark-surface/30 to-neon-purple/5 dark:to-dark-bg">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-4">
              Milestones & <span className="text-gradient">Metrics</span>
            </h2>
            <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
              Numbers that reflect our commitment to excellence
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {milestones.map((milestone, index) => {
                const Icon = milestone.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="neon-card p-8 rounded-xl border border-neon-cyan/30 dark:border-neon-cyan/30 border-neon-light-blue/40 text-center hover:border-neon-cyan/50 dark:hover:border-neon-cyan/50 hover:border-neon-light-blue/60 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] dark:hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(0,136,204,0.15)]"
                  >
                    <div className="mb-4">
                      <div className="w-12 h-12 rounded-lg bg-neon-cyan/10 dark:bg-neon-cyan/10 bg-neon-light-blue/20 border border-neon-cyan/30 dark:border-neon-cyan/30 border-neon-light-blue/40 flex items-center justify-center mx-auto">
                        <Icon className="w-6 h-6 text-neon-cyan" />
                      </div>
                    </div>
                    <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-300 dark:from-gray-300 from-gray-700 via-neon-blue/60 dark:via-neon-blue/60 via-neon-light-blue/80 to-gray-400 dark:to-gray-400 to-gray-600 bg-clip-text text-transparent mb-3" style={{ textShadow: '0 0 10px rgba(0, 240, 255, 0.15)' }}>
                      {milestone.value}
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{milestone.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative z-10">
        <div className="h-px bg-gradient-to-r from-transparent via-neon-blue/20 to-transparent" />
      </div>

      {/* Team And Culture */}
      <section className="section-padding relative z-10">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-6">
              Team And <span className="text-gradient">Culture</span>
            </h2>
            <div className="text-center mb-12 max-w-3xl mx-auto space-y-4">
              <p className="text-lg text-gray-300 leading-relaxed">
                We foster a vibrant and inclusive company culture that fuels our creativity and drives our success.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                We believe in creating a collaborative environment where every team member&apos;s unique perspectives and talents are valued and respected.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {culturePoints.map((point, index) => {
                const Icon = point.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="neon-card p-8 rounded-xl border border-neon-blue/30 hover:border-neon-blue/50 transition-all group hover:shadow-[0_0_30px_rgba(0,240,255,0.1)]"
                  >
                    <div className="mb-5">
                      <div className="w-12 h-12 rounded-lg bg-neon-blue/10 border border-neon-blue/30 flex items-center justify-center group-hover:bg-neon-blue/20 transition-colors">
                        <Icon className="w-6 h-6 text-neon-blue" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{point.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{point.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative z-10">
        <div className="h-px bg-gradient-to-r from-transparent via-neon-blue/20 to-transparent" />
      </div>

      {/* Final CTA */}
      <section className="section-padding relative z-10">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center neon-card rounded-2xl p-12 md:p-16 border border-neon-blue/30 max-w-4xl mx-auto relative overflow-hidden bg-gradient-to-br from-neon-blue/10 dark:from-dark-card via-neon-purple/15 dark:via-dark-surface/50 to-neon-blue/10 dark:to-dark-card"
          >
            <div className="absolute top-0 left-0 w-64 h-64 bg-neon-blue/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8">
                Let&apos;s build the future of software together.
              </h2>
              <Link
                href="/contact"
                className="btn-primary text-lg px-8 py-4 inline-block transform hover:scale-105 transition-transform duration-200"
              >
                Let&apos;s Talk
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

