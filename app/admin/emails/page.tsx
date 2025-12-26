"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmailTemplate, EmailCampaignStatus } from "@/lib/types/email";

export default function EmailsPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<EmailTemplate["category"] | "">("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);

  const categoryOptions = useMemo(
    () => [
      { value: "", label: "All categories" },
      { value: "newsletter", label: "Newsletter" },
      { value: "marketing", label: "Marketing" },
      { value: "transactional", label: "Transactional" },
      { value: "other", label: "Other" },
    ],
    []
  );

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryFilter]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (categoryFilter) params.append("category", categoryFilter);

      const response = await fetch(
        `/admin/emails/api/templates${params.toString() ? `?${params.toString()}` : ""}`
      );
      if (!response.ok) throw new Error("Failed to fetch email templates");
      const data = await response.json();

      setTemplates(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load templates");
      console.error("Error fetching email templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;

    try {
      const response = await fetch(`/admin/emails/api/templates?id=${templateToDelete.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete template");

      toast.success(`Template "${templateToDelete.name}" deleted`);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
      fetchTemplates();
    } catch (err: any) {
      toast.error(`Failed to delete template: ${err.message}`);
    }
  };

  const handleDuplicate = async (template: EmailTemplate) => {
    try {
      const response = await fetch("/admin/emails/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${template.name} (Copy)`,
          description: template.description,
          category: template.category,
          content: template.content,
          thumbnail: template.thumbnail,
        }),
      });
      if (!response.ok) throw new Error("Failed to duplicate template");

      toast.success("Template duplicated successfully");
      fetchTemplates();
    } catch (err: any) {
      toast.error(`Failed to duplicate template: ${err.message}`);
    }
  };

  const getStatusBadge = (status: EmailCampaignStatus) => {
    const variants: Record<EmailCampaignStatus, { variant: "default" | "secondary" | "outline"; label: string }> = {
      draft: { variant: "outline", label: "Draft" },
      active: { variant: "default", label: "Active" },
      paused: { variant: "secondary", label: "Paused" },
      completed: { variant: "default", label: "Completed" },
      scheduled: { variant: "secondary", label: "Scheduled" },
      sending: { variant: "secondary", label: "Sending" },
      sent: { variant: "default", label: "Sent" },
      cancelled: { variant: "outline", label: "Cancelled" },
    };
    const config = variants[status] || { variant: "outline" as const, label: status || "Unknown" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getCategoryBadge = (category: EmailTemplate["category"]) => {
    const styles: Record<EmailTemplate["category"], string> = {
      newsletter: "bg-blue-500/20 text-blue-300",
      marketing: "bg-purple-500/20 text-purple-300",
      transactional: "bg-green-500/20 text-green-300",
      other: "bg-gray-500/20 text-gray-300",
    };
    return <Badge className={styles[category]}>{category}</Badge>;
  };

  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading email templates...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Email Templates</h1>
          <p className="mt-2 text-sm text-gray-400">
            Create reusable email templates that campaigns can extend
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/emails/new")}
          className="bg-neon-blue hover:bg-neon-blue/80"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                className="bg-dark-surface border-neon-blue/20"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value as EmailTemplate["category"] | "");
              }}
              className="px-3 py-2 bg-dark-surface border border-neon-blue/20 rounded-md text-white"
            >
              {categoryOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Template List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Templates ({templates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg mb-2">No templates found</p>
              <p className="text-sm">Create your first email template to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-4 border border-neon-blue/20 rounded-lg hover:bg-dark-surface transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-white font-medium">{template.name}</h3>
                      {getCategoryBadge(template.category)}
                    </div>
                    {template.description && (
                      <p className="text-sm text-gray-400">{template.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Updated {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicate(template)}
                      title="Duplicate template"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/emails/${template.id}`)}
                      title="Edit template"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTemplateToDelete(template);
                        setDeleteDialogOpen(true);
                      }}
                      title="Delete template"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Email Template"
        description={
          templateToDelete
            ? `Are you sure you want to delete "${templateToDelete.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this template?"
        }
      />
    </div>
  );
}

