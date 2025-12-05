import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - Innovation Driven By AI-Powered Engineering | AlgoGI",
  description:
    "Learn about AlgoGI - a fervent group of software innovators, engineers, and designers creating future-capable AI solutions for companies worldwide. Discover our vision, strengths, milestones, and team culture.",
  keywords: [
    "AI software development company",
    "AI engineering team",
    "artificial intelligence experts",
    "AI innovation",
    "software engineering",
    "AI product design",
    "full-cycle development",
    "AI solutions company",
  ],
  openGraph: {
    title: "About Us - Innovation Driven By AI-Powered Engineering | AlgoGI",
    description:
      "Learn about AlgoGI - a fervent group of software innovators, engineers, and designers creating future-capable AI solutions for companies worldwide.",
    url: "https://algogi.com/about",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us - Innovation Driven By AI-Powered Engineering | AlgoGI",
    description:
      "Learn about AlgoGI - a fervent group of software innovators, engineers, and designers creating future-capable AI solutions for companies worldwide.",
  },
  alternates: {
    canonical: "https://algogi.com/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

