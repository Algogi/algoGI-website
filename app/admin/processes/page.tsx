"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, RefreshCw, Timer, PlayCircle, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type VerificationJob = {
  id: string;
  jobType?: string | null;
  campaignId?: string | null;
  source?: string | null;
  status: string;
  total: number;
  processed: number;
  createdAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  error?: string | null;
  progressPercentage: number;
  estimatedCompletionTime: string | null;
  timeRemainingSeconds: number | null;
  timeElapsedSeconds: number | null;
};

type CampaignProcess = {
  id: string;
  name: string;
  status: string;
  isActive: boolean;
  totalContacts: number;
  sentContacts: number;
  progressPercentage: number;
  emailsPerHour: number | null;
  estimatedCompletionTime: string | null;
  startedAt: string | null;
  pausedAt: string | null;
  completedAt: string | null;
  nextSendTime: string | null;
};

type CompletedCampaign = CampaignProcess & {
  analytics?: {
    totalSent?: number;
    uniqueOpened?: number;
    uniqueClicked?: number;
    openRate?: number;
    clickRate?: number;
    totalBounced?: number;
    totalUnsubscribed?: number;
  } | null;
  snapshotSource?: "live" | "snapshot";
};

type WarmupStatus = {
  id: string;
  name: string;
  active: boolean;
  subject: string;
  fromEmail: string;
  contactEmails: number;
  contactIds: number;
  unmatchedEmails: string[];
  updatedAt?: string | null;
  lastRunAt?: string | null;
  lastRunSent?: number;
  lastRunFailed?: number;
  lastRunTotal?: number;
  totalSent?: number;
  totalFailed?: number;
  runCount?: number;
  progress?: number | null;
};

type SendQueueItem = {
  id: string;
  campaignId: string;
  status: string;
  contactCount: number;
  subject?: string | null;
  fromEmail?: string | null;
  runAfter: string | null;
  createdAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  attempts: number;
  sent?: number;
  failed?: number;
  error?: string | null;
};

type ProcessesResponse = {
  verificationJobs: VerificationJob[];
  campaigns: CampaignProcess[];
  sendQueue: SendQueueItem[];
  completedVerificationJobs?: VerificationJob[];
  completedCampaigns?: CompletedCampaign[];
  warmups?: WarmupStatus[];
  summary: {
    activeVerificationJobs: number;
    activeCampaigns: number;
    sendQueuePending?: number;
    sendQueueProcessing?: number;
    sendQueueFailed?: number;
    sendQueueRecent?: number;
    warmupActive?: boolean;
  };
};

const POLL_INTERVAL_MS = 60 * 1000; // 1 minute

function formatDate(iso: string | null) {
  if (!iso) return "–";
  return new Date(iso).toLocaleString();
}

function formatDuration(seconds: number | null) {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) return "–";
  const mins = Math.max(0, Math.round(seconds / 60));
  if (mins < 1) return "<1 min";
  if (mins < 90) return `${mins} min`;
  const hours = Math.round(mins / 60);
  return `${hours} hr${hours === 1 ? "" : "s"}`;
}

function statusBadgeVariant(status: string) {
  switch (status) {
    case "processing":
    case "active":
    case "sending":
      return "default" as const;
    case "pending":
    case "scheduled":
      return "secondary" as const;
    case "paused":
      return "outline" as const;
    case "completed":
      return "default" as const;
    case "failed":
    case "cancelled":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

export default function ProcessesPage() {
  const [data, setData] = useState<ProcessesResponse | null>(null);
  const [completedJobs, setCompletedJobs] = useState<VerificationJob[] | null>(null);
  const [completedCampaigns, setCompletedCampaigns] = useState<CompletedCampaign[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCompleted, setLoadingCompleted] = useState(false);
  const [loadingCompletedCampaigns, setLoadingCompletedCampaigns] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async (includeCompleted = false) => {
    try {
      setError(null);
      const response = await fetch(`/admin/processes/api${includeCompleted ? "?includeCompleted=true" : ""}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to load processes");
      }
      const json = (await response.json()) as ProcessesResponse;
      setData(json);
      if (includeCompleted && json.completedVerificationJobs) {
        setCompletedJobs(json.completedVerificationJobs);
      }
      if (includeCompleted && json.completedCampaigns) {
        setCompletedCampaigns(json.completedCampaigns);
      }
      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
      if (includeCompleted) {
        setLoadingCompleted(false);
        setLoadingCompletedCampaigns(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const activeJobs = data?.verificationJobs || [];
  const activeCampaigns = data?.campaigns || [];
  const queueItems = data?.sendQueue || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Background Processes</h1>
          <p className="text-sm text-gray-400 mt-1">
            Live status for verification jobs and campaign sending progress
          </p>
        </div>
        <Button variant="outline" onClick={() => fetchData()} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Refreshing
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-destructive">{error}</div>
          </CardContent>
        </Card>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verification Jobs</CardTitle>
            <ShieldCheck className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{data?.summary.activeVerificationJobs ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active or pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Campaign Runs</CardTitle>
            <Send className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{data?.summary.activeCampaigns ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active or sending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Send Queue</CardTitle>
            <Send className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{data?.summary.sendQueuePending ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Processing: {data?.summary.sendQueueProcessing ?? 0} · Failed: {data?.summary.sendQueueFailed ?? 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Recent items: {data?.summary.sendQueueRecent ?? queueItems.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Warmup</CardTitle>
            <PlayCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {(data?.warmups || []).filter((w) => w.active).length} active
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(data?.warmups || []).length} total warmups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Updated</CardTitle>
            <Timer className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold text-white">
              {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {lastUpdated ? lastUpdated.toLocaleDateString() : "Auto-refresh enabled"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Send queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Send Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !data ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Loading...
            </div>
          ) : queueItems.length === 0 ? (
            <div className="text-sm text-muted-foreground">No recent send queue items.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Queue Item</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contacts</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Timing</TableHead>
                  <TableHead>Result / Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queueItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-semibold text-white">ID: {item.id}</div>
                      <div className="text-xs text-muted-foreground">Campaign: {item.campaignId || "—"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-white line-clamp-2">{item.subject || "—"}</div>
                      <div className="text-xs text-muted-foreground">{item.fromEmail || "—"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(item.status)} className="capitalize">
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-white">{item.contactCount}</TableCell>
                    <TableCell className="text-sm text-white">{item.attempts}</TableCell>
                    <TableCell className="text-sm text-white">
                      <div>Run after: {formatDate(item.runAfter)}</div>
                      <div className="text-xs text-muted-foreground">Started: {formatDate(item.startedAt)}</div>
                      <div className="text-xs text-muted-foreground">Completed: {formatDate(item.completedAt)}</div>
                    </TableCell>
                    <TableCell className="text-sm text-white">
                      <div>
                        Sent: {item.sent ?? "—"} · Failed: {item.failed ?? "—"}
                      </div>
                      {item.error && <div className="text-xs text-destructive mt-1 break-words">{item.error}</div>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Verification jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Running Verification Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !data ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Loading...
            </div>
          ) : activeJobs.length === 0 ? (
            <div className="text-sm text-muted-foreground">No active or recent jobs.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead>Started</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div className="font-semibold text-white">{job.jobType || "Verification"}</div>
                      <div className="text-xs text-muted-foreground">Job ID: {job.id}</div>
                      {job.campaignId && (
                        <div className="text-xs text-muted-foreground">Campaign: {job.campaignId}</div>
                      )}
                      {job.source && (
                        <div className="text-xs text-muted-foreground">Source: {job.source}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(job.status)} className="capitalize">
                        {job.status}
                      </Badge>
                      {job.error && (
                        <div className="text-xs text-destructive mt-1 max-w-xs break-words">{job.error}</div>
                      )}
                    </TableCell>
                    <TableCell className="min-w-[180px]">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {job.processed} / {job.total}
                        </span>
                        <span>{job.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${job.progressPercentage}%` }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-white">{formatDuration(job.timeRemainingSeconds)}</div>
                      <div className="text-xs text-muted-foreground">
                        {job.estimatedCompletionTime ? `ETA ${formatDate(job.estimatedCompletionTime)}` : "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(job.startedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>Jobs shown include active and the last 24h of completions.</TableCaption>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Completed verification jobs */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Completed Verification Jobs
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoadingCompleted(true);
              fetchData(true);
            }}
            disabled={loadingCompleted}
          >
            {loadingCompleted ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Load completed
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {loadingCompleted && (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading completed jobs...
            </div>
          )}
          {!loadingCompleted && completedJobs === null && (
            <div className="text-sm text-muted-foreground">Click “Load completed” to view recent completed jobs.</div>
          )}
          {!loadingCompleted && completedJobs !== null && completedJobs.length === 0 && (
            <div className="text-sm text-muted-foreground">No completed jobs in the recent window.</div>
          )}
          {!loadingCompleted && completedJobs && completedJobs.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Started</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div className="font-semibold text-white">{job.jobType || "Verification"}</div>
                      <div className="text-xs text-muted-foreground">Job ID: {job.id}</div>
                      {job.campaignId && (
                        <div className="text-xs text-muted-foreground">Campaign: {job.campaignId}</div>
                      )}
                      {job.source && (
                        <div className="text-xs text-muted-foreground">Source: {job.source}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(job.status)} className="capitalize">
                        {job.status}
                      </Badge>
                      {job.error && (
                        <div className="text-xs text-destructive mt-1 max-w-xs break-words">{job.error}</div>
                      )}
                    </TableCell>
                    <TableCell className="min-w-[180px]">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {job.processed} / {job.total}
                        </span>
                        <span>{job.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${job.progressPercentage}%` }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(job.completedAt)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(job.startedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>Completed jobs within the last 24 hours.</TableCaption>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Campaign processes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4" />
            Campaign Runs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !data ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Loading...
            </div>
          ) : activeCampaigns.length === 0 ? (
            <div className="text-sm text-muted-foreground">No active or in-progress campaigns.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead>Started</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div className="font-semibold text-white">{campaign.name}</div>
                      <div className="text-xs text-muted-foreground">ID: {campaign.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(campaign.status)} className="capitalize">
                        {campaign.status}
                      </Badge>
                      {campaign.isActive && (
                        <Badge variant="default" className="ml-2 bg-green-500">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="min-w-[180px]">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {campaign.sentContacts} / {campaign.totalContacts}
                        </span>
                        <span>{campaign.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${campaign.progressPercentage}%` }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-white">
                      {campaign.emailsPerHour ? `${campaign.emailsPerHour} / hr` : "—"}
                      {campaign.nextSendTime && (
                        <div className="text-xs text-muted-foreground">
                          Next batch: {formatDate(campaign.nextSendTime)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-white">
                        {campaign.estimatedCompletionTime
                          ? formatDuration(
                              Math.max(
                                0,
                                (new Date(campaign.estimatedCompletionTime).getTime() - Date.now()) / 1000
                              )
                            )
                          : "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {campaign.estimatedCompletionTime ? `ETA ${formatDate(campaign.estimatedCompletionTime)}` : "—"}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(campaign.startedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Completed campaigns */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4" />
            Completed Campaigns
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLoadingCompletedCampaigns(true);
              fetchData(true);
            }}
            disabled={loadingCompletedCampaigns}
          >
            {loadingCompletedCampaigns ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Load completed
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {loadingCompletedCampaigns && (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading completed campaigns...
            </div>
          )}
          {!loadingCompletedCampaigns && completedCampaigns === null && (
            <div className="text-sm text-muted-foreground">
              Click “Load completed” to view recent completed campaigns (including deleted snapshots).
            </div>
          )}
          {!loadingCompletedCampaigns && completedCampaigns !== null && completedCampaigns.length === 0 && (
            <div className="text-sm text-muted-foreground">No completed campaigns in the recent window.</div>
          )}
          {!loadingCompletedCampaigns && completedCampaigns && completedCampaigns.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Analytics</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedCampaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div className="font-semibold text-white">{campaign.name}</div>
                      <div className="text-xs text-muted-foreground">ID: {campaign.id}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(campaign.status)} className="capitalize">
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-[180px]">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {campaign.sentContacts} / {campaign.totalContacts}
                        </span>
                        <span>{campaign.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${campaign.progressPercentage}%` }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(campaign.completedAt)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {campaign.analytics ? (
                        <div className="space-y-1">
                          <div>Sent: {campaign.analytics.totalSent ?? "—"}</div>
                          <div>
                            Open: {campaign.analytics.uniqueOpened ?? 0}
                            {campaign.analytics.openRate !== undefined && ` (${campaign.analytics.openRate.toFixed(1)}%)`}
                          </div>
                          <div>
                            Click: {campaign.analytics.uniqueClicked ?? 0}
                            {campaign.analytics.clickRate !== undefined &&
                              ` (${campaign.analytics.clickRate.toFixed(1)}%)`}
                          </div>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {campaign.snapshotSource === "snapshot" ? "Snapshot" : "Live"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>Completed campaigns from the last 24 hours (including deleted snapshots).</TableCaption>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Warmup status detail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4" />
            Warmup Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!data?.warmups || data.warmups.length === 0 ? (
            <div className="text-sm text-muted-foreground">No warmup campaigns configured.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Total Sent</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.warmups.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>
                      <div className="font-semibold text-white">{w.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{w.subject}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={w.active ? "default" : "secondary"}>{w.active ? "Active" : "Inactive"}</Badge>
                    </TableCell>
                    <TableCell className="min-w-[160px]">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {w.contactIds} / {w.contactEmails}
                        </span>
                        <span>{w.progress ?? 0}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${w.progress ?? 0}%` }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {w.lastRunAt ? formatDate(w.lastRunAt) : "—"}
                      <div className="text-xs">
                        {w.lastRunSent ?? 0} / {w.lastRunTotal ?? 0} sent
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {w.totalSent ?? 0} sent
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {w.updatedAt ? formatDate(w.updatedAt) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

