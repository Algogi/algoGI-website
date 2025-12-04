"use client";

import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import DateTimePicker from "./date-time-picker";

interface FormData {
  name: string;
  email: string;
  company: string;
  projectDescription: string;
  budgetTimeline: string;
  openToCall: boolean;
  preferredCallTime?: string;
}

export default function LeadCaptureForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    company: "",
    projectDescription: "",
    budgetTimeline: "",
    openToCall: false,
    preferredCallTime: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleDateTimeChange = (name: string, value: string) => {
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
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message:
            "Thank you! A senior engineer will review your brief and respond with next steps.",
        });
        setFormData({
          name: "",
          email: "",
          company: "",
          projectDescription: "",
          budgetTimeline: "",
          openToCall: false,
          preferredCallTime: "",
        });
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message:
          "Something went wrong. Please try again or contact us directly.",
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
      className="neon-card max-w-2xl mx-auto relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 dark:from-neon-blue/5 from-neon-light-blue/10 to-neon-purple/5 dark:to-neon-purple/5 to-neon-light-purple/10 opacity-50" />
      <div className="relative z-10">
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Send your <span className="text-gradient">project brief</span>
        </h3>
        <p className="text-gray-400 dark:text-gray-400 text-gray-600 mb-8">
          Tell us about your product, timeline, and what success looks like.
        </p>

      <div className="space-y-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              Work Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-dark-card dark:bg-dark-card bg-light-card border border-neon-blue/30 dark:border-neon-blue/30 border-neon-light-blue/40 rounded-lg focus:ring-2 focus:ring-neon-blue dark:focus:ring-neon-blue focus:ring-neon-light-blue focus:border-neon-blue dark:focus:border-neon-blue focus:border-neon-light-blue outline-none transition-all duration-200 hover:border-neon-blue/50 dark:hover:border-neon-blue/50 hover:border-neon-light-blue/60 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 placeholder-gray-400"
            />
          </motion.div>
        </div>

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
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-6 flex flex-col"
      >
        <label
          htmlFor="projectDescription"
          className="block text-sm font-medium text-gray-300 dark:text-gray-300 text-gray-700 mb-2"
        >
          What are you looking to build? *
        </label>
        <textarea
          id="projectDescription"
          name="projectDescription"
          required
          rows={4}
          value={formData.projectDescription}
          onChange={handleChange}
          placeholder="Describe your product, goals, and what success looks like..."
          className="w-full px-4 py-3 bg-dark-card dark:bg-dark-card bg-light-card border border-neon-blue/30 dark:border-neon-blue/30 border-neon-light-blue/40 rounded-lg focus:ring-2 focus:ring-neon-blue dark:focus:ring-neon-blue focus:ring-neon-light-blue focus:border-neon-blue dark:focus:border-neon-blue focus:border-neon-light-blue outline-none resize-none transition-all duration-200 hover:border-neon-blue/50 dark:hover:border-neon-blue/50 hover:border-neon-light-blue/60 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 placeholder-gray-400"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-6 flex flex-col"
      >
        <label
          htmlFor="budgetTimeline"
          className="block text-sm font-medium text-gray-300 dark:text-gray-300 text-gray-700 mb-2"
        >
          Budget & timeline (rough is fine) *
        </label>
        <textarea
          id="budgetTimeline"
          name="budgetTimeline"
          required
          rows={3}
          value={formData.budgetTimeline}
          onChange={handleChange}
          placeholder="Share your budget range and timeline expectations..."
          className="w-full px-4 py-3 bg-dark-card dark:bg-dark-card bg-light-card border border-neon-blue/30 dark:border-neon-blue/30 border-neon-light-blue/40 rounded-lg focus:ring-2 focus:ring-neon-blue dark:focus:ring-neon-blue focus:ring-neon-light-blue focus:border-neon-blue dark:focus:border-neon-blue focus:border-neon-light-blue outline-none resize-none transition-all duration-200 hover:border-neon-blue/50 dark:hover:border-neon-blue/50 hover:border-neon-light-blue/60 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 placeholder-gray-400"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-6"
      >
        <label className="flex items-center cursor-pointer group">
          <input
            type="checkbox"
            name="openToCall"
            checked={formData.openToCall}
            onChange={handleChange}
            className="w-5 h-5 mr-3 bg-dark-card dark:bg-dark-card bg-light-card border border-neon-blue/30 dark:border-neon-blue/30 border-neon-light-blue/40 rounded focus:ring-2 focus:ring-neon-blue dark:focus:ring-neon-blue focus:ring-neon-light-blue text-neon-blue dark:text-neon-blue text-neon-light-blue cursor-pointer flex-shrink-0"
          />
          <span className="text-gray-300 dark:text-gray-300 text-gray-700 group-hover:text-white dark:group-hover:text-white group-hover:text-gray-900 transition-colors">
            I&apos;m open to a quick call this week
          </span>
        </label>
      </motion.div>

      {formData.openToCall && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 p-5 bg-dark-card/50 dark:bg-dark-card/50 bg-light-card/50 rounded-lg border border-neon-blue/20 dark:border-neon-blue/20 border-neon-light-blue/30"
        >
          <label
            htmlFor="preferredCallTime"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Preferred call time *
          </label>
          <DateTimePicker
            id="preferredCallTime"
            name="preferredCallTime"
            value={formData.preferredCallTime || ""}
            onChange={handleDateTimeChange}
            required={formData.openToCall}
            placeholder="Select your preferred date & time"
          />
        </motion.div>
      )}

      {submitStatus.type && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-4 rounded-lg border ${
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
        {isSubmitting ? "Sending..." : "Send my project brief"}
      </motion.button>
      </div>
    </motion.form>
  );
}

