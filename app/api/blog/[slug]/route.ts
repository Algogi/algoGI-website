import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/config";
import { getSession } from "@/lib/auth/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = getDb();
    const session = await getSession();
    const isAdmin = !!session;

    let blogSnapshot;
    if (isAdmin) {
      // Admins can see both published and draft posts
      blogSnapshot = await db
        .collection("blog")
        .where("slug", "==", slug)
        .limit(1)
        .get();
    } else {
      // Public users only see published posts
      blogSnapshot = await db
        .collection("blog")
        .where("slug", "==", slug)
        .where("published", "==", true)
        .limit(1)
        .get();
    }

    if (blogSnapshot.empty) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    const doc = blogSnapshot.docs[0];
    const data = doc.data();

    return NextResponse.json({
      id: doc.id,
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt || "",
      author: data.author || "",
      published: data.published || false,
      featuredImage: data.featuredImage || null,
      tags: data.tags || [],
      publishedAt: data.publishedAt?.toDate?.()?.toISOString() || null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
    });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}

