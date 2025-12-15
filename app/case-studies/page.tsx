import { ArticleStructuredData } from "@/components/seo/structured-data";
import type { Metadata } from "next";
import { getDb } from "@/lib/firebase/config";
import { caseStudies as staticCaseStudies, type CaseStudy } from "./case-studies-data";
import CaseStudiesClient from "@/components/sections/case-studies-client";

export const revalidate = 600;

const baseUrl = process.env.NEXTAUTH_URL || "https://algogi.com";

export const metadata: Metadata = {
  title: "Portfolio | AI Solutions & Automation Templates | AlgoGI",
  description: "Explore AlgoGI's portfolio of AI solutions and automation templates built for production impact.",
  alternates: { canonical: `${baseUrl}/case-studies` },
};

async function loadCaseStudies(): Promise<CaseStudy[]> {
  try {
    const db = getDb();
    const snapshot = await db.collection("portfolio").orderBy("order", "asc").get();
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        title: data.title,
        client: data.client,
        challenge: data.challenge,
        solution: data.solution,
        results: data.results || [],
        metrics: data.metrics || {
          primary: "",
          primaryLabel: "",
          secondary: "",
          secondaryLabel: "",
        },
        techStack: data.techStack || [],
        isTemplate: data.isTemplate || false,
        demoUrl: data.demoUrl || "#",
        downloadFile: data.downloadFile || {
          type: "pdf" as const,
          identifier: "",
        },
        heroImage: data.heroImage,
      } as CaseStudy;
    });
  } catch (error) {
    console.error("Error fetching case studies:", error);
    return staticCaseStudies;
  }
}

export default async function CaseStudiesPage() {
  const caseStudies = await loadCaseStudies();

  return (
    <>
      <ArticleStructuredData
        headline="Portfolio - AI Solutions & Automation Templates"
        description="Explore AlgoGI's portfolio of innovative AI solutions and free automation templates."
      />
      <div className="section-padding bg-dark-bg relative overflow-hidden">
        <div className="absolute inset-0 grid-background opacity-10" />
        <div className="container-custom relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">Portfolio</h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
              Innovative AI solutions and free automation templates built by AlgoGI. Explore our open-source
              contributions and AI agent implementations.
            </p>
          </div>

          <CaseStudiesClient caseStudies={caseStudies} />

          <div className="text-center neon-card rounded-2xl p-12 border border-brand-primary/30 dark:border-brand-primary/30 border-brand-primary/40">
            <h2 className="text-3xl font-bold text-white dark:text-gray-900 mb-4">
              See our full portfolio of AI solutions and automation templates
            </h2>
            <p className="text-lg text-gray-300 dark:text-gray-700 mb-8 max-w-2xl mx-auto">
              Explore more innovative AI solutions, workflow automation examples, and free automation templates designed
              to accelerate your business.
            </p>
            <a href="/contact" className="btn-primary text-lg px-8 py-4 transform hover:scale-105 transition-transform duration-200">
              Discuss Your AI Needs
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

