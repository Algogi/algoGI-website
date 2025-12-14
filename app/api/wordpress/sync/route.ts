import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/firebase/config";
import { getWordPressClient } from "@/lib/wordpress/client";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { postId } = body; // Optional: sync specific post by WordPress ID

    const client = getWordPressClient();
    const db = getDb();

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    if (postId) {
      // Sync single post
      const wpPost = await client.fetchPostById(postId);
      if (!wpPost) {
        return NextResponse.json(
          { error: "WordPress post not found" },
          { status: 404 }
        );
      }

      const transformed = await client.transformPost(wpPost);

      // Check if post exists by wordpressId
      const existingByWpId = await db
        .collection("blog")
        .where("wordpressId", "==", postId)
        .get();

      // Also check by slug
      const existingBySlug = await db
        .collection("blog")
        .where("slug", "==", transformed.slug)
        .get();

      let docRef;
      let isUpdate = false;

      if (!existingByWpId.empty) {
        docRef = db.collection("blog").doc(existingByWpId.docs[0].id);
        isUpdate = true;
      } else if (!existingBySlug.empty) {
        docRef = db.collection("blog").doc(existingBySlug.docs[0].id);
        isUpdate = true;
      } else {
        docRef = db.collection("blog").doc();
        isUpdate = false;
      }

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
        updatedAt: FieldValue.serverTimestamp(),
      };

      if (isUpdate) {
        await docRef.update(postData);
        results.updated = 1;
      } else {
        postData.createdAt = FieldValue.serverTimestamp();
        postData.publishedAt = null; // No publishedAt for drafts
        await docRef.set(postData);
        results.created = 1;
      }

      return NextResponse.json({
        success: true,
        results,
        postId: docRef.id,
      });
    } else {
      // Sync all posts
      const wpPosts = await client.fetchAllPosts();

      for (const wpPost of wpPosts) {
        try {
          const transformed = await client.transformPost(wpPost);

          // Check if post exists by wordpressId
          const existingByWpId = await db
            .collection("blog")
            .where("wordpressId", "==", transformed.wordpressId)
            .get();

          // Also check by slug
          const existingBySlug = await db
            .collection("blog")
            .where("slug", "==", transformed.slug)
            .get();

          let docRef;
          let isUpdate = false;

          if (!existingByWpId.empty) {
            docRef = db.collection("blog").doc(existingByWpId.docs[0].id);
            isUpdate = true;
          } else if (!existingBySlug.empty) {
            docRef = db.collection("blog").doc(existingBySlug.docs[0].id);
            isUpdate = true;
          } else {
            docRef = db.collection("blog").doc();
            isUpdate = false;
          }

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
            updatedAt: FieldValue.serverTimestamp(),
          };

          if (isUpdate) {
            await docRef.update(postData);
            results.updated++;
          } else {
            postData.createdAt = FieldValue.serverTimestamp();
            postData.publishedAt = null; // No publishedAt for drafts
            await docRef.set(postData);
            results.created++;
          }
        } catch (error: any) {
          results.errors.push(
            `Failed to sync post ${wpPost.id}: ${error.message}`
          );
          results.skipped++;
        }
      }

      return NextResponse.json({
        success: true,
        results,
        total: wpPosts.length,
      });
    }
  } catch (error: any) {
    console.error("Error syncing WordPress posts:", error);
    
    let errorMessage = error.message || "Failed to sync WordPress posts";
    
    // Provide helpful suggestions for common errors
    if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
      errorMessage += " Use /api/wordpress/test to diagnose connection issues.";
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        suggestion: "Try testing the connection at /api/wordpress/test to get detailed diagnostics"
      },
      { status: 500 }
    );
  }
}

