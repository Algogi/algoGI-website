"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import JobForm from "@/components/admin/job-form";

interface Job {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  type: string;
  jdContent: string;
  jdPdfUrl?: string | null;
  formFields: any[];
  status: string;
  excerpt?: string;
}

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchJob(params.id as string);
    }
  }, [params.id]);

  const fetchJob = async (id: string) => {
    try {
      const response = await fetch(`/api/cms/careers/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push("/admin/careers");
          return;
        }
        throw new Error("Failed to fetch job");
      }
      const data = await response.json();
      setJob(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded">
        {error || "Job not found"}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Edit Job</h1>
        <p className="mt-2 text-sm text-gray-400">
          Update job details and application form
        </p>
      </div>
      <JobForm job={job} />
    </div>
  );
}

