import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const jobsSnapshot = await db.collection("jobs").orderBy("createdAt", "desc").get();

    const jobs = jobsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        slug: data.slug,
        department: data.department,
        location: data.location,
        type: data.type,
        status: data.status || "draft",
        formFields: data.formFields || [],
        applicationFormId: data.applicationFormId || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        createdBy: data.createdBy || "",
        updatedBy: data.updatedBy || "",
        publishedAt: data.publishedAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.slug || !body.department || !body.location || !body.type) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug, department, location, type" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check if slug already exists
    const existing = await db.collection("jobs").where("slug", "==", body.slug).get();
    if (!existing.empty) {
      return NextResponse.json(
        { error: "A job with this slug already exists" },
        { status: 400 }
      );
    }

    const jobData: any = {
      title: body.title,
      slug: body.slug,
      department: body.department,
      location: body.location,
      type: body.type,
      jdContent: body.jdContent || "",
      jdPdfUrl: body.jdPdfUrl || null,
      status: body.status || "draft",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      createdBy: session.email,
      updatedBy: session.email,
      publishedAt: body.status === "published" ? FieldValue.serverTimestamp() : null,
    };

    // Handle form source: template or custom
    if (body.applicationFormId) {
      jobData.applicationFormId = body.applicationFormId;
      // Don't store formFields when using template
    } else {
      jobData.formFields = body.formFields || [];
      jobData.applicationFormId = null;
    }

    const docRef = await db.collection("jobs").add(jobData);

    return NextResponse.json({
      id: docRef.id,
      ...jobData,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}

