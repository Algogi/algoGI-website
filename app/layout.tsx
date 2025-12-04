import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/navigation/site-header";
import SiteFooter from "@/components/footer/site-footer";
import { ThemeProvider } from "@/components/theme/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-geometric" });

export const metadata: Metadata = {
  title: {
    default: "AlgoGI - AI Agent Development & Intelligent Automation Solutions",
    template: "%s | AlgoGI",
  },
  description:
    "We specialize in AI agent development and AI-enabled software solutions that deliver agility, performance, and measurable impact. Creating future-capable solutions with profound technical expertise in artificial intelligence, product design, and full-cycle development.",
  keywords: [
    "AI agent development",
    "intelligent automation",
    "AI virtual agents",
    "bespoke AI platforms",
    "AI strategy consulting",
    "AI model lifecycle management",
    "n8n templates",
    "workflow automation",
    "machine learning",
    "NLP",
    "generative AI",
  ],
  authors: [{ name: "AlgoGI" }],
  icons: {
    icon: "/images/algogi-logo.svg",
    shortcut: "/images/algogi-logo.svg",
    apple: "/images/algogi-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://algogi.com",
    siteName: "AlgoGI",
    title: "AlgoGI - AI Agent Development & Intelligent Automation Solutions",
    description:
      "We specialize in AI agent development and AI-enabled software solutions that deliver agility, performance, and measurable impact.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AlgoGI - AI Agent Development & Intelligent Automation Solutions",
    description:
      "We specialize in AI agent development and AI-enabled software solutions that deliver agility, performance, and measurable impact.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <SiteHeader />
          <main className="min-h-screen">{children}</main>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}

