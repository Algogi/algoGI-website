import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";

function safeTimestamp(value: any): string | null {
  return value?.toDate?.()?.toISOString?.() || value?._seconds ? new Date(value._seconds * 1000).toISOString() : value || null;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const settingsSnap = await db.collection("warmup_settings").get();
  const statsSnap = await db.collection("warmup_stats").get();
  const statsMap = new Map(statsSnap.docs.map((d) => [d.id, d.data()]));

  const items = settingsSnap.docs.map((doc) => {
    const data = doc.data() as any;
    const stats = statsMap.get(doc.id) || {};
    return {
      id: doc.id,
      name: data.name || doc.id,
      active: !!data.active,
      subject: data.subject || "",
      fromEmail: data.fromEmail || "",
      contactEmails: (data.contactEmails || []).length || 0,
      contactIds: (data.contactIds || []).length || 0,
      unmatchedEmails: data.unmatchedEmails || [],
      updatedAt: safeTimestamp(data.updatedAt),
      lastRunAt: safeTimestamp(stats.lastRunAt),
      lastRunSent: stats.lastRunSent || 0,
      lastRunFailed: stats.lastRunFailed || 0,
      lastRunTotal: stats.lastRunTotal || 0,
      totalSent: stats.totalSent || 0,
      totalFailed: stats.totalFailed || 0,
      runCount: stats.runCount || 0,
    };
  });

  return NextResponse.json({ items });
}

