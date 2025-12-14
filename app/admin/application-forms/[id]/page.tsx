"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ApplicationFormEditor from "@/components/admin/application-form-editor";

interface ApplicationForm {
  id: string;
  name: string;
  description: string;
  formFields: any[];
}

export default function EditApplicationFormPage() {
  const params = useParams();
  const router = useRouter();
  const [form, setForm] = useState<ApplicationForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchForm(params.id as string);
    }
  }, [params.id]);

  const fetchForm = async (id: string) => {
    try {
      const response = await fetch(`/api/cms/application-forms/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          router.push("/admin/application-forms");
          return;
        }
        throw new Error("Failed to fetch form");
      }
      const data = await response.json();
      setForm(data);
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

  if (error || !form) {
    return (
      <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded">
        {error || "Form not found"}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Edit Application Form</h1>
        <p className="mt-2 text-sm text-gray-400">
          Update form details and fields
        </p>
      </div>
      <ApplicationFormEditor form={form} />
    </div>
  );
}

