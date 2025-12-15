import { MetadataRoute } from "next";
import { services } from "./services/services-data";
import { getDb } from "@/lib/firebase/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "https://algogi.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/case-studies`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  const servicePages: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  let blogPages: MetadataRoute.Sitemap = [];

  try {
    const db = getDb();
    const blogSnapshot = await db.collection("blog").where("published", "==", true).get();
    blogPages = blogSnapshot.docs.map((doc) => ({
      url: `${baseUrl}/blog/${doc.data().slug}`,
      lastModified: doc.data().publishedAt?.toDate?.() || new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Sitemap blog fetch failed, continuing without dynamic blog URLs:", error);
  }

  // Case studies are all displayed on /case-studies page (no individual pages)
  // The /case-studies URL is already included in staticPages above
  // No need to add individual case study URLs to sitemap

  return [...staticPages, ...servicePages, ...blogPages];
}

