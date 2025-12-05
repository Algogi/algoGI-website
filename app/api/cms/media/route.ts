import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getBucket } from "@/lib/firebase/storage";
import { readdir } from "fs/promises";
import { join } from "path";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const folder = searchParams.get("folder") || "images";
    const source = searchParams.get("source") || "all"; // "all", "storage", "public"

    const mediaFiles: Array<{
      name: string;
      url: string;
      type: string;
      size?: number;
      uploadedAt?: string;
    }> = [];

    // Get files from Cloud Storage
    if (source === "all" || source === "storage") {
      try {
        const bucket = getBucket();
        const [files] = await bucket.getFiles({ prefix: `${folder}/` });

        for (const file of files) {
          // Generate signed URL for the file
          const [url] = await file.getSignedUrl({
            action: "read",
            expires: Date.now() + 31536000 * 1000, // 1 year
          });

          const metadata = await file.getMetadata();
          mediaFiles.push({
            name: file.name.split("/").pop() || file.name,
            url: url,
            type: metadata[0].contentType?.startsWith("image/") ? "image" : "file",
            size: parseInt(String(metadata[0].size || "0"), 10),
            uploadedAt: metadata[0].timeCreated,
          });
        }
      } catch (storageError) {
        console.error("Error fetching from Cloud Storage:", storageError);
        // Continue to public folder files
      }
    }

    // Get files from public/images directory
    if (source === "all" || source === "public") {
      try {
        const imagesDir = join(process.cwd(), "public", "images");
        const files = await readdir(imagesDir);

        const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
        const publicFiles = files
          .filter((file) => {
            const ext = file.toLowerCase().substring(file.lastIndexOf("."));
            return imageExtensions.includes(ext);
          })
          .map((file) => ({
            name: file,
            url: `/images/${file}`,
            type: "image",
          }));

        mediaFiles.push(...publicFiles);
      } catch (publicError) {
        console.error("Error reading public images:", publicError);
        // Continue without public files
      }
    }

    // Sort by upload date (newest first) or name
    mediaFiles.sort((a, b) => {
      if (a.uploadedAt && b.uploadedAt) {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json(mediaFiles);
  } catch (error) {
    console.error("Error listing media files:", error);
    return NextResponse.json(
      { error: "Failed to list media files" },
      { status: 500 }
    );
  }
}

