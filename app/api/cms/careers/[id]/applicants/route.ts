import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";

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
    
    // Fetch job title once for all applications
    let jobTitle = "";
    try {
      const jobDoc = await db.collection("jobs").doc(id).get();
      if (jobDoc.exists) {
        jobTitle = jobDoc.data()?.title || "";
      }
    } catch (error) {
      console.error("Error fetching job title:", error);
    }
    
    const applicationsSnapshot = await db
      .collection("applications")
      .where("jobId", "==", id)
      .orderBy("createdAt", "desc")
      .get();

    const applications = applicationsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        jobId: data.jobId,
        jobTitle: jobTitle, // Fetch from jobId
        name: data.name,
        email: data.email,
        status: data.status || "applied",
        resumeUrl: data.resumeUrl || null,
        coverLetter: data.coverLetter || "",
        statusHistory: (data.statusHistory || []).map((entry: any) => ({
          status: entry.status,
          timestamp: entry.timestamp?.toDate?.()?.toISOString() || null,
          modifiedBy: entry.modifiedBy,
          notes: entry.notes || "",
        })),
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        updatedBy: data.updatedBy || "",
      };
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return NextResponse.json(
      { error: "Failed to fetch applicants" },
      { status: 500 }
    );
  }
}

