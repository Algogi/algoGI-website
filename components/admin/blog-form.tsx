"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import MediaSelector from "./media-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import "@uiw/react-md-editor/markdown-editor.css";

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

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
  const [formData, setFormData] = useState<BlogPost>({
    title: post?.title || "",
    slug: post?.slug || "",
    content: post?.content || "",
    excerpt: post?.excerpt || "",
    author: post?.author || "",
    published: post?.published || false,
    featuredImage: post?.featuredImage || null,
    tags: post?.tags || [],
  });

  const [tagInput, setTagInput] = useState("");

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
          alert("Draft saved successfully!");
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
          <CardDescription>Write your blog post content using the markdown editor.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Content *</Label>
            <div data-color-mode="dark">
              <MDEditor
                value={formData.content}
                onChange={(value) => setFormData((prev) => ({ ...prev, content: value || "" }))}
                preview="edit"
                height={600}
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
      <div className="flex justify-end space-x-3">
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
  );
}

