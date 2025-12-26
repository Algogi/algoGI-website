"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Send, Eye, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import EmailBuilder from "@/components/admin/emails/email-builder";
import EmailPreview from "@/components/admin/emails/email-preview";
import BlockProperties from "@/components/admin/emails/block-properties";
import { EmailTemplate, EmailBlock } from "@/lib/types/email";
import { renderEmailBlocksToHTML, htmlToText } from "@/lib/email/render-email";

export default function EditEmailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showProperties, setShowProperties] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function loadTemplate() {
      const resolvedParams = await params;
      const id = resolvedParams.id;
      setTemplateId(id);
      
      try {
        const response = await fetch(`/admin/emails/api/templates/${id}`);
        if (!response.ok) throw new Error("Failed to load email template");
        const templateData = await response.json();
        setTemplate(templateData);
      } catch (err: any) {
        toast.error(`Failed to load email template: ${err.message}`);
        router.push("/admin/emails/templates");
      } finally {
        setLoading(false);
      }
    }
    loadTemplate();
  }, [params, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-400">Loading email...</div>
      </div>
    );
  }

  if (!template) {
    return null;
  }

  const selectedBlock = template.content?.find((b) => b.id === selectedBlockId) || null;

  const handleBlocksChange = (blocks: EmailBlock[]) => {
    setTemplate((prev) =>
      prev
        ? {
            ...prev,
            content: blocks,
            htmlContent: renderEmailBlocksToHTML(blocks),
            textContent: htmlToText(renderEmailBlocksToHTML(blocks)),
          }
        : null
    );
  };

  const handleBlockUpdate = (updatedBlock: EmailBlock) => {
    setTemplate((prev) => {
      if (!prev) return null;
      const newContent = prev.content?.map((b) =>
        b.id === updatedBlock.id ? updatedBlock : b
      ) || [];
      return {
        ...prev,
        content: newContent,
        htmlContent: renderEmailBlocksToHTML(newContent),
        textContent: htmlToText(renderEmailBlocksToHTML(newContent)),
      };
    });
  };

  const handleSave = async () => {
    if (!template) return;

    setSaving(true);
    try {
      const response = await fetch(`/admin/emails/api/templates`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(template),
      });

      if (!response.ok) throw new Error("Failed to save email template");
      toast.success("Email template saved successfully");
    } catch (err: any) {
      toast.error(`Failed to save email: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!template) return;

    // Ensure we have content to send
    if (!template.content || template.content.length === 0) {
      toast.error("Please add content to your email template");
      return;
    }

    setSending(true);
    try {
      // Fetch current user's email from session
      const sessionResponse = await fetch("/api/auth/session");
      if (!sessionResponse.ok) {
        throw new Error("Failed to get user session");
      }
      const sessionData = await sessionResponse.json();
      
      if (!sessionData.authenticated || !sessionData.user?.email) {
        throw new Error("User not authenticated");
      }

      const userEmail = sessionData.user.email;

      // Generate test subject (templates don't have subject)
      const timestamp = new Date().toLocaleString();
      const testSubject = `[TEST] Email Template - ${timestamp}`;

      // Send test email with current content directly (no save required)
      const response = await fetch("/admin/emails/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testEmail: userEmail,
          testContent: template.content,
          testSubject: testSubject,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to send test email" }));
        throw new Error(errorData.error || "Failed to send test email");
      }

      const result = await response.json();
      toast.success(`Test email sent to ${userEmail}`);
    } catch (err: any) {
      toast.error(`Failed to send test email: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-dark-bg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neon-blue/20 bg-dark-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/emails/templates")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-white">{template.name || "Email Template"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className={showPreview ? "bg-neon-blue/20" : ""}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendTest}
            disabled={sending}
            title="Send test email to current logged-in user"
          >
            <Send className="w-4 h-4 mr-2" />
            {sending ? "Sending..." : "Test Email"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Builder */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1">
            <EmailBuilder
              blocks={template.content || []}
              onChange={handleBlocksChange}
              onBlockSelect={setSelectedBlockId}
              selectedBlockId={selectedBlockId}
            />
          </div>

          {/* Properties Panel */}
          {showProperties && (
            <BlockProperties
              block={selectedBlock}
              onUpdate={handleBlockUpdate}
              onClose={() => setSelectedBlockId(null)}
            />
          )}
        </div>

        {/* Preview Sidebar */}
        {showPreview && (
          <div className="w-96 border-l border-neon-blue/20">
            <EmailPreview
              blocks={template.content || []}
              subject=""
            />
          </div>
        )}
      </div>

    </div>
  );
}

