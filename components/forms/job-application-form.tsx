"use client";

import { useState, FormEvent, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { logAnalyticsEvent, AnalyticsEvents } from "@/lib/firebase/analytics";

interface FormField {
  id: string;
  type: "text" | "email" | "phone" | "textarea" | "select" | "checkbox" | "file";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface JobApplicationFormProps {
  jobId: string;
  jobTitle: string;
  jobSlug: string;
  formFields: FormField[];
}

export default function JobApplicationForm({
  jobId,
  jobTitle,
  jobSlug,
  formFields,
}: JobApplicationFormProps) {
  // System fields that are always required
  const SYSTEM_FIELDS: FormField[] = [
    {
      id: "name",
      type: "text",
      label: "Full Name",
      placeholder: "Enter your full name",
      required: true,
    },
    {
      id: "email",
      type: "email",
      label: "Email Address",
      placeholder: "Enter your email address",
      required: true,
    },
    {
      id: "resume",
      type: "file",
      label: "Resume",
      placeholder: "Upload your resume (PDF only)",
      required: true,
    },
  ];

  // Ensure system fields are always present
  const hasNameField = formFields.some((f) => f.id === "name");
  const hasEmailField = formFields.some((f) => f.id === "email" || f.type === "email");
  const hasResumeField = formFields.some((f) => f.id === "resume");
  
  const requiredFields: FormField[] = [];
  if (!hasNameField) {
    requiredFields.push(SYSTEM_FIELDS[0]);
  }
  if (!hasEmailField) {
    requiredFields.push(SYSTEM_FIELDS[1]);
  }
  if (!hasResumeField) {
    requiredFields.push(SYSTEM_FIELDS[2]);
  }

  // Merge required fields with form fields, ensuring system fields are required
  const allFormFields: FormField[] = [
    ...requiredFields,
    ...formFields.map((field) => {
      // Ensure system fields are marked as required if they exist
      if (field.id === "name") {
        return { ...field, required: true };
      }
      if (field.id === "email" || field.type === "email") {
        return { ...field, required: true, type: "email" as const };
      }
      if (field.id === "resume") {
        return { ...field, required: true, type: "file" as const };
      }
      return field;
    }),
  ];

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const hasTrackedStart = useRef(false);

  const handleChange = (
    fieldId: string,
    value: any,
    type: string
  ) => {
    if (type === "file") {
      const file = value as File;
      setFiles((prev) => ({ ...prev, [fieldId]: file }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [fieldId]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [fieldId]: value }));
    }
  };

  const handleFormFocus = () => {
    if (!hasTrackedStart.current) {
      hasTrackedStart.current = true;
      logAnalyticsEvent(AnalyticsEvents.JOB_APPLICATION_START, {
        job_id: jobId,
        job_title: jobTitle,
        job_slug: jobSlug,
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const submitFormData = new FormData();

      // Add all form field values
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          submitFormData.append(key, String(value));
        }
      });

      // Add files
      Object.entries(files).forEach(([key, file]) => {
        submitFormData.append(key, file);
      });

      // Add cover letter if there's a textarea field
      const coverLetterField = formFields.find((f) => f.type === "textarea" && f.id === "coverLetter");
      if (coverLetterField && formData[coverLetterField.id]) {
        submitFormData.append("coverLetter", formData[coverLetterField.id]);
      }

      const response = await fetch(`/api/careers/${jobSlug}/apply`, {
        method: "POST",
        body: submitFormData,
      });

      const data = await response.json();

      if (response.ok) {
        // Track successful submission
        logAnalyticsEvent(AnalyticsEvents.JOB_APPLICATION_SUBMIT, {
          job_id: jobId,
          job_title: jobTitle,
          job_slug: jobSlug,
        });

        setSubmitStatus({
          type: "success",
          message:
            "Thank you! Your application has been submitted successfully. We'll review it and get back to you soon.",
        });
        // Reset form
        setFormData({});
        setFiles({});
        hasTrackedStart.current = false;
      } else {
        throw new Error(data.error || "Submission failed");
      }
    } catch (error: any) {
      setSubmitStatus({
        type: "error",
        message: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.id] || "";
    const file = files[field.id];

    switch (field.type) {
      case "text":
      case "email":
      case "phone":
        return (
          <Input
            type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
            id={field.id}
            name={field.id}
            required={field.required}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value, field.type)}
            placeholder={field.placeholder}
            className="w-full"
          />
        );

      case "textarea":
        return (
          <Textarea
            id={field.id}
            name={field.id}
            required={field.required}
            value={value}
            onChange={(e) => handleChange(field.id, e.target.value, field.type)}
            placeholder={field.placeholder}
            rows={4}
            className="w-full"
          />
        );

      case "select":
        return (
          <Select
            value={value}
            onValueChange={(val) => handleChange(field.id, val, field.type)}
            required={field.required}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value === true || value === "true"}
              onCheckedChange={(checked) => handleChange(field.id, checked, field.type)}
              required={field.required}
            />
            <Label htmlFor={field.id} className="font-normal">
              {field.placeholder || "I agree"}
            </Label>
          </div>
        );

      case "file":
        // System field "resume" only accepts PDF
        const acceptTypes = field.id === "resume" ? ".pdf" : ".pdf,.doc,.docx";
        return (
          <div className="space-y-2">
            <Input
              type="file"
              id={field.id}
              name={field.id}
              required={field.required}
              accept={acceptTypes}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Validate file type for resume
                  if (field.id === "resume" && file.type !== "application/pdf") {
                    toast.error("Resume must be a PDF file");
                    e.target.value = "";
                    return;
                  }
                  if (file.size > 10 * 1024 * 1024) {
                    toast.error("File size must be less than 10MB");
                    e.target.value = "";
                    return;
                  }
                  handleChange(field.id, file, field.type);
                }
              }}
              className="w-full"
            />
            {file && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
            {field.id === "resume" && (
              <p className="text-xs text-muted-foreground">
                Only PDF files are accepted for resumes
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onSubmit={handleSubmit}
      onFocus={handleFormFocus}
      className="neon-card max-w-2xl mx-auto relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5 opacity-50" />
      <div className="relative z-10 p-8">
        <h3 className="text-3xl font-bold text-white mb-2">
          Apply for <span className="text-gradient">{jobTitle}</span>
        </h3>
        <p className="text-gray-400 mb-8">
          Please fill out the form below to submit your application.
        </p>

        <div className="space-y-6 mb-6">
          {allFormFields.map((field, index) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col"
            >
              <Label
                htmlFor={field.id}
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </Label>
              {renderField(field)}
            </motion.div>
          ))}
        </div>

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
            <div className="flex items-center gap-2">
              {submitStatus.type === "success" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              {submitStatus.message}
            </div>
          </motion.div>
        )}

        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit Application"}
        </motion.button>
      </div>
    </motion.form>
  );
}

