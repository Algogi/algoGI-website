"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import BlogForm from "@/components/admin/blog-form";

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchPost(params.id as string);
    }
  }, [params.id]);

  const fetchPost = async (id: string) => {
    try {
      const response = await fetch(`/api/cms/blog/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPost(data);
      } else {
        throw new Error("Failed to fetch blog post");
      }
    } catch (err: any) {
      alert("Error fetching blog post: " + err.message);
      router.push("/admin/blog");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Edit Blog Post
        </h1>
        <p className="text-sm text-muted-foreground">
          Update the blog post details below.
        </p>
      </div>
      <BlogForm post={post} />
    </div>
  );
}

