import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Calendar, User, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import BlogPlaceholderImage from "@/components/blog/blog-placeholder-image";
import { getDb } from "@/lib/firebase/config";

interface FAQ {
  question: string;
  answer: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  published: boolean;
  featuredImage: string | null;
  tags: string[];
  publishedAt: string | null;
  faqs?: FAQ[];
}

async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const db = getDb();
    const snapshot = await db
      .collection("blog")
      .where("slug", "==", slug)
      .where("published", "==", true)
      .limit(1)
      .get();

    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      title: data.title,
      slug: data.slug,
      content: data.content || "",
      excerpt: data.excerpt || "",
      author: data.author || "AlgoGI Team",
      published: data.published || false,
      featuredImage: data.featuredImage || null,
      tags: data.tags || [],
      publishedAt: data.publishedAt?.toDate?.()?.toISOString() || null,
      faqs: data.faqs || [],
    };
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const db = getDb();
    const snapshot = await db.collection("blog").where("published", "==", true).get();
    return snapshot.docs.map((doc) => ({ slug: doc.data().slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);
  const baseUrl = process.env.NEXTAUTH_URL || "https://algogi.com";

  if (!post) {
    return {
      title: "Blog post not found | AlgoGI",
      description: "The requested blog post could not be found.",
    };
  }

  const description = post.excerpt || post.content.slice(0, 160);
  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toISOString().split("T")[0]
    : undefined;

  return {
    title: `${post.title} | AlgoGI`,
    description,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: publishedDate,
    },
    alternates: {
      canonical: `${baseUrl}/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const publishedDate = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Unpublished";
  const content = post.content || post.excerpt || "No content available.";

  return (
    <article className="section-padding bg-dark-bg">
      <div className="container-custom max-w-5xl">
        <Link href="/blog" className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-primary/80 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-neon-blue/10">
          {post.featuredImage ? (
            <div className="relative h-72 w-full">
              <Image src={post.featuredImage} alt={post.title} fill className="object-cover" priority />
            </div>
          ) : (
            <div className="h-72 w-full bg-gray-100 flex items-center justify-center">
              <BlogPlaceholderImage title={post.title} size="large" />
            </div>
          )}

          <div className="p-8 md:p-10 lg:p-12">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full">
                <User className="w-4 h-4" />
                {post.author || "AlgoGI Team"}
              </div>
              <div className="inline-flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {publishedDate}
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{post.title}</h1>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 text-xs font-semibold bg-brand-primary/10 text-brand-primary rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-brand-primary">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>

            {post.faqs && post.faqs.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {post.faqs.map((faq, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-700">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

