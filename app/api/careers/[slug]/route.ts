import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/config";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = getDb();
    const jobsSnapshot = await db
      .collection("jobs")
      .where("slug", "==", slug)
      .where("status", "==", "published")
      .limit(1)
      .get();

    if (jobsSnapshot.empty) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    const doc = jobsSnapshot.docs[0];
    const data = doc.data();

    // If job uses a form template, fetch the form fields from the template
    let formFields = data.formFields || [];
    if (data.applicationFormId) {
      try {
        const formDoc = await db.collection("applicationForms").doc(data.applicationFormId).get();
        if (formDoc.exists) {
          formFields = formDoc.data()?.formFields || [];
        }
      } catch (error) {
        console.error("Error fetching application form:", error);
        // Fall back to empty array if form fetch fails
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
      formFields: formFields,
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

