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
    const testimonialsRef = db.collection("testimonials");
    const snapshot = await testimonialsRef.orderBy("order", "asc").get();

    const testimonials = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { error: "Failed to fetch testimonials" },
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
    const requiredFields = ["quote", "author", "role", "rating"];
    const missingFields = requiredFields.filter((field) => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Validate rating
    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Get the highest order number
    const snapshot = await db.collection("testimonials").orderBy("order", "desc").limit(1).get();
    const maxOrder = snapshot.empty ? 0 : snapshot.docs[0].data().order || 0;

    const testimonialData = {
      ...body,
      order: maxOrder + 1,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection("testimonials").add(testimonialData);

    return NextResponse.json(
      { id: docRef.id, ...testimonialData },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
      { status: 500 }
    );
  }
}

