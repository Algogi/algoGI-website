"use client";

import ApplicationFormEditor from "@/components/admin/application-form-editor";

export default function NewApplicationFormPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Create New Application Form</h1>
        <p className="mt-2 text-sm text-gray-400">
          Create a reusable application form that can be assigned to multiple jobs
        </p>
      </div>
      <ApplicationFormEditor />
    </div>
  );
}

