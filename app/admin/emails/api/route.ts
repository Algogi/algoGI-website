import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";

/**
 * GET /admin/emails/api
 * List all email campaigns (from contact_segments with email content)
 * NOTE: This endpoint is for backward compatibility. New code should use /admin/campaigns/api
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Redirect to campaigns API for consistency
    // This maintains backward compatibility for any code still using this endpoint
    const { searchParams } = new URL(request.url);
    const campaignsUrl = `/admin/campaigns/api?${searchParams.toString()}`;
    
    // For now, return campaigns from contact_segments
    const db = getDb();
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "50", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");

    let query = db.collection("contact_segments").orderBy("createdAt", "desc");

    if (status) {
      query = query.where("status", "==", status) as any;
    }

    const snapshot = await query.get();
    let campaigns = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        subject: data.subject,
        fromEmail: data.fromEmail,
        replyTo: data.replyTo,
        templateId: data.templateId,
        content: data.content,
        htmlContent: data.htmlContent,
        textContent: data.textContent,
        status: data.status || "draft",
        isActive: data.isActive || false,
        totalContacts: data.totalContacts || data.contactCount || 0,
        sentContacts: data.sentContacts || 0,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        // Legacy fields for backward compatibility
        recipientType: "segments" as const,
        recipientIds: [doc.id],
        scheduledAt: data.scheduledAt,
        sentAt: data.sentAt,
      };
    });

    // Client-side search
    if (search) {
      campaigns = campaigns.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.subject?.toLowerCase().includes(search.toLowerCase()) ||
          c.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = campaigns.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedCampaigns = campaigns.slice(startIndex, endIndex);

    return NextResponse.json({
      data: paginatedCampaigns,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error: any) {
    console.error("Error fetching email campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch email campaigns", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /admin/emails/api
 * DEPRECATED: Use /admin/emails/api/templates for templates or /admin/campaigns/api for campaigns
 * This endpoint is kept for backward compatibility but redirects to templates API
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Redirect template creation to templates API
    const body = await request.json();
    const { content, htmlContent, textContent, category, description, thumbnail, name } = body;

    // If it has name and category, it's a template - use templates API
    if (name || category) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin/emails/api/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || `Template ${new Date().toISOString()}`,
          description,
          category: category || "other",
          content,
          htmlContent,
          textContent,
          thumbnail,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create template");
      }

      return NextResponse.json(await response.json());
    }

    // Otherwise, it's a campaign - redirect to campaigns API
    return NextResponse.json(
      { error: "Use /admin/campaigns/api to create campaigns or /admin/emails/api/templates to create templates" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error in POST /admin/emails/api:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: error.message },
      { status: 500 }
    );
  }
}

