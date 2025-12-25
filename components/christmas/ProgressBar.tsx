"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  // Don't show progress on welcome slide (step 0)
  if (currentStep === 0) return null;
  
  // Calculate progress: currentStep out of totalSteps (both are 1-indexed for display)
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-3 md:mb-4">
        <span className="text-base md:text-lg font-semibold christmas-progress-text">
          Question {currentStep} of {totalSteps}
        </span>
        <span className="text-base md:text-lg font-semibold christmas-progress-text">{Math.round(progress)}%</span>
      </div>
      <div className="w-full h-4 md:h-5 christmas-progress-bg rounded-full overflow-hidden shadow-lg">
        <motion.div
          className="h-full christmas-progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

