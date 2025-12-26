"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Segment,
  SegmentInput,
  SegmentCriteria,
  SegmentCriteriaRule,
  SegmentVerificationStats,
  SegmentField,
  SegmentOperator,
} from "@/lib/types/segment";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Search,
  Loader2,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  MailCheck,
  RefreshCw,
  PlusCircle,
  Minus,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useRouter } from "next/navigation";
import { Play, Pause, Send, BarChart3, Mail, MailOpen, MousePointerClick } from "lucide-react";
import { EmailAnalytics } from "@/lib/types/email";

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editingCampaign, setEditingCampaign] = useState<Segment | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Segment | null>(null);
  const [previewCampaign, setPreviewCampaign] = useState<Segment | null>(null);
  const [verificationStats, setVerificationStats] = useState<Record<string, SegmentVerificationStats>>({});
  const [loadingStats, setLoadingStats] = useState<Record<string, boolean>>({});
  const [verifyingCampaigns, setVerifyingCampaigns] = useState<Set<string>>(new Set());
  const [bulkVerifyDialogOpen, setBulkVerifyDialogOpen] = useState(false);
  const [campaignToVerify, setCampaignToVerify] = useState<Segment | null>(null);
  const [togglingCampaigns, setTogglingCampaigns] = useState<Set<string>>(new Set());
  const [verificationJobs, setVerificationJobs] = useState<Record<string, {
    jobId: string;
    total: number;
    processed: number;
    status: string;
    currentEmail: string | null;
    progressPercentage: number;
  }>>({});
  const [pollingIntervals, setPollingIntervals] = useState<Record<string, NodeJS.Timeout>>({});
  const [analytics, setAnalytics] = useState<Record<string, EmailAnalytics>>({});
  const [loadingAnalytics, setLoadingAnalytics] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Cleanup polling intervals on unmount
  useEffect(() => {
    return () => {
      Object.values(pollingIntervals).forEach((interval) => {
        clearInterval(interval);
      });
    };
  }, [pollingIntervals]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/admin/campaigns/api");
      if (!response.ok) throw new Error("Failed to fetch campaigns");
      const data = await response.json();
      setCampaigns(data.data || []);
      
      // Fetch verification stats and analytics for all campaigns
      (data.data || []).forEach((campaign: Segment) => {
        fetchCampaignStats(campaign.id);
        fetchCampaignAnalytics(campaign.id);
      });
    } catch (err: any) {
      setError(err.message || "Failed to load campaigns");
      console.error("Error fetching campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaignStats = async (campaignId: string) => {
    if (loadingStats[campaignId]) return;
    
    setLoadingStats((prev) => ({ ...prev, [campaignId]: true }));
    try {
      const response = await fetch(`/admin/campaigns/api/${campaignId}/contacts`);
      if (!response.ok) throw new Error("Failed to fetch campaign stats");
      const data = await response.json();
      
      const stats: SegmentVerificationStats = {
        total: data.verificationStats.total,
        verified: data.verificationStats.verified,
        pending: data.verificationStats.pending,
        invalid: data.verificationStats.invalid,
        bounced: data.verificationStats.bounced,
        unsubscribed: data.verificationStats.unsubscribed,
        verifiedPercentage: data.verificationStats.total > 0
          ? Math.round((data.verificationStats.verified / data.verificationStats.total) * 100)
          : 0,
        unverifiedCount: data.verificationStats.total - data.verificationStats.verified - data.verificationStats.unsubscribed,
      };
      
      setVerificationStats((prev) => ({ ...prev, [campaignId]: stats }));
    } catch (err: any) {
      console.error("Error fetching campaign stats:", err);
    } finally {
      setLoadingStats((prev) => ({ ...prev, [campaignId]: false }));
    }
  };

  const fetchCampaignAnalytics = async (campaignId: string) => {
    if (loadingAnalytics[campaignId]) return;
    
    setLoadingAnalytics((prev) => ({ ...prev, [campaignId]: true }));
    try {
      const response = await fetch(`/admin/emails/api/analytics/${campaignId}`);
      if (!response.ok) {
        // Analytics might not exist yet, that's okay
        setLoadingAnalytics((prev) => ({ ...prev, [campaignId]: false }));
        return;
      }
      const data = await response.json();
      setAnalytics((prev) => ({ ...prev, [campaignId]: data }));
    } catch (err: any) {
      console.error("Error fetching campaign analytics:", err);
    } finally {
      setLoadingAnalytics((prev) => ({ ...prev, [campaignId]: false }));
    }
  };

  const handleBulkVerify = async (campaign: Segment) => {
    if (!campaign) return;

    setCampaignToVerify(campaign);
    setBulkVerifyDialogOpen(true);
  };

  const confirmBulkVerify = async () => {
    if (!campaignToVerify) return;

    const campaignId = campaignToVerify.id;
    setVerifyingCampaigns((prev) => new Set(prev).add(campaignId));
    setBulkVerifyDialogOpen(false);

    try {
      // Fetch campaign contacts
      const contactsResponse = await fetch(`/admin/campaigns/api/${campaignId}/contacts`);
      if (!contactsResponse.ok) throw new Error("Failed to fetch campaign contacts");
      const contactsData = await contactsResponse.json();

      const unverifiedContacts = contactsData.unverifiedContacts || [];
      
      if (unverifiedContacts.length === 0) {
        toast.info("No unverified contacts to verify in this campaign");
        setVerifyingCampaigns((prev) => {
          const next = new Set(prev);
          next.delete(campaignId);
          return next;
        });
        return;
      }

      // Extract emails
      const emails = unverifiedContacts.map((c: any) => c.email);

      // Verify emails in batches of 1000 (API limit)
      const batchSize = 1000;
      let totalStarted = 0;
      const jobIds: string[] = [];

      for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize);
        
        // Start verification (now runs in background)
        const verifyResponse = await fetch('/admin/contacts/api/verify', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emails: batch }),
        });

        if (!verifyResponse.ok) {
          const errorData = await verifyResponse.json();
          throw new Error(errorData.error || 'Verification failed to start');
        }

        const verifyResult = await verifyResponse.json();
        totalStarted += verifyResult.total || batch.length;
        if (verifyResult.jobId) {
          jobIds.push(verifyResult.jobId);
        }
      }

      // Store job IDs for progress tracking
      if (jobIds.length > 0) {
        const primaryJobId = jobIds[0];
        setVerificationJobs((prev) => ({
          ...prev,
          [campaignId]: {
            jobId: primaryJobId,
            total: totalStarted,
            processed: 0,
            status: 'pending',
            currentEmail: null,
            progressPercentage: 0,
          },
        }));

        // Start polling for progress
        startProgressPolling(campaignId, primaryJobId);
      }

      toast.success(
        `Verification started for ${totalStarted} contact(s) in campaign "${campaignToVerify.name}". You will receive an email report when complete.`
      );

      // Refresh stats after a short delay to show 'verifying' status
      setTimeout(() => {
        fetchCampaignStats(campaignId);
      }, 1000);
    } catch (err: any) {
      toast.error(`Verification failed: ${err.message}`);
      setVerifyingCampaigns((prev) => {
        const next = new Set(prev);
        next.delete(campaignId);
        return next;
      });
    } finally {
      setCampaignToVerify(null);
    }
  };

  const startProgressPolling = (campaignId: string, jobId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/admin/contacts/api/verify/${jobId}`);
        if (!response.ok) {
          clearInterval(pollInterval);
          setPollingIntervals((prev) => {
            const next = { ...prev };
            delete next[campaignId];
            return next;
          });
          return;
        }

        const progress = await response.json();
        
        setVerificationJobs((prev) => ({
          ...prev,
          [campaignId]: {
            jobId: progress.jobId,
            total: progress.total,
            processed: progress.processed,
            status: progress.status,
            currentEmail: progress.currentEmail,
            progressPercentage: progress.progressPercentage,
          },
        }));

        // Stop polling if completed or failed
        if (progress.status === 'completed' || progress.status === 'failed') {
          clearInterval(pollInterval);
          setPollingIntervals((prev) => {
            const next = { ...prev };
            delete next[campaignId];
            return next;
          });
          // Refresh stats when complete
          fetchCampaignStats(campaignId);
          // Remove from verifying campaigns
          setVerifyingCampaigns((prev) => {
            const next = new Set(prev);
            next.delete(campaignId);
            return next;
          });
          // Clean up job after a delay
          setTimeout(() => {
            setVerificationJobs((prev) => {
              const next = { ...prev };
              delete next[campaignId];
              return next;
            });
          }, 5000);
        }
      } catch (error) {
        console.error('Error polling progress:', error);
        clearInterval(pollInterval);
        setPollingIntervals((prev) => {
          const next = { ...prev };
          delete next[campaignId];
          return next;
        });
      }
    }, 2000); // Poll every 2 seconds

    // Store interval for cleanup
    setPollingIntervals((prev) => ({
      ...prev,
      [campaignId]: pollInterval,
    }));

    // Clean up after 10 minutes (safety timeout)
    setTimeout(() => {
      clearInterval(pollInterval);
      setPollingIntervals((prev) => {
        const next = { ...prev };
        delete next[campaignId];
        return next;
      });
    }, 10 * 60 * 1000);
  };

  const handleToggleCampaign = async (campaign: Segment) => {
    setTogglingCampaigns((prev) => new Set(prev).add(campaign.id));
    try {
      const newIsActive = !campaign.isActive;
      const response = await fetch(`/admin/campaigns/api/${campaign.id}/toggle`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newIsActive }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${newIsActive ? "start" : "pause"} campaign`);
      }

      toast.success(`Campaign "${campaign.name}" ${newIsActive ? "started" : "paused"} successfully`);
      fetchCampaigns();
    } catch (err: any) {
      toast.error(`Failed to toggle campaign: ${err.message}`);
    } finally {
      setTogglingCampaigns((prev) => {
        const next = new Set(prev);
        next.delete(campaign.id);
        return next;
      });
    }
  };

  const handleDelete = async () => {
    if (!campaignToDelete) return;

    try {
      const response = await fetch(
        `/admin/campaigns/api?id=${campaignToDelete.id}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete campaign");
      
      toast.success("Campaign deleted successfully");
      fetchCampaigns();
      setDeleteDialogOpen(false);
      setCampaignToDelete(null);
    } catch (err: any) {
      toast.error(`Failed to delete campaign: ${err.message}`);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(search.toLowerCase()) ||
    campaign.description?.toLowerCase().includes(search.toLowerCase()) ||
    campaign.subject?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Email Campaigns</h1>
          <p className="text-sm text-gray-400 mt-1">
            Create and manage email campaigns with contact targeting
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-red-400">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Campaigns List */}
      {filteredCampaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Create your first campaign to start sending targeted emails
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCampaigns.map((campaign) => {
            const stats = verificationStats[campaign.id];
            const isLoadingStats = loadingStats[campaign.id];
            const isVerifying = verifyingCampaigns.has(campaign.id);
            const hasUnverified = stats && stats.unverifiedCount > 0;
            const isToggling = togglingCampaigns.has(campaign.id);

            return (
              <Card key={campaign.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      {campaign.description && (
                        <CardDescription className="mt-1">
                          {campaign.description}
                        </CardDescription>
                      )}
                      {campaign.subject && (
                        <CardDescription className="mt-1 text-xs">
                          Subject: {campaign.subject}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewCampaign(campaign)}
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/campaigns/${campaign.id}`)}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCampaignToDelete(campaign);
                          setDeleteDialogOpen(true);
                        }}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {campaign.contactCount || campaign.totalContacts || 0} contacts
                      </span>
                    </div>

                    {/* Sending Progress */}
                    {campaign.isActive && campaign.status === "active" && (campaign.sentContacts || 0) > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Sending Progress</span>
                          <span className="font-medium text-white">
                            {campaign.sentContacts || 0} / {campaign.totalContacts || campaign.contactCount || 0}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{
                              width: `${Math.min(100, Math.floor(((campaign.sentContacts || 0) / (campaign.totalContacts || campaign.contactCount || 1)) * 100))}%`,
                            }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.min(100, Math.floor(((campaign.sentContacts || 0) / (campaign.totalContacts || campaign.contactCount || 1)) * 100))}% complete
                        </div>
                      </div>
                    )}
                    
                    {/* Campaign Status */}
                    {campaign.status && (
                      <div className="flex items-center gap-2">
                        <Badge variant={campaign.status === 'active' ? 'default' : campaign.status === 'paused' ? 'secondary' : 'outline'}>
                          {campaign.status}
                        </Badge>
                        {campaign.isActive && (
                          <Badge variant="default" className="bg-green-500">
                            Active
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {/* Verification Stats */}
                    {isLoadingStats ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Loading stats...</span>
                      </div>
                    ) : stats ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-muted-foreground">Verified:</span>
                            <span className="font-medium">{stats.verified}</span>
                          </div>
                          <Badge variant={stats.verifiedPercentage >= 80 ? "default" : stats.verifiedPercentage >= 50 ? "secondary" : "outline"}>
                            {stats.verifiedPercentage}%
                          </Badge>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{ width: `${stats.verifiedPercentage}%` }}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>Pending: {stats.pending}</span>
                          </div>
                          {stats.invalid > 0 && (
                            <div className="flex items-center gap-1">
                              <X className="w-3 h-3 text-red-500" />
                              <span>Invalid: {stats.invalid}</span>
                            </div>
                          )}
                        </div>

                        {hasUnverified && (
                          <div className="w-full mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => handleBulkVerify(campaign)}
                              disabled={isVerifying}
                            >
                              {isVerifying ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Verifying...
                                </>
                              ) : (
                                <>
                                  <MailCheck className="w-4 h-4 mr-2" />
                                  Bulk Verify ({stats.unverifiedCount})
                                </>
                              )}
                            </Button>
                            {isVerifying && verificationJobs[campaign.id] && (
                              <div className="mt-2 space-y-1">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>
                                    {verificationJobs[campaign.id].processed} / {verificationJobs[campaign.id].total}
                                  </span>
                                  <span>{verificationJobs[campaign.id].progressPercentage}%</span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${verificationJobs[campaign.id].progressPercentage}%`,
                                    }}
                                  />
                                </div>
                                {verificationJobs[campaign.id].currentEmail && (
                                  <div className="text-xs text-muted-foreground truncate">
                                    Processing: {verificationJobs[campaign.id].currentEmail}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {!hasUnverified && stats.total > 0 && (
                          <div className="flex items-center gap-2 text-xs text-green-500 mt-2">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>All contacts verified</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fetchCampaignStats(campaign.id)}
                        className="text-xs"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Load stats
                      </Button>
                    )}

                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      {campaign.criteria.rules.length} rule
                      {campaign.criteria.rules.length !== 1 ? "s" : ""}
                    </div>

                    {/* Email Analytics */}
                    {loadingAnalytics[campaign.id] ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Loading analytics...</span>
                      </div>
                    ) : analytics[campaign.id] ? (
                      <div className="pt-2 border-t space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-medium">Email Analytics</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => router.push(`/admin/emails/${campaign.id}/analytics`)}
                          >
                            <BarChart3 className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              <span>Sent</span>
                            </div>
                            <span className="font-medium text-white">{analytics[campaign.id].totalSent || 0}</span>
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MailOpen className="w-3 h-3 text-green-400" />
                              <span>Opened</span>
                            </div>
                            <span className="font-medium text-white">
                              {analytics[campaign.id].uniqueOpened || 0}
                            </span>
                            {analytics[campaign.id].totalSent > 0 && (
                              <span className="text-xs text-green-400">
                                ({analytics[campaign.id].openRate.toFixed(1)}%)
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MousePointerClick className="w-3 h-3 text-purple-400" />
                              <span>Clicked</span>
                            </div>
                            <span className="font-medium text-white">
                              {analytics[campaign.id].uniqueClicked || 0}
                            </span>
                            {analytics[campaign.id].totalSent > 0 && (
                              <span className="text-xs text-purple-400">
                                ({analytics[campaign.id].clickRate.toFixed(1)}%)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                  
                  {/* Campaign Controls */}
                  <div className="mt-4 pt-4 border-t space-y-2">
                    {campaign.subject && campaign.fromEmail ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleToggleCampaign(campaign)}
                          disabled={isToggling || campaign.status === 'completed' || campaign.status === 'cancelled'}
                        >
                          {isToggling ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : campaign.isActive ? (
                            <Pause className="w-4 h-4 mr-2" />
                          ) : (
                            <Play className="w-4 h-4 mr-2" />
                          )}
                          {campaign.isActive ? "Pause" : "Start"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/campaigns/${campaign.id}`)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => router.push(`/admin/campaigns/${campaign.id}`)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Add Email Content
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Campaign Dialog */}
      <CampaignDialog
        open={createDialogOpen || !!editingCampaign}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false);
            setEditingCampaign(null);
          }
        }}
        campaign={editingCampaign}
        onSuccess={() => {
          fetchCampaigns();
          setCreateDialogOpen(false);
          setEditingCampaign(null);
        }}
      />

      {/* Preview Dialog */}
      <PreviewDialog
        campaign={previewCampaign}
        onOpenChange={(open) => !open && setPreviewCampaign(null)}
      />

      {/* Bulk Verify Confirmation */}
      <ConfirmDialog
        open={bulkVerifyDialogOpen}
        onOpenChange={setBulkVerifyDialogOpen}
        title="Bulk Verify Emails"
        description={
          campaignToVerify && verificationStats[campaignToVerify.id]
            ? `Verify ${verificationStats[campaignToVerify.id].unverifiedCount} unverified email(s) in campaign "${campaignToVerify.name}"? This may take a few minutes.`
            : `Verify unverified emails in campaign "${campaignToVerify?.name}"?`
        }
        confirmText="Verify"
        cancelText="Cancel"
        onConfirm={confirmBulkVerify}
        variant="default"
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Campaign"
        description={`Are you sure you want to delete "${campaignToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}

// Campaign Create/Edit Dialog Component
function CampaignDialog({
  open,
  onOpenChange,
  campaign,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Segment | null;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [criteria, setCriteria] = useState<SegmentCriteria>({
    rules: [],
    logic: "AND",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (campaign) {
      setName(campaign.name);
      setDescription(campaign.description || "");
      setCriteria(campaign.criteria);
    } else {
      setName("");
      setDescription("");
      setCriteria({
        rules: [],
        logic: "AND",
      });
    }
  }, [campaign, open]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Campaign name is required");
      return;
    }

    if (criteria.rules.length === 0) {
      toast.error("At least one criteria rule is required");
      return;
    }

    setSaving(true);
    try {
      if (campaign) {
        // Update existing campaign
        const response = await fetch("/admin/campaigns/api", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: campaign.id,
            name,
            description,
            criteria,
          }),
        });
        if (!response.ok) throw new Error("Failed to update campaign");
        toast.success("Campaign updated successfully");
      } else {
        // Create new campaign
        const response = await fetch("/admin/campaigns/api", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description,
            criteria,
          }),
        });
        if (!response.ok) throw new Error("Failed to create campaign");
        const data = await response.json();
        toast.success("Campaign created successfully");
        // Navigate to edit page to add email content
        router.push(`/admin/campaigns/${data.id}`);
        onSuccess();
        return;
      }

      onSuccess();
    } catch (err: any) {
      toast.error(`Failed to save campaign: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {campaign ? "Edit Campaign" : "Create Campaign"}
          </DialogTitle>
          <DialogDescription>
            {campaign
              ? "Update campaign details and criteria"
              : "Create a new campaign to send targeted emails"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Christmas Quiz - ChatGPT Users"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this segment..."
              className="mt-1"
            />
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <Label className="text-base">Criteria Rules</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Define conditions that contacts must meet to be included in this campaign
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Logic:</Label>
                <Select
                  value={criteria.logic || "AND"}
                  onValueChange={(value: "AND" | "OR") =>
                    setCriteria({ ...criteria, logic: value })
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AND">AND</SelectItem>
                    <SelectItem value="OR">OR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              {criteria.rules.map((rule, index) => (
                <CriteriaRuleEditor
                  key={index}
                  rule={rule}
                  onUpdate={(updatedRule) => {
                    const newRules = [...criteria.rules];
                    newRules[index] = updatedRule;
                    setCriteria({ ...criteria, rules: newRules });
                  }}
                  onRemove={() => {
                    const newRules = criteria.rules.filter((_, i) => i !== index);
                    setCriteria({ ...criteria, rules: newRules });
                  }}
                />
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCriteria({
                    ...criteria,
                    rules: [
                      ...criteria.rules,
                      {
                        field: "status",
                        operator: "equals",
                        value: "",
                      },
                    ],
                  });
                }}
                className="w-full"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Rule
              </Button>
            </div>

            {criteria.rules.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded">
                {`No rules added. Click "Add Rule" to create your first condition.`}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Criteria Rule Editor Component
function CriteriaRuleEditor({
  rule,
  onUpdate,
  onRemove,
}: {
  rule: SegmentCriteriaRule;
  onUpdate: (rule: SegmentCriteriaRule) => void;
  onRemove: () => void;
}) {
  const fieldOptions: { value: SegmentField; label: string }[] = [
    { value: "status", label: "Status" },
    { value: "source", label: "Source" },
    { value: "engagementScore", label: "Engagement Score" },
    { value: "company", label: "Company" },
    { value: "lastSent", label: "Last Sent" },
    { value: "metadata.q1", label: "Metadata: Q1 (AI Tool)" },
    { value: "metadata.q2", label: "Metadata: Q2 (AI Status)" },
    { value: "metadata.q3", label: "Metadata: Q3 (Team Size)" },
    { value: "metadata.q4", label: "Metadata: Q4 (Automation)" },
    { value: "metadata.q5", label: "Metadata: Q5 (Analysis)" },
  ];

  const getOperatorsForField = (field: SegmentField): SegmentOperator[] => {
    switch (field) {
      case "status":
      case "source":
      case "company":
      case "metadata.q1":
      case "metadata.q2":
      case "metadata.q3":
      case "metadata.q4":
      case "metadata.q5":
        return ["equals", "not_equals", "contains", "not_contains", "in", "not_in", "exists", "not_exists"];
      case "engagementScore":
      case "lastSent":
        return ["equals", "not_equals", "greater_than", "less_than", "exists", "not_exists"];
      default:
        return ["equals", "not_equals", "contains", "not_contains", "exists", "not_exists"];
    }
  };

  const operators: { value: SegmentOperator; label: string }[] = [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Not Equals" },
    { value: "contains", label: "Contains" },
    { value: "not_contains", label: "Not Contains" },
    { value: "in", label: "In (multiple values)" },
    { value: "not_in", label: "Not In (multiple values)" },
    { value: "greater_than", label: "Greater Than" },
    { value: "less_than", label: "Less Than" },
    { value: "exists", label: "Exists" },
    { value: "not_exists", label: "Not Exists" },
  ];

  const availableOperators = getOperatorsForField(rule.field);
  const currentOperator = operators.find((op) => op.value === rule.operator);
  const needsValue = !["exists", "not_exists"].includes(rule.operator);
  const isArrayValue = ["in", "not_in"].includes(rule.operator);

  const getValueInput = () => {
    if (!needsValue) return null;

    if (isArrayValue) {
      const arrayValue = Array.isArray(rule.value) ? rule.value : rule.value ? [rule.value] : [];
      return (
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Values (comma-separated)</Label>
          <Textarea
            value={arrayValue.join(", ")}
            onChange={(e) => {
              const values = e.target.value
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean);
              onUpdate({ ...rule, value: values });
            }}
            placeholder="value1, value2, value3"
            className="mt-1 min-h-[60px]"
          />
        </div>
      );
    }

    if (rule.field === "status") {
      return (
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Value</Label>
          <Select
            value={String(rule.value || "")}
            onValueChange={(value) => onUpdate({ ...rule, value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="bounced">Bounced</SelectItem>
              <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
              <SelectItem value="invalid">Invalid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (rule.field === "source") {
      return (
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Value</Label>
          <Select
            value={String(rule.value || "")}
            onValueChange={(value) => onUpdate({ ...rule, value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="christmas-quiz">Christmas Quiz</SelectItem>
              <SelectItem value="csv-import">CSV Import</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="api">API</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (rule.field === "engagementScore") {
      return (
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Value</Label>
          <Input
            type="number"
            value={String(rule.value || "")}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : 0;
              onUpdate({ ...rule, value });
            }}
            placeholder="0"
            className="mt-1"
          />
        </div>
      );
    }

    if (rule.field === "lastSent") {
      return (
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Value</Label>
          <Input
            type="date"
            value={
              rule.value
                ? typeof rule.value === "string"
                  ? rule.value.split("T")[0]
                  : new Date(rule.value as number).toISOString().split("T")[0]
                : ""
            }
            onChange={(e) => {
              const value = e.target.value ? new Date(e.target.value).toISOString() : "";
              onUpdate({ ...rule, value });
            }}
            placeholder="YYYY-MM-DD"
            className="mt-1"
          />
        </div>
      );
    }

    return (
      <div className="flex-1">
        <Label className="text-xs text-muted-foreground">Value</Label>
        <Input
          value={String(rule.value || "")}
          onChange={(e) => onUpdate({ ...rule, value: e.target.value })}
          placeholder="Enter value"
          className="mt-1"
        />
      </div>
    );
  };

  return (
    <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
      <div className="flex items-start gap-3">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Field</Label>
            <Select
              value={rule.field}
              onValueChange={(value: SegmentField) => {
                const newOperators = getOperatorsForField(value);
                const newOperator = newOperators.includes(rule.operator)
                  ? rule.operator
                  : newOperators[0];
                onUpdate({
                  ...rule,
                  field: value,
                  operator: newOperator,
                  value: "",
                });
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fieldOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Operator</Label>
            <Select
              value={rule.operator}
              onValueChange={(value: SegmentOperator) => {
                const isArrayOp = ["in", "not_in"].includes(value);
                const isNoValueOp = ["exists", "not_exists"].includes(value);
                onUpdate({
                  ...rule,
                  operator: value,
                  value: isNoValueOp ? null : isArrayOp ? [] : rule.value || "",
                });
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {operators
                  .filter((op) => availableOperators.includes(op.value))
                  .map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {getValueInput()}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="mt-6"
        >
          <Minus className="w-4 h-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

// Preview Dialog Component
function PreviewDialog({
  campaign,
  onOpenChange,
}: {
  campaign: Segment | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [verificationStats, setVerificationStats] = useState<any>(null);

  useEffect(() => {
    if (campaign) {
      fetchPreview();
      fetchVerificationStats();
    }
  }, [campaign]);

  const fetchPreview = async () => {
    if (!campaign) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/admin/campaigns/api?preview=true&criteria=${encodeURIComponent(
          JSON.stringify(campaign.criteria)
        )}`
      );
      if (!response.ok) throw new Error("Failed to fetch preview");
      const data = await response.json();
      setPreview(data);
    } catch (err: any) {
      console.error("Error fetching preview:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationStats = async () => {
    if (!campaign) return;

    try {
      const response = await fetch(`/admin/campaigns/api/${campaign.id}/contacts`);
      if (response.ok) {
        const data = await response.json();
        setVerificationStats(data.verificationStats);
      }
    } catch (err: any) {
      console.error("Error fetching verification stats:", err);
    }
  };

  if (!campaign) return null;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'verified':
        return 'default';
      case 'pending':
      case 'verifying':
        return 'secondary';
      case 'invalid':
      case 'bounced':
        return 'destructive';
      case 'unsubscribed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Dialog open={!!campaign} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Campaign Preview: {campaign.name}</DialogTitle>
          <DialogDescription>
            {`Preview contacts matching this campaign's criteria`}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : preview ? (
          <div className="space-y-4">
            <div>
              <div className="text-lg font-semibold">
                {preview.contactCount} contacts match this campaign
              </div>
            </div>

            {/* Verification Stats */}
            {verificationStats && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="text-sm font-medium mb-2">Verification Status</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-muted-foreground">Verified:</span>
                    <span className="font-medium">{verificationStats.verified}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-muted-foreground">Pending:</span>
                    <span className="font-medium">{verificationStats.pending}</span>
                  </div>
                  {verificationStats.invalid > 0 && (
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-muted-foreground">Invalid:</span>
                      <span className="font-medium">{verificationStats.invalid}</span>
                    </div>
                  )}
                  {verificationStats.bounced > 0 && (
                    <div className="flex items-center gap-2">
                      <X className="w-4 h-4 text-red-500" />
                      <span className="text-muted-foreground">Bounced:</span>
                      <span className="font-medium">{verificationStats.bounced}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {preview.sampleContacts && preview.sampleContacts.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2">
                  Sample Contacts (first 10):
                </div>
                <div className="space-y-2">
                  {preview.sampleContacts.map((contact: any) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <div className="font-medium">{contact.email}</div>
                        {(contact.firstName || contact.lastName) && (
                          <div className="text-sm text-muted-foreground">
                            {contact.firstName} {contact.lastName}
                          </div>
                        )}
                      </div>
                      <Badge variant={getStatusBadgeVariant(contact.status)}>
                        {contact.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-muted-foreground">No preview available</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

