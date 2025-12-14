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
    const doc = await db.collection("jobs").doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    const data = doc.data()!;
    
    // If job uses a form template, fetch the form fields
    let formFields = data.formFields || [];
    if (data.applicationFormId) {
      try {
        const formDoc = await db.collection("applicationForms").doc(data.applicationFormId).get();
        if (formDoc.exists) {
          formFields = formDoc.data()?.formFields || [];
        }
      } catch (error) {
        console.error("Error fetching application form:", error);
      }
    }

    return NextResponse.json({
      id: doc.id,
      title: data.title,
      slug: data.slug,
      department: data.department,
      location: data.location,
      type: data.type,
      jdContent: data.jdContent || "",
      jdPdfUrl: data.jdPdfUrl || null,
      excerpt: data.excerpt || "",
      formFields: formFields,
      applicationFormId: data.applicationFormId || null,
      formSource: data.applicationFormId ? "template" : "custom",
      status: data.status || "draft",
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      createdBy: data.createdBy || "",
      updatedBy: data.updatedBy || "",
      publishedAt: data.publishedAt?.toDate?.()?.toISOString() || null,
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
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
    const docRef = db.collection("jobs").doc(id);

    // Check if document exists
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Check if slug is being changed and if it conflicts
    if (body.slug && body.slug !== doc.data()?.slug) {
      const existing = await db.collection("jobs").where("slug", "==", body.slug).get();
      if (!existing.empty && existing.docs[0].id !== id) {
        return NextResponse.json(
          { error: "A job with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: session.email,
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.department !== undefined) updateData.department = body.department;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.jdContent !== undefined) updateData.jdContent = body.jdContent;
    if (body.jdPdfUrl !== undefined) updateData.jdPdfUrl = body.jdPdfUrl;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    
    // Handle form source: template or custom - ensure mutual exclusivity
    if (body.applicationFormId !== undefined) {
      updateData.applicationFormId = body.applicationFormId;
      // Clear formFields when using template
      if (body.applicationFormId) {
        updateData.formFields = null;
      }
    }
    if (body.formFields !== undefined) {
      updateData.formFields = body.formFields;
      // Clear applicationFormId when using custom
      if (body.formFields && body.formFields.length > 0) {
        updateData.applicationFormId = null;
      }
    }

    // Handle status changes
    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === "published" && !doc.data()?.publishedAt) {
        updateData.publishedAt = FieldValue.serverTimestamp();
      }
    }

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const data = updatedDoc.data()!;

    return NextResponse.json({
      id: updatedDoc.id,
      title: data.title,
      slug: data.slug,
      department: data.department,
      location: data.location,
      type: data.type,
      jdContent: data.jdContent || "",
      jdPdfUrl: data.jdPdfUrl || null,
      excerpt: data.excerpt || "",
      formFields: data.formFields || [],
      applicationFormId: data.applicationFormId || null,
      formSource: data.applicationFormId ? "template" : "custom",
      status: data.status || "draft",
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      createdBy: data.createdBy || "",
      updatedBy: data.updatedBy || "",
      publishedAt: data.publishedAt?.toDate?.()?.toISOString() || null,
    });
  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
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
    const docRef = db.collection("jobs").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    // Optionally: Check if there are applications and handle cascade
    const applicationsSnapshot = await db
      .collection("applications")
      .where("jobId", "==", id)
      .limit(1)
      .get();

    if (!applicationsSnapshot.empty) {
      // Don't delete if there are applications, just close the job
      await docRef.update({
        status: "closed",
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: session.email,
      });
      return NextResponse.json({ success: true, message: "Job closed (has applications)" });
    }

    await docRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting job:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}

