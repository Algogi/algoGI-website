import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(
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
    const doc = await db.collection("blog").doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      );
    }

    const data = doc.data()!;
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
      faqs: data.faqs || [],
      publishedAt: data.publishedAt?.toDate?.()?.toISOString() || null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      seoScore: data.seoScore || null,
      seoAnalysis: data.seoAnalysis || null,
      wordpressId: data.wordpressId || null,
      migratedAt: data.migratedAt?.toDate?.()?.toISOString() || null,
    });
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog post" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
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

    // Check if slug is being changed and if it conflicts
    if (body.slug && body.slug !== doc.data()?.slug) {
      const existing = await db.collection("blog").where("slug", "==", body.slug).get();
      if (!existing.empty && existing.docs[0].id !== id) {
        return NextResponse.json(
          { error: "A blog post with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const updateData: any = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.author !== undefined) updateData.author = body.author;
    if (body.featuredImage !== undefined) updateData.featuredImage = body.featuredImage;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.faqs !== undefined) updateData.faqs = body.faqs;

    // Handle published status
    if (body.published !== undefined) {
      updateData.published = body.published;
      if (body.published && !doc.data()?.publishedAt) {
        updateData.publishedAt = FieldValue.serverTimestamp();
      }
    }

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const data = updatedDoc.data()!;

    return NextResponse.json({
      id: updatedDoc.id,
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt || "",
      author: data.author || "",
      published: data.published || false,
      featuredImage: data.featuredImage || null,
      tags: data.tags || [],
      faqs: data.faqs || [],
      publishedAt: data.publishedAt?.toDate?.()?.toISOString() || null,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      seoScore: data.seoScore || null,
      seoAnalysis: data.seoAnalysis || null,
      wordpressId: data.wordpressId || null,
      migratedAt: data.migratedAt?.toDate?.()?.toISOString() || null,
    });
  } catch (error) {
    console.error("Error updating blog post:", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    await db.collection("blog").doc(id).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}

