import { getDb } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";

export type SendQueuePayload = {
  campaignId: string;
  contactIds: string[];
  subject: string;
  fromEmail: string;
  replyTo?: string;
  htmlContent: string;
  textContent: string;
  runAfter: Date;
};

export async function enqueueSendBatch(payload: SendQueuePayload): Promise<string> {
  const db = getDb();

  const docRef = db.collection("send_queue").doc();
  await docRef.set({
    ...payload,
    status: "pending",
    attempts: 0,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return docRef.id;
}

export async function enqueueSendBatches(
  payloads: SendQueuePayload[]
): Promise<number> {
  if (payloads.length === 0) return 0;

  const db = getDb();
  const batch = db.batch();

  payloads.forEach((payload) => {
    const docRef = db.collection("send_queue").doc();
    batch.set(docRef, {
      ...payload,
      status: "pending",
      attempts: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
  return payloads.length;
}

export type QueuedSend = {
  id: string;
  campaignId: string;
  contactIds: string[];
  subject: string;
  fromEmail: string;
  replyTo?: string;
  htmlContent: string;
  textContent: string;
  runAfter: Date;
  attempts: number;
};

/**
 * Fetch due queue items and atomically mark them processing
 */
export async function claimDueQueueItems(
  limit: number = 10
): Promise<QueuedSend[]> {
  const db = getDb();
  const now = new Date();

  const snapshot = await db
    .collection("send_queue")
    .where("status", "==", "pending")
    .where("runAfter", "<=", now)
    .orderBy("runAfter", "asc")
    .limit(limit)
    .get();

  if (snapshot.empty) return [];

  const claimed: QueuedSend[] = [];

  for (const doc of snapshot.docs) {
    await db.runTransaction(async (txn) => {
      const fresh = await txn.get(doc.ref);
      if (!fresh.exists) return;
      if (fresh.get("status") !== "pending") return;

      txn.update(doc.ref, {
        status: "processing",
        attempts: (fresh.get("attempts") || 0) + 1,
        startedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      const data = fresh.data() as any;
      claimed.push({
        id: doc.id,
        campaignId: data.campaignId,
        contactIds: data.contactIds || [],
        subject: data.subject,
        fromEmail: data.fromEmail,
        replyTo: data.replyTo,
        htmlContent: data.htmlContent,
        textContent: data.textContent,
        runAfter: data.runAfter?.toDate ? data.runAfter.toDate() : new Date(data.runAfter),
        attempts: (data.attempts || 0) + 1,
      });
    });
  }

  return claimed;
}

export async function markQueueItemCompleted(
  id: string,
  result: { sent: number; failed: number }
) {
  const db = getDb();
  await db.collection("send_queue").doc(id).update({
    status: "completed",
    sent: result.sent,
    failed: result.failed,
    completedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function markQueueItemFailed(
  id: string,
  attempts: number,
  error: string
) {
  const db = getDb();

  const maxAttempts = 3;
  const backoffMinutes = Math.min(60, attempts * 5);
  const nextRun = new Date(Date.now() + backoffMinutes * 60 * 1000);

  if (attempts >= maxAttempts) {
    await db.collection("send_queue").doc(id).update({
      status: "failed",
      error,
      updatedAt: FieldValue.serverTimestamp(),
      completedAt: FieldValue.serverTimestamp(),
    });
    return;
  }

  await db.collection("send_queue").doc(id).update({
    status: "pending",
    error,
    runAfter: nextRun,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

