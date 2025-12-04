"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Code, Bot, Cloud, BarChart3 } from "lucide-react";
import Card3D from "@/components/animations/3d-card";

interface Service {
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  gradient: string;
}

const services: Service[] = [
  {
    title: "Product engineering",
    description:
      "Cross‑functional squads that handle architecture, backend, frontend, and DevOps to ship reliable, scalable products.",
    Icon: Code,
    gradient: "from-neon-blue to-neon-cyan",
  },
  {
    title: "AI‑native experiences",
    description:
      "Design and integrate LLMs, agents, and custom models into products that feel intelligent, not gimmicky.",
    Icon: Bot,
    gradient: "from-neon-purple to-neon-pink",
  },
  {
    title: "Cloud and platforms",
    description:
      "Cloud‑ready infrastructure, observability, and security baked in from day one for zero‑drama releases.",
    Icon: Cloud,
    gradient: "from-neon-cyan to-neon-blue",
  },
  {
    title: "Strategy sprints",
    description:
      "Intense, outcome‑driven workshops to define scope, roadmap, and success metrics before a single line of code.",
    Icon: BarChart3,
    gradient: "from-neon-pink to-neon-purple",
  },
];

function ServiceCard({ service, index }: { service: Service; index: number }) {
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
          className={`neon-card relative overflow-hidden group cursor-pointer h-full`}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
          />
          <div className="relative z-10">
            <motion.div
              className="mb-6 flex justify-center"
              whileHover={{ scale: 1.3, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <service.Icon className="w-16 h-16 text-neon-blue dark:text-neon-blue text-neon-light-blue" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-neon-blue dark:group-hover:text-neon-blue group-hover:text-neon-light-blue transition-colors">
              {service.title}
            </h3>
            <p className="text-gray-400 dark:text-gray-400 text-gray-600 leading-relaxed">
              {service.description}
            </p>
            <motion.div
              className="mt-6 text-neon-blue dark:text-neon-blue text-neon-light-blue font-semibold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
              initial={false}
            >
              Learn More <span>→</span>
            </motion.div>
          </div>
        </motion.div>
      </Card3D>
    </motion.div>
  );
}

export default function ServicesOverview() {
  return (
    <section className="section-padding bg-dark-surface dark:bg-dark-surface bg-light-surface relative overflow-hidden">
      <div className="absolute inset-0 grid-background opacity-20" />
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-gray-900 dark:text-white">Strategy · Engineering · </span>
            <span className="text-gradient">AI & Automation</span>
          </h2>
          <p className="text-lg text-gray-400 dark:text-gray-400 text-gray-600 max-w-2xl mx-auto">
            Built‑for‑you product teams that move from idea to deployment with precision and speed.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} service={service} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <Link href="/services" className="btn-primary">
            View all services
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

