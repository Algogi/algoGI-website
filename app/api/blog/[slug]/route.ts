import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebase/config";
import { getSession } from "@/lib/auth/session";
import { getWordPressClient } from "@/lib/wordpress/client";
import { FieldValue } from "firebase-admin/firestore";

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

    // If found in Firebase, return it
    if (!blogSnapshot.empty) {
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
        wordpressId: data.wordpressId || null,
        migratedAt: data.migratedAt?.toDate?.()?.toISOString() || null,
        faqs: data.faqs || [],
      });
    }

    // Not found in Firebase, try WordPress
    try {
      const client = getWordPressClient();
      const wpPost = await client.fetchPostBySlug(slug);

      if (!wpPost) {
        return NextResponse.json(
          { error: "Blog post not found" },
          { status: 404 }
        );
      }

      // Transform WordPress post
      const transformed = await client.transformPost(wpPost);

      // Save to Firebase as draft (must be manually published)
      const postData: any = {
        title: transformed.title,
        slug: transformed.slug,
        content: transformed.content,
        excerpt: transformed.excerpt,
        author: transformed.author,
        published: false, // Always save as draft when syncing from WordPress
        featuredImage: transformed.featuredImage,
        tags: transformed.tags,
        wordpressId: transformed.wordpressId,
        migratedAt: FieldValue.serverTimestamp(),
        createdAt: transformed.createdAt
          ? new Date(transformed.createdAt)
          : FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        publishedAt: null, // No publishedAt for drafts
      };

      const docRef = await db.collection("blog").add(postData);
      const savedDoc = await docRef.get();
      const savedData = savedDoc.data()!;

      return NextResponse.json({
        id: savedDoc.id,
        title: savedData.title,
        slug: savedData.slug,
        content: savedData.content,
        excerpt: savedData.excerpt || "",
        author: savedData.author || "",
        published: savedData.published || false,
        featuredImage: savedData.featuredImage || null,
        tags: savedData.tags || [],
        publishedAt: savedData.publishedAt?.toDate?.()?.toISOString() || null,
        createdAt: savedData.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: savedData.updatedAt?.toDate?.()?.toISOString() || null,
        wordpressId: savedData.wordpressId || null,
        migratedAt: savedData.migratedAt?.toDate?.()?.toISOString() || null,
        faqs: savedData.faqs || [],
      });
    } catch (wpError: any) {
      // WordPress fetch failed, return 404
      console.error("Error fetching from WordPress:", wpError);
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}

