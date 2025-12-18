"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Calendar, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import DOMPurify from "dompurify";
import { toast } from "sonner";
import BlogPlaceholderImage from "@/components/blog/blog-placeholder-image";
import { logAnalyticsEvent, AnalyticsEvents } from "@/lib/firebase/analytics";

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

export default function BlogPostPage() {
  const params = useParams();
  const pathname = usePathname();
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
        
        // Track blog view
        if (data) {
          logAnalyticsEvent(AnalyticsEvents.BLOG_VIEW, {
            blog_slug: slug,
            blog_title: data.title,
            author: data.author || null,
            tags: data.tags || [],
          });
        }
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
                    toast.error("Failed to publish post");
                  }
                }}
                className="px-3 py-1 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
              >
                Publish
              </button>
            </div>
          )}
        </div>

        <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
          {post.featuredImage ? (
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          ) : (
            <BlogPlaceholderImage title={post.title} size="large" />
          )}
        </div>

        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>
          <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
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

        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-200 prose-a:text-brand-primary dark:prose-a:text-neon-blue prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-brand-primary dark:prose-code:text-neon-blue prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800 prose-li:text-gray-700 dark:prose-li:text-gray-200 prose-ul:text-gray-700 dark:prose-ul:text-gray-200 prose-ol:text-gray-700 dark:prose-ol:text-gray-200">
          {(() => {
            // Check if content is JSON (block-based editor format)
            let contentToRender = post.content;
            try {
              const parsed = JSON.parse(post.content);
              if (parsed.blocks && Array.isArray(parsed.blocks)) {
                // Convert blocks to HTML using the new block editor serializer
                const { blocksToHTML } = require("@/app/admin/blog/_components/editor/utils/serializer");
                contentToRender = blocksToHTML(parsed);
              }
            } catch {
              // Not JSON, continue with original content
            }
            
            // Check if content is HTML (contains HTML tags) or Markdown
            const isHTML = /<[a-z][\s\S]*>/i.test(contentToRender);
            
            if (isHTML) {
              // Render HTML content safely
              const sanitizedHTML = DOMPurify.sanitize(contentToRender, {
                ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'code', 'pre', 'div', 'span', 'figure', 'figcaption'],
                ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'style', 'target', 'rel', 'width', 'height', 'data-align'],
                ALLOW_DATA_ATTR: true,
              });
              
              // Process links in HTML
              const processedHTML = sanitizedHTML.replace(/<a\s+href=["']([^"']+)["'][^>]*>/gi, (match, href) => {
                if (href && (href.includes('algogi.com') || href.includes('www.algogi.com'))) {
                  return `<a href="${pathname}" class="text-brand-primary hover:underline">`;
                }
                if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
                  return match.replace('>', ' target="_blank" rel="noopener noreferrer">');
                }
                return match;
              });
              
              return (
                <div
                  dangerouslySetInnerHTML={{ __html: processedHTML }}
                  className="[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4 [&_a]:text-brand-primary [&_a]:hover:underline dark:[&_a]:text-neon-blue [&_div[data-grid-row]]:grid [&_div[data-grid-row]]:grid-cols-12 [&_div[data-grid-row]]:gap-4 [&_div[data-grid-column]]:grid-column [&_img[data-align='left']]:float-left [&_img[data-align='left']]:mr-4 [&_img[data-align='left']]:mb-4 [&_img[data-align='right']]:float-right [&_img[data-align='right']]:ml-4 [&_img[data-align='right']]:mb-4 [&_img[data-align='center']]:block [&_img[data-align='center']]:mx-auto [&_img[data-align='full-width']]:block [&_img[data-align='full-width']]:w-full [&_.columns-container]:my-6 [&_.columns-container]:gap-4 [&_figure]:my-4 [&_figure_img]:w-full [&_figure_img]:h-auto [&_figure_img]:rounded-lg [&_figcaption]:text-sm [&_figcaption]:text-gray-600 [&_figcaption]:dark:text-gray-400 [&_figcaption]:mt-2 [&_figcaption]:text-center [&_.btn-primary]:inline-block [&_.btn-primary]:px-6 [&_.btn-primary]:py-3 [&_.btn-primary]:bg-brand-primary [&_.btn-primary]:text-white [&_.btn-primary]:rounded-lg [&_.btn-primary]:font-semibold [&_.btn-primary]:hover:bg-opacity-90 [&_.btn-primary]:transition-colors [&_.btn-primary]:my-4 [&_.btn-secondary]:inline-block [&_.btn-secondary]:px-6 [&_.btn-secondary]:py-3 [&_.btn-secondary]:bg-gray-200 [&_.btn-secondary]:dark:bg-gray-700 [&_.btn-secondary]:text-gray-900 [&_.btn-secondary]:dark:text-white [&_.btn-secondary]:rounded-lg [&_.btn-secondary]:font-semibold [&_.btn-secondary]:hover:bg-opacity-90 [&_.btn-secondary]:transition-colors [&_.btn-secondary]:my-4 [&_pre]:bg-gray-900 [&_pre]:dark:bg-gray-800 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4 [&_code]:bg-gray-100 [&_code]:dark:bg-gray-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm"
                />
              );
            } else {
              // Render Markdown content (backward compatibility)
              return (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ node, href, ...props }) => {
                      // Transform algogi.com links to current blog post URL
                      if (href && (href.includes('algogi.com') || href.includes('www.algogi.com'))) {
                        // Redirect to current blog post URL
                        return <Link href={pathname} {...props} />;
                      }
                      // For external links, open in new tab
                      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
                        return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />;
                      }
                      // For relative links, use Next.js Link
                      if (href && href.startsWith('/')) {
                        return <Link href={href} {...props} />;
                      }
                      // Default fallback
                      return <a href={href} {...props} />;
                    },
                  }}
                >
                  {contentToRender}
                </ReactMarkdown>
              );
            }
          })()}
        </div>

        {/* FAQs Section */}
        {post.faqs && post.faqs.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {post.faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

