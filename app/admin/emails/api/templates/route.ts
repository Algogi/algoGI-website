import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";
import { EmailTemplate } from "@/lib/types/email";

/**
 * GET /admin/emails/api/templates
 * List all email templates
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search") || "";

    const db = getDb();
    let query = db.collection("email_templates").orderBy("createdAt", "desc");

    if (category) {
      query = query.where("category", "==", category) as any;
    }

    const snapshot = await query.get();
    let templates: EmailTemplate[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as EmailTemplate[];

    if (search) {
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json(templates);
  } catch (error: any) {
    console.error("Error fetching email templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch email templates", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /admin/emails/api/templates
 * Create new email template
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, category, content, thumbnail } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const now = new Date().toISOString();

    const templateData: Omit<EmailTemplate, "id"> = {
      name,
      description: description || "",
      category,
      content: content || [],
      thumbnail: thumbnail || null,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection("email_templates").add(templateData);

    return NextResponse.json({
      id: docRef.id,
      ...templateData,
    });
  } catch (error: any) {
    console.error("Error creating email template:", error);
    return NextResponse.json(
      { error: "Failed to create email template", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /admin/emails/api/templates
 * Update email template
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    const db = getDb();
    const docRef = db.collection("email_templates").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    await docRef.update({
      ...updateData,
      updatedAt: new Date().toISOString(),
    });

    const updatedDoc = await docRef.get();
    return NextResponse.json({
      id: updatedDoc.id,
      ...updatedDoc.data(),
    });
  } catch (error: any) {
    console.error("Error updating email template:", error);
    return NextResponse.json(
      { error: "Failed to update email template", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /admin/emails/api/templates
 * Delete email template
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
    }

    const db = getDb();
    const docRef = db.collection("email_templates").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting email template:", error);
    return NextResponse.json(
      { error: "Failed to delete email template", details: error.message },
      { status: 500 }
    );
  }
}


