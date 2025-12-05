"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useTheme } from "next-themes";
import Card3D from "@/components/animations/3d-card";

interface CaseStudy {
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
  gradient: string;
}

const caseStudies: CaseStudy[] = [
  {
    title: "Automated Lead Enrichment",
    description:
      "AI-powered lead enrichment that automatically processes and enriches incoming leads, reducing manual research time by 85%.",
    metric: "85%",
    metricLabel: "Time Reduction",
    gradient: "from-neon-blue to-neon-cyan",
  },
  {
    title: "AI-Driven Personalization",
    description:
      "Intelligent personalization engine that adapts content based on geographic and behavioral data, increasing conversion rates by 40%.",
    metric: "40%",
    metricLabel: "Conversion Increase",
    gradient: "from-neon-purple to-neon-pink",
  },
  {
    title: "Virtual Support Agent",
    description:
      "24/7 virtual support agent handling 70% of customer inquiries with human-level accuracy, reducing support costs significantly.",
    metric: "70%",
    metricLabel: "Inquiries Automated",
    gradient: "from-neon-cyan to-neon-blue",
  },
];

function CaseStudyCard({
  study,
  index,
}: {
  study: CaseStudy;
  index: number;
}) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
    >
      <Card3D>
        <motion.div
          whileHover={{ y: -12 }}
          className="neon-card relative overflow-hidden group cursor-pointer h-full"
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${study.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
          />
          <div className="relative z-10">
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={inView ? { scale: 1 } : {}}
                transition={{ delay: index * 0.15 + 0.3, type: "spring", stiffness: 200 }}
                className="text-6xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-br from-gray-300 dark:from-gray-300 from-gray-700 via-neon-blue/60 dark:via-neon-blue/60 via-neon-light-blue/80 to-gray-400 dark:to-gray-400 to-gray-600"
                style={{
                  textShadow: isLight ? "0 0 20px rgba(0, 136, 204, 0.2)" : "0 0 20px rgba(0, 240, 255, 0.15)",
                }}
              >
                {study.metric}
              </motion.div>
              <div className="text-xs text-gray-400 dark:text-gray-400 text-gray-600 uppercase tracking-widest">
                {study.metricLabel}
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-neon-blue dark:group-hover:text-neon-blue group-hover:text-neon-light-blue transition-colors">
              {study.title}
            </h3>
            <p className="text-gray-400 dark:text-gray-400 text-gray-600 leading-relaxed text-sm">
              {study.description}
            </p>
          </div>
        </motion.div>
      </Card3D>
    </motion.div>
  );
}

export default function CaseStudyStrip() {
  return (
    <section className="section-padding bg-dark-bg dark:bg-dark-bg bg-light-bg relative overflow-hidden">
      <div className="absolute inset-0 grid-background opacity-20" />
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-gray-900 dark:text-white">Selected work from teams that care about </span>
            <span className="text-gradient">throughput, quality, and real‑world impact</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => (
            <CaseStudyCard key={index} study={study} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link href="/case-studies" className="btn-secondary">
            View case studies
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

