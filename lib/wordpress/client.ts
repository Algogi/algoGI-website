interface WordPressPost {
  id: number;
  date: string;
  date_gmt: string;
  guid: { rendered: string };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  meta: any;
  categories: number[];
  tags: number[];
  _links: any;
}

interface WordPressMedia {
  id: number;
  source_url: string;
  media_details: {
    width: number;
    height: number;
    file: string;
  };
}

interface WordPressAuthor {
  id: number;
  name: string;
  url: string;
  description: string;
}

interface WordPressCategory {
  id: number;
  name: string;
  slug: string;
}

interface WordPressTag {
  id: number;
  name: string;
  slug: string;
}

export interface TransformedBlogPost {
  wordpressId: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  published: boolean;
  featuredImage: string | null;
  tags: string[];
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

class WordPressClient {
  private baseUrl: string;
  private authHeader: string | null = null;

  constructor() {
    const apiUrl = process.env.WORDPRESS_API_URL;
    if (!apiUrl) {
      // Don't throw during initialization - will fail at runtime when actually used
      this.baseUrl = "";
      return;
    }
    this.baseUrl = apiUrl.replace(/\/$/, ""); // Remove trailing slash

    // Setup authentication if provided
    const username = process.env.WORDPRESS_USERNAME;
    const password = process.env.WORDPRESS_PASSWORD;
    const appPassword = process.env.WORDPRESS_APPLICATION_PASSWORD;

    if (appPassword) {
      // Application Password authentication
      const auth = Buffer.from(`${username || ""}:${appPassword}`).toString("base64");
      this.authHeader = `Basic ${auth}`;
    } else if (username && password) {
      // Basic Auth
      const auth = Buffer.from(`${username}:${password}`).toString("base64");
      this.authHeader = `Basic ${auth}`;
    }
  }

  private async fetchWithAuth(url: string): Promise<Response> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.authHeader) {
      headers["Authorization"] = this.authHeader;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      let errorMessage = `WordPress API error: ${response.status} ${response.statusText}`;
      
      // Provide helpful error messages for common issues
      if (response.status === 403) {
        const hasAuth = !!this.authHeader;
        if (!hasAuth) {
          errorMessage += ". Authentication required. Please set WORDPRESS_USERNAME and WORDPRESS_PASSWORD (or WORDPRESS_APPLICATION_PASSWORD) in your environment variables.";
        } else {
          errorMessage += ". Authentication failed. Please check your WordPress credentials. If using Application Password, ensure it's correctly set in WORDPRESS_APPLICATION_PASSWORD.";
        }
        errorMessage += " Also verify that the WordPress REST API is enabled and accessible.";
      } else if (response.status === 404) {
        errorMessage += ". The WordPress API endpoint was not found. Please verify WORDPRESS_API_URL is correct (should end with /wp-json/wp/v2).";
      } else if (response.status === 401) {
        errorMessage += ". Unauthorized. Please check your WordPress username and password/application password.";
      }
      
      // Try to get error details from response body
      try {
        const errorBody = await response.text();
        if (errorBody) {
          try {
            const errorJson = JSON.parse(errorBody);
            if (errorJson.message) {
              errorMessage += ` Details: ${errorJson.message}`;
            } else if (errorJson.code) {
              errorMessage += ` Code: ${errorJson.code}`;
            }
          } catch {
            // If not JSON, include first 200 chars of response
            if (errorBody.length > 0) {
              errorMessage += ` Response: ${errorBody.substring(0, 200)}`;
            }
          }
        }
      } catch {
        // Ignore errors when reading response body
      }
      
      throw new Error(errorMessage);
    }
    return response;
  }

  async fetchAllPosts(): Promise<WordPressPost[]> {
    if (!this.baseUrl) {
      throw new Error("WORDPRESS_API_URL environment variable is not set");
    }

    const allPosts: WordPressPost[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const url = `${this.baseUrl}/posts?per_page=100&page=${page}&_embed=true`;
      const response = await this.fetchWithAuth(url);
      const posts: WordPressPost[] = await response.json();

      if (posts.length === 0) {
        hasMore = false;
      } else {
        allPosts.push(...posts);
        page++;

        // Check if there are more pages
        const totalPages = parseInt(response.headers.get("x-wp-totalpages") || "1", 10);
        if (page > totalPages) {
          hasMore = false;
        }
      }
    }

    return allPosts;
  }

  async fetchPostBySlug(slug: string): Promise<WordPressPost | null> {
    if (!this.baseUrl) {
      throw new Error("WORDPRESS_API_URL environment variable is not set");
    }

    try {
      const url = `${this.baseUrl}/posts?slug=${encodeURIComponent(slug)}&_embed=true`;
      const response = await this.fetchWithAuth(url);
      const posts: WordPressPost[] = await response.json();

      if (posts.length === 0) {
        return null;
      }

      return posts[0];
    } catch (error) {
      console.error("Error fetching WordPress post by slug:", error);
      return null;
    }
  }

  async fetchPostById(id: number): Promise<WordPressPost | null> {
    if (!this.baseUrl) {
      throw new Error("WORDPRESS_API_URL environment variable is not set");
    }

    try {
      const url = `${this.baseUrl}/posts/${id}?_embed=true`;
      const response = await this.fetchWithAuth(url);
      return await response.json();
    } catch (error) {
      console.error("Error fetching WordPress post by ID:", error);
      return null;
    }
  }

  async fetchMedia(mediaId: number): Promise<WordPressMedia | null> {
    try {
      const url = `${this.baseUrl}/media/${mediaId}`;
      const response = await this.fetchWithAuth(url);
      return await response.json();
    } catch (error) {
      console.error("Error fetching WordPress media:", error);
      return null;
    }
  }

  async fetchAuthor(authorId: number): Promise<WordPressAuthor | null> {
    try {
      const url = `${this.baseUrl}/users/${authorId}`;
      const response = await this.fetchWithAuth(url);
      return await response.json();
    } catch (error) {
      console.error("Error fetching WordPress author:", error);
      return null;
    }
  }

  async fetchCategories(categoryIds: number[]): Promise<WordPressCategory[]> {
    if (categoryIds.length === 0) return [];

    try {
      const categories: WordPressCategory[] = [];
      for (const id of categoryIds) {
        try {
          const url = `${this.baseUrl}/categories/${id}`;
          const response = await this.fetchWithAuth(url);
          const category = await response.json();
          categories.push(category);
        } catch (error) {
          console.error(`Error fetching category ${id}:`, error);
        }
      }
      return categories;
    } catch (error) {
      console.error("Error fetching WordPress categories:", error);
      return [];
    }
  }

  async fetchTags(tagIds: number[]): Promise<WordPressTag[]> {
    if (tagIds.length === 0) return [];

    try {
      const tags: WordPressTag[] = [];
      for (const id of tagIds) {
        try {
          const url = `${this.baseUrl}/tags/${id}`;
          const response = await this.fetchWithAuth(url);
          const tag = await response.json();
          tags.push(tag);
        } catch (error) {
          console.error(`Error fetching tag ${id}:`, error);
        }
      }
      return tags;
    } catch (error) {
      console.error("Error fetching WordPress tags:", error);
      return [];
    }
  }

  private htmlToMarkdown(html: string): string {
    // Basic HTML to Markdown conversion
    // This is a simplified version - for production, consider using a library like turndown
    let markdown = html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
      .replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1\n\n")
      .replace(/<h5[^>]*>(.*?)<\/h5>/gi, "##### $1\n\n")
      .replace(/<h6[^>]*>(.*?)<\/h6>/gi, "###### $1\n\n")
      .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
      .replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**")
      .replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*")
      .replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*")
      .replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, "[$2]($1)")
      .replace(/<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, "![$2]($1)")
      .replace(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi, "![]($1)")
      .replace(/<ul[^>]*>/gi, "\n")
      .replace(/<\/ul>/gi, "\n")
      .replace(/<ol[^>]*>/gi, "\n")
      .replace(/<\/ol>/gi, "\n")
      .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/?[^>]+(>|$)/g, ""); // Remove remaining HTML tags

    // Clean up extra newlines
    markdown = markdown.replace(/\n{3,}/g, "\n\n").trim();

    return markdown;
  }

  async transformPost(post: WordPressPost): Promise<TransformedBlogPost> {
    // Fetch additional data
    let featuredImageUrl: string | null = null;
    if (post.featured_media > 0) {
      const media = await this.fetchMedia(post.featured_media);
      if (media) {
        featuredImageUrl = media.source_url;
      }
    }

    let authorName = "Unknown";
    if (post.author) {
      const author = await this.fetchAuthor(post.author);
      if (author) {
        authorName = author.name;
      }
    }

    // Fetch tags
    const tagObjects = await this.fetchTags(post.tags || []);
    const tags = tagObjects.map((tag) => tag.name);

    // Convert HTML content to Markdown
    const content = this.htmlToMarkdown(post.content.rendered);
    const excerpt = this.htmlToMarkdown(post.excerpt.rendered);

    return {
      wordpressId: post.id,
      title: post.title.rendered,
      slug: post.slug,
      content,
      excerpt,
      author: authorName,
      published: post.status === "publish",
      featuredImage: featuredImageUrl,
      tags,
      publishedAt: post.date ? new Date(post.date).toISOString() : null,
      createdAt: post.date ? new Date(post.date).toISOString() : null,
      updatedAt: post.modified ? new Date(post.modified).toISOString() : null,
    };
  }
}

let clientInstance: WordPressClient | null = null;

export function getWordPressClient(): WordPressClient {
  if (!clientInstance) {
    clientInstance = new WordPressClient();
  }
  return clientInstance;
}

