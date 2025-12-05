import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { uploadFile } from "@/lib/firebase/storage";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "images";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type based on folder
    let allowedTypes: string[] = [];
    let maxSize = 5 * 1024 * 1024; // Default 5MB

    if (folder === "downloads") {
      // Allow PDF and JSON files for downloads folder
      allowedTypes = [
        "application/pdf",
        "application/json",
        "text/json",
        "text/plain", // Some systems may report JSON as text/plain
      ];
      maxSize = 50 * 1024 * 1024; // 50MB for downloads
    } else {
      // Allow images for other folders (images, etc.)
      allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
      ];
      maxSize = 5 * 1024 * 1024; // 5MB for images
    }

    // Also check file extension as fallback
    const fileExtension = file.name.toLowerCase().split(".").pop();
    const allowedExtensions = folder === "downloads" 
      ? ["pdf", "json"] 
      : ["jpg", "jpeg", "png", "webp", "gif", "svg"];

    const isValidType = allowedTypes.includes(file.type) || 
                       (fileExtension && allowedExtensions.includes(fileExtension));

    if (!isValidType) {
      return NextResponse.json(
        { 
          error: folder === "downloads" 
            ? "Invalid file type. Only PDF and JSON files are allowed." 
            : "Invalid file type. Only images are allowed." 
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${folder}/${timestamp}-${sanitizedName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloud Storage
    const url = await uploadFile(fileName, buffer, file.type);

    // Generate a signed URL for the uploaded file (valid for 1 year)
    const { generateSignedUrl } = await import("@/lib/firebase/storage");
    // The url from uploadFile is the full GCS URL, we need just the file path
    const filePath = fileName; // Use the fileName we created
    const signedUrl = await generateSignedUrl(filePath, 31536000); // 1 year

    return NextResponse.json({
      success: true,
      url: signedUrl,
      fileName,
    });
  } catch (error: any) {
    console.error("Error uploading file:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to upload file";
    let statusCode = 500;

    // Parse Google Cloud Storage error format
    let parsedError: any = null;
    try {
      // Try to parse error as JSON if it's a string
      if (typeof error === 'string') {
        parsedError = JSON.parse(error);
      } else if (error.response?.data) {
        parsedError = error.response.data;
      } else if (error.error) {
        parsedError = error.error;
      } else {
        parsedError = error;
      }
    } catch {
      parsedError = error;
    }

    // Check for permission errors (403)
    if (error.code === 403 || parsedError?.code === 403 || parsedError?.error?.code === 403) {
      statusCode = 403;
      const message = parsedError?.error?.message || parsedError?.message || error.message;
      if (message?.includes("storage.objects.create") || message?.includes("storage.objects.list")) {
        errorMessage = "Permission denied. The Firebase service account needs 'Storage Admin' or 'Storage Object Admin' role. Please grant this permission in Google Cloud Console > IAM & Admin > IAM.";
      } else {
        errorMessage = `Permission denied: ${message || "Access to Cloud Storage bucket is restricted."}`;
      }
    } else if (error.message?.includes("credentials") || error.message?.includes("Could not load")) {
      errorMessage = "Cloud Storage credentials not configured. Please check your FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.";
    } else if (error.message?.includes("bucket") || error.code === 404 || parsedError?.code === 404) {
      errorMessage = "Cloud Storage bucket not found or inaccessible. Please check your GCS_BUCKET_NAME configuration and ensure the bucket exists.";
    } else if (parsedError?.error?.message) {
      // Handle Google API error format
      errorMessage = parsedError.error.message;
      statusCode = parsedError.error.code || 500;
    } else if (parsedError?.message) {
      errorMessage = parsedError.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

