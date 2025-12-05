import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/config";
import { getSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const session = await getSession();
    const isAdmin = !!session;

    let blogSnapshot;
    if (isAdmin) {
      // Admins can see both published and draft posts
      blogSnapshot = await db
        .collection("blog")
        .orderBy("createdAt", "desc")
        .get();
    } else {
      // Public users only see published posts
      blogSnapshot = await db
        .collection("blog")
        .where("published", "==", true)
        .orderBy("publishedAt", "desc")
        .get();
    }

    const posts = blogSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || "",
        author: data.author || "",
        published: data.published || false,
        featuredImage: data.featuredImage || null,
        tags: data.tags || [],
        publishedAt: data.publishedAt?.toDate?.()?.toISOString() || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}

