"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";

interface FormData {
  name: string;
  email: string;
  company: string;
}

interface DownloadFormProps {
  fileIdentifier: string;
  fileType: "pdf" | "json";
  caseStudyTitle: string;
  onSuccess: () => void;
}

export default function DownloadForm({
  fileIdentifier,
  fileType,
  caseStudyTitle,
  onSuccess,
}: DownloadFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    company: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          fileIdentifier,
          fileType,
          caseStudyTitle,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message:
            "Thank you! We've sent the file to your email. Please check your inbox.",
        });
        setFormData({
          name: "",
          email: "",
          company: "",
        });
        // Call onSuccess after a short delay to show success message
        setTimeout(() => {
          onSuccess();
        }, 2000);
      } else {
        throw new Error(data.error || "Submission failed");
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message:
          "Something went wrong. Please try again or contact us directly at Sales@algogi.com.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Get Your {fileType === "pdf" ? "Case Study" : "Automation Template"}
        </h3>
        <p className="text-gray-400 dark:text-gray-400 text-gray-600 mb-6">
          Enter your details to receive the {fileType === "pdf" ? "PDF case study" : "automation template"} via email.
        </p>
      </div>

      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col"
        >
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300 dark:text-gray-300 text-gray-700 mb-2"
          >
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-dark-card dark:bg-dark-card bg-light-card border border-neon-blue/30 dark:border-neon-blue/30 border-neon-light-blue/40 rounded-lg focus:ring-2 focus:ring-neon-blue dark:focus:ring-neon-blue focus:ring-neon-light-blue focus:border-neon-blue dark:focus:border-neon-blue focus:border-neon-light-blue outline-none transition-all duration-200 hover:border-neon-blue/50 dark:hover:border-neon-blue/50 hover:border-neon-light-blue/60 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 placeholder-gray-400"
            placeholder="Your full name"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col"
        >
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300 dark:text-gray-300 text-gray-700 mb-2"
          >
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-dark-card dark:bg-dark-card bg-light-card border border-neon-blue/30 dark:border-neon-blue/30 border-neon-light-blue/40 rounded-lg focus:ring-2 focus:ring-neon-blue dark:focus:ring-neon-blue focus:ring-neon-light-blue focus:border-neon-blue dark:focus:border-neon-blue focus:border-neon-light-blue outline-none transition-all duration-200 hover:border-neon-blue/50 dark:hover:border-neon-blue/50 hover:border-neon-light-blue/60 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 placeholder-gray-400"
            placeholder="your.email@company.com"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col"
        >
          <label
            htmlFor="company"
            className="block text-sm font-medium text-gray-300 dark:text-gray-300 text-gray-700 mb-2"
          >
            Company *
          </label>
          <input
            type="text"
            id="company"
            name="company"
            required
            value={formData.company}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-dark-card dark:bg-dark-card bg-light-card border border-neon-blue/30 dark:border-neon-blue/30 border-neon-light-blue/40 rounded-lg focus:ring-2 focus:ring-neon-blue dark:focus:ring-neon-blue focus:ring-neon-light-blue focus:border-neon-blue dark:focus:border-neon-blue focus:border-neon-light-blue outline-none transition-all duration-200 hover:border-neon-blue/50 dark:hover:border-neon-blue/50 hover:border-neon-light-blue/60 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 placeholder-gray-400"
            placeholder="Your company name"
          />
        </motion.div>
      </div>

      {submitStatus.type && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            submitStatus.type === "success"
              ? "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30"
              : "bg-red-500/10 text-red-400 border-red-500/30"
          }`}
        >
          {submitStatus.message}
        </motion.div>
      )}

      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Sending..." : `Get ${fileType === "pdf" ? "PDF" : "Template"}`}
      </motion.button>
    </motion.form>
  );
}

