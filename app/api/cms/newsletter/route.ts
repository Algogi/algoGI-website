import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    // Check if newsletter collection exists, if not return empty array
    let newsletterSnapshot;
    try {
      newsletterSnapshot = await db.collection("newsletter").orderBy("subscribedAt", "desc").get();
    } catch (error) {
      // Collection might not exist yet
      return NextResponse.json([]);
    }

    const subscribers = newsletterSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        subscribedAt: data.subscribedAt?.toDate?.()?.toISOString() || null,
        source: data.source || "unknown",
      };
    });

    return NextResponse.json(subscribers);
  } catch (error) {
    console.error("Error fetching newsletter subscribers:", error);
    return NextResponse.json(
      { error: "Failed to fetch newsletter subscribers" },
      { status: 500 }
    );
  }
}

