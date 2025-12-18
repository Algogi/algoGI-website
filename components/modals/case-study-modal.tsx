"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { X, Download, Wrench, Bot } from "lucide-react";
import DownloadFormModal from "@/components/modals/download-form-modal";
import { useState, useEffect } from "react";
import { type CaseStudy } from "@/app/case-studies/case-studies-data";
import { logAnalyticsEvent, AnalyticsEvents } from "@/lib/firebase/analytics";

interface CaseStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  study: CaseStudy | null;
}

// Helper function to get image source with fallback
function getCaseStudyImage(study: NonNullable<CaseStudyModalProps["study"]>): string {
  if (study.heroImage) {
    // If it's already a full URL (Cloud Storage signed URL), use it directly
    if (study.heroImage.startsWith("http://") || study.heroImage.startsWith("https://")) {
      return study.heroImage;
    }
    // Otherwise, treat it as a local image path
    return `/images/${study.heroImage}`;
  }
  // Return generic placeholder based on type
  return study.isTemplate 
    ? "/images/case-study-template-default.png" 
    : "/images/case-study-ai-default.png";
}

export default function CaseStudyModal({
  isOpen,
  onClose,
  study,
}: CaseStudyModalProps) {
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen && study) {
      logAnalyticsEvent(AnalyticsEvents.PORTFOLIO_VIEW, {
        case_study_title: study.title,
        case_study_client: study.client,
      });
    }
  }, [isOpen, study]);

  const handleDownloadClick = () => {
    if (study?.downloadFile) {
      logAnalyticsEvent(AnalyticsEvents.CASE_STUDY_DOWNLOAD, {
        case_study_title: study.title,
        case_study_client: study.client,
        file_type: study.downloadFile.type,
      });
    }
    setDownloadModalOpen(true);
  };

  if (!study) return null;

  const imageSrc = getCaseStudyImage(study);
  const hasCustomImage = !!study.heroImage;

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
            <div className="neon-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-brand-primary/40 dark:border-brand-primary/30">
              <div className="sticky top-0 bg-dark-card border-b border-brand-primary/40 dark:border-brand-primary/30 p-6 flex items-center justify-between rounded-t-2xl z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {study.title}
                  </h2>
                  <p className="text-brand-primary font-semibold mt-1">
                    {study.client}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {study.downloadFile && (
                    <motion.button
                      onClick={handleDownloadClick}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-lg bg-brand-primary/20 dark:bg-brand-primary/10 hover:bg-brand-primary/30 dark:hover:bg-brand-primary/20 border border-brand-primary/40 dark:border-brand-primary/30 transition-colors flex items-center gap-2 text-sm font-semibold text-brand-primary"
                    >
                      <Download className="w-4 h-4" />
                      Download {study.downloadFile.type === "pdf" ? "PDF" : "Template"}
                    </motion.button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-dark-surface rounded-lg transition-colors"
                    aria-label="Close modal"
                  >
                    <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* Hero Image */}
                <div className="w-full h-64 rounded-lg overflow-hidden border border-brand-primary/30 dark:border-brand-primary/20 relative">
                  {hasCustomImage ? (
                    <Image
                      src={imageSrc}
                      alt={study.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-neon-light-blue/20 dark:from-neon-blue/10 to-neon-light-purple/20 dark:to-neon-purple/10 flex items-center justify-center">
                      {study.isTemplate ? (
                        <Wrench className="w-24 h-24 text-brand-primary" />
                      ) : (
                        <Bot className="w-24 h-24 text-neon-purple" />
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Challenge
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {study.challenge}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Solution
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
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
                        className="flex items-start text-gray-700 dark:text-gray-300"
                      >
                        <span className="text-brand-primary mr-3 font-bold">
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
                          className="px-3 py-1 bg-brand-primary/20 dark:bg-brand-primary/10 text-brand-primary rounded-full text-sm font-medium border border-brand-primary/40 dark:border-brand-primary/30"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-brand-primary/40 dark:border-brand-primary/30">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-brand-primary mb-2">
                      {study.metrics.primary}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      {study.metrics.primaryLabel}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-neon-cyan mb-2">
                      {study.metrics.secondary}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                      {study.metrics.secondaryLabel}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {study.downloadFile && (
        <DownloadFormModal
          isOpen={downloadModalOpen}
          onClose={() => setDownloadModalOpen(false)}
          fileIdentifier={study.downloadFile.identifier}
          fileType={study.downloadFile.type}
          caseStudyTitle={study.title}
        />
      )}
    </AnimatePresence>
  );
}

