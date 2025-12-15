import Link from "next/link";
import Image from "next/image";
import { Calendar, User, ArrowRight } from "lucide-react";
import BlogPlaceholderImage from "@/components/blog/blog-placeholder-image";
import type { Metadata } from "next";
import { getDb } from "@/lib/firebase/config";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  published: boolean;
  featuredImage: string | null;
  tags: string[];
  publishedAt: string | null;
}

export const revalidate = 300;

const baseUrl = process.env.NEXTAUTH_URL || "https://algogi.com";

export const metadata: Metadata = {
  title: "Blog | AI Engineering Insights from AlgoGI",
  description: "Insights, tutorials, and updates on AI agents, automation, and engineering from the AlgoGI team.",
  alternates: { canonical: `${baseUrl}/blog` },
};

async function getPosts(): Promise<BlogPost[]> {
  try {
    const db = getDb();
    const snapshot = await db
      .collection("blog")
      .where("published", "==", true)
      .orderBy("publishedAt", "desc")
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || "",
        author: data.author || "",
        published: data.published || false,
        featuredImage: data.featuredImage || null,
        tags: data.tags || [],
        publishedAt: data.publishedAt?.toDate?.()?.toISOString() || null,
      };
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="section-padding bg-dark-bg">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white dark:text-gray-100 mb-6">
            Blog
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 dark:text-gray-200 max-w-4xl mx-auto">
            Insights, tutorials, and updates from the AlgoGI team
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white border border-neon-blue/20 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow public-blog-card"
              >
                <div className="relative h-48 w-full">
                  {post.featuredImage ? (
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <BlogPlaceholderImage title={post.title} size="small" />
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold text-gray-900 public-blog-title group-hover:text-brand-primary transition-colors">
                      {post.title}
                    </h2>
                    {!post.published && (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 public-blog-excerpt text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 public-blog-meta">
                    <div className="flex items-center space-x-4">
                      {post.author && (
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {post.author}
                        </div>
                      )}
                      {post.publishedAt && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(post.publishedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-gray-500 public-blog-arrow" />
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-brand-primary/10 text-brand-primary rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

