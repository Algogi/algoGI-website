"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    title: string;
    description: string;
    features: string[];
    Icon: React.ComponentType<{ className?: string }>;
    gradient?: string;
  } | null;
}

export default function ServiceModal({
  isOpen,
  onClose,
  service,
}: ServiceModalProps) {
  if (!service) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-50 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-dark-card rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neon-blue/30">
              <div className="sticky top-0 bg-dark-card border-b border-neon-blue/20 p-6 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  {service.Icon && (
                    <div className="p-3 rounded-xl bg-neon-blue/10 border border-neon-blue/30">
                      <service.Icon className="w-8 h-8 text-neon-blue" />
                    </div>
                  )}
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    {service.title}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-dark-surface rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6 text-gray-400 hover:text-white" />
                </button>
              </div>
              <div className="p-6 md:p-8">
                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                  {service.description}
                </p>
                <h3 className="text-xl font-semibold text-white mb-6">
                  Key Features:
                </h3>
                <ul className="space-y-4">
                  {service.features.map((feature, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start text-gray-300"
                    >
                      <span className="text-neon-blue mr-3 font-bold text-xl">✓</span>
                      <span className="text-base">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

