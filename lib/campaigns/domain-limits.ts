import { getDb } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";

const MAX_HOURLY = 200;
const MAX_DAILY = 800;

type DomainLimitDoc = {
  hourlyCount?: number;
  hourlyStart?: FirebaseFirestore.Timestamp;
  dailyCount?: number;
  dailyStart?: FirebaseFirestore.Timestamp;
};

function resetIfWindowPassed(doc: DomainLimitDoc, now: Date) {
  const hourlyStart = doc.hourlyStart?.toDate?.() || new Date(0);
  const dailyStart = doc.dailyStart?.toDate?.() || new Date(0);
  const nextHour = hourlyStart.getTime() + 60 * 60 * 1000;
  const nextDay = dailyStart.getTime() + 24 * 60 * 60 * 1000;

  return {
    hourlyCount: now.getTime() >= nextHour ? 0 : doc.hourlyCount || 0,
    hourlyStart: now.getTime() >= nextHour ? now : hourlyStart,
    dailyCount: now.getTime() >= nextDay ? 0 : doc.dailyCount || 0,
    dailyStart: now.getTime() >= nextDay ? now : dailyStart,
  };
}

export async function checkDomainLimits(
  domainCounts: Map<string, number>
): Promise<{ allowed: Map<string, number>; blocked: Map<string, number> }> {
  const db = getDb();
  const now = new Date();
  const allowed = new Map<string, number>();
  const blocked = new Map<string, number>();

  for (const [domain, requested] of domainCounts.entries()) {
    const ref = db.collection("sending_limits").doc(domain);
    const snap = await ref.get();
    const data = (snap.exists ? (snap.data() as DomainLimitDoc) : {}) || {};
    const windowed = resetIfWindowPassed(data, now);

    const availableHourly = Math.max(0, MAX_HOURLY - windowed.hourlyCount);
    const availableDaily = Math.max(0, MAX_DAILY - windowed.dailyCount);
    const allowedCount = Math.min(requested, availableHourly, availableDaily);

    if (allowedCount > 0) {
      allowed.set(domain, allowedCount);
    }
    if (requested > allowedCount) {
      blocked.set(domain, requested - allowedCount);
    }
  }

  return { allowed, blocked };
}

export async function incrementDomainUsage(domainCounts: Map<string, number>) {
  const db = getDb();
  const now = new Date();

  for (const [domain, count] of domainCounts.entries()) {
    const ref = db.collection("sending_limits").doc(domain);
    await db.runTransaction(async (txn) => {
      const snap = await txn.get(ref);
      const data = (snap.exists ? (snap.data() as DomainLimitDoc) : {}) || {};
      const windowed = resetIfWindowPassed(data, now);

      txn.set(
        ref,
        {
          hourlyCount: (windowed.hourlyCount || 0) + count,
          hourlyStart: windowed.hourlyStart || now,
          dailyCount: (windowed.dailyCount || 0) + count,
          dailyStart: windowed.dailyStart || now,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    });
  }
}

