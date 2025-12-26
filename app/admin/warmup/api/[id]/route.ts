import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";
import { verifyEmailBatch } from "@/lib/utils/email-validation";
import { PERSONAL_EMAIL_PROVIDERS } from "@/lib/utils/work-email";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIRESTORE_IN_LIMIT = 10;
const WARMUP_CRON_INTERVAL_MINUTES = 60; // assumed cadence for external cron hitting /api/cron/warmup

function toDate(value: any): Date | null {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  if (value._seconds) return new Date(value._seconds * 1000);
  if (typeof value === "string" || value instanceof Date) return new Date(value);
  return null;
}

function normalizeEmails(raw: any): string[] {
  return Array.from(
    new Set(
      (Array.isArray(raw) ? raw : String(raw || "").split(/[\n,]+/))
        .map((e) => (typeof e === "string" ? e.trim().toLowerCase() : ""))
        .filter(Boolean)
    )
  );
}

async function resolveOrCreate(
  db: FirebaseFirestore.Firestore,
  emails: string[],
  warmupId: string
) {
  const map = new Map<string, string>();
  for (let i = 0; i < emails.length; i += FIRESTORE_IN_LIMIT) {
    const chunk = emails.slice(i, i + FIRESTORE_IN_LIMIT);
    const snap = await db.collection("contacts").where("email", "in", chunk).get();
    snap.docs.forEach((doc) => {
      const email = (doc.data().email || "").toLowerCase();
      if (email) map.set(email, doc.id);
    });
  }

  const toCreate = emails.filter((e) => !map.has(e));
  for (let i = 0; i < toCreate.length; i += 500) {
    const batch = db.batch();
    const chunk = toCreate.slice(i, i + 500);
    chunk.forEach((email) => {
      const ref = db.collection("contacts").doc();
      map.set(email, ref.id);
      batch.set(ref, {
        email,
        status: "verifying",
        source: "warmup",
        segments: ["warmup", `warmup:${warmupId}`],
        engagementScore: 0,
        metadata: { warmup: true, warmupId },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();
  }

  return map;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  const doc = await db.collection("warmup_settings").doc(id).get();
  const stats = await db.collection("warmup_stats").doc(id).get();
  const statsData = stats.exists ? stats.data() : null;
  const lastRunAtDate = statsData?.lastRunAt ? toDate(statsData.lastRunAt) : null;
  const nextRunAt =
    lastRunAtDate && !isNaN(lastRunAtDate.getTime())
      ? new Date(lastRunAtDate.getTime() + WARMUP_CRON_INTERVAL_MINUTES * 60 * 1000)
      : null;

  if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    id,
    ...doc.data(),
    stats: statsData
      ? {
          ...statsData,
          nextRunAt: nextRunAt ? nextRunAt.toISOString() : null,
          assumedCronCadenceMinutes: WARMUP_CRON_INTERVAL_MINUTES,
        }
      : null,
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: warmupId } = await params;
  const db = getDb();
  const body = await req.json();

  const subject = String(body.subject || "").trim();
  const bodyHtml = String(body.body || "").trim();
  const fromEmail = String(body.fromEmail || "").trim();
  const contactEmails = normalizeEmails(body.contactEmails);

  if (!subject) return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  if (!bodyHtml) return NextResponse.json({ error: "Body is required" }, { status: 400 });
  if (!fromEmail) return NextResponse.json({ error: "From email is required" }, { status: 400 });

  const validEmails = contactEmails.filter((e) => EMAIL_REGEX.test(e));
  const invalidFormat = contactEmails.filter((e) => !EMAIL_REGEX.test(e));
  const personalDomains = new Set(PERSONAL_EMAIL_PROVIDERS);
  const personal = validEmails.filter((e) => personalDomains.has(e.split("@")[1]?.toLowerCase() || ""));
  const toVerify = validEmails.filter((e) => !personal.includes(e));

  const emailToId = await resolveOrCreate(db, validEmails, warmupId);
  const verification = toVerify.length ? await verifyEmailBatch(toVerify) : { valid: [], invalid: [], needsVerification: [] };

  const verifiedEmails = [
    ...personal.map((e) => e.toLowerCase()),
    ...verification.valid.map((v) => v.email.toLowerCase()),
  ];
  const invalidEmails = [
    ...invalidFormat,
    ...verification.invalid.map((v) => v.email.toLowerCase()),
  ];
  const verifiedIds = verifiedEmails.map((e) => emailToId.get(e)).filter(Boolean) as string[];

  const batch = db.batch();
  verifiedEmails.forEach((email) => {
    const id = emailToId.get(email);
    if (id) batch.update(db.collection("contacts").doc(id), { status: "verified", updatedAt: FieldValue.serverTimestamp() });
  });
  invalidEmails.forEach((email) => {
    const id = emailToId.get(email);
    if (id) batch.update(db.collection("contacts").doc(id), { status: "invalid", updatedAt: FieldValue.serverTimestamp() });
  });
  await batch.commit();

  await db.collection("warmup_settings").doc(warmupId).set(
    {
      name: body.name || warmupId,
      active: body.active !== undefined ? !!body.active : true,
      subject,
      body: bodyHtml,
      fromEmail,
      contactEmails,
      contactIds: verifiedIds,
      unmatchedEmails: invalidEmails,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: (session as any)?.email || (session as any)?.user?.email || "admin",
    },
    { merge: true }
  );

  return NextResponse.json({
    success: true,
    id: warmupId,
    verified: verifiedIds.length,
    invalid: invalidEmails.length,
    total: contactEmails.length,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const { id } = await params;
  const { active } = await req.json();
  await db.collection("warmup_settings").doc(id).set(
    { active: !!active, updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
  return NextResponse.json({ success: true, active: !!active });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const { id } = await params;
  await db.collection("warmup_settings").doc(id).set(
    { active: false, updatedAt: FieldValue.serverTimestamp(), deletedAt: FieldValue.serverTimestamp() },
    { merge: true }
  );
  return NextResponse.json({ success: true });
}

