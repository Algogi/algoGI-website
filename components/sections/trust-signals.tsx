"use client";

import { motion } from "framer-motion";
import { Shield, Award, CheckCircle2, Star, Users, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

const certifications = [
  { name: "ISO 27001", icon: Shield, description: "Information Security" },
];

export default function TrustSignals() {
  const [testimonials, setTestimonials] = useState<Array<{
    quote: string;
    author: string;
    role: string;
    rating: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const response = await fetch("/api/testimonials");
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            // Transform Firestore data to match testimonial structure
            const transformed = data.map((item: any) => ({
              quote: item.quote,
              author: item.author,
              role: item.role,
              rating: item.rating || 5,
            }));
            setTestimonials(transformed);
          }
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
        // Don't set testimonials on error - section will be hidden
      } finally {
        setIsLoading(false);
      }
    }

    fetchTestimonials();
  }, []);
  return (
    <section className="section-padding bg-dark-bg relative overflow-hidden">
      <div className="absolute inset-0 grid-background opacity-10" />
      <div className="container-custom relative z-10">
        {/* Certifications & Security Badges */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 md:mb-24"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Trusted & <span className="text-gradient">Certified</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-6">
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
                  className="neon-card p-6 rounded-xl border border-neon-blue/30 text-center min-w-[180px]"
                >
                  <Icon className="w-10 h-10 text-neon-blue mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-1">{cert.name}</h3>
                  <p className="text-sm text-gray-400">{cert.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div> */}

        {/* Client Testimonials - Only show if testimonials exist */}
        {!isLoading && testimonials.length > 0 && (
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
            <p className="text-lg text-gray-600 dark:text-gray-400 text-center max-w-2xl mx-auto mb-8">
              Real results from real clients
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="neon-card p-6 rounded-xl border border-neon-purple/30 relative overflow-hidden w-full max-w-md"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-neon-purple/5 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-300 mb-4 leading-relaxed italic">
                      &quot;{testimonial.quote}&quot;
                    </p>
                    <div className="pt-4 border-t border-neon-purple/20">
                      <p className="font-semibold text-white">{testimonial.author}</p>
                      <p className="text-sm text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Social Proof Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          <div className="text-center neon-card p-6 rounded-xl border border-neon-cyan/30">
            <Users className="w-8 h-8 text-neon-cyan mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">25+</div>
            <div className="text-sm text-gray-400">Happy Clients</div>
          </div>
          <div className="text-center neon-card p-6 rounded-xl border border-neon-blue/30">
            <CheckCircle2 className="w-8 h-8 text-neon-blue mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">75+</div>
            <div className="text-sm text-gray-400">Projects Delivered</div>
          </div>
          <div className="text-center neon-card p-6 rounded-xl border border-neon-purple/30">
            <Star className="w-8 h-8 text-neon-purple mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">4.9/5</div>
            <div className="text-sm text-gray-400">Client Rating</div>
          </div>
          <div className="text-center neon-card p-6 rounded-xl border border-neon-cyan/30">
            <TrendingUp className="w-8 h-8 text-neon-cyan mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">95%</div>
            <div className="text-sm text-gray-400">Retention Rate</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

