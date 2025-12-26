import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";
import { EmailTemplate } from "@/lib/types/email";

/**
 * GET /admin/emails/api/templates/[id]
 * Get email template by ID
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
    const doc = await db.collection("email_templates").doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const template: EmailTemplate = {
      id: doc.id,
      ...doc.data(),
    } as EmailTemplate;

    return NextResponse.json(template);
  } catch (error: any) {
    console.error("Error fetching email template:", error);
    return NextResponse.json(
      { error: "Failed to fetch email template", details: error.message },
      { status: 500 }
    );
  }
}

