import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";

/**
 * GET /admin/campaigns/api/[id]/progress
 * Get campaign progress
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();
    const doc = await db.collection("contact_segments").doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const data = doc.data();
    if (!data) {
      return NextResponse.json({ error: "Campaign data not found" }, { status: 404 });
    }

    const totalContacts = data.totalContacts || 0;
    const sentContacts = data.sentContacts || 0;
    const progressPercentage = totalContacts > 0
      ? Math.min(100, Math.floor((sentContacts / totalContacts) * 100))
      : 0;

    // Calculate estimated completion time
    const emailsPerHour = data.emailsPerHour || 0;
    const remainingContacts = totalContacts - sentContacts;
    const estimatedHours = emailsPerHour > 0
      ? Math.ceil(remainingContacts / emailsPerHour)
      : null;
    const estimatedCompletionTime = estimatedHours
      ? new Date(Date.now() + estimatedHours * 60 * 60 * 1000).toISOString()
      : null;

    // Next send time (if active, next hour)
    const nextSendTime = data.isActive && data.status === "active"
      ? new Date(Date.now() + 60 * 60 * 1000).toISOString()
      : null;

    return NextResponse.json({
      totalContacts,
      sentContacts,
      remainingContacts,
      progressPercentage,
      emailsPerHour,
      estimatedCompletionTime,
      nextSendTime,
      status: data.status,
      isActive: data.isActive || false,
    });
  } catch (error: any) {
    console.error("Error fetching campaign progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign progress", details: error.message },
      { status: 500 }
    );
  }
}

