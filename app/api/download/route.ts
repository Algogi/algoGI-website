import { NextRequest, NextResponse } from "next/server";

interface DownloadData {
  name: string;
  email: string;
  company: string;
  fileIdentifier: string;
  fileType: "pdf" | "json";
  caseStudyTitle: string;
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

    // Get n8n webhook URL from environment variables
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      console.error("N8N_WEBHOOK_URL is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Call n8n webhook
    try {
      const webhookResponse = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: body.name,
          email: body.email,
          company: body.company,
          fileIdentifier: body.fileIdentifier,
          fileType: body.fileType,
          caseStudyTitle: body.caseStudyTitle,
        }),
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook responded with status: ${webhookResponse.status}`);
      }

      // Log the download request
      console.log("Download request submitted:", {
        timestamp: new Date().toISOString(),
        email: body.email,
        fileIdentifier: body.fileIdentifier,
        fileType: body.fileType,
      });

      return NextResponse.json(
        {
          success: true,
          message: "Download request submitted successfully",
        },
        { status: 200 }
      );
    } catch (webhookError) {
      console.error("Error calling n8n webhook:", webhookError);
      return NextResponse.json(
        { error: "Failed to process download request" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing download request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

