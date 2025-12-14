import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";
import { analyzeSEO } from "@/lib/seo/analyzer";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { postId, postData } = body;

    let analysisData;

    if (postData) {
      // Analyze provided post data
      analysisData = postData;
    } else if (postId) {
      // Fetch post from database
      const db = getDb();
      const doc = await db.collection("blog").doc(postId).get();

      if (!doc.exists) {
        return NextResponse.json(
          { error: "Blog post not found" },
          { status: 404 }
        );
      }

      const data = doc.data()!;
      analysisData = {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || "",
        featuredImage: data.featuredImage || null,
      };
    } else {
      return NextResponse.json(
        { error: "Either postId or postData must be provided" },
        { status: 400 }
      );
    }

    // Run SEO analysis
    const analysis = analyzeSEO(analysisData);

    // Save analysis to database if postId provided
    if (postId) {
      const db = getDb();
      await db.collection("blog").doc(postId).update({
        seoScore: analysis.overall.score,
        seoAnalysis: analysis,
        lastSeoCheck: FieldValue.serverTimestamp(),
      });
    }

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    console.error("Error analyzing SEO:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze SEO" },
      { status: 500 }
    );
  }
}

