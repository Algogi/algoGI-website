"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MediaSelector from "./media-selector";
import SEOReport from "./seo-report";
import VisualEditor from "./visual-editor/VisualEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FAQ {
  question: string;
  answer: string;
}

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  published: boolean;
  featuredImage?: string | null;
  tags: string[];
  faqs?: FAQ[];
  seoScore?: number | null;
  seoAnalysis?: any;
}

interface BlogFormProps {
  post?: BlogPost;
}

export default function BlogForm({ post }: BlogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  // Convert markdown to HTML if needed (for backward compatibility with existing markdown posts)
  const convertMarkdownToHTML = (content: string): string => {
    if (!content) return "";
    // Simple check: if it contains markdown syntax but no HTML tags, it's markdown
    const isMarkdown = /^[^<]*[#*\[\!`]/.test(content) && !/<[a-z][\s\S]*>/i.test(content);
    if (!isMarkdown) return content; // Already HTML or empty
    
    // Basic markdown to HTML conversion for editor
    let html = content
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1" />')
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/^\- (.*$)/gim, "<li>$1</li>")
      .replace(/^(\d+)\. (.*$)/gim, "<li>$2</li>")
      .split("\n")
      .map((line) => {
        if (line.trim() && !line.match(/^<(h[1-6]|li|img|a|ul|ol)/)) {
          return `<p>${line}</p>`;
        }
        return line;
      })
      .join("\n");
    
    return html;
  };

  const [formData, setFormData] = useState<BlogPost>({
    title: post?.title || "",
    slug: post?.slug || "",
    content: post?.content ? convertMarkdownToHTML(post.content) : "",
    excerpt: post?.excerpt || "",
    author: post?.author || "",
    published: post?.published || false,
    featuredImage: post?.featuredImage || null,
    tags: post?.tags || [],
    faqs: post?.faqs || [],
  });

  const [tagInput, setTagInput] = useState("");
  const [seoAnalyzing, setSeoAnalyzing] = useState(false);
  const [seoAnalysis, setSeoAnalysis] = useState<any>(post?.seoAnalysis || null);
  const [showSeoReport, setShowSeoReport] = useState(false);

  // Fetch current user session
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          // Set author if creating new post
          if (!post && !formData.author) {
            setFormData((prev) => ({ ...prev, author: data.user.name || data.user.email }));
          }
        }
      })
      .catch(console.error);
  }, [post]);

  useEffect(() => {
    // Auto-generate slug from title
    if (!post && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title, post]);

  const handleSave = async (publish: boolean) => {
    setSaving(true);
    setError(null);

    try {
      const url = post ? `/api/cms/blog/${post.id}` : "/api/cms/blog";
      const method = post ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          published: publish,
          author: currentUser?.name || currentUser?.email || formData.author,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (publish) {
          router.push("/admin/blog");
        } else {
          // If saving as draft, update the post ID if it's a new post
          if (!post && data.id) {
            router.push(`/admin/blog/${data.id}`);
          }
          setError(null);
          toast.success("Draft saved successfully!");
        }
      } else {
        throw new Error(data.error || "Failed to save blog post");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleVerifySEO = async () => {
    setSeoAnalyzing(true);
    setError(null);

    try {
      const payload: any = {
        postData: {
          title: formData.title,
          slug: formData.slug,
          content: formData.content,
          excerpt: formData.excerpt,
          featuredImage: formData.featuredImage,
        },
      };

      if (post?.id) {
        payload.postId = post.id;
      }

      const response = await fetch("/api/seo/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSeoAnalysis(data.analysis);
        setShowSeoReport(true);
      } else {
        throw new Error(data.error || "Failed to analyze SEO");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSeoAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Enter the title, slug, excerpt, and featured image for your blog post.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Blog post title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="blog-post-url-slug"
            />
            <p className="text-xs text-muted-foreground">
              URL-friendly version of the title (auto-generated from title)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
              rows={3}
              placeholder="Brief description of the blog post"
            />
          </div>

          <div className="space-y-2">
            <MediaSelector
              label="Featured Image"
              value={formData.featuredImage || undefined}
              onChange={(url) =>
                setFormData((prev) => ({
                  ...prev,
                  featuredImage: url || null,
                }))
              }
              folder="images"
              accept="image/*"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
          <CardDescription>Write your blog post content using the rich text editor. You can format text, add images from the gallery, and control content placement visually.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Content *</Label>
            <div className="min-h-[600px]">
              <VisualEditor
                content={formData.content}
                onChange={(content) => setFormData((prev) => ({ ...prev, content }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
          <CardDescription>Add tags and author information for your blog post.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tags</Label>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-sm py-1 px-3">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
              >
                Add
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              type="text"
              value={formData.author}
              onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
              placeholder={currentUser?.name || currentUser?.email || "Author name"}
            />
            <p className="text-xs text-muted-foreground">
              Auto-filled from your account
            </p>
          </div>
        </CardContent>
      </Card>

      {/* FAQs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Add FAQs to your blog post to help readers find answers quickly.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.faqs && formData.faqs.length > 0 && (
            <div className="space-y-4">
              {formData.faqs.map((faq, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>FAQ #{index + 1}</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newFaqs = formData.faqs?.filter((_, i) => i !== index) || [];
                        setFormData((prev) => ({ ...prev, faqs: newFaqs }));
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Question</Label>
                    <Input
                      value={faq.question}
                      onChange={(e) => {
                        const newFaqs = [...(formData.faqs || [])];
                        newFaqs[index] = { ...newFaqs[index], question: e.target.value };
                        setFormData((prev) => ({ ...prev, faqs: newFaqs }));
                      }}
                      placeholder="Enter question"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Answer</Label>
                    <Textarea
                      value={faq.answer}
                      onChange={(e) => {
                        const newFaqs = [...(formData.faqs || [])];
                        newFaqs[index] = { ...newFaqs[index], answer: e.target.value };
                        setFormData((prev) => ({ ...prev, faqs: newFaqs }));
                      }}
                      rows={3}
                      placeholder="Enter answer"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                faqs: [...(prev.faqs || []), { question: "", answer: "" }],
              }));
            }}
          >
            Add FAQ
          </Button>
        </CardContent>
      </Card>

      {/* SEO Analysis */}
      {seoAnalysis && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle>SEO Analysis</CardTitle>
                {post?.seoScore !== null && post?.seoScore !== undefined && (
                  <Badge
                    className={
                      post.seoScore >= 90
                        ? "bg-green-500"
                        : post.seoScore >= 70
                        ? "bg-blue-500"
                        : post.seoScore >= 50
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }
                  >
                    Score: {post.seoScore}
                  </Badge>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSeoReport(!showSeoReport)}
              >
                {showSeoReport ? "Hide" : "Show"}
              </Button>
            </div>
          </CardHeader>
          {showSeoReport && (
            <CardContent>
              <SEOReport analysis={seoAnalysis} />
            </CardContent>
          )}
        </Card>
      )}

      {/* Preview */}
      {post && formData.slug && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-2">
              <strong>View post:</strong>{" "}
              <a
                href={`/blog/${formData.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary/80"
              >
                /blog/{formData.slug}
              </a>
            </p>
            <p className="text-xs text-muted-foreground">
              {formData.published
                ? "This post is published and visible to everyone."
                : "This is a draft. Only admins can view it."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={handleVerifySEO}
          disabled={seoAnalyzing || !formData.title || !formData.content}
        >
          {seoAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Verify SEO
            </>
          )}
        </Button>
        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/blog")}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save as Draft"}
          </Button>
          <Button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            {saving ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>
    </div>
  );
}

