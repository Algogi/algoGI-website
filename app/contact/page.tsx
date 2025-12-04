"use client";

import LeadCaptureForm from "@/components/forms/lead-capture-form";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="section-padding bg-dark-bg relative overflow-hidden">
      <div className="absolute inset-0 grid-background opacity-10" />
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Contact
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-4">
            Tell us what you're building. Get a clear plan in your inbox.
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Share a bit about your product, your timeline, and what 'success' looks like. A senior engineer will respond with next steps—no sales scripts, no spam.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="neon-card rounded-xl p-6 border border-neon-blue/30 text-center"
          >
            <div className="bg-neon-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-neon-blue/30">
              <Phone className="w-8 h-8 text-neon-blue" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Phone</h3>
            <p className="text-gray-300">+1 (555) 123-4567</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="neon-card rounded-xl p-6 border border-neon-blue/30 text-center"
          >
            <div className="bg-neon-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-neon-blue/30">
              <Mail className="w-8 h-8 text-neon-blue" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
            <p className="text-gray-300">hello@algogi.com</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="neon-card rounded-xl p-6 border border-neon-blue/30 text-center"
          >
            <div className="bg-neon-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-neon-blue/30">
              <MapPin className="w-8 h-8 text-neon-blue" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Address</h3>
            <p className="text-gray-300">123 Tech Street, San Francisco, CA 94105</p>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <LeadCaptureForm />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="neon-card rounded-xl p-8 border border-neon-blue/30 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-4">
              Location
            </h2>
            <div className="h-64 bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 rounded-lg flex items-center justify-center border border-neon-blue/20">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-neon-blue mx-auto mb-4" />
                <p className="text-gray-300 font-medium">
                  123 Tech Street, San Francisco, CA 94105
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  (Map integration can be added here)
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

