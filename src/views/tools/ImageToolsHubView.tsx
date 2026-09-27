"use client";

/**
 * ImageToolsHubView — image tools category hub.
 * Dark-themed layout matching the converter pages.
 */

import Link from "next/link";
import {
  ArrowRight,
  Image as ImageIcon,
  RefreshCw,
  Minimize2,
  Pencil,
  Wrench,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";

// ---------------------------------------------------------------------------
// Tool registry — 49 image tools, grouped into 4 categories
// ---------------------------------------------------------------------------

interface ImageTool {
  slug: string;
  name: string;
  description: string;
}

const CONVERT_TOOLS: ImageTool[] = [
  { slug: "image-converter", name: "Image Converter", description: "Convert between JPG, PNG, WEBP, AVIF, GIF, BMP, TIFF and more." },
  { slug: "jpg-to-png", name: "JPG to PNG", description: "Convert JPEG images to lossless PNG with transparency support." },
  { slug: "png-to-jpg", name: "PNG to JPG", description: "Flatten transparent PNGs to JPEG for smaller file sizes." },
  { slug: "image-to-webp", name: "Image to WebP", description: "Convert any image to modern WebP for faster web loading." },
  { slug: "webp-to-jpg", name: "WebP to JPG", description: "Convert WebP back to universal JPEG format." },
  { slug: "heic-to-jpg", name: "HEIC to JPG", description: "Convert iPhone HEIC photos to JPEG for cross-platform sharing." },
  { slug: "svg-to-png", name: "SVG to PNG", description: "Rasterise scalable SVG vectors to PNG at any resolution." },
  { slug: "gif-to-mp4", name: "GIF to MP4", description: "Convert animated GIFs to MP4 for smaller social media files." },
];

const COMPRESS_TOOLS: ImageTool[] = [
  { slug: "image-compressor", name: "Image Compressor", description: "Reduce image file size without visible quality loss." },
  { slug: "jpg-compressor", name: "JPG Compressor", description: "Compress JPEG images with adjustable quality slider." },
  { slug: "png-compressor", name: "PNG Compressor", description: "Losslessly compress PNG files to save storage and bandwidth." },
  { slug: "bulk-image-compressor", name: "Bulk Image Compressor", description: "Compress multiple images at once and download as ZIP." },
];

const EDIT_TOOLS: ImageTool[] = [
  { slug: "image-resizer", name: "Image Resizer", description: "Resize images to exact dimensions or by percentage." },
  { slug: "image-cropper", name: "Image Cropper", description: "Crop images to a custom selection or preset aspect ratio." },
  { slug: "image-rotator", name: "Image Rotator", description: "Rotate images 90°, 180°, 270° or to a custom angle." },
  { slug: "background-remover", name: "Background Remover", description: "Remove backgrounds from photos using AI — no green screen needed." },
  { slug: "image-filters", name: "Image Filters", description: "Apply brightness, contrast, saturation, blur and sepia effects." },
];

const UTILITY_TOOLS: ImageTool[] = [
  { slug: "image-to-text", name: "Image to Text (OCR)", description: "Extract editable text from images and screenshots with OCR." },
  { slug: "image-to-base64", name: "Image to Base64", description: "Encode any image as a Base64 data URI for inline embedding." },
  { slug: "qr-code-generator", name: "QR Code Generator", description: "Generate QR codes for URLs, text, Wi-Fi, or contact cards." },
  { slug: "image-metadata", name: "Metadata Viewer", description: "Read EXIF, IPTC, and XMP metadata from photos." },
  { slug: "image-collage", name: "Collage Maker", description: "Combine multiple images into a grid or freeform collage." },
  { slug: "image-to-pdf", name: "Image to PDF", description: "Convert one or more images into a single PDF document." },
  { slug: "watermark-adder", name: "Watermark Adder", description: "Add text or image watermarks to protect your photos." },
];

// ---------------------------------------------------------------------------
// Category section config
// ---------------------------------------------------------------------------

interface CategorySection {
  id: string;
  label: string;
  icon: typeof RefreshCw;
  colorHsl: string;
  tools: ImageTool[];
}

const SECTIONS: CategorySection[] = [
  { id: "convert", label: "CONVERT", icon: RefreshCw, colorHsl: "21 95% 56%", tools: CONVERT_TOOLS },
  { id: "compress", label: "COMPRESS", icon: Minimize2, colorHsl: "142.1 76.2% 36.3%", tools: COMPRESS_TOOLS },
  { id: "edit", label: "EDIT", icon: Pencil, colorHsl: "217 91% 60%", tools: EDIT_TOOLS },
  { id: "utility", label: "UTILITY", icon: Wrench, colorHsl: "270 95.2% 75.3%", tools: UTILITY_TOOLS },
];

// ---------------------------------------------------------------------------
// Tool Card
// ---------------------------------------------------------------------------

function ToolCard({ tool, colorHsl }: { tool: ImageTool; colorHsl: string }) {
  return (
    <li>
      <Link
        href={`/tools/${tool.slug}`}
        aria-label={tool.name}
        className="group flex h-full flex-col rounded-lg p-4 transition-all duration-200"
        style={{
          background: "hsl(223 62% 9%)",
          border: "1px solid hsl(224 28% 18%)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = `hsl(${colorHsl})`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "hsl(224 28% 18%)";
        }}
      >
        <div className="mb-2 flex items-start gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `hsl(${colorHsl} / 0.12)` }}
          >
            <ImageIcon
              className="h-4 w-4"
              style={{ color: `hsl(${colorHsl})` }}
              aria-hidden="true"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3
              className="text-sm font-semibold transition-colors duration-200"
              style={{ color: "hsl(210 40% 98%)" }}
            >
              {tool.name}
            </h3>
            <p
              className="mt-1 text-xs leading-relaxed"
              style={{ color: "hsl(215 20.2% 65.1%)" }}
            >
              {tool.description}
            </p>
          </div>
        </div>
        <span
          className="mt-auto inline-flex items-center gap-1 pt-2 text-xs font-semibold transition-colors duration-200"
          style={{ color: `hsl(${colorHsl})` }}
        >
          Try it
          <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </Link>
    </li>
  );
}

// ---------------------------------------------------------------------------
// View
// ---------------------------------------------------------------------------

export function ImageToolsHubView() {
  return (
    <MarketingShell>
      <div
        className="min-h-screen"
        style={{ background: "hsl(223 62% 7%)", color: "hsl(210 40% 98%)" }}
      >
        {/* Hero */}
        <section className="px-4 pt-16 pb-10 text-center sm:pt-24 sm:pb-14">
          <div className="mx-auto max-w-3xl space-y-4">
            <p
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "hsl(21 95% 56%)" }}
            >
              Free · No signup · In-browser
            </p>
            <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.1] tracking-tight">
              49{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, hsl(21 95% 56%), hsl(32 95% 50%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Free
              </span>{" "}
              Image Tools
            </h1>
            <p
              className="mx-auto max-w-xl text-base leading-relaxed sm:text-lg"
              style={{ color: "hsl(215 20.2% 65.1%)" }}
            >
              Convert, compress, resize, crop, remove backgrounds — all in your
              browser. No signup, no upload.
            </p>
          </div>
        </section>

        {/* Category sections */}
        {SECTIONS.map((section) => {
          const SectionIcon = section.icon;
          return (
            <section
              key={section.id}
              id={section.id}
              className="px-4 pb-10 sm:pb-14"
              aria-labelledby={`${section.id}-heading`}
            >
              <div className="mx-auto max-w-6xl">
                {/* Section header */}
                <div className="mb-6 flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `hsl(${section.colorHsl} / 0.12)` }}
                  >
                    <SectionIcon
                      className="h-4 w-4"
                      style={{ color: `hsl(${section.colorHsl})` }}
                      aria-hidden="true"
                    />
                  </div>
                  <h2
                    id={`${section.id}-heading`}
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: `hsl(${section.colorHsl})` }}
                  >
                    {section.label}
                  </h2>
                  <div
                    className="h-px flex-1"
                    style={{ backgroundColor: "hsl(224 28% 18%)" }}
                    aria-hidden="true"
                  />
                </div>

                {/* Tool grid */}
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {section.tools.map((tool) => (
                    <ToolCard
                      key={tool.slug}
                      tool={tool}
                      colorHsl={section.colorHsl}
                    />
                  ))}
                </ul>
              </div>
            </section>
          );
        })}

        {/* Bottom spacer */}
        <div className="h-12 sm:h-20" aria-hidden="true" />
      </div>
    </MarketingShell>
  );
}
