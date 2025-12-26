import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";
import { Campaign } from "@/lib/types/segment";

/**
 * POST /admin/emails/api/schedule
 * Schedule email campaign for future send
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { campaignId, scheduledAt } = body;

    if (!campaignId || !scheduledAt) {
      return NextResponse.json(
        { error: "Campaign ID and scheduledAt are required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const docRef = db.collection("contact_segments").doc(campaignId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    await docRef.update({
      status: "scheduled",
      scheduledAt,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error scheduling email campaign:", error);
    return NextResponse.json(
      { error: "Failed to schedule email campaign", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /admin/emails/api/schedule
 * Cancel scheduled email
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");

    if (!campaignId) {
      return NextResponse.json({ error: "Campaign ID is required" }, { status: 400 });
    }

    const db = getDb();
    const docRef = db.collection("contact_segments").doc(campaignId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    await docRef.update({
      status: "draft",
      scheduledAt: null,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error cancelling scheduled email:", error);
    return NextResponse.json(
      { error: "Failed to cancel scheduled email", details: error.message },
      { status: 500 }
    );
  }
}

