"use client";

/**
 * ImageEditShell — shared shell for the 9 image edit/compress tools.
 * Wraps ImageToolsShell with the correct identity props for each tool
 * from image-edit-data.ts.
 *
 * Usage: each tool page renders
 *   <ImageEditShell slug="compress-jpg">
 *     <CompressJpgControls />
 *   </ImageEditShell>
 *
 * Shadcn primitives: none (delegates all to ImageToolsShell).
 * Design tokens: via ImageToolsShell.
 */

import type { ReactNode } from "react";
import { ImageToolsShell } from "@/views/tools/image-tools/ImageToolsShell";
import { getEditTool } from "@/lib/image-edit-data";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ImageEditShellProps {
  /** Slug from image-edit-data.ts — e.g. "compress-jpg", "image-resizer" */
  slug: string;
  /** Tool UI controls rendered in the main content slot */
  children: ReactNode;
  /**
   * Optional override for the H1 highlight word(s).
   * Defaults to the tool's short name derived from slug.
   */
  h1HighlightOverride?: string;
}

// ---------------------------------------------------------------------------
// Helpers — derive H1 parts from tool name
// ---------------------------------------------------------------------------

function deriveH1Parts(name: string): {
  prefix: string;
  highlight: string;
  suffix: string;
} {
  // Most names are "Free X Tool" → prefix="Free", highlight=X, suffix="Tool"
  // e.g. "Free JPG Compressor" → prefix="Free", highlight="JPG", suffix="Compressor"
  // e.g. "Free Online Image Resizer" → prefix="Free Online", highlight="Image", suffix="Resizer"
  const words = name.replace(/^Free\s+(Online\s+)?/i, "").split(" ");
  if (words.length === 1) {
    return { prefix: "Free", highlight: words[0], suffix: "" };
  }
  if (words.length === 2) {
    return { prefix: "Free", highlight: words[0], suffix: words[1] };
  }
  // 3+ words: highlight the middle noun
  const [first, ...rest] = words;
  const last = rest.pop() ?? "";
  return {
    prefix: "Free",
    highlight: first,
    suffix: [...rest, last].join(" "),
  };
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function ImageEditShell({
  slug,
  children,
  h1HighlightOverride,
}: ImageEditShellProps) {
  const tool = getEditTool(slug);

  if (!tool) {
    // Graceful fallback — should not happen in production with valid slugs
    return (
      <ImageToolsShell
        slug={slug}
        toolName={slug}
        h1Prefix="Free"
        h1Highlight="Image"
        h1Suffix="Tool"
        eyebrow="Free Image Tool"
        heroSubline="Process images directly in your browser — no uploads, no signup."
        whyText=""
        faqs={[]}
      >
        {children}
      </ImageToolsShell>
    );
  }

  const { prefix, highlight, suffix } = deriveH1Parts(tool.h1);

  return (
    <ImageToolsShell
      slug={slug}
      toolName={tool.name}
      h1Prefix={prefix}
      h1Highlight={h1HighlightOverride ?? highlight}
      h1Suffix={suffix}
      eyebrow={`Free ${tool.name}`}
      heroSubline={tool.description}
      whyText={tool.description}
      faqs={tool.faqs}
    >
      {children}
    </ImageToolsShell>
  );
}
