"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TestimonialFormData {
  quote: string;
  author: string;
  role: string;
  rating: number;
}

interface TestimonialFormProps {
  initialData?: TestimonialFormData & { id?: string };
  isEdit?: boolean;
}

export default function TestimonialForm({ initialData, isEdit }: TestimonialFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<TestimonialFormData>({
    quote: "",
    author: "",
    role: "",
    rating: 5,
    ...initialData,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = isEdit && initialData?.id
        ? `/api/cms/testimonials/${initialData.id}`
        : "/api/cms/testimonials";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save");
      }

      router.push("/admin/testimonials");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Testimonial Details</CardTitle>
          <CardDescription>Enter the testimonial quote, author information, and rating.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, rating }))}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      rating <= formData.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    } hover:text-yellow-400 transition-colors`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {formData.rating} / 5
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quote">Quote *</Label>
            <Textarea
              id="quote"
              required
              rows={4}
              value={formData.quote}
              onChange={(e) => setFormData((prev) => ({ ...prev, quote: e.target.value }))}
              placeholder="Enter the testimonial quote..."
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="author">Author Name *</Label>
              <Input
                id="author"
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                placeholder="Author name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role/Title *</Label>
              <Input
                id="role"
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                placeholder="e.g., CTO, TechCorp"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/testimonials")}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? "Saving..." : isEdit ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}

