"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmailTemplate } from "@/lib/types/email";

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, [categoryFilter]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter) params.append("category", categoryFilter);
      if (search) params.append("search", search);

      const response = await fetch(`/admin/emails/api/templates?${params}`);
      if (!response.ok) throw new Error("Failed to fetch templates");
      const data = await response.json();
      setTemplates(data);
    } catch (err: any) {
      toast.error(`Failed to load templates: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;

    try {
      const response = await fetch(`/admin/emails/api/templates?id=${templateToDelete}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete template");
      
      toast.success("Template deleted successfully");
      fetchTemplates();
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    } catch (err: any) {
      toast.error(`Failed to delete template: ${err.message}`);
    }
  };

  const filteredTemplates = templates.filter((t) =>
    search ? t.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      newsletter: "bg-blue-500/20 text-blue-400",
      transactional: "bg-green-500/20 text-green-400",
      marketing: "bg-purple-500/20 text-purple-400",
      other: "bg-gray-500/20 text-gray-400",
    };
    return (
      <Badge className={colors[category] || colors.other}>{category}</Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Email Templates</h1>
          <p className="mt-2 text-sm text-gray-400">
            Create and manage reusable email templates
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
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-dark-surface border-neon-blue/20 pl-10"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-dark-surface border border-neon-blue/20 rounded-md text-white"
            >
              <option value="">All Categories</option>
              <option value="newsletter">Newsletter</option>
              <option value="transactional">Transactional</option>
              <option value="marketing">Marketing</option>
              <option value="other">Other</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            <p className="text-lg mb-2">No templates found</p>
            <p className="text-sm">Create your first template to get started</p>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:bg-dark-surface transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white mb-2">{template.name}</CardTitle>
                    {getCategoryBadge(template.category)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/admin/emails/${template.id}`)}
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setTemplateToDelete(template.id);
                        setDeleteDialogOpen(true);
                      }}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {template.description && (
                  <p className="text-sm text-gray-400 mb-4">{template.description}</p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => router.push(`/admin/emails/new?template=${template.id}`)}
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Template"
        description="Are you sure you want to delete this template? This action cannot be undone."
      />
    </div>
  );
}

