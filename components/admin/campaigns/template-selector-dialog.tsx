"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { EmailTemplate } from "@/lib/types/email";

interface TemplateSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: EmailTemplate) => void;
}

export default function TemplateSelectorDialog({
  open,
  onOpenChange,
  onSelectTemplate,
}: TemplateSelectorDialogProps) {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/admin/emails/api/templates");
      if (!response.ok) throw new Error("Failed to fetch templates");
      const data = await response.json();
      setTemplates(data);
    } catch (err: any) {
      toast.error(`Failed to load templates: ${err.message}`);
    } finally {
      setLoading(false);
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

  const handleSelectTemplate = (template: EmailTemplate) => {
    onSelectTemplate(template);
    onOpenChange(false);
  };

  const handleCreateNew = () => {
    router.push("/admin/emails/new");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Email Template</DialogTitle>
          <DialogDescription>
            Choose an existing template to use for this campaign or create a new one
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-dark-surface border-neon-blue/20 pl-10"
          />
        </div>

        {/* Create New Template Button */}
        <Button
          onClick={handleCreateNew}
          className="bg-neon-blue hover:bg-neon-blue/80 w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Template
        </Button>

        {/* Templates Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-neon-blue" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">No templates found</p>
            <p className="text-sm">Create your first template to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="hover:bg-dark-surface transition-colors cursor-pointer"
                onClick={() => handleSelectTemplate(template)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white mb-2">{template.name}</CardTitle>
                      {getCategoryBadge(template.category)}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectTemplate(template);
                    }}
                  >
                    Select Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


