import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/config";

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const jobsSnapshot = await db
      .collection("jobs")
      .where("status", "==", "published")
      .orderBy("publishedAt", "desc")
      .get();

    const jobs = jobsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        slug: data.slug,
        department: data.department,
        location: data.location,
        type: data.type,
        excerpt: data.excerpt || "",
        publishedAt: data.publishedAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching careers:", error);
    return NextResponse.json(
      { error: "Failed to fetch careers" },
      { status: 500 }
    );
  }
}

