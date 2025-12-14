"use client";

import JobForm from "@/components/admin/job-form";

export default function NewJobPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Create New Job</h1>
        <p className="mt-2 text-sm text-gray-400">
          Create a new job posting with custom application form
        </p>
      </div>
      <JobForm />
    </div>
  );
}

