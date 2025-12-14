"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Briefcase, Calendar, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import JobApplicationForm from "@/components/forms/job-application-form";
import parse from "html-react-parser";
import PDFViewer from "@/components/pdf-viewer";

interface Job {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  type: string;
  jdContent: string;
  jdPdfUrl: string | null;
  formFields: any[];
  publishedAt: string | null;
}

export default function JobDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJob();
  }, [slug]);

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/careers/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("Job not found");
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400">Loading job details...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="container-custom py-16">
        <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded mb-4">
          {error || "Job not found"}
        </div>
        <Button asChild>
          <Link href="/careers">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Careers
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-custom py-16">
      <Button variant="ghost" asChild className="mb-8">
        <Link href="/careers">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Careers
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Job Header */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {job.title}
            </h1>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center text-gray-400">
                <Briefcase className="w-5 h-5 mr-2" />
                {job.department}
              </div>
              <div className="flex items-center text-gray-400">
                <MapPin className="w-5 h-5 mr-2" />
                {job.location}
              </div>
              <div className="flex items-center text-gray-400">
                <Calendar className="w-5 h-5 mr-2" />
                {job.type.charAt(0).toUpperCase() + job.type.slice(1).replace("-", " ")}
              </div>
            </div>
          </div>

          {/* Job Description */}
          <Card>
            <CardContent className="pt-6">
              {job.jdPdfUrl ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Job Description</h2>
                  </div>
                  <PDFViewer url={job.jdPdfUrl} height="800px" />
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Job Description</h2>
                  <div className="prose prose-invert max-w-none">
                    <div className="rich-text-content">
                      {parse(job.jdContent || "")}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Application Form Sidebar */}
        <div>
          <div className="sticky top-8">
            <JobApplicationForm
              jobId={job.id}
              jobTitle={job.title}
              jobSlug={job.slug}
              formFields={job.formFields}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

