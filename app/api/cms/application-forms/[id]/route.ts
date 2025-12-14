import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const doc = await db.collection("applicationForms").doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Application form not found" },
        { status: 404 }
      );
    }

    const data = doc.data()!;
    return NextResponse.json({
      id: doc.id,
      name: data.name,
      description: data.description || "",
      formFields: data.formFields || [],
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      createdBy: data.createdBy || "",
      updatedBy: data.updatedBy || "",
    });
  } catch (error) {
    console.error("Error fetching application form:", error);
    return NextResponse.json(
      { error: "Failed to fetch application form" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const db = getDb();
    const docRef = db.collection("applicationForms").doc(id);

    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json(
        { error: "Application form not found" },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: session.email,
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.formFields !== undefined) updateData.formFields = body.formFields;

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const data = updatedDoc.data()!;

    return NextResponse.json({
      id: updatedDoc.id,
      name: data.name,
      description: data.description || "",
      formFields: data.formFields || [],
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      createdBy: data.createdBy || "",
      updatedBy: data.updatedBy || "",
    });
  } catch (error) {
    console.error("Error updating application form:", error);
    return NextResponse.json(
      { error: "Failed to update application form" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const docRef = db.collection("applicationForms").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Application form not found" },
        { status: 404 }
      );
    }

    // Check if form is being used by any jobs
    const jobsSnapshot = await db
      .collection("jobs")
      .where("applicationFormId", "==", id)
      .limit(1)
      .get();

    if (!jobsSnapshot.empty) {
      return NextResponse.json(
        { error: "Cannot delete form: It is being used by one or more jobs" },
        { status: 400 }
      );
    }

    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting application form:", error);
    return NextResponse.json(
      { error: "Failed to delete application form" },
      { status: 500 }
    );
  }
}

