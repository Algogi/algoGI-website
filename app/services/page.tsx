"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { BarChart3 } from "lucide-react";
import { services } from "./services-data";

function ServiceCard({
  service,
  index,
}: {
  service: typeof services[0];
  index: number;
}) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <Link href={`/services/${service.slug}`}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        className="neon-card rounded-2xl p-8 border border-neon-blue/30 dark:border-neon-blue/30 border-neon-light-blue/40 hover:border-neon-blue/50 dark:hover:border-neon-blue/50 hover:border-neon-light-blue/60 transition-all duration-300 group relative overflow-hidden cursor-pointer h-full flex flex-col"
      >
        {/* Gradient background on hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
        />
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Icon with gradient background */}
          <motion.div
            className="mb-8 flex justify-center"
            whileHover={{ scale: 1.15, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative">
              {/* Gradient glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-20 group-hover:opacity-30 rounded-2xl blur-xl transition-opacity duration-500`} />
              {/* Icon container */}
              <div className={`relative p-6 rounded-2xl bg-transparent dark:bg-dark-surface/50 border-2 border-neon-light-blue/40 dark:border-neon-blue/30 group-hover:border-neon-light-blue/60 dark:group-hover:border-neon-blue/50 transition-all duration-500 backdrop-blur-sm`}>
                <div className="relative z-10" style={{ filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.6))' }}>
                  <service.Icon className="w-20 h-20 text-neon-blue" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-neon-blue transition-colors">
            {service.title.split("-")[0].trim()}
          </h2>

          {/* Short description - flex-1 to push button down */}
          <p className="text-base text-gray-400 mb-8 leading-relaxed flex-1">
            {service.shortDescription}
          </p>

          {/* CTA Button - always at bottom */}
          <motion.div
            whileHover={{ x: 5 }}
            className="text-neon-blue font-semibold hover:text-neon-cyan flex items-center gap-2 group-hover:gap-3 transition-all w-full justify-between mt-auto"
          >
            <span>Learn More</span>
            <span className="text-xl">→</span>
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function ServicesPage() {
  return (
    <div className="section-padding bg-dark-bg relative overflow-hidden">
      <div className="absolute inset-0 grid-background opacity-10" />
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            AI Agent Development & Intelligent Automation Solutions
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 dark:text-gray-300 text-gray-700 max-w-4xl mx-auto">
            We specialize in AI agent development and AI-enabled software solutions that deliver agility, performance, and measurable impact.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <ServiceCard
              key={service.slug}
              service={service}
              index={index}
            />
          ))}
        </div>

        {/* Analytics Platforms Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="max-w-4xl mx-auto neon-card rounded-2xl p-10 md:p-12 border border-neon-purple/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-4 mb-6">
                <BarChart3 className="w-10 h-10 text-neon-purple" />
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Analytics <span className="text-gradient">Platforms</span>
                </h2>
              </div>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-8 text-center max-w-3xl mx-auto">
                AlgoGI also designs AI-powered analytics platforms that transform raw data into actionable intelligence. Our solutions enable real-time monitoring, predictive insights, and data-driven decision-making. We customize analytics to your unique needs, helping uncover trends and optimize strategies to enhance operational efficiency, customer experience, and business growth.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center neon-card rounded-2xl p-12 border border-neon-blue/30 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-neon-blue/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Let&apos;s co-create. Strategy to scale, we&apos;re your go-to AI software partner.
            </h2>
            <Link
              href="/contact"
              className="btn-primary text-lg px-8 py-4 inline-block transform hover:scale-105 transition-transform duration-200"
            >
              Discuss Your AI Needs
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
