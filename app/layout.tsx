import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/navigation/site-header";
import SiteFooter from "@/components/footer/site-footer";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { OrganizationStructuredData } from "@/components/seo/structured-data";
import FloatingCTA from "@/components/cta/floating-cta";

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
    images: [
      {
        url: "https://algogi.com/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "AlgoGI - AI Agent Development & Intelligent Automation Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AlgoGI - AI Agent Development & Intelligent Automation Solutions",
    description:
      "We specialize in AI agent development and AI-enabled software solutions that deliver agility, performance, and measurable impact.",
    images: ["https://algogi.com/images/og-image.png"],
  },
  alternates: {
    canonical: "https://algogi.com",
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
        <OrganizationStructuredData />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <SiteHeader />
          <main className="min-h-screen">{children}</main>
          <SiteFooter />
          <FloatingCTA />
        </ThemeProvider>
        {/* Google Analytics 4 - Replace G-XXXXXXXXXX with your actual GA4 Measurement ID */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}

