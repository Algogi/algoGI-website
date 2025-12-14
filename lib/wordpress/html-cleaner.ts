/**
 * Utility functions to clean and fix HTML/text issues from WordPress imports
 */

/**
 * Clean and fix common HTML/text issues from WordPress content
 */
export function cleanWordPressHTML(html: string): string {
  if (!html || typeof html !== "string") {
    return "";
  }

  let cleaned = html;

  // 1. Remove WordPress-specific shortcodes (but keep content inside)
  cleaned = cleaned.replace(/\[gallery[^\]]*\]/gi, "");
  cleaned = cleaned.replace(/\[caption[^\]]*\](.*?)\[\/caption\]/gi, "$1");
  cleaned = cleaned.replace(/\[embed[^\]]*\](.*?)\[\/embed\]/gi, "$1");
  cleaned = cleaned.replace(/\[video[^\]]*\](.*?)\[\/video\]/gi, "$1");
  cleaned = cleaned.replace(/\[audio[^\]]*\](.*?)\[\/audio\]/gi, "$1");
  cleaned = cleaned.replace(/\[contact-form[^\]]*\]/gi, "");
  cleaned = cleaned.replace(/\[contact-form-7[^\]]*\]/gi, "");
  cleaned = cleaned.replace(/\[.*?\]/g, ""); // Remove any remaining shortcodes

  // 2. Remove script and style tags completely
  cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

  // 3. Remove WordPress-specific classes and attributes
  cleaned = cleaned.replace(/\s*class=["'][^"']*wp-[^"']*["']/gi, "");
  cleaned = cleaned.replace(/\s*data-[^=]*=["'][^"']*["']/gi, "");
  cleaned = cleaned.replace(/\s*id=["'][^"']*["']/gi, "");

  // 4. Fix common HTML entity issues
  cleaned = cleaned.replace(/&nbsp;/g, " ");
  cleaned = cleaned.replace(/&amp;/g, "&");
  cleaned = cleaned.replace(/&lt;/g, "<");
  cleaned = cleaned.replace(/&gt;/g, ">");
  cleaned = cleaned.replace(/&quot;/g, '"');
  cleaned = cleaned.replace(/&#8217;/g, "'");
  cleaned = cleaned.replace(/&#8216;/g, "'");
  cleaned = cleaned.replace(/&#8220;/g, '"');
  cleaned = cleaned.replace(/&#8221;/g, '"');
  cleaned = cleaned.replace(/&#8211;/g, "–");
  cleaned = cleaned.replace(/&#8212;/g, "—");
  cleaned = cleaned.replace(/&#8230;/g, "…");

  // 5. Remove empty tags
  cleaned = cleaned.replace(/<p[^>]*>\s*<\/p>/gi, "");
  cleaned = cleaned.replace(/<div[^>]*>\s*<\/div>/gi, "");
  cleaned = cleaned.replace(/<span[^>]*>\s*<\/span>/gi, "");
  cleaned = cleaned.replace(/<h[1-6][^>]*>\s*<\/h[1-6]>/gi, "");

  // 6. Fix unclosed tags (basic fix)
  cleaned = cleaned.replace(/<br\s*\/?>/gi, "<br />");
  cleaned = cleaned.replace(/<hr\s*\/?>/gi, "<hr />");
  cleaned = cleaned.replace(/<img([^>]*?)(?<!\/)\s*>/gi, "<img$1 />");

  // 7. Remove WordPress-specific wrapper divs
  cleaned = cleaned.replace(/<div[^>]*class=["'][^"']*wp-block[^"']*["'][^>]*>/gi, "");
  cleaned = cleaned.replace(/<\/div>\s*<!-- \/wp:.*? -->/gi, "</div>");
  cleaned = cleaned.replace(/<!-- wp:.*? -->/gi, "");

  // 8. Clean up excessive whitespace
  cleaned = cleaned.replace(/\s+/g, " "); // Multiple spaces to single
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, "\n\n"); // Multiple newlines to double
  cleaned = cleaned.replace(/>\s+</g, "><"); // Remove spaces between tags

  // 9. Fix malformed links
  cleaned = cleaned.replace(/<a[^>]*href=["']#["'][^>]*>(.*?)<\/a>/gi, "$1"); // Remove anchor links with no href
  cleaned = cleaned.replace(/<a[^>]*href=["']javascript:[^"']*["'][^>]*>(.*?)<\/a>/gi, "$1"); // Remove javascript links

  // 10. Remove WordPress image captions wrapper but keep image
  cleaned = cleaned.replace(/<figure[^>]*class=["'][^"']*wp-caption[^"']*["'][^>]*>/gi, "<figure>");
  cleaned = cleaned.replace(/<figcaption[^>]*class=["'][^"']*wp-caption-text[^"']*["'][^>]*>/gi, "<figcaption>");

  // 11. Clean up table tags (remove WordPress table classes)
  cleaned = cleaned.replace(/<table[^>]*class=["'][^"']*["'][^>]*>/gi, "<table>");
  cleaned = cleaned.replace(/<tr[^>]*class=["'][^"']*["'][^>]*>/gi, "<tr>");
  cleaned = cleaned.replace(/<td[^>]*class=["'][^"']*["'][^>]*>/gi, "<td>");
  cleaned = cleaned.replace(/<th[^>]*class=["'][^"']*["'][^>]*>/gi, "<th>");

  // 12. Remove comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "");

  // 13. Fix broken image tags
  cleaned = cleaned.replace(/<img([^>]*?)src=["']([^"']*)["']([^>]*?)>/gi, (match, before, src, after) => {
    if (!src || src.trim() === "") {
      return ""; // Remove images with no src
    }
    return `<img${before}src="${src}"${after} />`;
  });

  // 14. Remove empty attributes
  cleaned = cleaned.replace(/\s+class=["']\s*["']/gi, "");
  cleaned = cleaned.replace(/\s+id=["']\s*["']/gi, "");
  cleaned = cleaned.replace(/\s+style=["']\s*["']/gi, "");

  // 15. Normalize line breaks
  cleaned = cleaned.replace(/\r\n/g, "\n");
  cleaned = cleaned.replace(/\r/g, "\n");

  // 16. Trim whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Clean and fix text content (for excerpts, titles, etc.)
 */
export function cleanWordPressText(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  let cleaned = text;

  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, "");

  // Fix HTML entities
  cleaned = cleaned.replace(/&nbsp;/g, " ");
  cleaned = cleaned.replace(/&amp;/g, "&");
  cleaned = cleaned.replace(/&lt;/g, "<");
  cleaned = cleaned.replace(/&gt;/g, ">");
  cleaned = cleaned.replace(/&quot;/g, '"');
  cleaned = cleaned.replace(/&#8217;/g, "'");
  cleaned = cleaned.replace(/&#8216;/g, "'");
  cleaned = cleaned.replace(/&#8220;/g, '"');
  cleaned = cleaned.replace(/&#8221;/g, '"');
  cleaned = cleaned.replace(/&#8211;/g, "–");
  cleaned = cleaned.replace(/&#8212;/g, "—");
  cleaned = cleaned.replace(/&#8230;/g, "…");

  // Clean up whitespace
  cleaned = cleaned.replace(/\s+/g, " ");
  cleaned = cleaned.replace(/\n\s*\n/g, "\n");
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Fix common formatting issues in content
 */
export function fixContentFormatting(content: string): string {
  if (!content || typeof content !== "string") {
    return "";
  }

  let fixed = content;

  // Fix paragraphs that are missing closing tags
  const openP = (fixed.match(/<p[^>]*>/gi) || []).length;
  const closeP = (fixed.match(/<\/p>/gi) || []).length;
  if (openP > closeP) {
    // Add missing closing tags at the end
    for (let i = 0; i < openP - closeP; i++) {
      fixed += "</p>";
    }
  }

  // Fix headings that might be malformed
  fixed = fixed.replace(/<h([1-6])[^>]*>([^<]*)<\/h([1-7])>/gi, (match, openLevel, content, closeLevel) => {
    if (openLevel !== closeLevel) {
      return `<h${openLevel}>${content}</h${openLevel}>`;
    }
    return match;
  });

  // Ensure proper spacing around block elements
  fixed = fixed.replace(/(<\/p>)(<h[1-6])/gi, "$1\n$2");
  fixed = fixed.replace(/(<\/h[1-6]>)(<p)/gi, "$1\n$2");
  fixed = fixed.replace(/(<\/p>)(<ul|<ol)/gi, "$1\n$2");
  fixed = fixed.replace(/(<\/ul>|<\/ol>)(<p)/gi, "$1\n$2");

  return fixed;
}

/**
 * Comprehensive WordPress content cleaner - applies all fixes
 */
export function cleanWordPressContent(content: string): string {
  if (!content || typeof content !== "string") {
    return "";
  }

  // Apply all cleaning steps
  let cleaned = cleanWordPressHTML(content);
  cleaned = fixContentFormatting(cleaned);
  
  return cleaned;
}

