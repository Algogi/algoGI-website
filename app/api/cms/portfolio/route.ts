import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/config";
import { getSession } from "@/lib/auth/session";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const portfolioRef = db.collection("portfolio");
    const snapshot = await portfolioRef.orderBy("order", "asc").get();

    const portfolio = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
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
    const requiredFields = [
      "title",
      "challenge",
      "solution",
      "results",
      "metrics",
      "techStack",
      "isTemplate",
      "downloadFile",
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    const db = getDb();

    // Get the highest order number
    const snapshot = await db.collection("portfolio").orderBy("order", "desc").limit(1).get();
    const maxOrder = snapshot.empty ? 0 : snapshot.docs[0].data().order || 0;

    const portfolioData = {
      ...body,
      order: maxOrder + 1,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection("portfolio").add(portfolioData);

    return NextResponse.json(
      { id: docRef.id, ...portfolioData },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating portfolio item:", error);
    return NextResponse.json(
      { error: "Failed to create portfolio item" },
      { status: 500 }
    );
  }
}

