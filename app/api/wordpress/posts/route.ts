import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getWordPressClient } from "@/lib/wordpress/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = getWordPressClient();
    const posts = await client.fetchAllPosts();

    // Transform posts to include basic info
    const transformedPosts = await Promise.all(
      posts.map(async (post) => {
        const transformed = await client.transformPost(post);
        return {
          wordpressId: transformed.wordpressId,
          title: transformed.title,
          slug: transformed.slug,
          excerpt: transformed.excerpt,
          author: transformed.author,
          published: transformed.published,
          featuredImage: transformed.featuredImage,
          tags: transformed.tags,
          publishedAt: transformed.publishedAt,
        };
      })
    );

    return NextResponse.json(transformedPosts);
  } catch (error: any) {
    console.error("Error fetching WordPress posts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch WordPress posts" },
      { status: 500 }
    );
  }
}

