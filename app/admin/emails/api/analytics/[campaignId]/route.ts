import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";
import { EmailAnalytics } from "@/lib/types/email";

/**
 * GET /admin/emails/api/analytics/[campaignId]
 * Get analytics for specific campaign
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { campaignId } = await params;
    const db = getDb();
    const analyticsDoc = await db.collection("email_analytics").doc(campaignId).get();

    if (!analyticsDoc.exists) {
      // Return empty analytics if not found
      return NextResponse.json({
        campaignId,
        totalSent: 0,
        totalDelivered: 0,
        totalOpened: 0,
        uniqueOpened: 0,
        totalClicked: 0,
        uniqueClicked: 0,
        totalBounced: 0,
        totalUnsubscribed: 0,
        openRate: 0,
        clickRate: 0,
        bounceRate: 0,
        recipientAnalytics: [],
      });
    }

    return NextResponse.json({
      id: analyticsDoc.id,
      ...analyticsDoc.data(),
    });
  } catch (error: any) {
    console.error("Error fetching email analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch email analytics", details: error.message },
      { status: 500 }
    );
  }
}


