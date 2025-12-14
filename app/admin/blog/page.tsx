"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Eye, EyeOff, RefreshCw, CheckCircle2, TestTube } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string | null;
  seoScore?: number | null;
  wordpressId?: number | null;
  migratedAt?: string | null;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/cms/blog");
      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        throw new Error("Failed to fetch blog posts");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletePostId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletePostId) return;

    try {
      const response = await fetch(`/api/cms/blog/${deletePostId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPosts(posts.filter((post) => post.id !== deletePostId));
        toast.success("Blog post deleted successfully");
      } else {
        throw new Error("Failed to delete blog post");
      }
    } catch (err: any) {
      toast.error("Error deleting blog post: " + err.message);
    } finally {
      setDeleteDialogOpen(false);
      setDeletePostId(null);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setError(null);
    setSyncStatus("Testing WordPress connection...");

    try {
      const response = await fetch("/api/wordpress/test");
      const data = await response.json();

      if (data.success) {
        setSyncStatus(`Connection successful! Found ${data.postsFound} post(s).`);
        setTimeout(() => setSyncStatus(null), 5000);
      } else {
        let errorMsg = data.error || "Connection test failed";
        if (data.suggestions && data.suggestions.length > 0) {
          errorMsg += "\n\nSuggestions:\n" + data.suggestions.map((s: string) => `• ${s}`).join("\n");
        }
        setError(errorMsg);
        setSyncStatus(null);
      }
    } catch (err: any) {
      setError("Failed to test connection: " + err.message);
      setSyncStatus(null);
    } finally {
      setTesting(false);
    }
  };

  const handleSyncClick = () => {
    setSyncDialogOpen(true);
  };

  const handleSyncFromWordPress = async () => {
    setSyncing(true);
    setSyncDialogOpen(false);
    setSyncStatus("Syncing posts from WordPress...");
    setError(null);

    try {
      const response = await fetch("/api/wordpress/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.ok) {
        setSyncStatus(
          `Sync complete! Created: ${data.results.created}, Updated: ${data.results.updated}, Skipped: ${data.results.skipped}`
        );
        // Refresh the posts list
        fetchPosts();
        setTimeout(() => setSyncStatus(null), 5000);
      } else {
        throw new Error(data.error || "Failed to sync from WordPress");
      }
    } catch (err: any) {
      setError(err.message);
      setSyncStatus(null);
    } finally {
      setSyncing(false);
    }
  };

  const getSEOBadgeColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return "bg-gray-500";
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSEOBadgeText = (score: number | null | undefined) => {
    if (score === null || score === undefined) return "Not checked";
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Needs Improvement";
    return "Poor";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading blog posts...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-white">
            Blog Posts
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Manage your blog posts ({posts.length} total)
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex gap-2">
          <button
            onClick={handleTestConnection}
            disabled={testing || syncing}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TestTube className={`w-4 h-4 mr-2 ${testing ? "animate-pulse" : ""}`} />
            {testing ? "Testing..." : "Test Connection"}
          </button>
          <button
            onClick={handleSyncClick}
            disabled={syncing || testing}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync from WordPress"}
          </button>
          <button
            onClick={() => router.push("/admin/blog/new")}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-brand-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {syncStatus && (
        <div className="mb-4 bg-green-900/20 border border-green-800 text-green-400 px-4 py-3 rounded flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          {syncStatus}
        </div>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white admin-blog-empty rounded-lg border border-gray-200">
          <h3 className="mt-2 text-sm font-medium text-gray-900 admin-blog-empty-title">
            No blog posts yet
          </h3>
          <p className="mt-1 text-sm text-gray-500 admin-blog-empty-text">
            Get started by creating a new blog post.
          </p>
        </div>
      ) : (
        <div className="bg-white admin-blog-list shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {posts.map((post) => (
              <li key={post.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 flex-wrap">
                      <h3 className="text-lg font-medium text-gray-900 admin-blog-title">
                        {post.title}
                      </h3>
                      {post.published ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 admin-blog-published">
                          <Eye className="w-3 h-3 mr-1" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 admin-blog-draft">
                          <EyeOff className="w-3 h-3 mr-1" />
                          Draft
                        </span>
                      )}
                      {post.seoScore !== null && post.seoScore !== undefined && (
                        <Badge
                          className={`${getSEOBadgeColor(post.seoScore)} text-white`}
                        >
                          SEO: {post.seoScore} - {getSEOBadgeText(post.seoScore)}
                        </Badge>
                      )}
                      {post.wordpressId && (
                        <Badge variant="outline" className="text-xs">
                          WordPress
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500 admin-blog-excerpt line-clamp-2">
                      {post.excerpt || "No excerpt"}
                    </p>
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-400 admin-blog-meta">
                      <span>By {post.author}</span>
                      {post.publishedAt && (
                        <span>
                          Published: {new Date(post.publishedAt).toLocaleDateString()}
                        </span>
                      )}
                      {post.createdAt && (
                        <span>
                          Created: {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex items-center space-x-2">
                    <button
                      onClick={() => router.push(`/admin/blog/${post.id}`)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 admin-blog-edit-btn rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(post.id)}
                      className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Blog Post"
        description="Are you sure you want to delete this blog post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
      />

      <ConfirmDialog
        open={syncDialogOpen}
        onOpenChange={setSyncDialogOpen}
        title="Sync from WordPress"
        description="This will sync all posts from WordPress. Continue?"
        confirmText="Sync"
        cancelText="Cancel"
        onConfirm={handleSyncFromWordPress}
      />
    </div>
  );
}

