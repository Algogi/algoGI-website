"use client";

import LeadCaptureForm from "@/components/forms/lead-capture-form";
import { motion } from "framer-motion";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  Zap, 
  Users, 
  Globe,
  ArrowRight,
  HelpCircle,
  Calendar,
  Shield,
  TrendingUp
} from "lucide-react";
import { ContactPageStructuredData } from "@/components/seo/structured-data";

export default function ContactPage() {
  const trustIndicators = [
    { icon: Clock, value: "24h", label: "Response Time" },
    { icon: CheckCircle2, value: "100+", label: "Projects Delivered" },
    { icon: Users, value: "50+", label: "Happy Clients" },
    { icon: TrendingUp, value: "95%", label: "Satisfaction Rate" },
  ];

  const benefits = [
    {
      icon: MessageSquare,
      title: "Direct Communication",
      description: "Speak directly with senior engineers—no sales scripts, no spam.",
    },
    {
      icon: Zap,
      title: "Fast Response",
      description: "Get a clear plan in your inbox within 24 hours of your inquiry.",
    },
    {
      icon: Shield,
      title: "Expert Guidance",
      description: "Receive actionable insights from our AI and software development experts.",
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description: "Book a call at your convenience to discuss your project in detail.",
    },
  ];

  const faqs = [
    {
      question: "What information should I include in my project brief?",
      answer: "Include details about your product vision, technical requirements, timeline expectations, budget range, and what success looks like for your project. The more context you provide, the better we can tailor our response.",
    },
    {
      question: "How quickly will I receive a response?",
      answer: "We guarantee a response within 24 hours. A senior engineer will review your brief and respond with next steps, technical recommendations, and a clear plan forward.",
    },
    {
      question: "What happens after I submit the form?",
      answer: "After submission, our team reviews your project brief. If you're open to a call, we'll coordinate a convenient time. Otherwise, you'll receive a detailed written response with recommendations and next steps.",
    },
    {
      question: "Is there a cost for the initial consultation?",
      answer: "No, the initial consultation and project brief review are completely free. We believe in providing value upfront to help you make informed decisions about your AI and software development needs.",
    },
    {
      question: "Can I contact you for ongoing support?",
      answer: "Absolutely! We offer ongoing support and maintenance services. You can reach out anytime for assistance with existing projects or new development needs.",
    },
  ];

  const officeLocations = [
    {
      city: "Newark, USA",
      address: "131 CONTINENTAL DRIVE, SUITE 305 NEWARK, New Castle, DE -19713",
      phone: "+1 540 268 8778",
      email: "info@algogi.com",
    },
    {
      city: "Bengaluru, India",
      address: "JBR Tech Park, Plot No. 77, 6th Rd, EPIP Zone, Whitefield, Bengaluru, Karnataka 560066",
      phone: "+91 877 017 0371",
      email: "info@algogi.com",
    },
  ];

  return (
    <div className="section-padding bg-dark-bg relative overflow-hidden min-h-screen">
      <ContactPageStructuredData />
      <div className="absolute inset-0 grid-background opacity-10" />
      
      <div className="container-custom relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-neon-blue/20 rounded-full blur-2xl" />
              <MessageSquare className="w-16 h-16 text-neon-blue relative z-10" />
            </div>
          </motion.div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Let&apos;s <span className="text-gradient">Connect</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-4">
            Tell us what you&apos;re building. Get a clear plan in your inbox.
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Share a bit about your product, your timeline, and what &apos;success&apos; looks like. A senior engineer will respond with next steps—no sales scripts, no spam.
          </p>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16"
        >
          {trustIndicators.map((indicator, index) => {
            const Icon = indicator.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="neon-card rounded-xl p-6 border border-neon-blue/30 text-center"
              >
                <div className="bg-neon-blue/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-neon-blue/30">
                  <Icon className="w-6 h-6 text-neon-blue" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-neon-blue mb-1">
                  {indicator.value}
                </div>
                <div className="text-sm text-gray-400">
                  {indicator.label}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Why Contact Us Section */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why <span className="text-gradient">Contact Us</span>?
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Get expert guidance and actionable insights for your AI and software development projects
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8 }}
                  className="neon-card rounded-xl p-6 border border-neon-blue/30 hover:border-neon-blue/50 transition-all group"
                >
                  <div className="bg-neon-blue/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4 border border-neon-blue/30 group-hover:bg-neon-blue/20 transition-colors">
                    <Icon className="w-7 h-7 text-neon-blue" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-neon-blue transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Divider */}
        <div className="relative z-10 mb-16">
          <div className="h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent" />
        </div>

        {/* Contact Methods Section */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Get in <span className="text-gradient">Touch</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Multiple ways to reach us—choose what works best for you
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="neon-card rounded-xl p-8 border border-neon-blue/30 dark:border-neon-blue/30 border-neon-light-blue/40 text-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="bg-neon-blue/10 dark:bg-neon-blue/10 bg-neon-light-blue/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-neon-blue/30 dark:border-neon-blue/30 border-neon-light-blue/40 group-hover:scale-110 transition-transform">
                  <Phone className="w-10 h-10 text-neon-blue dark:text-neon-blue text-neon-light-blue" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Phone</h3>
                <p className="text-gray-300 mb-2">+1 540 268 8778</p>
                <p className="text-sm text-gray-400">Mon-Fri, 9AM-6PM EST</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="neon-card rounded-xl p-8 border border-neon-purple/30 dark:border-neon-purple/30 border-neon-light-purple/40 text-center relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="bg-neon-purple/10 dark:bg-neon-purple/10 bg-neon-light-purple/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-neon-purple/30 dark:border-neon-purple/30 border-neon-light-purple/40 group-hover:scale-110 transition-transform">
                  <Mail className="w-10 h-10 text-neon-purple dark:text-neon-purple text-neon-light-purple" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Email</h3>
                <a href="mailto:info@algogi.com" className="text-neon-purple dark:text-neon-purple text-neon-light-purple hover:underline block mb-2">
                  info@algogi.com
                </a>
                <p className="text-sm text-gray-400">Email your questions to us 24/7</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="neon-card rounded-xl p-8 border border-neon-cyan/30 dark:border-neon-cyan/30 border-neon-light-blue/40 text-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="bg-neon-cyan/10 dark:bg-neon-cyan/10 bg-neon-light-blue/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-neon-cyan/30 dark:border-neon-cyan/30 border-neon-light-blue/40 group-hover:scale-110 transition-transform">
                  <Globe className="w-10 h-10 text-neon-cyan dark:text-neon-cyan text-neon-light-blue" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Global Offices</h3>
                <p className="text-gray-300 mb-2">2 locations worldwide</p>
                <p className="text-sm text-gray-400">See locations below</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Form Section with Visual Elements */}
        <section className="mb-16 relative">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-neon-blue/10 dark:bg-neon-blue/10 bg-neon-light-blue/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-neon-purple/10 dark:bg-neon-purple/10 bg-neon-light-purple/15 rounded-full blur-3xl pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative z-10 max-w-4xl mx-auto"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-block mb-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-neon-blue/20 dark:bg-neon-blue/20 bg-neon-light-blue/30 rounded-full blur-xl" />
                  <MessageSquare className="w-12 h-12 text-neon-blue dark:text-neon-blue text-neon-light-blue relative z-10" />
                </div>
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Send Your <span className="text-gradient">Project Brief</span>
              </h2>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Fill out the form below and we&apos;ll get back to you within 24 hours
              </p>
            </div>
            <LeadCaptureForm />
          </motion.div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center mb-4">
              <HelpCircle className="w-8 h-8 text-neon-blue dark:text-neon-blue text-neon-light-blue mr-3" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Frequently Asked <span className="text-gradient">Questions</span>
              </h2>
            </div>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Everything you need to know about contacting us
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="neon-card rounded-xl p-6 border border-neon-blue/30 dark:border-neon-blue/30 border-neon-light-blue/40 hover:border-neon-blue/50 dark:hover:border-neon-blue/50 hover:border-neon-light-blue/60 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-neon-blue/10 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border border-neon-blue/30">
                    <HelpCircle className="w-5 h-5 text-neon-blue" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="relative z-10 mb-16">
                <div className="h-px bg-gradient-to-r from-transparent via-neon-purple/30 to-transparent" />
        </div>

        {/* Office Locations Section */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center mb-4">
              <Globe className="w-8 h-8 text-neon-blue mr-3" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Our <span className="text-gradient">Locations</span>
              </h2>
            </div>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Visit us at any of our global offices
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {officeLocations.map((location, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8 }}
                className="neon-card rounded-xl p-8 border border-neon-blue/30 hover:border-neon-blue/50 transition-all relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="bg-neon-blue/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 border border-neon-blue/30 group-hover:scale-110 transition-transform">
                    <MapPin className="w-8 h-8 text-neon-blue" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-neon-blue transition-colors">
                    {location.city}
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-neon-blue mt-1 flex-shrink-0" />
                      <p className="text-gray-300 leading-relaxed">
                        {location.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-neon-blue flex-shrink-0" />
                      <a href={`tel:${location.phone.replace(/\s/g, '')}`} className="text-gray-300 hover:text-neon-blue transition-colors">
                        {location.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-neon-blue flex-shrink-0" />
                      <a href={`mailto:${location.email}`} className="text-gray-300 hover:text-neon-blue transition-colors">
                        {location.email}
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center neon-card rounded-2xl p-12 md:p-16 border border-neon-blue/30 max-w-4xl mx-auto relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/5 dark:bg-neon-blue/5 bg-neon-light-blue/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Start Your <span className="text-gradient">Project</span>?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Let&apos;s discuss how we can help bring your AI and software vision to life.
            </p>
            <motion.a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
