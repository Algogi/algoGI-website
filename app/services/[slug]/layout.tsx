import type { Metadata } from "next";
import { getServiceBySlug, services } from "../services-data";

export async function generateStaticParams() {
  return services.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const service = getServiceBySlug(params.slug);

  if (!service) {
    return {
      title: "Service Not Found | AlgoGI",
      description: "The service you're looking for doesn't exist.",
    };
  }

  const serviceTitle = service.title.split("—")[0].trim();
  const serviceSubtitle = service.title.includes("—")
    ? service.title.split("—")[1].trim()
    : "";

  return {
    title: `${serviceTitle} | AlgoGI`,
    description: `${service.description} ${serviceSubtitle ? serviceSubtitle + ". " : ""}${service.shortDescription}`,
    keywords: [
      serviceTitle.toLowerCase(),
      "AI agent development",
      "intelligent automation",
      "AI solutions",
      "AI consulting",
      ...service.features.slice(0, 3).map((f) => f.toLowerCase()),
    ],
    openGraph: {
      title: `${serviceTitle} | AlgoGI`,
      description: service.description,
      url: `https://algogi.com/services/${params.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${serviceTitle} | AlgoGI`,
      description: service.description,
    },
    alternates: {
      canonical: `https://algogi.com/services/${params.slug}`,
    },
  };
}

export default function ServiceDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

