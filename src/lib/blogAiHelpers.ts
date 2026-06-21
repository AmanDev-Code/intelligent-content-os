import { apiClient } from "./apiClient";

export interface AiGenerationResult {
  success: boolean;
  content: string;
  error?: string;
}

export async function generateTitleFromKeyword(keyword: string): Promise<AiGenerationResult> {
  try {
    const response = await apiClient.post("/admin/content-engine/generate-title", {
      keyword: keyword.trim(),
    });
    return {
      success: true,
      content: (response as { title: string }).title || "",
    };
  } catch (error) {
    return {
      success: false,
      content: "",
      error: error instanceof Error ? error.message : "Failed to generate title",
    };
  }
}

export async function generateExcerptFromBody(body: string): Promise<AiGenerationResult> {
  try {
    const response = await apiClient.post("/admin/content-engine/generate-excerpt", {
      body: body.trim(),
    });
    return {
      success: true,
      content: (response as { excerpt: string }).excerpt || "",
    };
  } catch (error) {
    return {
      success: false,
      content: "",
      error: error instanceof Error ? error.message : "Failed to generate excerpt",
    };
  }
}

export async function enhanceBodyWithAI(body: string, instructions?: string): Promise<AiGenerationResult> {
  try {
    const response = await apiClient.post("/admin/content-engine/enhance-content", {
      body: body.trim(),
      instructions: instructions?.trim() || "Expand and improve this content while maintaining the original structure and key points.",
    });
    return {
      success: true,
      content: (response as { enhanced_body: string }).enhanced_body || "",
    };
  } catch (error) {
    return {
      success: false,
      content: "",
      error: error instanceof Error ? error.message : "Failed to enhance content",
    };
  }
}

export async function generateFAQFromBody(body: string): Promise<{ success: boolean; faq: Array<{ question: string; answer: string }>; error?: string }> {
  try {
    const response = await apiClient.post("/admin/content-engine/generate-faq", {
      body: body.trim(),
    });
    return {
      success: true,
      faq: (response as { faq: Array<{ question: string; answer: string }> }).faq || [],
    };
  } catch (error) {
    return {
      success: false,
      faq: [],
      error: error instanceof Error ? error.message : "Failed to generate FAQ",
    };
  }
}

export async function generateSEOMetadata(
  title: string,
  body: string,
  keyword?: string
): Promise<{
  success: boolean;
  seo_title: string;
  seo_description: string;
  keywords: string;
  error?: string;
}> {
  try {
    const response = await apiClient.post("/admin/content-engine/generate-seo", {
      title: title.trim(),
      body: body.trim(),
      keyword: keyword?.trim(),
    });
    const data = response as { seo_title: string; seo_description: string; keywords: string };
    return {
      success: true,
      seo_title: data.seo_title || "",
      seo_description: data.seo_description || "",
      keywords: data.keywords || "",
    };
  } catch (error) {
    return {
      success: false,
      seo_title: "",
      seo_description: "",
      keywords: "",
      error: error instanceof Error ? error.message : "Failed to generate SEO metadata",
    };
  }
}

export async function generateSEOMetadataWithOG(
  postId: string,
): Promise<{
  success: boolean;
  title: string;
  metaDescription: string;
  keywords: string;
  ogImageUrl: string | null;
  error?: string;
}> {
  try {
    const response = await apiClient.post(
      `/admin/content-engine/optimize/${postId}/generate-seo-meta`,
      {},
    );
    const data = response as {
      title: string;
      metaDescription: string;
      keywords: string;
      ogImageUrl: string | null;
    };
    return {
      success: true,
      title: data.title || "",
      metaDescription: data.metaDescription || "",
      keywords: data.keywords || "",
      ogImageUrl: data.ogImageUrl || null,
    };
  } catch (error) {
    return {
      success: false,
      title: "",
      metaDescription: "",
      keywords: "",
      ogImageUrl: null,
      error: error instanceof Error ? error.message : "Failed to generate SEO metadata",
    };
  }
}

export function calculateReadingTime(markdown: string): number {
  const wordsPerMinute = 200;
  const text = markdown
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[.*?\]\(.*?\)/g, "")
    .replace(/#+ /g, "")
    .replace(/[*_~`]/g, "");
  
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function insertImageInMarkdown(
  markdown: string,
  imageUrl: string,
  altText: string,
  position: "top" | "after-first-h2" | "cursor",
  cursorPosition?: number
): string {
  const imageMarkdown = `![${altText}](${imageUrl})\n\n`;

  if (position === "cursor" && cursorPosition !== undefined) {
    return markdown.slice(0, cursorPosition) + imageMarkdown + markdown.slice(cursorPosition);
  }

  if (position === "top") {
    return imageMarkdown + markdown;
  }

  if (position === "after-first-h2") {
    const h2Match = markdown.match(/^## .+$/m);
    if (h2Match && h2Match.index !== undefined) {
      const endOfH2 = h2Match.index + h2Match[0].length;
      const afterH2 = markdown.slice(endOfH2).match(/\n+/);
      const insertAt = endOfH2 + (afterH2 ? afterH2[0].length : 1);
      return markdown.slice(0, insertAt) + imageMarkdown + markdown.slice(insertAt);
    }
  }

  return imageMarkdown + markdown;
}

/**
 * Detect visual content patterns in markdown and suggest image types
 */
export function detectVisualOpportunities(markdown: string): Array<{
  heading: string;
  type: 'comparison' | 'chart' | 'workflow' | 'market' | 'timeline';
  position: number;
}> {
  const opportunities: Array<{
    heading: string;
    type: 'comparison' | 'chart' | 'workflow' | 'market' | 'timeline';
    position: number;
  }> = [];

  const patterns = [
    {
      regex: /^#{2,3}\s+(.+?(?:comparison|vs\.?|versus|compared|difference|alternative).+?)$/gim,
      type: 'comparison' as const,
    },
    {
      regex: /^#{2,3}\s+(.+?(?:performance|metrics|statistics|data|numbers|results).+?)$/gim,
      type: 'chart' as const,
    },
    {
      regex: /^#{2,3}\s+(.+?(?:process|workflow|steps|how to|guide|tutorial).+?)$/gim,
      type: 'workflow' as const,
    },
    {
      regex: /^#{2,3}\s+(.+?(?:market|share|breakdown|distribution|analysis).+?)$/gim,
      type: 'market' as const,
    },
    {
      regex: /^#{2,3}\s+(.+?(?:timeline|growth|trend|history|evolution).+?)$/gim,
      type: 'timeline' as const,
    },
  ];

  for (const { regex, type } of patterns) {
    const matches = [...markdown.matchAll(regex)];
    for (const match of matches) {
      if (match.index !== undefined) {
        opportunities.push({
          heading: match[1],
          type,
          position: match.index + match[0].length,
        });
      }
    }
  }

  return opportunities.sort((a, b) => a.position - b.position);
}

/**
 * Intelligently insert images into markdown based on content patterns
 */
export function insertImagesIntelligently(
  markdown: string,
  primaryKeyword: string,
  options: {
    addHeroImage?: boolean;
    detectVisualPatterns?: boolean;
    maxImages?: number;
  } = {}
): string {
  const {
    addHeroImage = true,
    detectVisualPatterns = true,
    maxImages = 10,
  } = options;

  let result = markdown;
  const insertedPositions: number[] = [];

  // 1. Add hero image at top
  if (addHeroImage) {
    const heroUrl = `https://source.unsplash.com/1200x600/?${encodeURIComponent(primaryKeyword)}`;
    result = `![${primaryKeyword}](${heroUrl} "${primaryKeyword} overview")\n\n${result}`;
  }

  // 2. Detect and insert visual patterns
  if (detectVisualPatterns) {
    const opportunities = detectVisualOpportunities(result);
    
    for (const opportunity of opportunities.slice(0, maxImages - 1)) {
      // Skip if already inserted nearby
      if (insertedPositions.some(pos => Math.abs(pos - opportunity.position) < 200)) {
        continue;
      }

      const keywords = {
        comparison: ['comparison chart', 'versus', 'side by side'],
        chart: ['chart', 'graph', 'data visualization'],
        workflow: ['workflow diagram', 'process flow', 'step by step'],
        market: ['pie chart', 'market share', 'distribution'],
        timeline: ['timeline', 'trend graph', 'growth chart'],
      };

      const selectedKeyword = keywords[opportunity.type][0];
      const cleanHeading = opportunity.heading.toLowerCase().replace(/[^a-z0-9\s]/g, '');
      const imageKeyword = `${cleanHeading.split(' ').slice(0, 4).join(' ')} ${selectedKeyword}`;
      const imageUrl = `https://source.unsplash.com/800x500/?${encodeURIComponent(imageKeyword)}`;
      
      const visualTypeLabel = opportunity.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      const imageMarkdown = `\n\n![${opportunity.heading}](${imageUrl} "${visualTypeLabel}: ${opportunity.heading}")\n\n`;
      
      result = result.slice(0, opportunity.position) + imageMarkdown + result.slice(opportunity.position);
      insertedPositions.push(opportunity.position);
    }
  }

  return result;
}
