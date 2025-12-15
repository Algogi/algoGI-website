import Link from "next/link";
import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { services } from "./services-data";

const baseUrl = process.env.NEXTAUTH_URL || "https://algogi.com";

export const metadata: Metadata = {
  title: "Services | AI Agent Development & Automation | AlgoGI",
  description:
    "AI agents, automation platforms, and full-stack delivery. Explore how AlgoGI ships production-grade intelligence for modern teams.",
  alternates: { canonical: `${baseUrl}/services` },
};

function ServiceCard({ service }: { service: typeof services[0] }) {
  return (
    <Link href={`/services/${service.slug}`}>
      <div className="neon-card rounded-2xl p-8 border border-neon-blue/30 dark:border-neon-blue/30 border-neon-light-blue/40 hover:border-neon-blue/50 dark:hover:border-neon-blue/50 hover:border-neon-light-blue/60 transition-all duration-300 group relative overflow-hidden cursor-pointer h-full flex flex-col">
        <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

        <div className="relative z-10 flex flex-col h-full">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-20 rounded-2xl blur-xl transition-opacity duration-500`} />
              <div className="relative p-6 rounded-2xl bg-transparent dark:bg-dark-surface/50 border-2 border-neon-light-blue/40 dark:border-neon-blue/30 transition-all duration-500 backdrop-blur-sm">
                <div className="relative z-10" style={{ filter: "drop-shadow(0 0 10px rgba(0, 240, 255, 0.6))" }}>
                  <service.Icon className="w-20 h-20 text-neon-blue" />
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-neon-blue transition-colors">
            {service.title.split("-")[0].trim()}
          </h2>

          <p className="text-base text-gray-400 mb-8 leading-relaxed flex-1">{service.shortDescription}</p>

          <div className="text-neon-blue font-semibold hover:text-neon-cyan flex items-center gap-2 transition-all w-full justify-between mt-auto">
            <span>Learn More</span>
            <span className="text-xl">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ServicesPage() {
  return (
    <div className="section-padding bg-dark-bg relative overflow-hidden">
      <div className="absolute inset-0 grid-background opacity-10" />
      <div className="container-custom relative z-10 space-y-16">
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
            AI Agent Development & Intelligent Automation Solutions
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 dark:text-gray-300 text-gray-700 max-w-4xl mx-auto">
            We specialize in AI agent development and AI-enabled software solutions that deliver agility, performance,
            and measurable impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>

        <div className="mb-16">
          <div className="max-w-4xl mx-auto neon-card rounded-2xl p-10 md:p-12 border border-neon-purple/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-purple/5 rounded-full blur-3xl" />
            <div className="relative z-10 space-y-6 text-center">
              <div className="flex items-center justify-center gap-4">
                <BarChart3 className="w-10 h-10 text-neon-purple" />
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Analytics <span className="text-gradient">Platforms</span>
                </h2>
              </div>
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                AlgoGI designs AI-powered analytics platforms that transform raw data into actionable intelligence.
                Real-time monitoring, predictive insights, and data-driven decisions tailored to your needs.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center neon-card rounded-2xl p-12 border border-neon-blue/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-neon-blue/5 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Let&apos;s co-create. Strategy to scale, we&apos;re your go-to AI software partner.
            </h2>
            <Link href="/contact" className="btn-primary text-lg px-8 py-4 inline-block">
              Discuss Your AI Needs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
