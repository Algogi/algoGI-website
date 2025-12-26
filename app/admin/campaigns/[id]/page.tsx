"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Save, MailCheck, Play, Pause, Edit, Layers, BarChart3, Mail, MailOpen, MousePointerClick, Send, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Segment } from "@/lib/types/segment";
import { EmailTemplate, EmailAnalytics } from "@/lib/types/email";
import EmailPreview from "@/components/admin/emails/email-preview";
import TemplateSelectorDialog from "@/components/admin/campaigns/template-selector-dialog";
import PersonalizedTextInput from "@/components/admin/emails/personalized-text-input";
import { renderEmailBlocksToHTML, htmlToText } from "@/lib/email/render-email";

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [campaignId, setCampaignId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [campaign, setCampaign] = useState<Segment | null>(null);
  const [templateData, setTemplateData] = useState<EmailTemplate | null>(null);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [syncingTemplate, setSyncingTemplate] = useState(false);
  const [templateSyncToken, setTemplateSyncToken] = useState<string | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [analytics, setAnalytics] = useState<EmailAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [sending, setSending] = useState(false);
  const [recalculating, setRecalculating] = useState(false);
  const [progress, setProgress] = useState<{ sentContacts: number; totalContacts: number; progressPercentage: number } | null>(null);
  const previewBlocks = useMemo(
    () => templateData?.content || campaign?.content || [],
    [templateData, campaign]
  );

  useEffect(() => {
    params.then((p) => {
      setCampaignId(p.id);
      fetchCampaign(p.id);
      fetchAnalytics(p.id);
      fetchProgress(p.id);
    });
  }, [params]);

  // Auto-refresh progress every 30 seconds when campaign is active
  useEffect(() => {
    if (!campaign || !campaign.isActive || campaign.status !== "active") {
      return;
    }

    const interval = setInterval(() => {
      if (campaignId) {
        fetchProgress(campaignId);
        fetchCampaign(campaignId);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [campaign, campaignId]);

  const fetchCampaign = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/admin/campaigns/api/${id}`);
      if (!response.ok) throw new Error("Failed to fetch campaign");
      const data = await response.json();
      setCampaign(data);

      // Show template selector if campaign has no content
      if (!data.content || data.content.length === 0) {
        setShowTemplateSelector(true);
      }

      if (data.templateId) {
        fetchTemplateAndSync(data.templateId, data);
      } else {
        setTemplateData(null);
        setTemplateSyncToken(null);
      }
    } catch (err: any) {
      toast.error(`Failed to load campaign: ${err.message}`);
      router.push("/admin/campaigns");
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplateAndSync = async (templateId: string, currentCampaign: Segment) => {
    try {
      setTemplateLoading(true);
      const response = await fetch(`/admin/emails/api/templates/${templateId}`);
      if (!response.ok) throw new Error("Failed to load email template");
      const template = await response.json();
      setTemplateData(template);

      const syncKey = `${template.id}:${template.updatedAt || ""}`;
      if (templateSyncToken === syncKey) {
        return;
      }

      await syncTemplateIntoCampaign(template, currentCampaign, syncKey);
    } catch (err: any) {
      console.error("Failed to load template:", err);
      toast.error(`Failed to load template: ${err.message}`);
    } finally {
      setTemplateLoading(false);
    }
  };

  const syncTemplateIntoCampaign = async (
    template: EmailTemplate,
    currentCampaign: Segment,
    syncKey: string
  ) => {
    const newContent = template.content || [];
    const renderedHtml =
      template.htmlContent || renderEmailBlocksToHTML(newContent);
    const renderedText = template.textContent || htmlToText(renderedHtml);

    const contentEqual =
      JSON.stringify(currentCampaign.content || []) ===
      JSON.stringify(newContent);
    const htmlEqual = (currentCampaign.htmlContent || "") === renderedHtml;
    const textEqual = (currentCampaign.textContent || "") === renderedText;

    if (contentEqual && htmlEqual && textEqual) {
      setTemplateSyncToken(syncKey);
      return;
    }

    try {
      setSyncingTemplate(true);
      const response = await fetch(`/admin/campaigns/api/${currentCampaign.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newContent,
          htmlContent: renderedHtml,
          textContent: renderedText,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to sync template");
      }

      setCampaign((prev) =>
        prev && prev.id === currentCampaign.id
          ? {
              ...prev,
              content: newContent,
              htmlContent: renderedHtml,
              textContent: renderedText,
            }
          : prev
      );
      setTemplateSyncToken(syncKey);
      toast.success("Campaign email updated with latest template");
    } catch (err: any) {
      console.error("Failed to sync template:", err);
      toast.error(`Failed to sync template: ${err.message}`);
    } finally {
      setSyncingTemplate(false);
    }
  };

  const handleSave = async () => {
    if (!campaign) return;

    setSaving(true);
    try {
      const response = await fetch(`/admin/campaigns/api/${campaignId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaign),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update campaign");
      }

      toast.success("Campaign updated successfully");
      fetchCampaign(campaignId);
    } catch (err: any) {
      toast.error(`Failed to update campaign: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSMTPVerify = async () => {
    if (!campaignId) return;

    try {
      const response = await fetch(`/admin/campaigns/api/${campaignId}/verify-smtp`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start SMTP verification");
      }

      const data = await response.json();
      toast.success(`SMTP verification started for ${data.total} contacts`);
    } catch (err: any) {
      toast.error(`Failed to start SMTP verification: ${err.message}`);
    }
  };

  const handleRecalculate = async () => {
    if (!campaignId) return;

    setRecalculating(true);
    try {
      const response = await fetch(`/admin/campaigns/api/${campaignId}/recalculate`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to recalculate contacts");
      }

      const data = await response.json();
      toast.success(data.message || `Recalculated: ${data.eligibleContacts} eligible contacts`);
      
      // Refresh campaign data
      fetchCampaign(campaignId);
      fetchProgress(campaignId);
    } catch (err: any) {
      toast.error(`Failed to recalculate contacts: ${err.message}`);
    } finally {
      setRecalculating(false);
    }
  };

  const handleToggle = async () => {
    if (!campaign) return;

    try {
      const response = await fetch(`/admin/campaigns/api/${campaignId}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !campaign.isActive }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to toggle campaign");
      }

      toast.success(`Campaign ${!campaign.isActive ? "started" : "stopped"}`);
      fetchCampaign(campaignId);
    } catch (err: any) {
      toast.error(`Failed to toggle campaign: ${err.message}`);
    }
  };

  const handleEditEmail = () => {
    if (!campaign) return;
    if (campaign.templateId) {
      router.push(`/admin/emails/${campaign.templateId}`);
      return;
    }

    toast.error("No email template is linked to this campaign. Select a template first.");
    setShowTemplateSelector(true);
  };

  const handleSelectTemplate = async (template: EmailTemplate) => {
    if (!campaign) return;

    try {
      // Copy template content to campaign
      const updatedCampaign: Segment = {
        ...campaign,
        templateId: template.id,
        content: template.content || [],
        htmlContent: template.htmlContent || renderEmailBlocksToHTML(template.content || []),
        textContent: template.textContent || htmlToText(renderEmailBlocksToHTML(template.content || [])),
      };

      setCampaign(updatedCampaign);
      setTemplateData(template);
      setTemplateSyncToken(null);
      
      // Save the campaign with the template content
      const response = await fetch(`/admin/campaigns/api/${campaignId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCampaign),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to apply template");
      }

      toast.success("Template applied successfully");
      setShowTemplateSelector(false);
    } catch (err: any) {
      toast.error(`Failed to apply template: ${err.message}`);
    }
  };

  const fetchAnalytics = async (id: string) => {
    try {
      setLoadingAnalytics(true);
      const response = await fetch(`/admin/emails/api/analytics/${id}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
      // Analytics might not exist yet, that's okay
    } catch (err: any) {
      console.error("Error fetching analytics:", err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchProgress = async (id: string) => {
    try {
      const response = await fetch(`/admin/campaigns/api/${id}/progress`);
      if (response.ok) {
        const data = await response.json();
        setProgress({
          sentContacts: data.sentContacts || 0,
          totalContacts: data.totalContacts || 0,
          progressPercentage: data.progressPercentage || 0,
        });
      }
    } catch (err: any) {
      console.error("Error fetching progress:", err);
    }
  };

  const handleSendNow = async () => {
    if (!campaignId || !campaign) return;

    // Confirmation
    if (!confirm(`Send emails now? This will send a batch of emails immediately.`)) {
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`/admin/campaigns/api/${campaignId}/send-now`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send emails");
      }

      const result = await response.json();
      toast.success(result.message || `Sent ${result.sent} email(s) successfully`);
      
      // Refresh campaign and progress
      fetchCampaign(campaignId);
      fetchProgress(campaignId);
      fetchAnalytics(campaignId);
    } catch (err: any) {
      toast.error(`Failed to send emails: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-neon-blue" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <p className="text-red-500">Campaign not found</p>
        <Button onClick={() => router.push("/admin/campaigns")} className="mt-4">
          Back to Campaigns
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-dark-bg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neon-blue/20 bg-dark-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/campaigns")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-white">Edit Campaign: {campaign.name}</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {campaign.status === "draft" || campaign.status === "paused" ? (
            <Button
              onClick={handleToggle}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
          ) : campaign.status === "active" && campaign.isActive ? (
            <Button onClick={handleToggle} variant="secondary" size="sm">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          ) : null}
          {campaign.isActive && campaign.status === "active" && (
            <Button
              onClick={handleSendNow}
              variant="outline"
              size="sm"
              disabled={sending || !campaign.subject || !campaign.fromEmail || (!campaign.htmlContent && !campaign.content)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Now
                </>
              )}
            </Button>
          )}
            <Button
              onClick={handleSMTPVerify}
              variant="outline"
              size="sm"
              disabled={campaign.smtpVerified}
            >
              <MailCheck className="w-4 h-4 mr-2" />
              {campaign.smtpVerified ? "SMTP Verified" : "Verify SMTP"}
            </Button>
            <Button
              onClick={handleRecalculate}
              variant="outline"
              size="sm"
              disabled={recalculating}
              title="Recalculate eligible contacts (verified only)"
            >
              {recalculating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Recalculating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recalculate
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Campaign"}
            </Button>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="p-4 border-b border-neon-blue/20 bg-dark-card grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-white">Campaign Name</Label>
          <Input
            id="name"
            value={campaign.name || ""}
            onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
            placeholder="e.g., Summer Newsletter"
            className="bg-dark-surface border-neon-blue/20 mt-1"
          />
        </div>
        <div>
          <PersonalizedTextInput
            label="Subject Line"
            value={campaign.subject || ""}
            onChange={(value) => setCampaign({ ...campaign, subject: value })}
            placeholder="e.g., Exciting Updates from AlgoGI! or Hi {{first_name}}, check this out!"
            className="bg-dark-surface border-neon-blue/20"
          />
        </div>
        <div>
          <Label htmlFor="fromEmail" className="text-white">From Email</Label>
          <Input
            id="fromEmail"
            type="email"
            value={campaign.fromEmail || ""}
            onChange={(e) => setCampaign({ ...campaign, fromEmail: e.target.value })}
            placeholder="e.g., info@algogi.email"
            className="bg-dark-surface border-neon-blue/20 mt-1"
          />
        </div>
        <div>
          <Label htmlFor="replyTo" className="text-white">Reply-To Email (Optional)</Label>
          <Input
            id="replyTo"
            type="email"
            value={campaign.replyTo || ""}
            onChange={(e) => setCampaign({ ...campaign, replyTo: e.target.value })}
            placeholder="e.g., replies@algogi.email"
            className="bg-dark-surface border-neon-blue/20 mt-1"
          />
        </div>
      </div>

      {/* Progress Section */}
      {campaign.isActive && campaign.status === "active" && (
        <div className="p-4 border-b border-neon-blue/20 bg-dark-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Sending Progress</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (campaignId) {
                  fetchProgress(campaignId);
                  fetchCampaign(campaignId);
                }
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-white">
                  {progress?.sentContacts ?? campaign.sentContacts ?? 0} / {progress?.totalContacts ?? campaign.totalContacts ?? campaign.contactCount ?? 0}
                </div>
                <div className="text-sm text-muted-foreground">emails sent</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {progress?.progressPercentage ?? Math.min(100, Math.floor(((campaign.sentContacts || 0) / (campaign.totalContacts || campaign.contactCount || 1)) * 100))}%
                </div>
                <div className="text-sm text-muted-foreground">complete</div>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-300"
                style={{
                  width: `${progress?.progressPercentage ?? Math.min(100, Math.floor(((campaign.sentContacts || 0) / (campaign.totalContacts || campaign.contactCount || 1)) * 100))}%`,
                }}
              />
            </div>
            {campaign.emailsPerHour && (
              <div className="text-sm text-muted-foreground">
                Sending rate: {campaign.emailsPerHour} emails/hour
              </div>
            )}
            {campaign.startedAt && (
              <div className="text-sm text-muted-foreground">
                Started: {new Date(campaign.startedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Section */}
      {analytics && analytics.totalSent > 0 && (
        <div className="p-4 border-b border-neon-blue/20 bg-dark-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Email Analytics</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/admin/emails/${campaignId}/analytics`)}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Full Analytics
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-muted-foreground">Sent</span>
                </div>
                <div className="text-2xl font-bold text-white">{analytics.totalSent}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <MailOpen className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-muted-foreground">Opened</span>
                </div>
                <div className="text-2xl font-bold text-white">{analytics.uniqueOpened}</div>
                <div className="text-xs text-green-400 mt-1">
                  {analytics.openRate.toFixed(1)}% open rate
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointerClick className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-muted-foreground">Clicked</span>
                </div>
                <div className="text-2xl font-bold text-white">{analytics.uniqueClicked}</div>
                <div className="text-xs text-purple-400 mt-1">
                  {analytics.clickRate.toFixed(1)}% click rate
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <MailCheck className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-muted-foreground">Delivered</span>
                </div>
                <div className="text-2xl font-bold text-white">{analytics.totalDelivered || analytics.totalSent}</div>
                {analytics.totalBounced > 0 && (
                  <div className="text-xs text-red-400 mt-1">
                    {analytics.totalBounced} bounced ({analytics.bounceRate.toFixed(1)}%)
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Email Preview */}
      <div className="flex-1 overflow-auto bg-dark-bg">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Email Preview</h2>
              <p className="text-sm text-muted-foreground">
                Email content is read-only from this page. Use the Edit Email button to make changes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplateSelector(true)}
              >
                <Layers className="w-4 h-4 mr-2" />
                Change Template
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditEmail}
                disabled={!campaign.templateId}
                title={campaign.templateId ? "Edit this campaign's email template" : "Select a template first"}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Email
              </Button>
            </div>
          </div>

          {(templateLoading || syncingTemplate) && (
            <div className="p-3 bg-dark-card border border-neon-blue/20 rounded-md text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-neon-blue" />
              {templateLoading ? "Loading latest template content..." : "Applying latest template changes..."}
            </div>
          )}

          {previewBlocks.length > 0 ? (
            <EmailPreview
              blocks={previewBlocks}
              subject={campaign.subject || "Campaign Preview"}
            />
          ) : (
            <div className="border border-dashed border-neon-blue/40 rounded-lg p-8 text-center text-muted-foreground">
              <p className="mb-4">No email content is attached to this campaign yet.</p>
              <Button onClick={() => setShowTemplateSelector(true)} size="sm">
                Select Template
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Template Selector Dialog */}
      <TemplateSelectorDialog
        open={showTemplateSelector}
        onOpenChange={setShowTemplateSelector}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
}

