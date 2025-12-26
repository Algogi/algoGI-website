import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/config";

/**
 * GET /admin/emails/api/track/open/[campaignId]/[recipientId]
 * Tracking pixel endpoint - records email open
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string; recipientId: string }> }
) {
  try {
    const { campaignId, recipientId } = await params;
    const db = getDb();

    // Get analytics document
    const analyticsDoc = await db.collection("email_analytics").doc(campaignId).get();
    
    if (analyticsDoc.exists) {
      const analytics = analyticsDoc.data();
      const recipientAnalytics = analytics?.recipientAnalytics || [];
      
      // Find and update recipient analytics
      // recipientId is sanitized email (with _ instead of special chars)
      // We need to match against both the sanitized version and the original email
      const recipientIndex = recipientAnalytics.findIndex(
        (r: any) => {
          const sanitizedEmail = r.email?.replace(/[^a-zA-Z0-9]/g, "_");
          return r.email === recipientId || sanitizedEmail === recipientId || r.email?.toLowerCase() === recipientId.toLowerCase();
        }
      );
      
      if (recipientIndex >= 0) {
        const recipient = recipientAnalytics[recipientIndex];
        if (!recipient.opened) {
          recipientAnalytics[recipientIndex] = {
            ...recipient,
            opened: true,
            openedAt: new Date().toISOString(),
          };
          
          // Update analytics
          const totalOpened = recipientAnalytics.filter((r: any) => r.opened).length;
          const uniqueOpened = totalOpened;
          const openRate = analytics.totalSent > 0 ? (uniqueOpened / analytics.totalSent) * 100 : 0;
          
          await db.collection("email_analytics").doc(campaignId).update({
            recipientAnalytics,
            totalOpened: totalOpened,
            uniqueOpened,
            openRate,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    // Return 1x1 transparent pixel
    const pixel = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    );

    return new NextResponse(pixel, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error: any) {
    console.error("Error tracking email open:", error);
    // Still return pixel even on error
    const pixel = Buffer.from(
      "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      "base64"
    );
    return new NextResponse(pixel, {
      headers: {
        "Content-Type": "image/gif",
      },
    });
  }
}

