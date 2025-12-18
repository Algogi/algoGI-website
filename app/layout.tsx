import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { OrganizationStructuredData } from "@/components/seo/structured-data";
import AdminRouteHandler from "@/components/admin/admin-route-handler";
import FirebaseAnalyticsProvider from "@/components/analytics/firebase-analytics-provider";
import GoogleAnalyticsLoader from "@/components/analytics/google-analytics-loader";
import CookieConsent from "@/components/cookie-consent/cookie-consent";
import { Toaster } from "@/components/ui/toast";

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
      <body className={`${inter.variable} font-sans`} suppressHydrationWarning>
        <OrganizationStructuredData />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <FirebaseAnalyticsProvider>
            <AdminRouteHandler>
              {children}
            </AdminRouteHandler>
          </FirebaseAnalyticsProvider>
          <Toaster />
          <CookieConsent />
        </ThemeProvider>
        {/* 
          Analytics Setup:
          - Firebase Analytics is the primary tracking method and automatically sends data to GA4
            using the measurementId from firebaseConfig (G-LDY83N2HS4).
          - GoogleAnalyticsLoader only loads gtag scripts if NEXT_PUBLIC_GA_MEASUREMENT_ID is set
            AND it's different from Firebase's measurementId (to prevent double tracking).
          - Both respect user consent preferences.
        */}
        <GoogleAnalyticsLoader />
      </body>
    </html>
  );
}

