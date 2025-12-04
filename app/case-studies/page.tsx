"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState } from "react";
import { Wrench, Bot } from "lucide-react";
import CaseStudyModal from "@/components/modals/case-study-modal";

const caseStudies = [
  {
    title: "Customer Data Sync Automation",
    client: "n8n Template · Open Source",
    challenge:
      "Manual data synchronization across multiple platforms leads to errors, delays, and inconsistent customer information.",
    solution:
      "Open-source n8n workflow template that automates customer data synchronization across multiple platforms. This template eliminates manual data entry and enables seamless integration between CRM, email marketing, and analytics platforms.",
    results: [
      "95% reduction in sync errors",
      "Real-time data synchronization",
      "Multi-platform integration",
      "Free open-source template available",
    ],
    metrics: {
      primary: "95%",
      primaryLabel: "Error Reduction",
      secondary: "100%",
      secondaryLabel: "Open Source",
    },
    techStack: ["n8n", "API Integration", "Workflow Automation"],
    isTemplate: true,
    demoUrl: "#",
  },
  {
    title: "AI-Powered Lead Qualification Agent",
    client: "AI Solution · SaaS",
    challenge:
      "Manual lead qualification is time-consuming and inconsistent, leading to missed opportunities and inefficient sales processes.",
    solution:
      "Intelligent AI agent that automatically qualifies leads using natural language processing and machine learning. The agent analyzes customer inquiries, scores leads based on multiple criteria, and routes high-value prospects to sales teams.",
    results: [
      "40% increase in conversion rates",
      "24/7 lead qualification",
      "Automated lead scoring",
      "Reduced sales cycle time",
    ],
    metrics: {
      primary: "40%",
      primaryLabel: "Conversion Increase",
      secondary: "24/7",
      secondaryLabel: "Availability",
    },
    techStack: ["AI Agents", "NLP", "Machine Learning", "Automation"],
    isTemplate: false,
    demoUrl: "#",
  },
  {
    title: "Invoice Processing Workflow",
    client: "n8n Template · Open Source",
    challenge:
      "Manual invoice processing takes hours per invoice, is error-prone, and delays financial operations.",
    solution:
      "Free open-source n8n template for automated invoice processing. This workflow extracts data from invoices, validates information, routes for approval, and updates accounting systems automatically.",
    results: [
      "99% processing accuracy",
      "Hours to minutes processing time",
      "Automated approval routing",
      "Free template available",
    ],
    metrics: {
      primary: "99%",
      primaryLabel: "Accuracy",
      secondary: "90%",
      secondaryLabel: "Time Saved",
    },
    techStack: ["n8n", "OCR", "Document Processing", "Workflow Automation"],
    isTemplate: true,
    demoUrl: "#",
  },
  {
    title: "Intelligent Customer Support Virtual Agent",
    client: "AI Solution · Customer Support",
    challenge:
      "Customer support teams are overwhelmed with routine inquiries, leading to slow response times and high operational costs.",
    solution:
      "Advanced AI virtual agent that handles customer support inquiries with context awareness and natural conversation flow. Built using AlgoGI's AI agent development framework, this solution provides intelligent, automated support.",
    results: [
      "75% automated resolution rate",
      "92% customer satisfaction",
      "24/7 intelligent support",
      "Reduced support costs by 60%",
    ],
    metrics: {
      primary: "75%",
      primaryLabel: "Auto Resolution",
      secondary: "92%",
      secondaryLabel: "Satisfaction",
    },
    techStack: ["AI Virtual Agents", "NLP", "Context Understanding", "Automation"],
    isTemplate: false,
    demoUrl: "#",
  },
];

function ProjectCard({
  study,
  index,
  onClick,
}: {
  study: typeof caseStudies[0];
  index: number;
  onClick: () => void;
}) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="neon-card rounded-xl p-6 border border-neon-blue/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300 cursor-pointer group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-neon-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="h-48 bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 rounded-lg mb-4 flex items-center justify-center border border-neon-blue/20 group-hover:border-neon-purple/50 transition-colors">
          <motion.div
            className="flex items-center justify-center"
            whileHover={{ scale: 1.2, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {study.isTemplate ? (
              <Wrench className="w-16 h-16 text-neon-blue" />
            ) : (
              <Bot className="w-16 h-16 text-neon-purple" />
            )}
          </motion.div>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-neon-purple bg-neon-purple/10 px-3 py-1 rounded-full border border-neon-purple/30">
            {study.isTemplate ? "n8n Template" : "AI Solution"}
          </span>
          {study.isTemplate && (
            <span className="text-xs font-semibold text-neon-cyan bg-neon-cyan/10 px-3 py-1 rounded-full border border-neon-cyan/30">
              Open Source
            </span>
          )}
        </div>
        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-neon-blue transition-colors">
          {study.title}
        </h3>
        <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
          {study.solution}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {study.techStack.map((tech, idx) => (
            <span
              key={idx}
              className="text-xs text-gray-400 bg-dark-card px-2 py-1 rounded border border-neon-blue/10"
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="pt-4 border-t border-neon-blue/20">
          <motion.button
            whileHover={{ x: 5 }}
            className="text-neon-blue font-semibold flex items-center gap-2 group-hover:text-neon-cyan transition-colors"
          >
            {study.isTemplate ? "View Template" : "View Demo"} →
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function CaseStudiesPage() {
  const [selectedStudy, setSelectedStudy] = useState<typeof caseStudies[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProjectClick = (study: typeof caseStudies[0]) => {
    // For templates, open demo URL; for solutions, open modal
    if (study.isTemplate && study.demoUrl) {
      window.open(study.demoUrl, '_blank');
    } else {
      setSelectedStudy(study);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="section-padding bg-dark-bg relative overflow-hidden">
        <div className="absolute inset-0 grid-background opacity-10" />
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Portfolio
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
              Innovative AI solutions and free n8n templates built by AlgoGI. Explore our open-source contributions and AI agent implementations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {caseStudies.map((study, index) => (
              <ProjectCard
                key={index}
                study={study}
                index={index}
                onClick={() => handleProjectClick(study)}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center neon-card rounded-2xl p-12 border border-neon-blue/30"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              See our full portfolio of AI solutions and automation templates
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Explore more innovative AI solutions, workflow automation examples, and free n8n templates designed to accelerate your business.
            </p>
            <Link
              href="/contact"
              className="btn-primary text-lg px-8 py-4 transform hover:scale-105 transition-transform duration-200"
            >
              Discuss Your AI Needs
            </Link>
          </motion.div>
        </div>
      </div>

      <CaseStudyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        study={selectedStudy}
      />
    </>
  );
}

