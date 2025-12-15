import HomeHero from "@/components/hero/home-hero";
import ServicesOverview from "@/components/sections/services-overview";
import CaseStudyStrip from "@/components/sections/case-study-strip";
import TechnologiesSection from "@/components/sections/technologies-section";
import HowWeWork from "@/components/sections/how-we-work";
import TrustSignals from "@/components/sections/trust-signals";
import HomeLeadCTA from "@/components/sections/home-lead-cta";
import type { Metadata } from "next";

const baseUrl = process.env.NEXTAUTH_URL || "https://algogi.com";

export const metadata: Metadata = {
  title: "AI Agent Development & Intelligent Automation | AlgoGI",
  description:
    "AI agents, automation, and full-stack engineering to ship production-grade intelligence fast. Strategy, engineering, and applied AI delivered end-to-end.",
  alternates: { canonical: baseUrl },
};

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <ServicesOverview />
      <HowWeWork />
      <TechnologiesSection />
      <CaseStudyStrip />
      <TrustSignals />
      <HomeLeadCTA />
    </>
  );
}

