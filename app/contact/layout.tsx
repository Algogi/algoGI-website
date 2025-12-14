import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Get Your AI Project Started | AlgoGI",
  description:
    "Contact AlgoGI to discuss your AI and software development needs. Get a clear plan in your inbox within 24 hours. Speak directly with senior engineers-no sales scripts, no spam. Multiple ways to reach us.",
  keywords: [
    "contact AI development company",
    "AI consultation",
    "AI project inquiry",
    "AI software development contact",
    "AI agent development consultation",
    "intelligent automation consultation",
    "AI strategy consultation",
  ],
  openGraph: {
    title: "Contact Us - Get Your AI Project Started | AlgoGI",
    description:
      "Contact AlgoGI to discuss your AI and software development needs. Get a clear plan in your inbox within 24 hours. Speak directly with senior engineers.",
    url: "https://algogi.com/contact",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us - Get Your AI Project Started | AlgoGI",
    description:
      "Contact AlgoGI to discuss your AI and software development needs. Get a clear plan in your inbox within 24 hours.",
  },
  alternates: {
    canonical: "https://algogi.com/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

