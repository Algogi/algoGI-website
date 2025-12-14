import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";
import { cleanWordPressContent, cleanWordPressText } from "@/lib/wordpress/html-cleaner";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const docRef = db.collection("blog").doc(id);

    // Check if document exists
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    const data = doc.data();
    if (!data) {
      return NextResponse.json(
        { error: "Blog post data not found" },
        { status: 404 }
      );
    }

    // Clean and fix content
    let cleanedContent = data.content || "";
    let cleanedTitle = cleanWordPressText(data.title || "");
    let cleanedExcerpt = cleanWordPressText(data.excerpt || "");

    // If content is HTML, clean it
    if (cleanedContent && !cleanedContent.trim().startsWith("{")) {
      cleanedContent = cleanWordPressContent(cleanedContent);
      
      // Convert to blocks and back to HTML for better structure
      try {
        const { htmlToBlocks } = require("@/app/admin/blog/_components/editor/utils/parser");
        const { blocksToHTML } = require("@/app/admin/blog/_components/editor/utils/serializer");
        const blocks = htmlToBlocks(cleanedContent);
        cleanedContent = blocksToHTML(blocks);
      } catch (error) {
        console.error("Error converting to blocks:", error);
        // Continue with cleaned HTML if conversion fails
      }
    }

    // Update the document
    await docRef.update({
      title: cleanedTitle,
      content: cleanedContent,
      excerpt: cleanedExcerpt,
      updatedAt: new Date(),
    });

    // Return updated data
    const updatedDoc = await docRef.get();
    const updatedData = updatedDoc.data()!;

    return NextResponse.json({
      id: updatedDoc.id,
      ...updatedData,
      updatedAt: updatedData.updatedAt?.toDate?.()?.toISOString() || null,
      createdAt: updatedData.createdAt?.toDate?.()?.toISOString() || null,
      publishedAt: updatedData.publishedAt?.toDate?.()?.toISOString() || null,
    });
  } catch (error: any) {
    console.error("Error fixing blog post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fix blog post" },
      { status: 500 }
    );
  }
}

