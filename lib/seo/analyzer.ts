interface SEOAnalysis {
  title: {
    score: number;
    length: number;
    optimal: boolean;
    hasKeyword: boolean;
    recommendations: string[];
  };
  metaDescription: {
    score: number;
    length: number;
    optimal: boolean;
    hasKeyword: boolean;
    hasCTA: boolean;
    recommendations: string[];
  };
  headings: {
    score: number;
    h1Count: number;
    h2Count: number;
    h3Count: number;
    hasH1: boolean;
    properHierarchy: boolean;
    keywordUsage: boolean;
    recommendations: string[];
  };
  images: {
    score: number;
    totalImages: number;
    imagesWithAlt: number;
    altTextCoverage: number;
    recommendations: string[];
  };
  content: {
    score: number;
    wordCount: number;
    keywordDensity: number;
    readabilityScore: number;
    recommendations: string[];
  };
  links: {
    score: number;
    internalLinks: number;
    externalLinks: number;
    linkRatio: number;
    recommendations: string[];
  };
  schema: {
    score: number;
    hasSchema: boolean;
    recommendations: string[];
  };
  url: {
    score: number;
    length: number;
    hasKeyword: boolean;
    readable: boolean;
    recommendations: string[];
  };
  overall: {
    score: number;
    rating: "Excellent" | "Good" | "Needs Improvement" | "Poor";
    recommendations: string[];
  };
}

interface BlogPostData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string | null;
}

export class SEOAnalyzer {
  private extractTextFromMarkdown(markdown: string): string {
    // Remove markdown syntax to get plain text
    return markdown
      .replace(/#{1,6}\s+/g, "") // Remove headers
      .replace(/\*\*([^*]+)\*\*/g, "$1") // Remove bold
      .replace(/\*([^*]+)\*/g, "$1") // Remove italic
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // Remove links, keep text
      .replace(/!\[([^\]]*)\]\([^\)]+\)/g, "") // Remove images
      .replace(/`([^`]+)`/g, "$1") // Remove code
      .replace(/```[\s\S]*?```/g, "") // Remove code blocks
      .replace(/\n+/g, " ") // Replace newlines with spaces
      .trim();
  }

  private extractHeadings(markdown: string): {
    h1: string[];
    h2: string[];
    h3: string[];
  } {
    const h1Matches = markdown.match(/^#\s+(.+)$/gm) || [];
    const h2Matches = markdown.match(/^##\s+(.+)$/gm) || [];
    const h3Matches = markdown.match(/^###\s+(.+)$/gm) || [];

    return {
      h1: h1Matches.map((h) => h.replace(/^#\s+/, "").trim()),
      h2: h2Matches.map((h) => h.replace(/^##\s+/, "").trim()),
      h3: h3Matches.map((h) => h.replace(/^###\s+/, "").trim()),
    };
  }

  private extractImages(markdown: string, featuredImage?: string | null): {
    total: number;
    withAlt: number;
  } {
    const imageRegex = /!\[([^\]]*)\]\([^\)]+\)/g;
    const matches = markdown.match(imageRegex) || [];
    const withAlt = matches.filter((img) => {
      const altMatch = img.match(/!\[([^\]]+)\]/);
      return altMatch && altMatch[1].trim().length > 0;
    }).length;

    // Include featured image in total count
    const totalImages = matches.length + (featuredImage ? 1 : 0);
    // Featured images are typically set with proper alt text via media selector
    // Count featured image as having alt text if it exists
    const totalWithAlt = withAlt + (featuredImage ? 1 : 0);

    return {
      total: totalImages,
      withAlt: totalWithAlt,
    };
  }

  private extractLinks(markdown: string): {
    internal: number;
    external: number;
  } {
    const linkRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;
    const matches = [...markdown.matchAll(linkRegex)];
    const baseUrl = process.env.NEXTAUTH_URL || "";

    let internal = 0;
    let external = 0;

    matches.forEach((match) => {
      const url = match[2];
      if (url.startsWith("/") || url.startsWith(baseUrl) || url.startsWith("#")) {
        internal++;
      } else if (url.startsWith("http://") || url.startsWith("https://")) {
        external++;
      } else {
        internal++; // Relative links are considered internal
      }
    });

    return { internal, external };
  }

  private calculateReadability(text: string): number {
    // Simplified Flesch Reading Ease calculation
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    const syllables = words.reduce((count, word) => {
      return count + this.countSyllables(word);
    }, 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    const score =
      206.835 -
      1.015 * avgSentenceLength -
      84.6 * avgSyllablesPerWord;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
    word = word.replace(/^y/, "");
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  private calculateKeywordDensity(text: string, keyword: string): number {
    if (!keyword || keyword.length === 0) return 0;
    const words = text.toLowerCase().split(/\s+/);
    const keywordLower = keyword.toLowerCase();
    const keywordWords = keywordLower.split(/\s+/);
    const totalWords = words.length;

    if (totalWords === 0) return 0;

    let matches = 0;
    if (keywordWords.length === 1) {
      matches = words.filter((w) => w === keywordWords[0]).length;
    } else {
      // Multi-word keyword
      for (let i = 0; i <= words.length - keywordWords.length; i++) {
        const slice = words.slice(i, i + keywordWords.length);
        if (slice.join(" ") === keywordWords.join(" ")) {
          matches++;
        }
      }
    }

    return (matches / totalWords) * 100;
  }

  private extractKeyword(title: string, slug: string): string {
    // Extract main keyword from title or slug
    const slugWords = slug.split("-").filter((w) => w.length > 3);
    if (slugWords.length > 0) {
      return slugWords[0];
    }
    const titleWords = title.split(/\s+/).filter((w) => w.length > 3);
    return titleWords[0] || "";
  }

  public analyze(post: BlogPostData): SEOAnalysis {
    const keyword = this.extractKeyword(post.title, post.slug);
    const plainText = this.extractTextFromMarkdown(post.content);
    const wordCount = plainText.split(/\s+/).filter((w) => w.length > 0).length;
    const headings = this.extractHeadings(post.content);
    const images = this.extractImages(post.content, post.featuredImage);
    const links = this.extractLinks(post.content);
    const readability = this.calculateReadability(plainText);
    const keywordDensity = this.calculateKeywordDensity(plainText, keyword);

    // Title Analysis
    const titleLength = post.title.length;
    const titleOptimal = titleLength >= 50 && titleLength <= 60;
    const titleHasKeyword = post.title.toLowerCase().includes(keyword.toLowerCase());
    let titleScore = 0;
    const titleRecommendations: string[] = [];

    if (titleOptimal) titleScore += 50;
    else if (titleLength < 50) titleRecommendations.push("Title is too short (aim for 50-60 characters)");
    else if (titleLength > 60) titleRecommendations.push("Title is too long (aim for 50-60 characters)");

    if (titleHasKeyword) titleScore += 30;
    else titleRecommendations.push("Include your main keyword in the title");

    if (titleLength > 0 && titleLength <= 70) titleScore += 20;
    else titleRecommendations.push("Keep title under 70 characters for best display");

    // Meta Description Analysis
    const metaLength = post.excerpt.length;
    const metaOptimal = metaLength >= 150 && metaLength <= 160;
    const metaHasKeyword = post.excerpt.toLowerCase().includes(keyword.toLowerCase());
    const metaHasCTA = /(learn|read|discover|explore|get|try|start|click|visit|download)/i.test(post.excerpt);
    let metaScore = 0;
    const metaRecommendations: string[] = [];

    if (metaOptimal) metaScore += 40;
    else if (metaLength < 150) metaRecommendations.push("Meta description is too short (aim for 150-160 characters)");
    else if (metaLength > 160) metaRecommendations.push("Meta description is too long (aim for 150-160 characters)");

    if (metaHasKeyword) metaScore += 30;
    else metaRecommendations.push("Include your main keyword in the meta description");

    if (metaHasCTA) metaScore += 20;
    else metaRecommendations.push("Add a call-to-action to your meta description");

    if (metaLength > 0) metaScore += 10;

    // Headings Analysis
    const hasH1 = headings.h1.length > 0;
    const properHierarchy = hasH1 && headings.h1.length === 1;
    const keywordInHeadings = [...headings.h1, ...headings.h2, ...headings.h3]
      .some((h) => h.toLowerCase().includes(keyword.toLowerCase()));
    let headingsScore = 0;
    const headingsRecommendations: string[] = [];

    if (properHierarchy) headingsScore += 40;
    else {
      if (headings.h1.length === 0) headingsRecommendations.push("Add exactly one H1 heading");
      if (headings.h1.length > 1) headingsRecommendations.push("Use only one H1 heading");
    }

    if (headings.h2.length > 0) headingsScore += 20;
    else headingsRecommendations.push("Add H2 headings to structure your content");

    if (keywordInHeadings) headingsScore += 20;
    else headingsRecommendations.push("Include your keyword in at least one heading");

    if (headings.h2.length > 0 || headings.h3.length > 0) headingsScore += 20;

    // Images Analysis
    const altTextCoverage = images.total > 0 ? (images.withAlt / images.total) * 100 : 100;
    let imagesScore = 0;
    const imagesRecommendations: string[] = [];

    if (images.total === 0) {
      imagesRecommendations.push("Add images to improve engagement");
      imagesScore = 30;
    } else {
      if (altTextCoverage === 100) imagesScore += 70;
      else if (altTextCoverage >= 80) imagesScore += 50;
      else imagesScore += 20;

      if (altTextCoverage < 100) {
        const imagesWithoutAlt = images.total - images.withAlt;
        imagesRecommendations.push(
          `Add alt text to ${imagesWithoutAlt} image(s)`
        );
      }

      // Featured image is already counted in total, so we don't need to add extra points
      // But we can still recommend it if missing
      if (!post.featuredImage && images.total === 0) {
        imagesRecommendations.push("Add a featured image");
      }
    }

    // Content Analysis
    let contentScore = 0;
    const contentRecommendations: string[] = [];

    if (wordCount >= 300) contentScore += 30;
    else {
      contentScore += (wordCount / 300) * 30;
      contentRecommendations.push(`Increase word count (currently ${wordCount}, aim for 300+)`);
    }

    if (keywordDensity >= 1 && keywordDensity <= 2) contentScore += 25;
    else if (keywordDensity > 0) {
      contentScore += 15;
      if (keywordDensity < 1) contentRecommendations.push("Increase keyword density (aim for 1-2%)");
      if (keywordDensity > 2) contentRecommendations.push("Reduce keyword density (aim for 1-2%)");
    } else {
      contentRecommendations.push("Include your main keyword in the content");
    }

    if (readability >= 60) contentScore += 25;
    else if (readability >= 40) {
      contentScore += 15;
      contentRecommendations.push("Improve readability (aim for 60+)");
    } else {
      contentScore += 5;
      contentRecommendations.push("Significantly improve readability (aim for 60+)");
    }

    if (wordCount > 0) contentScore += 20;

    // Links Analysis
    const totalLinks = links.internal + links.external;
    const linkRatio = totalLinks > 0 ? links.internal / totalLinks : 0;
    let linksScore = 0;
    const linksRecommendations: string[] = [];

    if (totalLinks >= 3) linksScore += 40;
    else {
      linksScore += (totalLinks / 3) * 40;
      linksRecommendations.push("Add more internal/external links (aim for 3+)");
    }

    if (linkRatio >= 0.6) linksScore += 30;
    else {
      linksScore += (linkRatio / 0.6) * 30;
      linksRecommendations.push("Add more internal links (aim for 60%+ internal)");
    }

    if (links.external > 0) linksScore += 30;
    else linksRecommendations.push("Add external links to authoritative sources");

    // Schema Analysis
    const hasSchema = /schema\.org|application\/ld\+json/i.test(post.content);
    let schemaScore = 0;
    const schemaRecommendations: string[] = [];

    if (hasSchema) {
      schemaScore = 100;
    } else {
      schemaScore = 0;
      schemaRecommendations.push("Add structured data (Schema.org JSON-LD)");
    }

    // URL/Slug Analysis
    const slugLength = post.slug.length;
    const slugHasKeyword = post.slug.includes(keyword.toLowerCase().replace(/\s+/g, "-"));
    const slugReadable = /^[a-z0-9-]+$/.test(post.slug) && !post.slug.includes("--");
    let urlScore = 0;
    const urlRecommendations: string[] = [];

    if (slugLength >= 3 && slugLength <= 50) urlScore += 40;
    else {
      if (slugLength < 3) urlRecommendations.push("Slug is too short");
      if (slugLength > 50) urlRecommendations.push("Slug is too long (aim for 3-50 characters)");
    }

    if (slugHasKeyword) urlScore += 30;
    else urlRecommendations.push("Include your keyword in the URL slug");

    if (slugReadable) urlScore += 30;
    else urlRecommendations.push("Use only lowercase letters, numbers, and hyphens in slug");

    // Calculate Overall Score
    const overallScore = Math.round(
      titleScore * 0.2 +
      metaScore * 0.15 +
      contentScore * 0.25 +
      imagesScore * 0.15 +
      linksScore * 0.1 +
      schemaScore * 0.1 +
      urlScore * 0.05
    );

    let rating: "Excellent" | "Good" | "Needs Improvement" | "Poor";
    if (overallScore >= 90) rating = "Excellent";
    else if (overallScore >= 70) rating = "Good";
    else if (overallScore >= 50) rating = "Needs Improvement";
    else rating = "Poor";

    const allRecommendations = [
      ...titleRecommendations,
      ...metaRecommendations,
      ...headingsRecommendations,
      ...imagesRecommendations,
      ...contentRecommendations,
      ...linksRecommendations,
      ...schemaRecommendations,
      ...urlRecommendations,
    ];

    return {
      title: {
        score: Math.min(100, titleScore),
        length: titleLength,
        optimal: titleOptimal,
        hasKeyword: titleHasKeyword,
        recommendations: titleRecommendations,
      },
      metaDescription: {
        score: Math.min(100, metaScore),
        length: metaLength,
        optimal: metaOptimal,
        hasKeyword: metaHasKeyword,
        hasCTA: metaHasCTA,
        recommendations: metaRecommendations,
      },
      headings: {
        score: Math.min(100, headingsScore),
        h1Count: headings.h1.length,
        h2Count: headings.h2.length,
        h3Count: headings.h3.length,
        hasH1: hasH1,
        properHierarchy: properHierarchy,
        keywordUsage: keywordInHeadings,
        recommendations: headingsRecommendations,
      },
      images: {
        score: Math.min(100, imagesScore),
        totalImages: images.total,
        imagesWithAlt: images.withAlt,
        altTextCoverage: Math.round(altTextCoverage),
        recommendations: imagesRecommendations,
      },
      content: {
        score: Math.min(100, contentScore),
        wordCount,
        keywordDensity: Math.round(keywordDensity * 100) / 100,
        readabilityScore: readability,
        recommendations: contentRecommendations,
      },
      links: {
        score: Math.min(100, linksScore),
        internalLinks: links.internal,
        externalLinks: links.external,
        linkRatio: Math.round(linkRatio * 100),
        recommendations: linksRecommendations,
      },
      schema: {
        score: Math.min(100, schemaScore),
        hasSchema,
        recommendations: schemaRecommendations,
      },
      url: {
        score: Math.min(100, urlScore),
        length: slugLength,
        hasKeyword: slugHasKeyword,
        readable: slugReadable,
        recommendations: urlRecommendations,
      },
      overall: {
        score: overallScore,
        rating,
        recommendations: allRecommendations.slice(0, 10), // Top 10 recommendations
      },
    };
  }
}

export function analyzeSEO(post: BlogPostData): SEOAnalysis {
  const analyzer = new SEOAnalyzer();
  return analyzer.analyze(post);
}

