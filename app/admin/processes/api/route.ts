import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";
import { calculateEmailsPerHour } from "@/lib/campaigns/warmup-calculator";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";
import { EmailAnalytics } from "@/lib/types/email";

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
  analytics?: Partial<EmailAnalytics> | null;
  snapshotSource?: "live" | "snapshot";
};

function safeTimestampToISO(value: any): string | null {
  return value?.toDate?.()?.toISOString?.() || value || null;
}

function estimateJobEta(job: { total: number; processed: number; startedAt: number | null }): {
  estimatedCompletionTime: string | null;
  timeRemainingSeconds: number | null;
  timeElapsedSeconds: number | null;
} {
  const nowMs = Date.now();
  if (!job.startedAt || job.processed <= 0 || job.total <= 0) {
    return { estimatedCompletionTime: null, timeRemainingSeconds: null, timeElapsedSeconds: null };
  }

  const elapsedSeconds = Math.max(0, (nowMs - job.startedAt) / 1000);
  const rate = job.processed / elapsedSeconds; // items per second
  if (rate <= 0) {
    return { estimatedCompletionTime: null, timeRemainingSeconds: null, timeElapsedSeconds: elapsedSeconds };
  }

  const remaining = Math.max(0, job.total - job.processed);
  const remainingSeconds = remaining / rate;
  const etaMs = nowMs + remainingSeconds * 1000;

  return {
    estimatedCompletionTime: new Date(etaMs).toISOString(),
    timeRemainingSeconds: Math.round(remainingSeconds),
    timeElapsedSeconds: Math.round(elapsedSeconds),
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const includeCompleted = searchParams.get("includeCompleted") === "true";

    // Fetch verification jobs (running + recent)
    const jobsSnapshot = await db
      .collection("verification_jobs")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const verificationJobs: VerificationJob[] = jobsSnapshot.docs.map((doc) => {
      const data = doc.data() || {};
      const createdAt = safeTimestampToISO(data.createdAt);
      const startedAt = safeTimestampToISO(data.startedAt);
      const completedAt = safeTimestampToISO(data.completedAt);

      const progress =
        data.total && data.total > 0
          ? Math.min(100, Math.round(((data.processed || 0) / data.total) * 100))
          : 0;

      const eta = estimateJobEta({
        total: data.total || 0,
        processed: data.processed || 0,
        startedAt: startedAt ? new Date(startedAt).getTime() : null,
      });

      return {
        id: doc.id,
        jobType: data.jobType || null,
        campaignId: data.campaignId || null,
        source: data.source || null,
        status: data.status || "pending",
        total: data.total || 0,
        processed: data.processed || 0,
        createdAt,
        startedAt,
        completedAt,
        error: data.error || null,
        progressPercentage: progress,
        estimatedCompletionTime: eta.estimatedCompletionTime,
        timeRemainingSeconds: eta.timeRemainingSeconds,
        timeElapsedSeconds: eta.timeElapsedSeconds,
      };
    });

    // Only keep active/recent jobs (pending/processing or completed within 24h)
    const cutoffMs = Date.now() - 24 * 60 * 60 * 1000;
    const activeJobs = verificationJobs.filter((job) => job.status === "pending" || job.status === "processing");
    const completedJobs = verificationJobs.filter((job) => {
      if (!job.completedAt) return false;
      return new Date(job.completedAt).getTime() >= cutoffMs && job.status !== "pending" && job.status !== "processing";
    });

    // Fetch active/in-progress campaigns
    const campaignsRef = db.collection("contact_segments");
    const [activeSnapshot, statusSnapshot] = await Promise.all([
      campaignsRef.where("isActive", "==", true).get(),
      campaignsRef.where("status", "in", ["active", "sending", "scheduled", "paused"]).get(),
    ]);

    const campaignDocsMap = new Map<string, QueryDocumentSnapshot>();
    activeSnapshot.docs.forEach((doc) => campaignDocsMap.set(doc.id, doc));
    statusSnapshot.docs.forEach((doc) => campaignDocsMap.set(doc.id, doc));

    const buildCampaignProcess = (doc: QueryDocumentSnapshot): CampaignProcess => {
      const data = doc.data() as any;
      const totalContacts = data.totalContacts || data.contactCount || 0;
      const sentContacts = data.sentContacts || 0;
      const progress =
        totalContacts > 0 ? Math.min(100, Math.round((sentContacts / totalContacts) * 100)) : 0;

      const startIso = safeTimestampToISO(data.startedAt);
      const emailsPerHour =
        typeof data.emailsPerHour === "number"
          ? data.emailsPerHour
          : totalContacts > 0
          ? calculateEmailsPerHour(totalContacts, sentContacts, startIso || new Date().toISOString())
          : null;

      const remaining = Math.max(0, totalContacts - sentContacts);
      const estimatedHours =
        emailsPerHour && emailsPerHour > 0 ? Math.ceil(remaining / emailsPerHour) : null;
      const estimatedCompletionTime =
        estimatedHours !== null ? new Date(Date.now() + estimatedHours * 60 * 60 * 1000).toISOString() : null;

      const nextSendTime =
        data.isActive && data.status === "active"
          ? new Date(Date.now() + 60 * 60 * 1000).toISOString()
          : null;

      return {
        id: doc.id,
        name: data.name || "Campaign",
        status: data.status || "draft",
        isActive: !!data.isActive,
        totalContacts,
        sentContacts,
        progressPercentage: progress,
        emailsPerHour,
        estimatedCompletionTime,
        startedAt: startIso,
        pausedAt: safeTimestampToISO(data.pausedAt),
        completedAt: safeTimestampToISO(data.completedAt),
        nextSendTime,
      };
    };

    const campaigns: CampaignProcess[] = Array.from(campaignDocsMap.values()).map(buildCampaignProcess);

    let completedCampaigns: CompletedCampaign[] = [];

    if (includeCompleted) {
      const [completedSnapshot, completedRunsSnapshot] = await Promise.all([
        campaignsRef.where("status", "in", ["completed", "sent", "cancelled"]).orderBy("updatedAt", "desc").limit(30).get(),
        db.collection("campaign_runs").orderBy("deletedAt", "desc").limit(30).get(),
      ]);

      const completedMap = new Map<string, CompletedCampaign>();

      // From live collection
      for (const doc of completedSnapshot.docs) {
        const base = buildCampaignProcess(doc);
        completedMap.set(base.id, {
          ...base,
          snapshotSource: "live",
        });
      }

      // From snapshots (ensure we keep even if deleted)
      for (const doc of completedRunsSnapshot.docs) {
        const data = doc.data() as any;
        const totalContacts = data.totalContacts || data.contactCount || 0;
        const sentContacts = data.sentContacts || 0;
        const progress = totalContacts > 0 ? Math.min(100, Math.round((sentContacts / totalContacts) * 100)) : 0;
        const completedAt = safeTimestampToISO(data.completedAt) || safeTimestampToISO(data.deletedAt);

        const snapshotCampaign: CompletedCampaign = {
          id: data.campaignId || doc.id,
          name: data.name || "Campaign",
          status: data.status || "completed",
          isActive: false,
          totalContacts,
          sentContacts,
          progressPercentage: progress,
          emailsPerHour: data.emailsPerHour || null,
          estimatedCompletionTime: null,
          startedAt: safeTimestampToISO(data.startedAt),
          pausedAt: safeTimestampToISO(data.pausedAt),
          completedAt,
          nextSendTime: null,
          analytics: data.analytics || null,
          snapshotSource: "snapshot",
        };

        if (!completedMap.has(snapshotCampaign.id)) {
          completedMap.set(snapshotCampaign.id, snapshotCampaign);
        }
      }

      // Optionally enrich live completions with analytics
      const liveCompletedIds = Array.from(completedMap.values())
        .filter((c) => c.snapshotSource === "live")
        .map((c) => c.id);

      if (liveCompletedIds.length > 0) {
        const analyticsDocs = await Promise.all(
          liveCompletedIds.map((id) => db.collection("email_analytics").doc(id).get())
        );

        analyticsDocs.forEach((doc) => {
          if (doc.exists) {
            const analytics = doc.data() as EmailAnalytics;
            const existing = completedMap.get(doc.id);
            if (existing) {
              completedMap.set(doc.id, { ...existing, analytics });
            }
          }
        });
      }

      // Filter by cutoff 24h for finished ones
      completedCampaigns = Array.from(completedMap.values()).filter((c) => {
        if (!c.completedAt) return false;
        return new Date(c.completedAt).getTime() >= cutoffMs;
      });
    }

    // Send queue snapshot (pending/processing)
    const queueSnapshot = await db
      .collection("send_queue")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const sendQueue = queueSnapshot.docs.map((doc) => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        campaignId: data.campaignId,
        status: data.status,
        contactCount: (data.contactIds || []).length,
      subject: data.subject || null,
      fromEmail: data.fromEmail || null,
        runAfter: safeTimestampToISO(data.runAfter),
        createdAt: safeTimestampToISO(data.createdAt),
      startedAt: safeTimestampToISO(data.startedAt),
      completedAt: safeTimestampToISO(data.completedAt),
        attempts: data.attempts || 0,
      sent: data.sent || 0,
      failed: data.failed || 0,
        error: data.error || null,
      };
    });

    const queueSummary = {
      pending: sendQueue.filter((q) => q.status === "pending").length,
      processing: sendQueue.filter((q) => q.status === "processing").length,
      failed: sendQueue.filter((q) => q.status === "failed").length,
      recent: sendQueue.length,
    };

    // Warmup statuses (multiple)
    const warmupSettingsSnap = await db.collection("warmup_settings").get();
    const warmupStatsSnap = await db.collection("warmup_stats").get();
    const statsMap = new Map(warmupStatsSnap.docs.map((d) => [d.id, d.data()]));

    const warmups = warmupSettingsSnap.docs.map((doc) => {
      const data = doc.data() as any;
      const stats = statsMap.get(doc.id) || {};
      const contactsCount = (data.contactIds || []).length || 0;
      return {
        id: doc.id,
        name: data.name || doc.id,
        active: !!data.active,
        subject: data.subject || "",
        fromEmail: data.fromEmail || "",
        contactEmails: (data.contactEmails || []).length || 0,
        contactIds: contactsCount,
        unmatchedEmails: data.unmatchedEmails || [],
        updatedAt: safeTimestampToISO(data.updatedAt),
        lastRunAt: safeTimestampToISO(stats.lastRunAt),
        lastRunSent: stats.lastRunSent || 0,
        lastRunFailed: stats.lastRunFailed || 0,
        lastRunTotal: stats.lastRunTotal || 0,
        totalSent: stats.totalSent || 0,
        totalFailed: stats.totalFailed || 0,
        runCount: stats.runCount || 0,
        progress:
          contactsCount > 0
            ? Math.min(100, Math.round(((stats.totalSent || 0) / contactsCount) * 100))
            : null,
      };
    });

    const responseBody: any = {
      verificationJobs: activeJobs,
      campaigns,
      sendQueue,
      warmups,
      summary: {
        activeVerificationJobs: activeJobs.length,
        activeCampaigns: campaigns.filter((c) => c.isActive || c.status === "active").length,
        sendQueuePending: queueSummary.pending,
        sendQueueProcessing: queueSummary.processing,
        sendQueueFailed: queueSummary.failed,
      sendQueueRecent: queueSummary.recent,
        warmupActive: warmups.some((w) => w.active),
      },
    };

    if (includeCompleted) {
      responseBody.completedVerificationJobs = completedJobs;
      responseBody.completedCampaigns = completedCampaigns;
    }

    return NextResponse.json(responseBody);
  } catch (error: any) {
    console.error("Error fetching processes:", error);
    return NextResponse.json(
      { error: "Failed to fetch processes", details: error.message },
      { status: 500 }
    );
  }
}

