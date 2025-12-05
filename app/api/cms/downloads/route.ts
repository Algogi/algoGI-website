import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/config";
import { getSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const downloadsRef = db.collection("downloads");
    const snapshot = await downloadsRef.orderBy("downloadedAt", "desc").get();

    const downloads = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email || "",
        name: data.name || "",
        company: data.company || "",
        fileIdentifier: data.fileIdentifier || "",
        fileType: data.fileType || "",
        caseStudyTitle: data.caseStudyTitle || "",
        downloadedAt: data.downloadedAt?.toDate?.()?.toISOString() || null,
        downloadMethod: data.downloadMethod || "email_link",
        ipAddress: data.ipAddress || null,
      };
    });

    return NextResponse.json(downloads);
  } catch (error) {
    console.error("Error fetching downloads:", error);
    return NextResponse.json(
      { error: "Failed to fetch downloads" },
      { status: 500 }
    );
  }
}

