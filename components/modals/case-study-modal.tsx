"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface CaseStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  study: {
    title: string;
    client: string;
    challenge: string;
    solution: string;
    results: string[];
    metrics: {
      primary: string;
      primaryLabel: string;
      secondary: string;
      secondaryLabel: string;
    };
    techStack?: string[];
  } | null;
}

export default function CaseStudyModal({
  isOpen,
  onClose,
  study,
}: CaseStudyModalProps) {
  if (!study) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="neon-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neon-blue/30">
              <div className="sticky top-0 bg-dark-card border-b border-neon-blue/30 p-6 flex items-center justify-between rounded-t-2xl">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {study.title}
                  </h2>
                  <p className="text-neon-blue font-semibold mt-1">
                    {study.client}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-dark-surface rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6 text-gray-300" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Challenge
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {study.challenge}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Solution
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {study.solution}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Results
                  </h3>
                  <ul className="space-y-2">
                    {study.results.map((result, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start text-gray-300"
                      >
                        <span className="text-neon-blue mr-3 font-bold">
                          ✓
                        </span>
                        <span>{result}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
                {study.techStack && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Tech Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {study.techStack.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-neon-blue/10 text-neon-blue rounded-full text-sm font-medium border border-neon-blue/30"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neon-blue/30">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-neon-blue mb-2">
                      {study.metrics.primary}
                    </div>
                    <div className="text-sm text-gray-400 uppercase tracking-wide">
                      {study.metrics.primaryLabel}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-neon-cyan mb-2">
                      {study.metrics.secondary}
                    </div>
                    <div className="text-sm text-gray-400 uppercase tracking-wide">
                      {study.metrics.secondaryLabel}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

