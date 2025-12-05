import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getBucket } from "@/lib/firebase/storage";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const folder = searchParams.get("folder") || "downloads";
    const source = searchParams.get("source") || "all";

    const files: Array<{
      name: string;
      url: string;
      type: string;
      size?: number;
      uploadedAt?: string;
      identifier?: string;
    }> = [];

    // Get files from Cloud Storage
    if (source === "all" || source === "storage") {
      try {
        const bucket = getBucket();
        const [storageFiles] = await bucket.getFiles({ prefix: `${folder}/` });

        for (const file of storageFiles) {
          // Generate signed URL for the file
          const [url] = await file.getSignedUrl({
            action: "read",
            expires: Date.now() + 31536000 * 1000, // 1 year
          });

          const metadata = await file.getMetadata();
          const fileName = file.name.split("/").pop() || file.name;
          const identifier = fileName.replace(/\.(pdf|json)$/, "");
          const fileType = fileName.endsWith(".pdf") ? "pdf" : fileName.endsWith(".json") ? "json" : "file";

          files.push({
            name: fileName,
            url: url,
            type: fileType,
            size: parseInt(String(metadata[0].size || "0"), 10),
            uploadedAt: metadata[0].timeCreated,
            identifier,
          });
        }
      } catch (storageError: any) {
        console.error("Error fetching from Cloud Storage:", storageError);
        // Continue without storage files if permission denied
        if (storageError.code !== 403) {
          throw storageError;
        }
      }
    }

    // Sort by upload date (newest first) or name
    files.sort((a, b) => {
      if (a.uploadedAt && b.uploadedAt) {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error("Error listing files:", error);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}

