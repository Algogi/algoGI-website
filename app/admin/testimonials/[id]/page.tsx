"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TestimonialForm from "@/components/admin/testimonial-form";

export default function EditTestimonialPage() {
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id === "new") {
      setLoading(false);
      return;
    }

    fetchTestimonial();
  }, [id]);

  const fetchTestimonial = async () => {
    try {
      const response = await fetch(`/api/cms/testimonials/${id}`);
      if (!response.ok) throw new Error("Failed to fetch testimonial");
      const testimonialData = await response.json();
      setData(testimonialData);
    } catch (err: any) {
      setError(err.message);
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

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {id === "new" ? "Create Testimonial" : "Edit Testimonial"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {id === "new" 
            ? "Fill in the details below to create a new testimonial."
            : "Update the testimonial details below."}
        </p>
      </div>
      <TestimonialForm initialData={data} isEdit={id !== "new"} />
    </div>
  );
}

