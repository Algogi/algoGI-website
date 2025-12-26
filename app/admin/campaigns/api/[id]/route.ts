import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";
import { Segment, CampaignStatus } from "@/lib/types/segment";
import { EmailBlock } from "@/lib/types/email";

/**
 * GET /admin/campaigns/api/[id]
 * Get campaign details
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
    const campaign: Segment = {
      id: doc.id,
      name: data?.name || "",
      description: data?.description,
      criteria: data?.criteria,
      contactCount: data?.contactCount || data?.totalContacts || 0,
      // Campaign fields - ensure empty strings are returned if field exists but is empty
      subject: data?.subject ?? "",
      fromEmail: data?.fromEmail ?? "",
      replyTo: data?.replyTo ?? "",
      templateId: data?.templateId,
      content: data?.content,
      htmlContent: data?.htmlContent,
      textContent: data?.textContent,
      status: data?.status || "draft",
      isActive: data?.isActive || false,
      smtpVerified: data?.smtpVerified || false,
      smtpVerifiedAt: data?.smtpVerifiedAt,
      totalContacts: data?.totalContacts || data?.contactCount || 0,
      sentContacts: data?.sentContacts || 0,
      emailsPerHour: data?.emailsPerHour,
      startedAt: data?.startedAt,
      pausedAt: data?.pausedAt,
      completedAt: data?.completedAt,
      createdAt: data?.createdAt?.toDate?.() || new Date(),
      updatedAt: data?.updatedAt?.toDate?.() || new Date(),
      createdBy: data?.createdBy,
    };

    return NextResponse.json(campaign);
  } catch (error: any) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /admin/campaigns/api/[id]
 * Update campaign
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const db = getDb();
    const docRef = db.collection("contact_segments").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Update only provided fields
    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.criteria !== undefined) updateData.criteria = body.criteria;
    // Save subject, fromEmail, and replyTo (including empty strings when provided)
    if (body.subject !== undefined) updateData.subject = body.subject;
    if (body.fromEmail !== undefined) updateData.fromEmail = body.fromEmail;
    if (body.replyTo !== undefined) updateData.replyTo = body.replyTo;
    if (body.templateId !== undefined) updateData.templateId = body.templateId;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.htmlContent !== undefined) updateData.htmlContent = body.htmlContent;
    if (body.textContent !== undefined) updateData.textContent = body.textContent;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.smtpVerified !== undefined) updateData.smtpVerified = body.smtpVerified;
    if (body.smtpVerifiedAt !== undefined) updateData.smtpVerifiedAt = body.smtpVerifiedAt;
    if (body.totalContacts !== undefined) {
      updateData.totalContacts = body.totalContacts;
      updateData.contactCount = body.totalContacts; // Keep both in sync
    }
    if (body.sentContacts !== undefined) updateData.sentContacts = body.sentContacts;
    if (body.emailsPerHour !== undefined) updateData.emailsPerHour = body.emailsPerHour;
    if (body.startedAt !== undefined) updateData.startedAt = body.startedAt;
    if (body.pausedAt !== undefined) updateData.pausedAt = body.pausedAt;
    if (body.completedAt !== undefined) updateData.completedAt = body.completedAt;

    // Remove undefined fields
    const cleanedUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );

    await docRef.update(cleanedUpdateData);

    const updatedDoc = await docRef.get();
    const updatedData = updatedDoc.data();

    return NextResponse.json({
      id: updatedDoc.id,
      ...updatedData,
    });
  } catch (error: any) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { error: "Failed to update campaign", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /admin/campaigns/api/[id]
 * Delete campaign
 */
export async function DELETE(
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
    const docRef = db.collection("contact_segments").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign", details: error.message },
      { status: 500 }
    );
  }
}
