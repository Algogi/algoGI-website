"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, TrendingUp, Target } from "lucide-react";
import { getServiceBySlug } from "../services-data";
import { ServiceStructuredData } from "@/components/seo/structured-data";

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const service = getServiceBySlug(slug);

  if (!service) {
    return (
      <div className="section-padding bg-dark-bg text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Service Not Found</h1>
        <p className="text-gray-400 mb-8">The service you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/services" className="btn-primary">
          Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-dark-bg relative overflow-hidden">
      {service && (
        <ServiceStructuredData
          name={service.title.split("—")[0].trim()}
          description={service.description}
          serviceType="AI Development Service"
        />
      )}
      <div className="absolute inset-0 grid-background opacity-10" />
      
      {/* Hero Section */}
      <section className="section-padding relative z-10">
        <div className="container-custom">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-neon-blue transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Services</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <div className="mb-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
                {service.title.split("—")[0].trim()}
              </h1>
              {service.title.includes("—") && (
                <p className="text-xl md:text-2xl lg:text-3xl text-gray-400 font-normal">
                  {service.title.split("—")[1].trim()}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative z-10">
        <div className="h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
      </div>

      {/* Full Description with Visual Element */}
      <section className="section-padding relative z-10">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="prose prose-invert max-w-none"
              >
                <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
                  {service.fullDescription}
                </p>
              </motion.div>
              
              {/* Service Image */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative group"
              >
                <motion.div
                  className="relative w-full overflow-hidden rounded-lg"
                  style={{ aspectRatio: '1200/800' }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={service.image}
                      alt={`${service.title.split("—")[0].trim()} - AI development service by AlgoGI showcasing ${service.shortDescription.toLowerCase()}`}
                      fill
                      className="object-contain transition-all duration-500 group-hover:brightness-110"
                    />
                  </motion.div>
                  {/* Subtle glow on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-10 blur-2xl`} />
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding relative z-10 bg-dark-bg">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Key <span className="text-gradient">Features</span>
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Comprehensive capabilities that drive results
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.features.map((feature, index) => {
                const totalItems = service.features.length;
                const isLastRow = index >= totalItems - (totalItems % 3 || 3);
                const itemsInLastRow = totalItems % 3 || 3;
                const shouldSpan = isLastRow && itemsInLastRow === 1 && totalItems > 1;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={`neon-card p-6 rounded-xl border border-neon-blue/30 dark:border-neon-blue/30 border-neon-light-blue/40 hover:border-neon-blue/50 dark:hover:border-neon-blue/50 hover:border-neon-light-blue/60 transition-all duration-300 group h-full flex flex-col cursor-pointer relative overflow-hidden ${shouldSpan ? 'md:col-span-2 lg:col-span-3' : ''}`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    <div className="relative z-10 flex flex-col h-full">
                      <CheckCircle2 className="w-6 h-6 text-neon-blue mb-3 group-hover:scale-110 transition-transform duration-300" />
                      <p className="text-gray-300 font-medium flex-1">{feature}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-padding relative z-10">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Business <span className="text-gradient">Benefits</span>
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Real value that transforms your operations
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {service.benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="neon-card p-6 rounded-xl border border-neon-purple/30 dark:border-neon-purple/30 border-neon-light-purple/40 hover:border-neon-purple/50 dark:hover:border-neon-purple/50 hover:border-neon-light-purple/60 transition-all duration-300 group h-full flex flex-col cursor-pointer relative overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <div className="relative z-10 flex flex-col h-full">
                    <TrendingUp className="w-6 h-6 text-neon-purple mb-3 group-hover:scale-110 transition-transform duration-300" />
                    <p className="text-gray-300 leading-relaxed flex-1">{benefit}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="section-padding relative z-10 bg-dark-bg">
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Real-World <span className="text-gradient">Use Cases</span>
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Practical applications across industries
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.useCases.map((useCase, index) => {
                const totalItems = service.useCases.length;
                const isLastRow = index >= totalItems - (totalItems % 3 || 3);
                const itemsInLastRow = totalItems % 3 || 3;
                const shouldSpan = isLastRow && itemsInLastRow === 1 && totalItems > 1;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={`neon-card p-6 rounded-xl border border-neon-cyan/30 dark:border-neon-cyan/30 border-neon-light-blue/40 hover:border-neon-cyan/50 dark:hover:border-neon-cyan/50 hover:border-neon-light-blue/60 transition-all duration-300 group h-full flex flex-col cursor-pointer relative overflow-hidden ${shouldSpan ? 'md:col-span-2 lg:col-span-3' : ''}`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    <div className="relative z-10 flex flex-col h-full">
                      <Target className="w-6 h-6 text-neon-cyan mb-3 group-hover:scale-110 transition-transform duration-300" />
                      <p className="text-gray-300 leading-relaxed flex-1">{useCase}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding relative z-10">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative p-10 md:p-14 rounded-3xl bg-gradient-to-br from-neon-cyan/20 dark:from-neon-cyan/20 from-neon-light-blue/30 via-neon-blue/15 dark:via-neon-blue/15 via-neon-light-blue/25 to-neon-purple/20 dark:to-neon-purple/20 to-neon-light-purple/30 border-2 border-neon-cyan/40 dark:border-neon-cyan/40 border-neon-light-blue/50 overflow-hidden backdrop-blur-sm"
            >
              {/* Subtle background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0, 240, 255, 0.1) 0%, transparent 50%),
                                   radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)`
                }} />
              </div>

              <div className="relative z-10 text-center">
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready to Transform Your Business?
                </h3>
                <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                  Let&apos;s discuss how {service.title.split("—")[0].trim()} can drive real results for your organization.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/contact"
                    className="btn-primary text-lg px-10 py-4 inline-block transform hover:scale-105 transition-transform duration-200 shadow-[0_0_30px_rgba(139,92,246,0.4)] dark:shadow-[0_0_30px_rgba(139,92,246,0.4)] shadow-[0_0_30px_rgba(102,51,153,0.3)]"
                  >
                    Schedule a Consultation
                  </Link>
                  <Link
                    href="/contact"
                    className="btn-secondary text-lg px-10 py-4 inline-block transform hover:scale-105 transition-transform duration-200 border-2 border-neon-cyan/50 dark:border-neon-cyan/50 border-neon-light-blue/60 hover:border-neon-cyan dark:hover:border-neon-cyan hover:border-neon-light-blue hover:bg-neon-cyan/10 dark:hover:bg-neon-cyan/10 hover:bg-neon-light-blue/20"
                  >
                    Get in Touch
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

