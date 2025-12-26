import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/config";

/**
 * GET /admin/emails/api/track/click
 * Click tracking endpoint - records click and redirects
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    const campaignId = searchParams.get("campaignId");
    const blockId = searchParams.get("blockId");
    const recipientId = searchParams.get("recipientId");

    if (!url) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Track click if we have campaign info
    if (campaignId) {
      const db = getDb();
      const analyticsDoc = await db.collection("email_analytics").doc(campaignId).get();
      
      if (analyticsDoc.exists) {
        const analytics = analyticsDoc.data();
        const recipientAnalytics = analytics?.recipientAnalytics || [];
        
        // Try to find recipient by email or ID
        // recipientId is sanitized email (with _ instead of special chars)
        let recipientIndex = -1;
        if (recipientId) {
          recipientIndex = recipientAnalytics.findIndex(
            (r: any) => {
              const sanitizedEmail = r.email?.replace(/[^a-zA-Z0-9]/g, "_");
              return r.email === recipientId || sanitizedEmail === recipientId || r.email?.toLowerCase() === recipientId.toLowerCase();
            }
          );
        }
        
        if (recipientIndex >= 0) {
          const recipient = recipientAnalytics[recipientIndex];
          const clickedLinks = recipient.clickedLinks || [];
          
          if (!clickedLinks.includes(url)) {
            clickedLinks.push(url);
          }
          
          recipientAnalytics[recipientIndex] = {
            ...recipient,
            clicked: true,
            clickedAt: recipient.clickedAt || new Date().toISOString(),
            clickedLinks,
          };
          
          // Update analytics
          const totalClicked = recipientAnalytics.filter((r: any) => r.clicked).length;
          const uniqueClicked = totalClicked;
          const totalSent = (analytics as any)?.totalSent || 0;
          const clickRate = totalSent > 0 ? (uniqueClicked / totalSent) * 100 : 0;
          
          await db.collection("email_analytics").doc(campaignId).update({
            recipientAnalytics,
            totalClicked,
            uniqueClicked,
            clickRate,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    // Redirect to original URL
    return NextResponse.redirect(new URL(url));
  } catch (error: any) {
    console.error("Error tracking email click:", error);
    // Still redirect even on error
    const url = new URL(request.url).searchParams.get("url");
    if (url) {
      return NextResponse.redirect(new URL(url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }
}

