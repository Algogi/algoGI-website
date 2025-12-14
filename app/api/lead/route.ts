import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";
import { sendLeadNotificationEmail } from "@/lib/email/send-email";

interface LeadData {
  name: string;
  email: string;
  company: string;
  projectDescription: string;
  budgetTimeline: string;
  openToCall?: boolean;
  preferredCallTime?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LeadData = await request.json();

    // Validate required fields
    const requiredFields = [
      "name",
      "email",
      "company",
      "projectDescription",
      "budgetTimeline",
    ];
    const missingFields = requiredFields.filter((field) => !body[field as keyof LeadData]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
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

    // Validate call time if openToCall is true
    if (body.openToCall && !body.preferredCallTime) {
      return NextResponse.json(
        { error: "Please provide your preferred call time" },
        { status: 400 }
      );
    }

    // Get client IP address (if available)
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Store lead in Firestore
    try {
      const db = getDb();
      await db.collection("leads").add({
        ...body,
        submittedAt: FieldValue.serverTimestamp(),
        ipAddress,
      });
    } catch (dbError) {
      console.error("Error storing lead in Firestore:", dbError);
      // Don't fail the request if logging fails
    }

    // Send admin notification email (non-blocking)
    try {
      await sendLeadNotificationEmail(
        body.name,
        body.email,
        body.company,
        body.projectDescription,
        body.budgetTimeline,
        body.openToCall,
        body.preferredCallTime
      );
    } catch (emailError) {
      console.error("Error sending lead notification email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: "Lead submitted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing lead:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

