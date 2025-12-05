"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Calendar, User, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
}

export default function BlogPostPage() {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        setIsAdmin(data.authenticated === true);
      })
      .catch(() => setIsAdmin(false));

    if (params.slug) {
      fetchPost(params.slug as string);
    }
  }, [params.slug]);

  const fetchPost = async (slug: string) => {
    try {
      const response = await fetch(`/api/blog/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      }
    } catch (error) {
      console.error("Error fetching blog post:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="section-padding bg-dark-bg">
        <div className="container-custom text-center py-12">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="section-padding bg-dark-bg">
        <div className="container-custom text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Post not found</h1>
          <Link href="/blog" className="text-brand-primary hover:underline">
            ← Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="section-padding bg-dark-bg">
      <div className="container-custom max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-brand-primary hover:text-brand-primary/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to blog
          </Link>
          {isAdmin && !post.published && (
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full">
                Draft
              </span>
              <a
                href={`/admin/blog/${post.id}`}
                className="px-3 py-1 text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 rounded-md"
              >
                Edit
              </a>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/cms/blog/${post.id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ...post, published: true }),
                    });
                    if (response.ok) {
                      window.location.reload();
                    }
                  } catch (error) {
                    alert("Failed to publish post");
                  }
                }}
                className="px-3 py-1 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
              >
                Publish
              </button>
            </div>
          )}
        </div>

        {post.featuredImage && (
          <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>
          <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
            {post.author && (
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                {post.author}
              </div>
            )}
            {post.publishedAt && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            )}
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm bg-brand-primary/10 text-brand-primary rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-brand-primary prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-brand-primary prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}

