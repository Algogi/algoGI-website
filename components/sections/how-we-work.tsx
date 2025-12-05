"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Search, Target, Code, Rocket, ArrowRight } from "lucide-react";

const processSteps = [
  {
    number: "01",
    title: "Discovery & Analysis",
    description: "We immerse ourselves in understanding your business goals, target audience, and technical requirements to lay a solid foundation.",
    icon: Search,
    gradient: "from-neon-blue to-neon-cyan",
  },
  {
    number: "02",
    title: "Strategic Planning",
    description: "Crafting detailed project roadmaps, selecting optimal tech stacks, and defining clear milestones with timelines.",
    icon: Target,
    gradient: "from-neon-purple to-neon-pink",
  },
  {
    number: "03",
    title: "Agile Development",
    description: "Iterative development cycles with continuous testing, code reviews, and regular progress updates to ensure quality.",
    icon: Code,
    gradient: "from-neon-cyan to-neon-blue",
  },
  {
    number: "04",
    title: "Launch & Beyond",
    description: "Smooth deployment, comprehensive training, and ongoing support to ensure your solution evolves with your business.",
    icon: Rocket,
    gradient: "from-neon-pink to-neon-purple",
  },
];

function ProcessStep({
  step,
  index,
}: {
  step: typeof processSteps[0];
  index: number;
}) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  const Icon = step.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="relative group"
    >
      <div className="neon-card rounded-2xl p-8 border border-neon-blue/30 hover:border-neon-blue/50 transition-all duration-300 h-full relative overflow-hidden">
        {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
        
        <div className="relative z-10">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative"
            >
              {/* Bright gradient background */}
              <div className={`relative p-6 rounded-2xl bg-gradient-to-br ${step.gradient} border-2 border-neon-blue/70 shadow-[0_0_50px_rgba(0,240,255,0.5)]`}>
                {/* Dark overlay for icon contrast */}
                <div className="absolute inset-0 bg-black/20 rounded-2xl" />
                
                {/* Icon with strong contrast */}
                <Icon className="w-14 h-14 text-white relative z-10 process-step-icon" style={{ 
                  filter: 'drop-shadow(0 0 20px rgba(0, 0, 0, 0.8)) drop-shadow(0 0 15px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 30px rgba(0, 240, 255, 0.7))',
                  strokeWidth: 2.5
                }} />
              </div>
              
              {/* Bright glow effect */}
              <div className={`absolute -inset-3 bg-gradient-to-br ${step.gradient} opacity-40 blur-2xl -z-10`} />
            </motion.div>
          </div>

          {/* Content */}
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-neon-blue transition-colors">
            {step.title}
          </h3>
          <p className="text-lg text-gray-300 leading-relaxed">
            {step.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function HowWeWork() {
  return (
    <section className="section-padding bg-dark-bg relative overflow-hidden">
      <div className="absolute inset-0 grid-background opacity-10" />
      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            How We <span className="text-gradient">Work</span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            A streamlined approach that transforms your vision into reality
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {processSteps.map((step, index) => (
            <ProcessStep
              key={index}
              step={step}
              index={index}
            />
          ))}
        </div>

        {/* Connecting arrow indicators on desktop */}
        <div className="hidden lg:flex items-center justify-center gap-4 mt-8 max-w-7xl mx-auto">
          {processSteps.slice(0, -1).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 + 0.6 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="h-px w-full bg-gradient-to-r from-neon-blue/50 via-neon-purple/50 to-transparent" />
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                className="mx-2"
              >
                <ArrowRight className="w-6 h-6 text-neon-blue" />
              </motion.div>
              <div className="h-px w-full bg-gradient-to-l from-neon-blue/50 via-neon-purple/50 to-transparent" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

