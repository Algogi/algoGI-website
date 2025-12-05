import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";

interface NewsletterData {
  email: string;
  agreedToMarketing?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: NewsletterData = await request.json();

    // Validate email field
    if (!body.email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate marketing consent
    if (!body.agreedToMarketing) {
      return NextResponse.json(
        { error: "Marketing consent is required" },
        { status: 400 }
      );
    }

    // Get client IP address and referrer
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const referrer = request.headers.get("referer") || "unknown";

    // Store newsletter subscription in Firestore
    try {
      const db = getDb();
      // Check if email already exists
      const existing = await db
        .collection("newsletter")
        .where("email", "==", body.email)
        .get();

      if (existing.empty) {
        // Add new subscription
        await db.collection("newsletter").add({
          email: body.email,
          subscribedAt: FieldValue.serverTimestamp(),
          source: referrer,
          ipAddress,
          agreedToMarketing: body.agreedToMarketing || false,
        });
      } else {
        // Update existing subscription
        await existing.docs[0].ref.update({
          subscribedAt: FieldValue.serverTimestamp(),
          source: referrer,
          ipAddress,
          agreedToMarketing: body.agreedToMarketing || false,
        });
      }
    } catch (dbError) {
      console.error("Error storing newsletter subscription in Firestore:", dbError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json(
      {
        success: true,
        message: "Successfully subscribed to newsletter",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing newsletter subscription:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

