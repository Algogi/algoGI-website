"use client";

import BlogForm from "@/components/admin/blog-form";

export default function NewBlogPage() {
  return (
    <div className="px-4 py-6 sm:px-0 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create Blog Post
        </h1>
        <p className="text-sm text-muted-foreground">
          Fill in the details below to create a new blog post.
        </p>
      </div>
      <BlogForm />
    </div>
  );
}

