import { NextRequest, NextResponse } from "next/server";
import { generateSignedUrl } from "@/lib/firebase/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  try {
    const { identifier } = await params;
    const searchParams = request.nextUrl.searchParams;
    const fileType = searchParams.get("type") || "pdf";

    // Validate file type
    if (fileType !== "pdf" && fileType !== "json") {
      return NextResponse.json(
        { error: "Invalid file type" },
        { status: 400 }
      );
    }

    // Generate file path in Cloud Storage
    const fileName = `downloads/${identifier}.${fileType}`;

    // Generate signed URL (valid for 1 hour)
    const downloadUrl = await generateSignedUrl(fileName, 3600);

    // Redirect to the signed URL
    return NextResponse.redirect(downloadUrl);
  } catch (error) {
    console.error("Error generating download URL:", error);
    return NextResponse.json(
      { error: "File not found or unavailable" },
      { status: 404 }
    );
  }
}

