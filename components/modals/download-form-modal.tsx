"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import DownloadForm from "@/components/forms/download-form";
import { useEffect, useRef } from "react";
import { trackModalOpen, trackModalClose, logAnalyticsEvent, AnalyticsEvents } from "@/lib/firebase/analytics";

interface DownloadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileIdentifier: string;
  fileType: "pdf" | "json";
  caseStudyTitle: string;
}

export default function DownloadFormModal({
  isOpen,
  onClose,
  fileIdentifier,
  fileType,
  caseStudyTitle,
}: DownloadFormModalProps) {
  const openTimeRef = useRef<number | null>(null);

  // Track modal open
  useEffect(() => {
    if (isOpen) {
      openTimeRef.current = Date.now();
      trackModalOpen("download", fileIdentifier);
      logAnalyticsEvent(AnalyticsEvents.DOWNLOAD_START, {
        case_study_title: caseStudyTitle,
        file_type: fileType,
        file_identifier: fileIdentifier,
        page_path: typeof window !== "undefined" ? window.location.pathname : "",
      });
    }
  }, [isOpen, fileIdentifier, fileType, caseStudyTitle]);

  const handleClose = () => {
    if (openTimeRef.current) {
      const timeSpent = Math.floor((Date.now() - openTimeRef.current) / 1000);
      trackModalClose("download", fileIdentifier, timeSpent);
      openTimeRef.current = null;
    }
    onClose();
  };

  const handleSuccess = () => {
    // Close modal after successful submission
    setTimeout(() => {
      handleClose();
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="neon-card rounded-2xl max-w-md w-full shadow-2xl border border-brand-primary/30 dark:border-brand-primary/30 border-brand-primary/40">
              <div className="sticky top-0 bg-dark-card border-b border-brand-primary/30 p-6 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Download {fileType === "pdf" ? "Case Study" : "Template"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-dark-surface rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-gray-300 dark:text-gray-300 text-gray-700" />
                </button>
              </div>
              <div className="p-6">
                <DownloadForm
                  fileIdentifier={fileIdentifier}
                  fileType={fileType}
                  caseStudyTitle={caseStudyTitle}
                  onSuccess={handleSuccess}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

