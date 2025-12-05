import { NextRequest, NextResponse } from "next/server";
import { generateSignedUrl } from "@/lib/firebase/storage";
import { getDb } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";
import { sendDownloadEmail, sendDownloadEmailWithAttachment } from "@/lib/email/send-email";

interface DownloadData {
  name: string;
  email: string;
  company: string;
  fileIdentifier: string;
  fileType: "pdf" | "json";
  caseStudyTitle: string;
  deliveryMethod?: "link" | "attachment"; // Optional: "link" sends signed URL, "attachment" sends file
}

export async function POST(request: NextRequest) {
  try {
    const body: DownloadData = await request.json();

    // Validate required fields
    const requiredFields = [
      "name",
      "email",
      "company",
      "fileIdentifier",
      "fileType",
      "caseStudyTitle",
    ];
    const missingFields = requiredFields.filter(
      (field) => !body[field as keyof DownloadData]
    );

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

    // Validate file type
    if (body.fileType !== "pdf" && body.fileType !== "json") {
      return NextResponse.json(
        { error: "Invalid file type. Must be 'pdf' or 'json'" },
        { status: 400 }
      );
    }

    // Generate file path in Cloud Storage
    const fileName = `downloads/${body.fileIdentifier}.${body.fileType}`;

    // Generate signed URL (valid for 1 hour)
    let downloadUrl: string;
    try {
      downloadUrl = await generateSignedUrl(fileName, 3600);
    } catch (error) {
      console.error("Error generating signed URL:", error);
      return NextResponse.json(
        { error: "File not found or unavailable" },
        { status: 404 }
      );
    }

    // Get client IP address (if available)
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Determine delivery method (default to "link" if not specified)
    const deliveryMethod = body.deliveryMethod || "link";

    // Send email via SMTP
    try {
      if (deliveryMethod === "attachment") {
        // Send email with file attachment
        await sendDownloadEmailWithAttachment(
          body.email,
          body.name,
          body.fileIdentifier,
          body.fileType,
          body.caseStudyTitle
        );
      } else {
        // Send email with download link
        await sendDownloadEmail(
          body.email,
          body.name,
          body.fileIdentifier,
          body.fileType,
          body.caseStudyTitle
        );
      }
    } catch (emailError: any) {
      console.error("Error sending email:", emailError);
      // Return error if email fails - don't provide download URL as fallback
      return NextResponse.json(
        {
          success: false,
          error: emailError.message || "Failed to send email. Please try again later or contact us at Sales@algogi.com.",
        },
        { status: 500 }
      );
    }

    // Log download request to Firestore
    try {
      const db = getDb();
      await db.collection("downloads").add({
        email: body.email,
        name: body.name,
        company: body.company,
        fileIdentifier: body.fileIdentifier,
        fileType: body.fileType,
        caseStudyTitle: body.caseStudyTitle,
        downloadedAt: FieldValue.serverTimestamp(),
        downloadMethod: deliveryMethod === "attachment" ? "email_attachment" : "email_link",
        ipAddress,
      });
    } catch (dbError) {
      console.error("Error logging download to Firestore:", dbError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json(
      {
        success: true,
        message:
          deliveryMethod === "attachment"
            ? "File has been sent to your email"
            : "Download link has been sent to your email",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing download request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

