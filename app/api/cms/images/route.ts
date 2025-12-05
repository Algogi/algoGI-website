import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { readdir } from "fs/promises";
import { join } from "path";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read images from public/images directory
    const imagesDir = join(process.cwd(), "public", "images");
    const files = await readdir(imagesDir);

    // Filter for image files
    const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
    const images = files
      .filter((file) => {
        const ext = file.toLowerCase().substring(file.lastIndexOf("."));
        return imageExtensions.includes(ext);
      })
      .map((file) => ({
        name: file,
        url: `/images/${file}`,
      }));

    return NextResponse.json(images);
  } catch (error) {
    console.error("Error listing images:", error);
    return NextResponse.json(
      { error: "Failed to list images" },
      { status: 500 }
    );
  }
}

