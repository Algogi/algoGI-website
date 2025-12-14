"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormBuilder from "./form-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FormField } from "./form-builder";

interface ApplicationForm {
  id?: string;
  name: string;
  description: string;
  formFields: FormField[];
}

interface ApplicationFormEditorProps {
  form?: ApplicationForm;
}

export default function ApplicationFormEditor({ form }: ApplicationFormEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // System fields that are always required
  const SYSTEM_FIELDS: FormField[] = [
    {
      id: "name",
      type: "text",
      label: "Full Name",
      placeholder: "Enter your full name",
      required: true,
      isSystemField: true,
    },
    {
      id: "email",
      type: "email",
      label: "Email Address",
      placeholder: "Enter your email address",
      required: true,
      isSystemField: true,
    },
    {
      id: "resume",
      type: "file",
      label: "Resume",
      placeholder: "Upload your resume (PDF only)",
      required: true,
      isSystemField: true,
    },
  ];

  // Ensure system fields are always included, filter them out from saved formFields
  const getCustomFields = (fields: FormField[]): FormField[] => {
    return fields.filter((field) => !SYSTEM_FIELDS.some((sf) => sf.id === field.id));
  };

  const [formData, setFormData] = useState<ApplicationForm>({
    name: form?.name || "",
    description: form?.description || "",
    formFields: getCustomFields(form?.formFields || []),
  });

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError("Form name is required");
      return;
    }

    if (formData.formFields.length === 0) {
      setError("At least one form field is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = form?.id
        ? `/api/cms/application-forms/${form.id}`
        : "/api/cms/application-forms";
      const method = form?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/admin/application-forms");
      } else {
        throw new Error(data.error || "Failed to save form");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormFieldsChange = (fields: FormField[]) => {
    // Filter out system fields when saving (they're always included automatically)
    const customFields = fields.filter((field) => !field.isSystemField);
    setFormData((prev) => ({ ...prev, formFields: customFields }));
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Form Information</CardTitle>
          <CardDescription>Enter a name and description for this application form.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Form Name *</Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Standard Engineering Application"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Brief description of what this form is used for..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Builder */}
      <Card>
        <CardHeader>
          <CardTitle>Form Fields</CardTitle>
          <CardDescription>Configure the fields for this application form.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormBuilder
            fields={formData.formFields}
            onChange={handleFormFieldsChange}
          />
          <p className="text-xs text-muted-foreground mt-4">
            Note: Name, Email, and Resume fields are automatically included and required for all job applications. Resume must be a PDF file.
          </p>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/application-forms")}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Saving..." : form?.id ? "Update Form" : "Create Form"}
        </Button>
      </div>
    </div>
  );
}

