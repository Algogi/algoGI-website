import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";
import { FieldValue } from "firebase-admin/firestore";

interface BlogPost {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author?: string;
  publishedAt?: any;
  createdAt?: any;
  updatedAt?: any;
  published: boolean;
  featuredImage?: string;
  tags?: string[];
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const blogSnapshot = await db.collection("blog").orderBy("createdAt", "desc").get();

    const posts = blogSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
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

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: BlogPost = await request.json();

    // Validate required fields
    if (!body.title || !body.slug || !body.content) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug, content" },
        { status: 400 }
      );
    }

    // Generate slug from title if not provided
    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const db = getDb();
    
    // Check if slug already exists
    const existing = await db.collection("blog").where("slug", "==", slug).get();
    if (!existing.empty) {
      return NextResponse.json(
        { error: "A blog post with this slug already exists" },
        { status: 400 }
      );
    }

    const postData = {
      title: body.title,
      slug,
      content: body.content,
      excerpt: body.excerpt || "",
      author: body.author || session.name || session.email,
      published: body.published || false,
      featuredImage: body.featuredImage || null,
      tags: body.tags || [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      publishedAt: body.published ? FieldValue.serverTimestamp() : null,
    };

    const docRef = await db.collection("blog").add(postData);

    return NextResponse.json({
      id: docRef.id,
      ...postData,
    });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}

