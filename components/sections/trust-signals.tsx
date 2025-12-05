"use client";

import { motion } from "framer-motion";
import { Shield, Award, CheckCircle2, Star, Users, TrendingUp } from "lucide-react";

const certifications = [
  { name: "ISO 27001", icon: Shield, description: "Information Security" },
  { name: "SOC 2", icon: Shield, description: "Security & Compliance" },
  { name: "GDPR Compliant", icon: Award, description: "Data Protection" },
];

const testimonials = [
  {
    quote: "AlgoGI transformed our customer support with an AI agent that handles 85% of inquiries. The ROI was immediate.",
    author: "Sarah Chen",
    role: "CTO, TechCorp",
    rating: 5,
  },
  {
    quote: "Their AI strategy consulting helped us prioritize initiatives that delivered $50M in revenue lift. Exceptional expertise.",
    author: "Michael Rodriguez",
    role: "VP Engineering, RetailCo",
    rating: 5,
  },
  {
    quote: "The intelligent automation platform reduced our processing time by 90%. AlgoGI delivers on their promises.",
    author: "Emily Johnson",
    role: "Operations Director, FinanceHub",
    rating: 5,
  },
];

export default function TrustSignals() {
  return (
    <section className="section-padding bg-gradient-to-b from-dark-bg via-dark-surface/30 to-dark-bg dark:from-dark-bg dark:via-dark-surface/30 dark:to-dark-bg from-light-bg via-light-surface/50 to-light-bg relative overflow-hidden">
      <div className="absolute inset-0 grid-background opacity-10" />
      <div className="container-custom relative z-10">
        {/* Certifications & Security Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 md:mb-24"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Trusted & <span className="text-gradient">Certified</span>
          </h2>
          <p className="text-lg text-gray-400 dark:text-gray-400 text-gray-600 max-w-2xl mx-auto mb-6">
            We maintain the highest standards for security, compliance, and quality
          </p>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {certifications.map((cert, index) => {
              const Icon = cert.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="neon-card p-6 rounded-xl border border-neon-blue/30 dark:border-neon-blue/30 border-neon-light-blue/40 text-center min-w-[180px]"
                >
                  <Icon className="w-10 h-10 text-neon-blue dark:text-neon-blue text-neon-light-blue mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{cert.name}</h3>
                  <p className="text-sm text-gray-400 dark:text-gray-400 text-gray-600">{cert.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Client Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6 md:mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-3">
            What Our <span className="text-gradient">Clients Say</span>
          </h2>
          <p className="text-lg text-gray-400 dark:text-gray-400 text-gray-600 text-center max-w-2xl mx-auto mb-8">
            Real results from real clients
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="neon-card p-6 rounded-xl border border-neon-purple/30 dark:border-neon-purple/30 border-neon-light-purple/40 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/5 dark:bg-neon-purple/5 bg-neon-light-purple/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-300 dark:text-gray-300 text-gray-700 mb-4 leading-relaxed italic">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  <div className="pt-4 border-t border-neon-purple/20 dark:border-neon-purple/20 border-neon-light-purple/30">
                    <p className="font-semibold text-gray-900 dark:text-white">{testimonial.author}</p>
                    <p className="text-sm text-gray-400 dark:text-gray-400 text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Social Proof Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <div className="text-center neon-card p-6 rounded-xl border border-neon-cyan/30 dark:border-neon-cyan/30 border-neon-light-blue/40">
            <Users className="w-8 h-8 text-neon-cyan dark:text-neon-cyan text-neon-light-blue mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">100+</div>
            <div className="text-sm text-gray-400 dark:text-gray-400 text-gray-600">Happy Clients</div>
          </div>
          <div className="text-center neon-card p-6 rounded-xl border border-neon-blue/30 dark:border-neon-blue/30 border-neon-light-blue/40">
            <CheckCircle2 className="w-8 h-8 text-neon-blue dark:text-neon-blue text-neon-light-blue mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">500+</div>
            <div className="text-sm text-gray-400 dark:text-gray-400 text-gray-600">Projects Delivered</div>
          </div>
          <div className="text-center neon-card p-6 rounded-xl border border-neon-purple/30 dark:border-neon-purple/30 border-neon-light-purple/40">
            <Star className="w-8 h-8 text-neon-purple dark:text-neon-purple text-neon-light-purple mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">4.9/5</div>
            <div className="text-sm text-gray-400 dark:text-gray-400 text-gray-600">Client Rating</div>
          </div>
          <div className="text-center neon-card p-6 rounded-xl border border-neon-cyan/30 dark:border-neon-cyan/30 border-neon-light-blue/40">
            <TrendingUp className="w-8 h-8 text-neon-cyan dark:text-neon-cyan text-neon-light-blue mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">95%</div>
            <div className="text-sm text-gray-400 dark:text-gray-400 text-gray-600">Retention Rate</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

