"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  SiReact,
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiNodedotjs,
  SiPython,
  SiExpress,
  SiFastapi,
  SiTensorflow,
  SiPytorch,
  SiOpenai,
  SiAmazon,
  SiDocker,
  SiKubernetes,
  SiGit,
  SiPostgresql,
  SiMongodb,
  SiRedis,
  SiPrisma,
} from "react-icons/si";
import { FaBrain, FaAws } from "react-icons/fa";

interface Technology {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const technologies: Technology[] = [
  { name: "React", icon: SiReact, color: "neon-blue" },
  { name: "Next.js", icon: SiNextdotjs, color: "neon-cyan" },
  { name: "TypeScript", icon: SiTypescript, color: "neon-blue" },
  { name: "TailwindCSS", icon: SiTailwindcss, color: "neon-cyan" },
  { name: "Node.js", icon: SiNodedotjs, color: "neon-purple" },
  { name: "Python", icon: SiPython, color: "neon-blue" },
  { name: "Express", icon: SiExpress, color: "neon-purple" },
  { name: "FastAPI", icon: SiFastapi, color: "neon-pink" },
  { name: "TensorFlow", icon: SiTensorflow, color: "neon-orange" },
  { name: "PyTorch", icon: SiPytorch, color: "neon-pink" },
  { name: "OpenAI", icon: SiOpenai, color: "neon-green" },
  { name: "LangChain", icon: FaBrain, color: "neon-purple" },
  { name: "AWS", icon: FaAws, color: "neon-orange" },
  { name: "Docker", icon: SiDocker, color: "neon-blue" },
  { name: "Kubernetes", icon: SiKubernetes, color: "neon-cyan" },
  { name: "Git", icon: SiGit, color: "neon-pink" },
  { name: "PostgreSQL", icon: SiPostgresql, color: "neon-blue" },
  { name: "MongoDB", icon: SiMongodb, color: "neon-green" },
  { name: "Redis", icon: SiRedis, color: "neon-red" },
  { name: "Prisma", icon: SiPrisma, color: "neon-purple" },
];

// Duplicate technologies for seamless loop
const duplicatedTechs = [...technologies, ...technologies, ...technologies];

function TechMarquee({
  technologies,
}: {
  technologies: Technology[];
}) {
  return (
    <div className="relative overflow-hidden w-full py-8 -rotate-2">
      {/* Gradient overlays for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-dark-bg via-dark-bg/80 to-transparent z-10 pointer-events-none marquee-fade-left" />
      <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-dark-bg via-dark-bg/80 to-transparent z-10 pointer-events-none marquee-fade-right" />
      
      <motion.div
        className="flex gap-6"
        animate={{
          x: ["0%", "-50%"],
        }}
        transition={{
          duration: 80,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          width: "max-content",
        }}
      >
        {technologies.map((tech, index) => (
          <motion.div
            key={`${tech.name}-${index}`}
            className="flex items-center gap-3 px-6 py-3 rounded-xl bg-dark-card border border-gray-600/30 text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-all duration-300 whitespace-nowrap group flex-shrink-0 grayscale hover:grayscale-0"
            whileHover={{ scale: 1.1, y: -4 }}
          >
            <tech.icon className="w-6 h-6 flex-shrink-0 text-gray-400" />
            <span className="text-sm font-semibold text-gray-400 group-hover:text-gray-300">
              {tech.name}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default function TechnologiesSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section ref={ref} className="section-padding bg-dark-bg relative overflow-hidden">
      <div className="absolute inset-0 grid-background opacity-10" />
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="text-neon-cyan font-bold text-sm uppercase tracking-widest mb-4 block"
          >
            Our Tech Stack
          </motion.span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            <span className="text-white">Technologies We </span>
            <span className="text-gradient">Use</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Cutting-edge tools and frameworks powering our innovative solutions
          </p>
        </motion.div>
      </div>

      {/* Moving Tech Marquee - Full Width, Tilted */}
      <div className="w-full mb-16 relative overflow-hidden">
        <TechMarquee technologies={duplicatedTechs} />
      </div>

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <p className="text-gray-400 mb-6">
            And many more cutting-edge technologies tailored to your project needs
          </p>
          <motion.a
            href="/services"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-secondary inline-block"
          >
            Explore Our Services
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

