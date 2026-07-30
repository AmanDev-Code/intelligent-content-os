/**
 * Utilities for auto-extracting Table of Contents and FAQ sections
 * from blog post markdown body content.
 */

export interface TocEntry {
  label: string;
  anchor: string;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface ExtractionResult {
  toc: TocEntry[];
  faq: FaqEntry[];
  cleanedBody: string;
}

/** Slugify a heading string into a URL-safe anchor ID (matches rehype-slug behavior). */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Extract TOC entries from all H2 headings in the body.
 * If a literal "## Contents" or "## Table of Contents" bulleted-list section exists,
 * it's removed from the body (it's a manual TOC being replaced by the structured field).
 * The actual H2 headings themselves are NOT removed — they are the article structure.
 */
export function extractTocFromBody(body: string): { toc: TocEntry[]; cleanedBody: string } {
  const lines = body.split("\n");
  const toc: TocEntry[] = [];
  const cleanedLines: string[] = [];
  let insideManualToc = false;
  let skipBlankAfterToc = false;

  // Headings to skip when building TOC (they are meta-sections, not content)
  const META_HEADINGS = new Set([
    "contents",
    "table of contents",
    "faq",
    "frequently asked questions",
    "quick answers",
  ]);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const h2Match = line.match(/^##\s+(.+)$/);

    if (h2Match) {
      const headingText = h2Match[1].replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").trim();
      const headingLower = headingText.toLowerCase();

      // Detect manual TOC section start
      if (headingLower === "contents" || headingLower === "table of contents") {
        insideManualToc = true;
        skipBlankAfterToc = false;
        continue;
      }

      // End manual TOC section if we hit another heading
      if (insideManualToc) {
        insideManualToc = false;
        skipBlankAfterToc = false;
      }

      // Add to TOC if not a meta heading
      if (!META_HEADINGS.has(headingLower)) {
        toc.push({
          label: headingText,
          anchor: slugify(headingText),
        });
      }

      cleanedLines.push(line);
      continue;
    }

    // Skip lines inside manual TOC section (bullet list of links)
    if (insideManualToc) {
      // If we hit an empty line after the list, stop skipping
      if (line.trim() === "" && skipBlankAfterToc) {
        insideManualToc = false;
        continue;
      }
      // Bullet list items or empty lines within the TOC
      if (line.trim().startsWith("-") || line.trim().startsWith("*") || line.trim() === "") {
        skipBlankAfterToc = line.trim() !== "";
        continue;
      }
      // Non-bullet, non-heading content means TOC section ended
      insideManualToc = false;
    }

    cleanedLines.push(line);
  }

  // Trim trailing empty lines that were left after TOC removal
  while (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1].trim() === "") {
    cleanedLines.pop();
  }

  return {
    toc,
    cleanedBody: cleanedLines.join("\n"),
  };
}

/**
 * Extract FAQ section from markdown body.
 * Looks for "## FAQ" or "## Frequently Asked Questions" heading.
 * Parses Q&A pairs in these formats:
 *   - **Question text?**\nAnswer paragraph
 *   - ### Question text?\nAnswer paragraph
 *   - Q: Question text?\nAnswer paragraph
 * Removes the entire FAQ section from the body.
 */
export function extractFaqFromBody(body: string): { faq: FaqEntry[]; cleanedBody: string } {
  const lines = body.split("\n");
  const faq: FaqEntry[] = [];
  let faqStartIndex = -1;
  let faqEndIndex = lines.length;

  // Find the FAQ section
  for (let i = 0; i < lines.length; i++) {
    const h2Match = lines[i].match(/^##\s+(.+)$/);
    if (h2Match) {
      const heading = h2Match[1].trim().toLowerCase();
      if (
        heading === "faq" ||
        heading === "frequently asked questions" ||
        heading === "quick answers"
      ) {
        faqStartIndex = i;
        // Find where it ends (next ## heading or end of file)
        for (let j = i + 1; j < lines.length; j++) {
          if (/^##\s+/.test(lines[j])) {
            faqEndIndex = j;
            break;
          }
        }
        break;
      }
    }
  }

  if (faqStartIndex === -1) {
    return { faq: [], cleanedBody: body };
  }

  // Parse FAQ content between faqStartIndex+1 and faqEndIndex
  const faqLines = lines.slice(faqStartIndex + 1, faqEndIndex);
  let currentQuestion = "";
  let currentAnswer: string[] = [];

  const flushQA = () => {
    if (currentQuestion && currentAnswer.length > 0) {
      faq.push({
        question: currentQuestion,
        answer: currentAnswer.join("\n").trim(),
      });
    }
    currentQuestion = "";
    currentAnswer = [];
  };

  for (const line of faqLines) {
    // Pattern 1: **Question text?**
    const boldMatch = line.match(/^\*\*(.+?)\*\*\s*$/);
    // Pattern 2: ### Question text?
    const h3Match = line.match(/^###\s+(.+)$/);
    // Pattern 3: Q: Question text?
    const qMatch = line.match(/^Q:\s*(.+)$/i);

    if (boldMatch || h3Match || qMatch) {
      flushQA();
      currentQuestion = (boldMatch?.[1] || h3Match?.[1] || qMatch?.[1] || "").trim();
    } else if (currentQuestion) {
      // Accumulate answer lines (skip leading empty lines)
      if (line.trim() === "" && currentAnswer.length === 0) continue;
      currentAnswer.push(line);
    }
  }
  flushQA();

  // Remove the FAQ section from the body
  const beforeFaq = lines.slice(0, faqStartIndex);
  const afterFaq = lines.slice(faqEndIndex);

  // Remove trailing empty lines before the cut
  while (beforeFaq.length > 0 && beforeFaq[beforeFaq.length - 1].trim() === "") {
    beforeFaq.pop();
  }

  const cleanedBody = [...beforeFaq, ...afterFaq].join("\n");

  return { faq, cleanedBody };
}

/**
 * Run both extractions in sequence.
 * 1. Extract and remove FAQ section from body
 * 2. Extract TOC from the remaining headings (remove manual TOC section if present)
 */
export function extractAllFromBody(body: string): ExtractionResult {
  // First extract FAQ (removes that section from body)
  const faqResult = extractFaqFromBody(body);
  // Then extract TOC from the cleaned body (removes manual TOC list if present)
  const tocResult = extractTocFromBody(faqResult.cleanedBody);

  return {
    toc: tocResult.toc,
    faq: faqResult.faq,
    cleanedBody: tocResult.cleanedBody,
  };
}
