import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/config";

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const portfolioRef = db.collection("portfolio");
    const snapshot = await portfolioRef.orderBy("order", "asc").get();

    const portfolio = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(portfolio, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    // Fallback to static data if Firestore fails
    try {
      const { caseStudies } = await import("@/app/case-studies/case-studies-data");
      return NextResponse.json(caseStudies);
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch portfolio" },
        { status: 500 }
      );
    }
  }
}

