"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";
import { Wrench, Bot, Download } from "lucide-react";
import CaseStudyModal from "@/components/modals/case-study-modal";
import DownloadFormModal from "@/components/modals/download-form-modal";
import { ArticleStructuredData } from "@/components/seo/structured-data";
import { caseStudies as staticCaseStudies, type CaseStudy } from "./case-studies-data";

// Helper function to get image source with fallback
function getCaseStudyImage(study: CaseStudy): string {
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

function ProjectCard({
  study,
  index,
  onClick,
  onDownloadClick,
}: {
  study: CaseStudy;
  index: number;
  onClick: () => void;
  onDownloadClick: (e: React.MouseEvent) => void;
}) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const imageSrc = getCaseStudyImage(study);
  const hasCustomImage = !!study.heroImage;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="neon-card rounded-xl p-6 border border-brand-primary/30 dark:border-brand-primary/30 border-brand-primary/40 hover:shadow-[0_0_30px_rgba(74,58,255,0.4)] dark:hover:shadow-[0_0_30px_rgba(74,58,255,0.4)] hover:shadow-[0_0_30px_rgba(74,58,255,0.3)] transition-all duration-300 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 dark:from-neon-purple/5 from-neon-light-purple/10 to-neon-blue/5 dark:to-neon-blue/5 to-neon-light-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div 
          className="h-48 rounded-lg mb-4 relative overflow-hidden border border-brand-primary/20 dark:border-brand-primary/20 border-brand-primary/30 group-hover:border-brand-primary/50 dark:group-hover:border-brand-primary/50 group-hover:border-brand-primary/60 transition-colors cursor-pointer"
          onClick={onClick}
        >
          {hasCustomImage ? (
            <Image
              src={imageSrc}
              alt={study.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-neon-blue/10 dark:from-neon-blue/10 from-neon-light-blue/20 to-neon-purple/10 dark:to-neon-purple/10 to-neon-light-purple/20 flex items-center justify-center">
              <motion.div
                className="flex items-center justify-center"
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {study.isTemplate ? (
                  <Wrench className="w-16 h-16 text-brand-primary dark:text-brand-primary text-brand-primary" />
                ) : (
                  <Bot className="w-16 h-16 text-neon-purple" />
                )}
              </motion.div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-neon-purple bg-neon-purple/10 px-3 py-1 rounded-full border border-neon-purple/30">
            {study.isTemplate ? "Automation Template" : "AI Solution"}
          </span>
          {study.isTemplate && (
            <span className="text-xs font-semibold text-neon-cyan bg-neon-cyan/10 px-3 py-1 rounded-full border border-neon-cyan/30">
              Open Source
            </span>
          )}
        </div>
        <div className="mb-3">
          <h3 
            className="text-xl font-semibold text-white dark:text-gray-900 mb-1 group-hover:text-brand-primary transition-colors cursor-pointer line-clamp-2"
            onClick={onClick}
            title={study.title}
          >
            {study.title}
          </h3>
          {study.client && (
            <p 
              className="text-sm text-gray-400 dark:text-gray-600 line-clamp-1"
              title={study.client}
            >
              {study.client}
            </p>
          )}
        </div>
        <p 
          className="text-gray-300 dark:text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed cursor-pointer"
          onClick={onClick}
        >
          {study.solution}
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {study.techStack.map((tech, idx) => (
            <span
              key={idx}
              className="text-xs text-gray-400 dark:text-gray-700 bg-dark-card dark:bg-gray-100 px-2 py-1 rounded border border-neon-blue/10 dark:border-neon-blue/20"
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="pt-4 border-t border-neon-light-blue/30 dark:border-neon-blue/20 flex items-center justify-between gap-2">
          <motion.button
            onClick={onClick}
            whileHover={{ x: 5 }}
            className="text-brand-primary dark:text-brand-primary text-brand-primary font-semibold flex items-center gap-2 group-hover:opacity-80 transition-colors text-sm flex-shrink min-w-0"
          >
            <span className="truncate">{study.isTemplate ? "View Template" : "View Demo"}</span> →
          </motion.button>
          <motion.button
            onClick={onDownloadClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-brand-primary/10 dark:bg-brand-primary/10 bg-brand-primary/20 hover:bg-brand-primary/20 dark:hover:bg-brand-primary/20 hover:bg-brand-primary/30 border border-brand-primary/30 dark:border-brand-primary/30 border-brand-primary/40 transition-colors flex-shrink-0"
            aria-label="Download"
            title="Download"
          >
            <Download className="w-5 h-5 text-brand-primary dark:text-brand-primary text-brand-primary" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function CaseStudiesPage() {
  const [selectedStudy, setSelectedStudy] = useState<CaseStudy | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [selectedDownloadStudy, setSelectedDownloadStudy] = useState<CaseStudy | null>(null);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCaseStudies() {
      try {
        const response = await fetch("/api/portfolio");
        if (response.ok) {
          const data = await response.json();
          // Transform Firestore data to match CaseStudy interface
          const transformed = data.map((item: any) => ({
            title: item.title,
            client: item.client,
            challenge: item.challenge,
            solution: item.solution,
            results: item.results || [],
            metrics: item.metrics || {
              primary: "",
              primaryLabel: "",
              secondary: "",
              secondaryLabel: "",
            },
            techStack: item.techStack || [],
            isTemplate: item.isTemplate || false,
            demoUrl: item.demoUrl || "#",
            downloadFile: item.downloadFile || {
              type: "pdf" as const,
              identifier: "",
            },
            heroImage: item.heroImage,
          }));
          setCaseStudies(transformed);
        } else {
          // Fallback to static data
          setCaseStudies(staticCaseStudies);
        }
      } catch (error) {
        console.error("Error fetching case studies:", error);
        // Fallback to static data
        setCaseStudies(staticCaseStudies);
      } finally {
        setLoading(false);
      }
    }

    fetchCaseStudies();
  }, []);

  const handleProjectClick = (study: CaseStudy) => {
    // For templates, open demo URL; for solutions, open modal
    if (study.isTemplate && study.demoUrl && study.demoUrl !== "#") {
      window.open(study.demoUrl, '_blank');
    } else {
      setSelectedStudy(study);
      setIsModalOpen(true);
    }
  };

  const handleDownloadClick = (e: React.MouseEvent, study: CaseStudy) => {
    e.stopPropagation();
    setSelectedDownloadStudy(study);
    setDownloadModalOpen(true);
  };

  return (
    <>
      <ArticleStructuredData
        headline="Portfolio - AI Solutions & Automation Templates"
        description="Explore AlgoGI's portfolio of innovative AI solutions and free automation templates."
      />
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
              Innovative AI solutions and free automation templates built by AlgoGI. Explore our open-source contributions and AI agent implementations.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="spinner mb-4"></div>
              <div className="text-gray-500 dark:text-gray-400">Loading portfolio...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {caseStudies.map((study, index) => (
                <ProjectCard
                  key={index}
                  study={study}
                  index={index}
                  onClick={() => handleProjectClick(study)}
                  onDownloadClick={(e) => handleDownloadClick(e, study)}
                />
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center neon-card rounded-2xl p-12 border border-brand-primary/30 dark:border-brand-primary/30 border-brand-primary/40"
          >
            <h2 className="text-3xl font-bold text-white dark:text-gray-900 mb-4">
              See our full portfolio of AI solutions and automation templates
            </h2>
            <p className="text-lg text-gray-300 dark:text-gray-700 mb-8 max-w-2xl mx-auto">
              Explore more innovative AI solutions, workflow automation examples, and free automation templates designed to accelerate your business.
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

      {selectedDownloadStudy && (
        <DownloadFormModal
          isOpen={downloadModalOpen}
          onClose={() => {
            setDownloadModalOpen(false);
            setSelectedDownloadStudy(null);
          }}
          fileIdentifier={selectedDownloadStudy.downloadFile.identifier}
          fileType={selectedDownloadStudy.downloadFile.type}
          caseStudyTitle={selectedDownloadStudy.title}
        />
      )}
    </>
  );
}

