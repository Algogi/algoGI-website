import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";
import { verifyEmailBatch } from "@/lib/utils/email-validation";
import { PERSONAL_EMAIL_PROVIDERS } from "@/lib/utils/work-email";

const COLLECTION = "warmup_settings";
const DOC_ID = "default";
const FIRESTORE_IN_LIMIT = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmails(emails: string[] | undefined): string[] {
  if (!Array.isArray(emails)) return [];
  return Array.from(
    new Set(
      emails
        .map((e) => (typeof e === "string" ? e.trim().toLowerCase() : ""))
        .filter(Boolean)
    )
  );
}

async function resolveOrCreateContacts(db: FirebaseFirestore.Firestore, emails: string[]) {
  const emailToId = new Map<string, string>();
  // Because Firestore "in" is limited, chunk manually
  for (let i = 0; i < emails.length; i += FIRESTORE_IN_LIMIT) {
    const chunk = emails.slice(i, i + FIRESTORE_IN_LIMIT);
    const snapshot = await db
      .collection("contacts")
      .where("email", "in", chunk)
      .get();

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const email = (data.email || "").toLowerCase();
      if (email) {
        emailToId.set(email, doc.id);
      }
    });
  }

  const toCreate = emails.filter((e) => !emailToId.has(e));

  if (toCreate.length > 0) {
    for (let i = 0; i < toCreate.length; i += 500) {
      const chunk = toCreate.slice(i, i + 500);
      const batch = db.batch();
      chunk.forEach((email) => {
        const docRef = db.collection("contacts").doc();
        emailToId.set(email, docRef.id);
        batch.set(docRef, {
          email,
          status: "verifying",
          source: "warmup",
          segments: ["warmup"],
          engagementScore: 0,
          metadata: { warmup: true },
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
    }
  }

  return {
    emailToId,
    created: toCreate.length,
  };
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const doc = await db.collection(COLLECTION).doc(DOC_ID).get();

    if (!doc.exists) {
      return NextResponse.json({
        active: false,
        subject: "Warm-up email from AlgoGI",
        body: `
          <h1>Hello from AlgoGI</h1>
          <p>This is a warm-up email to maintain sender reputation.</p>
          <p>Thank you for being part of our community!</p>
        `,
        fromEmail: process.env.SMTP_FROM_EMAIL || "",
        contactEmails: [],
        contactIds: [],
        updatedAt: null,
      });
    }

    return NextResponse.json(doc.data());
  } catch (error: any) {
    console.error("Error fetching warmup settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch warmup settings", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const subject = String(body.subject || "").trim();
    const emailBody = String(body.body || "").trim();
    const fromEmail = String(body.fromEmail || process.env.SMTP_FROM_EMAIL || "").trim();
    const active = Boolean(body.active);
    const contactEmails = normalizeEmails(body.contactEmails || body.contacts);

    if (!subject) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }
    if (!emailBody) {
      return NextResponse.json({ error: "Body is required" }, { status: 400 });
    }
    if (!fromEmail) {
      return NextResponse.json({ error: "From email is required" }, { status: 400 });
    }

    const db = getDb();
    // Validate formats
    const invalidFormat = contactEmails.filter((e) => !EMAIL_REGEX.test(e));
    const validEmails = contactEmails.filter((e) => EMAIL_REGEX.test(e));

    const { emailToId, created } = await resolveOrCreateContacts(db, validEmails);

    // Verify emails (MX-only)
    // Personal providers (e.g., gmail) are allowed for warmup; mark them as verified after MX check.
    const personalDomains = new Set(PERSONAL_EMAIL_PROVIDERS);
    const personalEmails = validEmails.filter((e) => {
      const domain = e.split("@")[1]?.toLowerCase();
      return domain && personalDomains.has(domain);
    });

    // Run MX-only verification for non-personal domains
    const toVerify = validEmails.filter((e) => !personalEmails.includes(e));
    const verification = toVerify.length > 0 ? await verifyEmailBatch(toVerify) : { valid: [], invalid: [], needsVerification: [] };

    const verifiedEmails = [
      ...personalEmails.map((e) => e.toLowerCase()),
      ...verification.valid.map((v) => v.email.toLowerCase()),
    ];
    const invalidEmails = verification.invalid.map((v) => v.email.toLowerCase());

    // Update statuses based on verification
    const batch = db.batch();

    const updateStatus = (emails: string[], status: string) => {
      for (let i = 0; i < emails.length; i += FIRESTORE_IN_LIMIT) {
        const chunk = emails.slice(i, i + FIRESTORE_IN_LIMIT);
        chunk.forEach((email) => {
          const id = emailToId.get(email);
          if (!id) return;
          const ref = db.collection("contacts").doc(id);
          batch.update(ref, {
            status,
            updatedAt: FieldValue.serverTimestamp(),
          });
        });
      }
    };

    updateStatus(verifiedEmails, "verified");
    updateStatus(invalidEmails, "invalid");

    await batch.commit();

    const verifiedIds = verifiedEmails
      .map((e) => emailToId.get(e))
      .filter(Boolean) as string[];

    const unmatched = [...invalidFormat];
    const notFound = validEmails.filter((e) => !emailToId.has(e));
    unmatched.push(...notFound);

    const payload = {
      active,
      subject,
      body: emailBody,
      fromEmail,
      contactEmails,
      contactIds: verifiedIds,
      unmatchedEmails: unmatched,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: (session as any)?.email || (session as any)?.user?.email || "admin",
    };

    await db.collection(COLLECTION).doc(DOC_ID).set(payload, { merge: true });

    return NextResponse.json({
      success: true,
      contactIds: verifiedIds.length,
      contactEmails: contactEmails.length,
      unmatchedEmails: unmatched,
      created,
      verified: verifiedIds.length,
      invalid: invalidEmails.length,
      active,
    });
  } catch (error: any) {
    console.error("Error updating warmup settings:", error);
    return NextResponse.json(
      { error: "Failed to update warmup settings", details: error.message },
      { status: 500 }
    );
  }
}

