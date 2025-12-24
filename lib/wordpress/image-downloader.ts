import { uploadFile, generateSignedUrl } from "@/lib/firebase/storage";
import { getWordPressClient } from "./client";

/**
 * Extract all image URLs from blog content (HTML and Markdown)
 */
export function extractImageUrls(content: string, featuredImage?: string | null): string[] {
  const urls = new Set<string>();

  // Extract from HTML img tags
  const htmlImageRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = htmlImageRegex.exec(content)) !== null) {
    if (match[1]) {
      urls.add(match[1]);
    }
  }

  // Extract from Markdown image syntax: ![alt](url)
  const mdImageRegex = /!\[([^\]]*)\]\(([^\)]+)\)/g;
  while ((match = mdImageRegex.exec(content)) !== null) {
    if (match[2]) {
      urls.add(match[2]);
    }
  }

  // Add featured image if provided
  if (featuredImage) {
    urls.add(featuredImage);
  }

  return Array.from(urls);
}

/**
 * Check if URL is from WordPress domain
 */
function isWordPressUrl(url: string, wordpressBaseUrl?: string): boolean {
  if (!url || !url.startsWith("http")) {
    return false;
  }

  // If we have WordPress base URL, check against it
  if (wordpressBaseUrl) {
    try {
      // Extract base domain from WordPress API URL (remove /wp-json/wp/v2 if present)
      const wpUrl = new URL(wordpressBaseUrl);
      const imageUrl = new URL(url);
      return imageUrl.hostname === wpUrl.hostname;
    } catch {
      // Invalid URL, skip
      return false;
    }
  }

  // Default: accept any external URL (we'll filter out data URLs and relative paths above)
  return true;
}

/**
 * Download image from URL and upload to Firebase Storage
 */
async function downloadAndUploadImage(
  imageUrl: string,
  wordpressBaseUrl?: string
): Promise<{ success: boolean; newUrl?: string; error?: string }> {
  try {
    // Validate URL
    if (!imageUrl || !imageUrl.startsWith("http")) {
      return { success: false, error: "Invalid URL" };
    }

    // Check if it's a WordPress URL
    if (!isWordPressUrl(imageUrl, wordpressBaseUrl)) {
      return { success: false, error: "Not a WordPress URL" };
    }

    // Get WordPress client for authentication
    const client = getWordPressClient();
    const headers: HeadersInit = {
      "User-Agent": "Mozilla/5.0",
    };

    // Add authentication if available (for private WordPress sites)
    const authHeader = client.getAuthHeader();
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    // Download image
    const response = await fetch(imageUrl, {
      headers,
      // Add timeout
      signal: AbortSignal.timeout(30000), // 30 seconds
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    // Validate content type
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.startsWith("image/")) {
      return { success: false, error: "Not an image file" };
    }

    // Get image data
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (buffer.length > maxSize) {
      return { success: false, error: "Image too large (max 10MB)" };
    }

    // Generate unique filename
    const urlPath = new URL(imageUrl).pathname;
    const originalName = urlPath.split("/").pop() || "image";
    const extension = originalName.includes(".")
      ? originalName.substring(originalName.lastIndexOf("."))
      : getExtensionFromContentType(contentType) || ".jpg";

    const timestamp = Date.now();
    const sanitizedName = originalName
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .replace(/\.[^.]+$/, ""); // Remove extension
    const fileName = `images/${timestamp}-${sanitizedName}${extension}`;

    // Upload to Firebase Storage
    await uploadFile(fileName, buffer, contentType);

    // Generate signed URL (valid for 1 year)
    const signedUrl = await generateSignedUrl(fileName, 31536000);

    return { success: true, newUrl: signedUrl };
  } catch (error: any) {
    // Handle timeout and other errors
    if (error.name === "AbortError" || error.message?.includes("timeout")) {
      return { success: false, error: "Download timeout" };
    }
    return {
      success: false,
      error: error.message || "Failed to download image",
    };
  }
}

/**
 * Get file extension from content type
 */
function getExtensionFromContentType(contentType: string): string | null {
  const mapping: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
  };

  return mapping[contentType.toLowerCase()] || null;
}

/**
 * Replace image URLs in HTML content
 */
function replaceUrlsInHTML(content: string, urlMap: Map<string, string>): string {
  return content.replace(
    /<img([^>]+)src=["']([^"']+)["']([^>]*)>/gi,
    (match, before, src, after) => {
      const newUrl = urlMap.get(src);
      if (newUrl) {
        return `<img${before}src="${newUrl}"${after}>`;
      }
      return match;
    }
  );
}

/**
 * Replace image URLs in Markdown content
 */
function replaceUrlsInMarkdown(content: string, urlMap: Map<string, string>): string {
  return content.replace(
    /!\[([^\]]*)\]\(([^\)]+)\)/g,
    (match, alt, url) => {
      const newUrl = urlMap.get(url);
      if (newUrl) {
        return `![${alt}](${newUrl})`;
      }
      return match;
    }
  );
}

/**
 * Download all images from WordPress and replace URLs in content
 */
export async function downloadAndReplaceImages(
  content: string,
  featuredImage: string | null,
  wordpressBaseUrl?: string
): Promise<{
  content: string;
  featuredImage: string | null;
  stats: {
    total: number;
    downloaded: number;
    failed: number;
    errors: string[];
  };
}> {
  const stats = {
    total: 0,
    downloaded: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Extract all image URLs
  const imageUrls = extractImageUrls(content, featuredImage);
  stats.total = imageUrls.length;

  if (imageUrls.length === 0) {
    return {
      content,
      featuredImage,
      stats,
    };
  }

  // Download and upload each image
  const urlMap = new Map<string, string>();

  // Process images in parallel (but limit concurrency to avoid overwhelming)
  const batchSize = 5;
  for (let i = 0; i < imageUrls.length; i += batchSize) {
    const batch = imageUrls.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map((url) => downloadAndUploadImage(url, wordpressBaseUrl))
    );

    batch.forEach((originalUrl, index) => {
      const result = results[index];
      if (result.success && result.newUrl) {
        urlMap.set(originalUrl, result.newUrl);
        stats.downloaded++;
      } else {
        stats.failed++;
        if (result.error) {
          stats.errors.push(`${originalUrl}: ${result.error}`);
        }
      }
    });
  }

  // Replace URLs in content
  let updatedContent = content;
  let updatedFeaturedImage = featuredImage;

  // Replace in HTML
  updatedContent = replaceUrlsInHTML(updatedContent, urlMap);

  // Replace in Markdown
  updatedContent = replaceUrlsInMarkdown(updatedContent, urlMap);

  // Replace featured image
  if (featuredImage && urlMap.has(featuredImage)) {
    updatedFeaturedImage = urlMap.get(featuredImage) || null;
  }

  return {
    content: updatedContent,
    featuredImage: updatedFeaturedImage,
    stats,
  };
}

