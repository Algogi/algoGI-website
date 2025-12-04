import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services - AI Agent Development & Intelligent Automation Solutions",
  description:
    "AlgoGI specializes in AI agent development, bespoke AI platforms, intelligent automation, AI virtual agents, and AI model lifecycle management. Transform your business with cutting-edge AI solutions that deliver agility, performance, and measurable impact.",
  keywords: [
    "AI agent development",
    "bespoke AI platforms",
    "AI strategy consulting",
    "intelligent automation",
    "AI virtual agents",
    "AI model lifecycle management",
    "AI analytics platforms",
    "generative AI solutions",
    "machine learning",
    "NLP automation",
  ],
  openGraph: {
    title: "Services - AI Agent Development & Intelligent Automation Solutions | AlgoGI",
    description:
      "AlgoGI specializes in AI agent development, bespoke AI platforms, intelligent automation, AI virtual agents, and AI model lifecycle management.",
    url: "https://algogi.com/services",
  },
  twitter: {
    card: "summary_large_image",
    title: "Services - AI Agent Development & Intelligent Automation Solutions | AlgoGI",
    description:
      "Transform your business with cutting-edge AI solutions that deliver agility, performance, and measurable impact.",
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

