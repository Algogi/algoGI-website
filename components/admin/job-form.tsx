"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import FormBuilder from "./form-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import  Link  from "next/link";

// Dynamically import the rich text editor to avoid SSR issues
const RichTextEditor = dynamic(() => import("./rich-text-editor"), { ssr: false });

interface FormField {
  id: string;
  type: "text" | "email" | "phone" | "textarea" | "select" | "checkbox" | "file";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface Job {
  id?: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  jdContent: string;
  jdPdfUrl?: string | null;
  jdSource: "richtext" | "pdf";
  formFields?: FormField[];
  applicationFormId?: string | null;
  formSource: "template" | "custom";
  status: "draft" | "published" | "closed";
  excerpt?: string;
}

interface ApplicationForm {
  id: string;
  name: string;
  formFields: FormField[];
}

interface JobFormProps {
  job?: Job;
}

export default function JobForm({ job }: JobFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Job>({
    title: job?.title || "",
    slug: job?.slug || "",
    department: job?.department || "",
    location: job?.location || "",
    type: job?.type || "full-time",
    jdContent: job?.jdContent || "",
    jdPdfUrl: job?.jdPdfUrl || null,
    jdSource: job?.jdPdfUrl ? "pdf" : (job?.jdContent ? "richtext" : "richtext"),
    formFields: job?.formFields || [],
    applicationFormId: job?.applicationFormId || null,
    formSource: job?.applicationFormId ? "template" : (job?.formFields && job.formFields.length > 0 ? "custom" : "template"),
    status: job?.status || "draft",
    excerpt: job?.excerpt || "",
  });

  const [availableForms, setAvailableForms] = useState<ApplicationForm[]>([]);
  const [loadingForms, setLoadingForms] = useState(false);

  useEffect(() => {
    // Auto-generate slug from title
    if (!job && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.title, job]);

  useEffect(() => {
    // Fetch available application forms
    fetchApplicationForms();
  }, []);

  useEffect(() => {
    // When form source changes to template and a form is selected, load its fields
    if (formData.formSource === "template" && formData.applicationFormId) {
      loadFormFields(formData.applicationFormId);
    }
  }, [formData.formSource, formData.applicationFormId]);

  const fetchApplicationForms = async () => {
    setLoadingForms(true);
    try {
      const response = await fetch("/api/cms/application-forms");
      if (response.ok) {
        const data = await response.json();
        setAvailableForms(data);
      }
    } catch (error) {
      console.error("Error fetching application forms:", error);
    } finally {
      setLoadingForms(false);
    }
  };

  const loadFormFields = async (formId: string) => {
    try {
      const response = await fetch(`/api/cms/application-forms/${formId}`);
      if (response.ok) {
        const form = await response.json();
        setFormData((prev) => ({ ...prev, formFields: form.formFields }));
      }
    } catch (error) {
      console.error("Error loading form fields:", error);
    }
  };

  const handleSubmit = async (publish: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const url = job ? `/api/cms/careers/${job.id}` : "/api/cms/careers";
      const method = job ? "PUT" : "POST";

      const submitData: any = {
        ...formData,
        status: publish ? "published" : formData.status,
        jdPdfUrl: formData.jdSource === "pdf" ? formData.jdPdfUrl : null,
        jdContent: formData.jdSource === "richtext" ? formData.jdContent : "",
      };

      // Remove computed fields that should not be stored
      delete submitData.formSource;
      delete submitData.jdSource;

      // If using template, only send applicationFormId
      if (formData.formSource === "template") {
        submitData.applicationFormId = formData.applicationFormId;
        delete submitData.formFields;
      } else {
        // If using custom, send formFields and clear applicationFormId
        submitData.formFields = formData.formFields;
        submitData.applicationFormId = null;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        if (publish) {
          router.push("/admin/careers");
        } else {
          if (!job && data.id) {
            router.push(`/admin/careers/${data.id}`);
          }
          setError(null);
          alert("Job saved successfully!");
        }
      } else {
        throw new Error(data.error || "Failed to save job");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormFieldsChange = (fields: FormField[]) => {
    setFormData((prev) => ({ ...prev, formFields: fields }));
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
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Enter the job title, department, location, and type.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Senior Software Engineer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="senior-software-engineer"
            />
            <p className="text-xs text-muted-foreground">
              URL-friendly version (auto-generated from title)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Input
                id="department"
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                placeholder="e.g., Engineering"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Remote, New York, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Job Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: any) => setFormData((prev) => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select job type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="internship">Internship</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Short Description (Optional)</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
              rows={2}
              placeholder="Brief description for job listings"
            />
          </div>
        </CardContent>
      </Card>

      {/* Job Description */}
      <Card>
        <CardHeader>
          <CardTitle>Job Description</CardTitle>
          <CardDescription>Upload a PDF or create markdown content for the job description.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>JD Source</Label>
            <RadioGroup
              value={formData.jdSource}
              onValueChange={(value: "richtext" | "pdf") =>
                setFormData((prev) => ({ ...prev, jdSource: value }))
              }
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="richtext" id="richtext" />
                <Label htmlFor="richtext">Rich Text Editor</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf">Upload PDF</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.jdSource === "richtext" ? (
            <div className="space-y-2">
              <Label>Job Description Content *</Label>
              <div className="border rounded-md">
                <RichTextEditor
                  content={formData.jdContent}
                  onChange={(content) => setFormData((prev) => ({ ...prev, jdContent: content || "" }))}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Job Description PDF *</Label>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    if (file.size > 10 * 1024 * 1024) {
                      setError("PDF file size exceeds 10MB limit");
                      return;
                    }

                    try {
                      const formData = new FormData();
                      formData.append("file", file);
                      formData.append("folder", "careers/jds");

                      const response = await fetch("/api/cms/upload", {
                        method: "POST",
                        body: formData,
                      });

                      const data = await response.json();
                      if (response.ok) {
                        setFormData((prev) => ({ ...prev, jdPdfUrl: data.url }));
                      } else {
                        throw new Error(data.error || "Upload failed");
                      }
                    } catch (err: any) {
                      setError(err.message || "Failed to upload PDF");
                    } finally {
                      e.target.value = "";
                    }
                  }}
                />
                {formData.jdPdfUrl && (
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="text-sm">PDF uploaded</span>
                    <a
                      href={formData.jdPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View PDF
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData((prev) => ({ ...prev, jdPdfUrl: null }))}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Form */}
      <Card>
        <CardHeader>
          <CardTitle>Application Form</CardTitle>
          <CardDescription>Select a reusable form template or create a custom form for this job.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Form Source</Label>
            <RadioGroup
              value={formData.formSource}
              onValueChange={(value: "template" | "custom") =>
                setFormData((prev) => ({ ...prev, formSource: value, applicationFormId: value === "template" ? null : prev.applicationFormId }))
              }
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="template" id="template" />
                <Label htmlFor="template">Use Form Template</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom">Custom Form</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.formSource === "template" ? (
            <div className="space-y-2">
              <Label>Select Form Template *</Label>
              <Select
                value={formData.applicationFormId || ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, applicationFormId: value }))
                }
                disabled={loadingForms}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingForms ? "Loading forms..." : "Select a form template"} />
                </SelectTrigger>
                <SelectContent>
                  {availableForms.map((form) => (
                    <SelectItem key={form.id} value={form.id}>
                      {form.name} ({form.formFields.length} fields)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.applicationFormId && (
                <p className="text-xs text-muted-foreground">
                  Selected form has {formData.formFields?.length || 0} field(s).{" "}
                  <Link href={`/admin/application-forms/${formData.applicationFormId}`} className="text-primary hover:underline" target="_blank">
                    View/Edit form →
                  </Link>
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Don&apos;t see the form you need?{" "}
                <Link href="/admin/application-forms/new" className="text-primary hover:underline" target="_blank">
                  Create a new form template →
                </Link>
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Custom Form Fields</Label>
                <Link href="/admin/application-forms" className="text-xs text-primary hover:underline" target="_blank">
                  Or use a template →
                </Link>
              </div>
              <FormBuilder
                fields={formData.formFields ?? []}
                onChange={handleFormFieldsChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
          <CardDescription>Set the job status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={formData.status}
            onValueChange={(value: any) => setFormData((prev) => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/careers")}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSubmit(false)}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save as Draft"}
        </Button>
        <Button
          type="button"
          onClick={() => handleSubmit(true)}
          disabled={loading}
        >
          {loading ? "Publishing..." : "Publish"}
        </Button>
      </div>
    </div>
  );
}

