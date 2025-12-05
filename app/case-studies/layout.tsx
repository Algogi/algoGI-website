import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio - AI Solutions & Automation Templates | AlgoGI",
  description:
    "Explore AlgoGI's portfolio of innovative AI solutions and free n8n automation templates. See real-world case studies including customer data sync automation, AI-powered lead qualification, invoice processing workflows, and intelligent customer support virtual agents.",
  keywords: [
    "AI case studies",
    "AI portfolio",
    "AI solutions examples",
    "n8n templates",
    "workflow automation examples",
    "AI agent implementations",
    "AI project portfolio",
    "automation case studies",
  ],
  openGraph: {
    title: "Portfolio - AI Solutions & Automation Templates | AlgoGI",
    description:
      "Explore AlgoGI's portfolio of innovative AI solutions and free n8n automation templates. See real-world case studies and implementations.",
    url: "https://algogi.com/case-studies",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio - AI Solutions & Automation Templates | AlgoGI",
    description:
      "Explore AlgoGI's portfolio of innovative AI solutions and free n8n automation templates.",
  },
  alternates: {
    canonical: "https://algogi.com/case-studies",
  },
};

export default function CaseStudiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

