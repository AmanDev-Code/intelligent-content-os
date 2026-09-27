"use client";

/**
 * ImageToolsHubView — image tools category hub.
 * Thin client shell; content will be filled in Phase 2.
 */

import Link from "next/link";
import { ArrowRight, Image as ImageIcon } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Tool registry — 49 image tools
// ---------------------------------------------------------------------------

interface ImageTool {
  slug: string;
  name: string;
  description: string;
  live: boolean;
}

const IMAGE_TOOLS: ImageTool[] = [
  // Format conversion (10)
  { slug: "image-converter", name: "Image Converter", description: "Convert between JPG, PNG, WEBP, AVIF, GIF, BMP, TIFF and more.", live: false },
  { slug: "jpg-to-png", name: "JPG to PNG", description: "Convert JPEG images to lossless PNG with transparency support.", live: false },
  { slug: "png-to-jpg", name: "PNG to JPG", description: "Flatten transparent PNGs to JPEG for smaller file sizes.", live: false },
  { slug: "image-to-webp", name: "Image to WebP", description: "Convert any image to modern WebP for faster web loading.", live: false },
  { slug: "webp-to-jpg", name: "WebP to JPG", description: "Convert WebP back to universal JPEG format.", live: false },
  { slug: "heic-to-jpg", name: "HEIC to JPG", description: "Convert iPhone HEIC photos to JPEG for cross-platform sharing.", live: false },
  { slug: "svg-to-png", name: "SVG to PNG", description: "Rasterise scalable SVG vectors to PNG at any resolution.", live: false },
  { slug: "gif-to-mp4", name: "GIF to MP4", description: "Convert animated GIFs to MP4 for smaller social media files.", live: false },
  { slug: "image-to-base64", name: "Image to Base64", description: "Encode any image as a Base64 data URI for inline embedding.", live: false },
  { slug: "base64-to-image", name: "Base64 to Image", description: "Decode a Base64 data URI back to a downloadable image file.", live: false },

  // Optimisation (5)
  { slug: "image-compressor", name: "Image Compressor", description: "Reduce image file size without visible quality loss.", live: false },
  { slug: "jpg-compressor", name: "JPG Compressor", description: "Compress JPEG images with adjustable quality slider.", live: false },
  { slug: "png-compressor", name: "PNG Compressor", description: "Losslessly compress PNG files to save storage and bandwidth.", live: false },
  { slug: "gif-compressor", name: "GIF Compressor", description: "Reduce GIF file size while preserving animation.", live: false },
  { slug: "bulk-image-compressor", name: "Bulk Image Compressor", description: "Compress multiple images at once and download as ZIP.", live: false },

  // Resize & crop (6)
  { slug: "image-resizer", name: "Image Resizer", description: "Resize images to exact dimensions or by percentage.", live: false },
  { slug: "image-cropper", name: "Image Cropper", description: "Crop images to a custom selection or preset aspect ratio.", live: false },
  { slug: "image-aspect-ratio", name: "Aspect Ratio Tool", description: "Resize images to match standard aspect ratios (16:9, 4:3, 1:1…).", live: false },
  { slug: "image-to-square", name: "Image to Square", description: "Pad or crop images into a 1:1 square for social profiles.", live: false },
  { slug: "thumbnail-maker", name: "Thumbnail Maker", description: "Create YouTube and social media thumbnails at exact sizes.", live: false },
  { slug: "bulk-image-resizer", name: "Bulk Image Resizer", description: "Resize a batch of images to the same dimensions in one go.", live: false },

  // Transform (4)
  { slug: "image-rotator", name: "Image Rotator", description: "Rotate images 90°, 180°, 270° or to a custom angle.", live: false },
  { slug: "image-flipper", name: "Image Flipper", description: "Flip images horizontally or vertically in one click.", live: false },
  { slug: "image-enlarger", name: "AI Image Enlarger", description: "Upscale images up to 4× without visible pixelation.", live: false },
  { slug: "image-perspective", name: "Perspective Corrector", description: "Fix keystoning and perspective distortion in photos.", live: false },

  // Filters & effects (6)
  { slug: "image-filters", name: "Image Filters", description: "Apply brightness, contrast, saturation, blur and sepia effects.", live: false },
  { slug: "grayscale-converter", name: "Grayscale Converter", description: "Convert colour images to black-and-white instantly.", live: false },
  { slug: "image-blur", name: "Image Blur", description: "Add Gaussian blur to entire images or selected regions.", live: false },
  { slug: "image-sharpen", name: "Image Sharpener", description: "Sharpen blurry images to improve clarity and detail.", live: false },
  { slug: "vintage-filter", name: "Vintage Filter", description: "Apply warm sepia tones and grain for a vintage photo look.", live: false },
  { slug: "image-color-picker", name: "Image Color Picker", description: "Extract hex and RGB colour values from any point in an image.", live: false },

  // Background (3)
  { slug: "background-remover", name: "Background Remover", description: "Remove backgrounds from photos using AI — no green screen needed.", live: false },
  { slug: "background-changer", name: "Background Changer", description: "Replace image backgrounds with a solid colour or new photo.", live: false },
  { slug: "image-transparency", name: "Make Image Transparent", description: "Remove specific colours or the entire background for transparency.", live: false },

  // Watermark & privacy (4)
  { slug: "watermark-adder", name: "Watermark Adder", description: "Add text or image watermarks to protect your photos.", live: false },
  { slug: "watermark-remover", name: "Watermark Remover", description: "Remove watermarks and logos from images with AI inpainting.", live: false },
  { slug: "image-blur-face", name: "Face Blurrer", description: "Automatically detect and blur faces for privacy protection.", live: false },
  { slug: "image-censor", name: "Image Censor", description: "Draw redaction bars over sensitive regions before sharing.", live: false },

  // Text & data (5)
  { slug: "image-to-text", name: "Image to Text (OCR)", description: "Extract editable text from images and screenshots with OCR.", live: false },
  { slug: "add-text-to-image", name: "Add Text to Image", description: "Overlay custom text with your choice of font, size, and colour.", live: false },
  { slug: "qr-code-generator", name: "QR Code Generator", description: "Generate QR codes for URLs, text, Wi-Fi, or contact cards.", live: false },
  { slug: "qr-code-reader", name: "QR Code Reader", description: "Decode QR codes from uploaded images instantly.", live: false },
  { slug: "image-metadata", name: "Image Metadata Viewer", description: "Read EXIF, IPTC, and XMP metadata from photos.", live: false },

  // Collage & combine (4)
  { slug: "image-collage", name: "Image Collage Maker", description: "Combine multiple images into a grid or freeform collage.", live: false },
  { slug: "image-merge", name: "Merge Images", description: "Stack or side-by-side merge two or more images into one.", live: false },
  { slug: "image-split", name: "Image Splitter", description: "Divide a single image into equal grid tiles for Instagram carousels.", live: false },
  { slug: "animated-gif-maker", name: "Animated GIF Maker", description: "Create animated GIFs from a sequence of image frames.", live: false },

  // Misc (2)
  { slug: "image-to-pdf", name: "Image to PDF", description: "Convert one or more images into a single PDF document.", live: false },
  { slug: "pdf-to-image", name: "PDF to Image", description: "Extract pages from a PDF as high-quality image files.", live: false },
];

// Supported formats table
const FORMAT_SUPPORT = [
  { format: "JPEG / JPG", input: true, output: true },
  { format: "PNG", input: true, output: true },
  { format: "WEBP", input: true, output: true },
  { format: "AVIF", input: true, output: true },
  { format: "GIF", input: true, output: true },
  { format: "BMP", input: true, output: true },
  { format: "TIFF", input: true, output: true },
  { format: "SVG", input: true, output: false },
  { format: "HEIC / HEIF", input: true, output: false },
  { format: "Base64", input: true, output: true },
];

// ---------------------------------------------------------------------------
// View
// ---------------------------------------------------------------------------

export function ImageToolsHubView() {
  return (
    <main>
      {/* Hero */}
      <section className="px-4 pt-12 pb-8 text-center sm:pt-20 sm:pb-12">
        <div className="mx-auto max-w-3xl space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--primary))]">
            Free · No signup · In-browser
          </p>
          <h1 className="font-display text-[clamp(2rem,4.5vw,3.5rem)] font-bold leading-[1.1] tracking-tight text-foreground">
            Free Image Tools
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            49 image tools — convert, compress, resize, crop, remove backgrounds, extract text,
            and more. All processing happens in your browser. Your files never leave your device.
          </p>
        </div>
      </section>

      {/* Tool grid */}
      <section
        className="px-4 pb-12 sm:pb-16"
        aria-labelledby="image-tools-heading"
      >
        <div className="mx-auto max-w-6xl">
          <h2 id="image-tools-heading" className="sr-only">
            All image tools
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {IMAGE_TOOLS.map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={tool.live ? `/tools/${tool.slug}` : "#"}
                  aria-label={`${tool.name}${!tool.live ? " — coming soon" : ""}`}
                  className={
                    !tool.live ? "pointer-events-none cursor-default" : ""
                  }
                  tabIndex={tool.live ? undefined : -1}
                >
                  <div className="group flex h-full flex-col rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition-colors hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))]">
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]">
                        <ImageIcon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      {!tool.live && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] shrink-0"
                        >
                          Soon
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-[hsl(var(--primary))] transition-colors">
                      {tool.name}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground flex-1">
                      {tool.description}
                    </p>
                    {tool.live && (
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[hsl(var(--primary))]">
                        Try it
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Format support table */}
      <section
        className="px-4 pb-16 sm:pb-24"
        aria-labelledby="format-support-heading"
      >
        <div className="mx-auto max-w-3xl">
          <h2
            id="format-support-heading"
            className="mb-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
          >
            Supported formats
          </h2>
          <div className="overflow-x-auto rounded-lg border border-[hsl(var(--border))]">
            <table className="w-full text-sm" aria-label="Image format support table">
              <thead>
                <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
                  <th
                    scope="col"
                    className="px-4 py-3 text-left font-semibold text-foreground"
                  >
                    Format
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center font-semibold text-foreground"
                  >
                    Input
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center font-semibold text-foreground"
                  >
                    Output
                  </th>
                </tr>
              </thead>
              <tbody>
                {FORMAT_SUPPORT.map(({ format, input, output }, i) => (
                  <tr
                    key={format}
                    className={
                      i % 2 === 0
                        ? "bg-[hsl(var(--card))]"
                        : "bg-[hsl(var(--muted)/0.4)]"
                    }
                  >
                    <td className="px-4 py-2.5 font-medium text-foreground">
                      {format}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {input ? (
                        <span className="text-[hsl(142.1_76.2%_36.3%)]" aria-label="Supported">
                          ✓
                        </span>
                      ) : (
                        <span className="text-muted-foreground" aria-label="Not supported">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {output ? (
                        <span className="text-[hsl(142.1_76.2%_36.3%)]" aria-label="Supported">
                          ✓
                        </span>
                      ) : (
                        <span className="text-muted-foreground" aria-label="Not supported">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
