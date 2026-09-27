/**
 * Image Converter tool data — single source of truth for all 33 conversion tools.
 *
 * Each entry drives: the tool page UI, SEO metadata, JSON-LD schemas, sitemap,
 * and the generic ImageConverterView component. Adding a tool? Append below —
 * dynamic routes pick it up automatically via generateStaticParams.
 */

export interface ConversionTool {
  slug: string;
  fromFormat: string;
  toFormat: string;
  fromLabel: string;
  toLabel: string;
  fromMime: string;
  toMime: string;
  primaryKeyword: string;
  searchVolume: number;
  seoTitle: string;
  seoDescription: string;
  h1: string;
  faqs: Array<{ question: string; answer: string }>;
  whyConvert: string;
}

export const CONVERSION_TOOLS: ConversionTool[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // PNG ↔ JPG family
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "png-to-jpg",
    fromFormat: "png", toFormat: "jpg",
    fromLabel: "PNG", toLabel: "JPG",
    fromMime: "image/png", toMime: "image/jpeg",
    primaryKeyword: "png to jpg converter free",
    searchVolume: 74000,
    seoTitle: "Free PNG to JPG Converter — Online, No Signup",
    seoDescription: "Convert PNG to JPG online free. No signup, instant download. Images never leave your browser. Supports batch conversion.",
    h1: "Free PNG to JPG Converter",
    whyConvert: "PNG files are 3-5x larger than equivalent JPGs. Converting to JPG reduces file size for faster web loading and social sharing.",
    faqs: [
      { question: "How do I convert PNG to JPG for free?", answer: "Upload your PNG file, click Convert, and download the JPG. No signup, no software, works in any browser." },
      { question: "Does converting PNG to JPG lose quality?", answer: "JPG uses lossy compression. Our tool defaults to 92% quality — visually identical to the original for most images." },
      { question: "Can I convert multiple PNG files to JPG at once?", answer: "Yes. Upload multiple PNG files at once and download them all as JPGs." },
      { question: "What is the difference between PNG and JPG?", answer: "PNG is lossless and supports transparency. JPG is lossy but produces much smaller files, ideal for photos." },
      { question: "Is it safe to convert PNG to JPG online?", answer: "Yes. All conversion happens in your browser. Images are never uploaded to any server." },
    ],
  },
  {
    slug: "jpg-to-png",
    fromFormat: "jpg", toFormat: "png",
    fromLabel: "JPG", toLabel: "PNG",
    fromMime: "image/jpeg", toMime: "image/png",
    primaryKeyword: "jpg to png converter free",
    searchVolume: 60500,
    seoTitle: "Free JPG to PNG Converter — Online, No Signup",
    seoDescription: "Convert JPG to PNG online free. Get transparent backgrounds and lossless quality. No signup, instant download.",
    h1: "Free JPG to PNG Converter",
    whyConvert: "PNG supports transparency and lossless compression, making it ideal when you need crisp edges or a transparent background.",
    faqs: [
      { question: "How do I convert JPG to PNG for free?", answer: "Upload your JPG, click Convert, and download the PNG. No signup, no software needed." },
      { question: "Will converting JPG to PNG improve quality?", answer: "No — converting to PNG preserves the existing quality but cannot recover data lost during the original JPG compression." },
      { question: "Does the PNG output support transparency?", answer: "The converted PNG uses an opaque white background. To add transparency, use an image editor after conversion." },
      { question: "Can I batch convert JPG to PNG?", answer: "Yes. Upload multiple JPG files at once and download them all as PNGs." },
      { question: "Is JPG to PNG conversion safe online?", answer: "Yes. All processing happens locally in your browser. No images are uploaded to any server." },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WebP conversions
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "webp-to-jpg",
    fromFormat: "webp", toFormat: "jpg",
    fromLabel: "WebP", toLabel: "JPG",
    fromMime: "image/webp", toMime: "image/jpeg",
    primaryKeyword: "webp to jpg converter",
    searchVolume: 49500,
    seoTitle: "Free WebP to JPG Converter — Online, Instant",
    seoDescription: "Convert WebP to JPG online free. No signup, instant download. Browser-based conversion, images never leave your device.",
    h1: "Free WebP to JPG Converter",
    whyConvert: "WebP is not universally supported by all apps. Converting to JPG ensures compatibility with every image viewer and editor.",
    faqs: [
      { question: "How do I convert WebP to JPG?", answer: "Upload your WebP file, click Convert, and download the JPG instantly. No signup required." },
      { question: "Why can't I open WebP files?", answer: "Some older apps and email clients don't support WebP. Converting to JPG solves this compatibility issue." },
      { question: "Does WebP to JPG lose quality?", answer: "There is minor quality loss since JPG is lossy, but at 92% quality the difference is imperceptible for most images." },
      { question: "Can I convert multiple WebP files at once?", answer: "Yes. Upload multiple WebP files and download all converted JPGs at once." },
      { question: "Is this WebP converter safe to use?", answer: "Yes. Conversion happens entirely in your browser. No files are uploaded to any server." },
    ],
  },
  {
    slug: "webp-to-png",
    fromFormat: "webp", toFormat: "png",
    fromLabel: "WebP", toLabel: "PNG",
    fromMime: "image/webp", toMime: "image/png",
    primaryKeyword: "webp to png converter",
    searchVolume: 40500,
    seoTitle: "Free WebP to PNG Converter — Online, No Signup",
    seoDescription: "Convert WebP to PNG online free. Lossless output, transparency preserved. No signup, instant download in your browser.",
    h1: "Free WebP to PNG Converter",
    whyConvert: "PNG offers lossless quality and universal compatibility. Convert WebP to PNG when you need to edit or share without quality loss.",
    faqs: [
      { question: "How do I convert WebP to PNG?", answer: "Upload your WebP file, click Convert, and download the PNG. No signup, works in any browser." },
      { question: "Does WebP to PNG preserve transparency?", answer: "Yes. If your WebP has transparency, the PNG output preserves it." },
      { question: "Is PNG better than WebP?", answer: "PNG is more universally compatible. WebP is smaller but not supported everywhere. Use PNG when compatibility matters." },
      { question: "Can I batch convert WebP to PNG?", answer: "Yes. Upload multiple WebP files at once and download them all as PNGs." },
      { question: "Is this tool safe?", answer: "Yes. All conversion happens in your browser. Images are never uploaded to any server." },
    ],
  },
  {
    slug: "jpg-to-webp",
    fromFormat: "jpg", toFormat: "webp",
    fromLabel: "JPG", toLabel: "WebP",
    fromMime: "image/jpeg", toMime: "image/webp",
    primaryKeyword: "jpg to webp converter",
    searchVolume: 33100,
    seoTitle: "Free JPG to WebP Converter — Smaller Files",
    seoDescription: "Convert JPG to WebP online free. Get 25-35% smaller files with the same visual quality. No signup, instant download.",
    h1: "Free JPG to WebP Converter",
    whyConvert: "WebP delivers 25-35% smaller files than JPG at equivalent quality, improving page load speed and Core Web Vitals.",
    faqs: [
      { question: "How do I convert JPG to WebP?", answer: "Upload your JPG file, click Convert, and download the WebP. No signup, no software needed." },
      { question: "Is WebP better than JPG?", answer: "WebP produces smaller files at the same quality. It's ideal for web use but not supported by all image editors." },
      { question: "Does JPG to WebP lose quality?", answer: "At 92% quality (our default), the output is visually identical to the original JPG but significantly smaller." },
      { question: "Do all browsers support WebP?", answer: "All modern browsers (Chrome, Firefox, Safari, Edge) support WebP. Only legacy IE11 and very old Safari lack support." },
      { question: "Is this converter safe?", answer: "Yes. All conversion happens in your browser. No files leave your device." },
    ],
  },
  {
    slug: "png-to-webp",
    fromFormat: "png", toFormat: "webp",
    fromLabel: "PNG", toLabel: "WebP",
    fromMime: "image/png", toMime: "image/webp",
    primaryKeyword: "png to webp converter",
    searchVolume: 27100,
    seoTitle: "Free PNG to WebP Converter — Smaller Files",
    seoDescription: "Convert PNG to WebP online free. Cut file size by 26% or more with lossless WebP. No signup, instant download.",
    h1: "Free PNG to WebP Converter",
    whyConvert: "WebP supports both lossy and lossless compression. Lossless WebP is 26% smaller than PNG with identical quality.",
    faqs: [
      { question: "How do I convert PNG to WebP?", answer: "Upload your PNG file, click Convert, and download the WebP. No signup, instant processing." },
      { question: "Does PNG to WebP keep transparency?", answer: "Yes. WebP supports alpha transparency just like PNG." },
      { question: "Is WebP lossless or lossy?", answer: "WebP supports both. Our tool uses lossy compression by default (92% quality) but you can adjust the slider." },
      { question: "How much smaller is WebP than PNG?", answer: "Lossless WebP is about 26% smaller than PNG. Lossy WebP can be 50-80% smaller depending on quality settings." },
      { question: "Is this tool safe?", answer: "Yes. All processing is browser-based. Your images never leave your device." },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HEIC conversions
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "heic-to-jpg",
    fromFormat: "heic", toFormat: "jpg",
    fromLabel: "HEIC", toLabel: "JPG",
    fromMime: "image/heic", toMime: "image/jpeg",
    primaryKeyword: "heic to jpg converter",
    searchVolume: 110000,
    seoTitle: "Free HEIC to JPG Converter — Open iPhone Photos",
    seoDescription: "Convert HEIC to JPG online free. Open iPhone photos on any device. No signup, no upload — conversion happens in your browser.",
    h1: "Free HEIC to JPG Converter",
    whyConvert: "iPhones save photos as HEIC by default. Most Windows apps and websites don't support HEIC — convert to JPG for universal compatibility.",
    faqs: [
      { question: "How do I convert HEIC to JPG?", answer: "Upload your HEIC file, click Convert, and download the JPG. No signup, no app needed." },
      { question: "What is a HEIC file?", answer: "HEIC (High Efficiency Image Container) is Apple's default photo format. It produces smaller files than JPG but isn't widely supported outside Apple devices." },
      { question: "Why can't I open HEIC files on Windows?", answer: "Windows doesn't natively support HEIC. Converting to JPG makes the file openable on any device or app." },
      { question: "Does HEIC to JPG lose quality?", answer: "There is minor quality loss since JPG is lossy, but at 92% quality the difference is imperceptible." },
      { question: "Is this HEIC converter safe?", answer: "Yes. Conversion uses a WASM decoder in your browser. No files are uploaded to any server." },
    ],
  },
  {
    slug: "heic-to-png",
    fromFormat: "heic", toFormat: "png",
    fromLabel: "HEIC", toLabel: "PNG",
    fromMime: "image/heic", toMime: "image/png",
    primaryKeyword: "heic to png converter",
    searchVolume: 22200,
    seoTitle: "Free HEIC to PNG Converter — Lossless Output",
    seoDescription: "Convert HEIC to PNG online free. Lossless quality, no signup, no upload. Browser-based conversion for iPhone photos.",
    h1: "Free HEIC to PNG Converter",
    whyConvert: "Convert iPhone HEIC photos to lossless PNG when you need maximum quality for editing, printing, or transparency support.",
    faqs: [
      { question: "How do I convert HEIC to PNG?", answer: "Upload your HEIC file, click Convert, and download the PNG. No signup, works in any browser." },
      { question: "Is PNG better than JPG for HEIC conversion?", answer: "PNG is lossless so it preserves all quality. Use PNG for editing or printing; use JPG for smaller file sizes." },
      { question: "Can I convert multiple HEIC files to PNG?", answer: "Yes. Upload multiple HEIC files at once and download them all as PNGs." },
      { question: "Does HEIC to PNG preserve the original quality?", answer: "Yes. PNG is lossless, so the converted file retains all image data from the HEIC source." },
      { question: "Is this tool safe?", answer: "Yes. HEIC decoding uses a WASM library in your browser. No files are uploaded anywhere." },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SVG conversion
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "svg-to-png",
    fromFormat: "svg", toFormat: "png",
    fromLabel: "SVG", toLabel: "PNG",
    fromMime: "image/svg+xml", toMime: "image/png",
    primaryKeyword: "svg to png converter",
    searchVolume: 74000,
    seoTitle: "Free SVG to PNG Converter — High Resolution",
    seoDescription: "Convert SVG to PNG online free. High-resolution raster output. No signup, instant download, browser-based.",
    h1: "Free SVG to PNG Converter",
    whyConvert: "Many platforms don't accept SVG uploads. Convert to PNG for universal compatibility while keeping sharp, high-resolution output.",
    faqs: [
      { question: "How do I convert SVG to PNG?", answer: "Upload your SVG file, click Convert, and download the PNG. No signup, no software needed." },
      { question: "What resolution is the PNG output?", answer: "The PNG is rendered at the SVG's native dimensions. For higher resolution, resize the SVG viewBox before converting." },
      { question: "Does SVG to PNG lose quality?", answer: "SVG is vector (infinitely scalable). The PNG is a fixed-resolution raster, so choose your dimensions carefully." },
      { question: "Can I convert SVG with transparency to PNG?", answer: "Yes. Transparent areas in your SVG are preserved in the PNG output." },
      { question: "Is this converter safe?", answer: "Yes. SVG rendering uses your browser's native engine. No files are uploaded to any server." },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GIF conversions
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "gif-to-jpg",
    fromFormat: "gif", toFormat: "jpg",
    fromLabel: "GIF", toLabel: "JPG",
    fromMime: "image/gif", toMime: "image/jpeg",
    primaryKeyword: "gif to jpg converter",
    searchVolume: 14800,
    seoTitle: "Free GIF to JPG Converter — Extract First Frame",
    seoDescription: "Convert GIF to JPG online free. Extracts the first frame as a static JPG. No signup, instant download.",
    h1: "Free GIF to JPG Converter",
    whyConvert: "Extract a static image from an animated GIF. Useful for thumbnails, previews, or when you need a smaller static file.",
    faqs: [
      { question: "How do I convert GIF to JPG?", answer: "Upload your GIF, click Convert, and download the JPG. The first frame is extracted as a static image." },
      { question: "Does this convert all frames of a GIF?", answer: "No. This tool extracts the first frame as a single JPG image. For multi-frame extraction, use a video editor." },
      { question: "Will the JPG be smaller than the GIF?", answer: "Yes, typically much smaller since a single JPG frame is far smaller than an animated GIF." },
      { question: "Can I batch convert GIFs to JPG?", answer: "Yes. Upload multiple GIF files at once and download them all as JPGs." },
      { question: "Is this tool safe?", answer: "Yes. All conversion happens in your browser. No files are uploaded to any server." },
    ],
  },
  {
    slug: "gif-to-png",
    fromFormat: "gif", toFormat: "png",
    fromLabel: "GIF", toLabel: "PNG",
    fromMime: "image/gif", toMime: "image/png",
    primaryKeyword: "gif to png converter",
    searchVolume: 12100,
    seoTitle: "Free GIF to PNG Converter — Lossless Output",
    seoDescription: "Convert GIF to PNG online free. Extract the first frame as a lossless PNG. No signup, instant download.",
    h1: "Free GIF to PNG Converter",
    whyConvert: "PNG preserves transparency and provides lossless quality. Extract a GIF frame as PNG for editing or high-quality sharing.",
    faqs: [
      { question: "How do I convert GIF to PNG?", answer: "Upload your GIF, click Convert, and download the PNG. The first frame is extracted with lossless quality." },
      { question: "Does GIF to PNG preserve transparency?", answer: "Yes. If your GIF has transparent areas, they are preserved in the PNG output." },
      { question: "Is PNG better than JPG for GIF conversion?", answer: "Yes if you need transparency or lossless quality. JPG is better if you just need a small static image." },
      { question: "Can I convert animated GIFs to PNG?", answer: "This tool extracts the first frame. For all frames, use a specialized frame extractor." },
      { question: "Is this converter safe?", answer: "Yes. All processing happens locally in your browser. No files leave your device." },
    ],
  },
  {
    slug: "gif-to-webp",
    fromFormat: "gif", toFormat: "webp",
    fromLabel: "GIF", toLabel: "WebP",
    fromMime: "image/gif", toMime: "image/webp",
    primaryKeyword: "gif to webp converter",
    searchVolume: 8100,
    seoTitle: "Free GIF to WebP Converter — Smaller Files",
    seoDescription: "Convert GIF to WebP online free. Get smaller animated images for the web. No signup, instant download.",
    h1: "Free GIF to WebP Converter",
    whyConvert: "WebP produces animated images that are 30-50% smaller than GIFs, improving page load speed without sacrificing quality.",
    faqs: [
      { question: "How do I convert GIF to WebP?", answer: "Upload your GIF, click Convert, and download the WebP. No signup, instant processing." },
      { question: "Does WebP support animation like GIF?", answer: "Yes. WebP supports animation and produces smaller files than GIF at equivalent quality." },
      { question: "Is WebP better than GIF?", answer: "For web use, yes. WebP animated images are smaller and support more colors (24-bit vs GIF's 256)." },
      { question: "Do all browsers support animated WebP?", answer: "All modern browsers support animated WebP. Only IE11 and very old Safari versions lack support." },
      { question: "Is this tool safe?", answer: "Yes. All conversion happens in your browser. No images are uploaded to any server." },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BMP conversions
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "bmp-to-jpg",
    fromFormat: "bmp", toFormat: "jpg",
    fromLabel: "BMP", toLabel: "JPG",
    fromMime: "image/bmp", toMime: "image/jpeg",
    primaryKeyword: "bmp to jpg converter",
    searchVolume: 14800,
    seoTitle: "Free BMP to JPG Converter — Reduce File Size",
    seoDescription: "Convert BMP to JPG online free. Reduce file size by 90%+. No signup, instant download, browser-based.",
    h1: "Free BMP to JPG Converter",
    whyConvert: "BMP files are uncompressed and enormous. Converting to JPG reduces file size by 90%+ while maintaining visual quality.",
    faqs: [
      { question: "How do I convert BMP to JPG?", answer: "Upload your BMP file, click Convert, and download the JPG. No signup, works in any browser." },
      { question: "How much smaller is JPG than BMP?", answer: "JPG files are typically 90-95% smaller than equivalent BMP files thanks to lossy compression." },
      { question: "Does BMP to JPG lose quality?", answer: "JPG uses lossy compression, but at 92% quality the difference from the BMP original is negligible." },
      { question: "Can I batch convert BMP to JPG?", answer: "Yes. Upload multiple BMP files at once and download them all as JPGs." },
      { question: "Is this tool safe?", answer: "Yes. All conversion happens in your browser. No files are uploaded to any server." },
    ],
  },
  {
    slug: "bmp-to-png",
    fromFormat: "bmp", toFormat: "png",
    fromLabel: "BMP", toLabel: "PNG",
    fromMime: "image/bmp", toMime: "image/png",
    primaryKeyword: "bmp to png converter",
    searchVolume: 9900,
    seoTitle: "Free BMP to PNG Converter — Lossless Compression",
    seoDescription: "Convert BMP to PNG online free. Lossless compression cuts file size without any quality loss. No signup, instant download.",
    h1: "Free BMP to PNG Converter",
    whyConvert: "PNG applies lossless compression to reduce BMP file sizes significantly while preserving every pixel of the original image.",
    faqs: [
      { question: "How do I convert BMP to PNG?", answer: "Upload your BMP file, click Convert, and download the PNG. No signup, no software needed." },
      { question: "Is PNG lossless?", answer: "Yes. PNG uses lossless compression, so the converted file is identical to the BMP original — just smaller." },
      { question: "How much smaller is PNG than BMP?", answer: "PNG files are typically 50-80% smaller than BMP depending on image complexity." },
      { question: "Can I batch convert BMP to PNG?", answer: "Yes. Upload multiple BMP files at once and download them all as PNGs." },
      { question: "Is this converter safe?", answer: "Yes. All processing happens locally in your browser. No files leave your device." },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TIFF conversions
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "tiff-to-jpg",
    fromFormat: "tiff", toFormat: "jpg",
    fromLabel: "TIFF", toLabel: "JPG",
    fromMime: "image/tiff", toMime: "image/jpeg",
    primaryKeyword: "tiff to jpg converter",
    searchVolume: 22200,
    seoTitle: "Free TIFF to JPG Converter — Reduce File Size",
    seoDescription: "Convert TIFF to JPG online free. Reduce large TIFF files for web sharing. No signup, instant download.",
    h1: "Free TIFF to JPG Converter",
    whyConvert: "TIFF files are large and not web-friendly. Convert to JPG for easy sharing, email attachments, and web uploads.",
    faqs: [
      { question: "How do I convert TIFF to JPG?", answer: "Upload your TIFF file, click Convert, and download the JPG. No signup, works in any browser." },
      { question: "Does TIFF to JPG lose quality?", answer: "JPG uses lossy compression. At 92% quality (our default), the visual difference from the TIFF is negligible." },
      { question: "How much smaller is JPG than TIFF?", answer: "JPG files are typically 80-95% smaller than TIFF files depending on compression settings." },
      { question: "Can I convert multi-page TIFF?", answer: "This tool converts the first page of a multi-page TIFF. For all pages, use a specialized TIFF editor." },
      { question: "Is this tool safe?", answer: "Yes. All conversion happens in your browser. No files are uploaded to any server." },
    ],
  },
  {
    slug: "tiff-to-png",
    fromFormat: "tiff", toFormat: "png",
    fromLabel: "TIFF", toLabel: "PNG",
    fromMime: "image/tiff", toMime: "image/png",
    primaryKeyword: "tiff to png converter",
    searchVolume: 14800,
    seoTitle: "Free TIFF to PNG Converter — Lossless Output",
    seoDescription: "Convert TIFF to PNG online free. Lossless compression with universal compatibility. No signup, instant download.",
    h1: "Free TIFF to PNG Converter",
    whyConvert: "PNG is universally compatible and web-friendly while preserving lossless quality — ideal for converting TIFF images for online use.",
    faqs: [
      { question: "How do I convert TIFF to PNG?", answer: "Upload your TIFF file, click Convert, and download the PNG. No signup, no software needed." },
      { question: "Is PNG lossless like TIFF?", answer: "Yes. Both TIFF and PNG support lossless compression. The PNG output preserves all image data." },
      { question: "Is PNG better than JPG for TIFF conversion?", answer: "Yes if you need lossless quality. JPG is better if you prioritize smaller file sizes." },
      { question: "Can I batch convert TIFF to PNG?", answer: "Yes. Upload multiple TIFF files at once and download them all as PNGs." },
      { question: "Is this converter safe?", answer: "Yes. All processing happens locally in your browser. No files leave your device." },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AVIF conversions
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "jpg-to-avif",
    fromFormat: "jpg", toFormat: "avif",
    fromLabel: "JPG", toLabel: "AVIF",
    fromMime: "image/jpeg", toMime: "image/avif",
    primaryKeyword: "jpg to avif converter",
    searchVolume: 8100,
    seoTitle: "Free JPG to AVIF Converter — Next-Gen Format",
    seoDescription: "Convert JPG to AVIF online free. Get 50% smaller files than JPG with better quality. No signup, instant download.",
    h1: "Free JPG to AVIF Converter",
    whyConvert: "AVIF achieves 50% smaller files than JPG at equivalent quality, making it the best next-gen format for web performance.",
    faqs: [
      { question: "How do I convert JPG to AVIF?", answer: "Upload your JPG file, click Convert, and download the AVIF. No signup, browser-based processing." },
      { question: "Is AVIF better than WebP?", answer: "AVIF generally achieves 20% smaller files than WebP at the same quality, but encoding is slower." },
      { question: "Do all browsers support AVIF?", answer: "Chrome, Firefox, and Safari 16+ support AVIF. Edge supports it via Chromium. IE11 does not." },
      { question: "Does JPG to AVIF lose quality?", answer: "AVIF uses lossy compression, but at 80% quality it looks identical to the JPG while being much smaller." },
      { question: "Is this tool safe?", answer: "Yes. All conversion happens in your browser. No files are uploaded to any server." },
    ],
  },
  {
    slug: "png-to-avif",
    fromFormat: "png", toFormat: "avif",
    fromLabel: "PNG", toLabel: "AVIF",
    fromMime: "image/png", toMime: "image/avif",
    primaryKeyword: "png to avif converter",
    searchVolume: 6600,
    seoTitle: "Free PNG to AVIF Converter — Smallest Files",
    seoDescription: "Convert PNG to AVIF online free. Dramatically reduce file size with next-gen compression. No signup, instant download.",
    h1: "Free PNG to AVIF Converter",
    whyConvert: "AVIF compresses images 50-70% smaller than PNG while maintaining excellent visual quality for web delivery.",
    faqs: [
      { question: "How do I convert PNG to AVIF?", answer: "Upload your PNG file, click Convert, and download the AVIF. No signup, works in any browser." },
      { question: "Does AVIF support transparency?", answer: "Yes. AVIF supports alpha transparency just like PNG." },
      { question: "Is AVIF better than PNG for web?", answer: "For file size, absolutely. AVIF is 50-70% smaller. Use PNG only when you need universal compatibility." },
      { question: "Can I batch convert PNG to AVIF?", answer: "Yes. Upload multiple PNG files at once and download them all as AVIF." },
      { question: "Is this converter safe?", answer: "Yes. All processing happens in your browser. No files leave your device." },
    ],
  },
  {
    slug: "webp-to-avif",
    fromFormat: "webp", toFormat: "avif",
    fromLabel: "WebP", toLabel: "AVIF",
    fromMime: "image/webp", toMime: "image/avif",
    primaryKeyword: "webp to avif converter",
    searchVolume: 3600,
    seoTitle: "Free WebP to AVIF Converter — Even Smaller",
    seoDescription: "Convert WebP to AVIF online free. Get 20% smaller files than WebP. No signup, instant download, browser-based.",
    h1: "Free WebP to AVIF Converter",
    whyConvert: "AVIF is 20% smaller than WebP at the same quality. Upgrade your images to the latest next-gen format.",
    faqs: [
      { question: "How do I convert WebP to AVIF?", answer: "Upload your WebP file, click Convert, and download the AVIF. No signup, instant processing." },
      { question: "Is AVIF smaller than WebP?", answer: "Yes. AVIF achieves roughly 20% smaller files than WebP at equivalent visual quality." },
      { question: "Should I switch from WebP to AVIF?", answer: "If your audience uses modern browsers, yes. AVIF offers better compression. Keep WebP as a fallback." },
      { question: "Do all browsers support AVIF?", answer: "Chrome, Firefox, and Safari 16+ support AVIF. Use WebP as a fallback for older browsers." },
      { question: "Is this tool safe?", answer: "Yes. All conversion happens in your browser. No files are uploaded to any server." },
    ],
  },
  {
    slug: "avif-to-jpg",
    fromFormat: "avif", toFormat: "jpg",
    fromLabel: "AVIF", toLabel: "JPG",
    fromMime: "image/avif", toMime: "image/jpeg",
    primaryKeyword: "avif to jpg converter",
    searchVolume: 6600,
    seoTitle: "Free AVIF to JPG Converter — Universal Format",
    seoDescription: "Convert AVIF to JPG online free. Make next-gen images compatible with all apps. No signup, instant download.",
    h1: "Free AVIF to JPG Converter",
    whyConvert: "Not all apps support AVIF yet. Convert to JPG for universal compatibility with image editors, email clients, and social platforms.",
    faqs: [
      { question: "How do I convert AVIF to JPG?", answer: "Upload your AVIF file, click Convert, and download the JPG. No signup, works in any browser." },
      { question: "Why convert AVIF to JPG?", answer: "Many image editors and older apps don't support AVIF. JPG is universally compatible." },
      { question: "Does AVIF to JPG lose quality?", answer: "There is some quality loss since JPG is lossy, but at 92% quality the difference is minimal." },
      { question: "Can I batch convert AVIF to JPG?", answer: "Yes. Upload multiple AVIF files at once and download them all as JPGs." },
      { question: "Is this converter safe?", answer: "Yes. All processing happens in your browser. No files leave your device." },
    ],
  },
  {
    slug: "avif-to-png",
    fromFormat: "avif", toFormat: "png",
    fromLabel: "AVIF", toLabel: "PNG",
    fromMime: "image/avif", toMime: "image/png",
    primaryKeyword: "avif to png converter",
    searchVolume: 4400,
    seoTitle: "Free AVIF to PNG Converter — Lossless Output",
    seoDescription: "Convert AVIF to PNG online free. Lossless output with universal compatibility. No signup, instant download.",
    h1: "Free AVIF to PNG Converter",
    whyConvert: "Convert AVIF to PNG for lossless quality and universal compatibility when editing or sharing images.",
    faqs: [
      { question: "How do I convert AVIF to PNG?", answer: "Upload your AVIF file, click Convert, and download the PNG. No signup, no software needed." },
      { question: "Does AVIF to PNG preserve transparency?", answer: "Yes. If your AVIF has transparency, the PNG output preserves it." },
      { question: "Is PNG better than JPG for AVIF conversion?", answer: "PNG is lossless, so it preserves all quality. Use JPG if you need smaller files." },
      { question: "Can I batch convert AVIF to PNG?", answer: "Yes. Upload multiple AVIF files and download them all as PNGs." },
      { question: "Is this tool safe?", answer: "Yes. All conversion happens in your browser. No files are uploaded to any server." },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // To GIF conversions
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "jpg-to-gif",
    fromFormat: "jpg", toFormat: "gif",
    fromLabel: "JPG", toLabel: "GIF",
    fromMime: "image/jpeg", toMime: "image/gif",
    primaryKeyword: "jpg to gif converter",
    searchVolume: 9900,
    seoTitle: "Free JPG to GIF Converter — Online, Instant",
    seoDescription: "Convert JPG to GIF online free. Create static GIF images from JPG photos. No signup, instant download.",
    h1: "Free JPG to GIF Converter",
    whyConvert: "Convert JPG to GIF format for compatibility with platforms that require GIF input or for creating simple web graphics.",
    faqs: [
      { question: "How do I convert JPG to GIF?", answer: "Upload your JPG file, click Convert, and download the GIF. No signup, works in any browser." },
      { question: "Will the GIF be animated?", answer: "No. This converts a static JPG to a static GIF. For animated GIFs, use a video-to-GIF tool." },
      { question: "Does JPG to GIF lose quality?", answer: "GIF is limited to 256 colors, so photos may show banding. GIF is better for graphics and logos." },
      { question: "Can I batch convert JPG to GIF?", answer: "Yes. Upload multiple JPG files at once and download them all as GIFs." },
      { question: "Is this tool safe?", answer: "Yes. All conversion happens in your browser. No files are uploaded to any server." },
    ],
  },
  {
    slug: "png-to-gif",
    fromFormat: "png", toFormat: "gif",
    fromLabel: "PNG", toLabel: "GIF",
    fromMime: "image/png", toMime: "image/gif",
    primaryKeyword: "png to gif converter",
    searchVolume: 8100,
    seoTitle: "Free PNG to GIF Converter — Online, No Signup",
    seoDescription: "Convert PNG to GIF online free. Keep transparency, create web-ready graphics. No signup, instant download.",
    h1: "Free PNG to GIF Converter",
    whyConvert: "GIF is widely supported and compact for simple graphics. Convert PNG to GIF for compatibility or to reduce colors.",
    faqs: [
      { question: "How do I convert PNG to GIF?", answer: "Upload your PNG file, click Convert, and download the GIF. No signup, instant processing." },
      { question: "Does PNG to GIF preserve transparency?", answer: "GIF supports binary transparency (fully transparent or fully opaque). Semi-transparent areas may show artifacts." },
      { question: "Is GIF smaller than PNG?", answer: "For images with few colors (logos, icons), GIF can be smaller. For photos, PNG is usually more efficient." },
      { question: "Can I batch convert PNG to GIF?", answer: "Yes. Upload multiple PNG files at once and download them all as GIFs." },
      { question: "Is this converter safe?", answer: "Yes. All processing happens in your browser. No files leave your device." },
    ],
  },
  {
    slug: "webp-to-gif",
    fromFormat: "webp", toFormat: "gif",
    fromLabel: "WebP", toLabel: "GIF",
    fromMime: "image/webp", toMime: "image/gif",
    primaryKeyword: "webp to gif converter",
    searchVolume: 6600,
    seoTitle: "Free WebP to GIF Converter — Online, Instant",
    seoDescription: "Convert WebP to GIF online free. Universal compatibility for animated and static images. No signup, instant download.",
    h1: "Free WebP to GIF Converter",
    whyConvert: "Not all platforms support WebP. Convert to GIF for universal compatibility, especially for animated images.",
    faqs: [
      { question: "How do I convert WebP to GIF?", answer: "Upload your WebP file, click Convert, and download the GIF. No signup, works in any browser." },
      { question: "Does this convert animated WebP to animated GIF?", answer: "This tool extracts the first frame as a static GIF. For animated conversion, use a video tool." },
      { question: "Is GIF larger than WebP?", answer: "Yes, typically. GIF files are larger than WebP due to less efficient compression." },
      { question: "Can I batch convert WebP to GIF?", answer: "Yes. Upload multiple WebP files at once and download them all as GIFs." },
      { question: "Is this tool safe?", answer: "Yes. All conversion happens in your browser. No files are uploaded to any server." },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // To BMP conversions
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "jpg-to-bmp",
    fromFormat: "jpg", toFormat: "bmp",
    fromLabel: "JPG", toLabel: "BMP",
    fromMime: "image/jpeg", toMime: "image/bmp",
    primaryKeyword: "jpg to bmp converter",
    searchVolume: 6600,
    seoTitle: "Free JPG to BMP Converter — Uncompressed Output",
    seoDescription: "Convert JPG to BMP online free. Uncompressed bitmap output for legacy software. No signup, instant download.",
    h1: "Free JPG to BMP Converter",
    whyConvert: "Some legacy applications and embedded systems require BMP format. Convert JPG to BMP for full compatibility.",
    faqs: [
      { question: "How do I convert JPG to BMP?", answer: "Upload your JPG file, click Convert, and download the BMP. No signup, works in any browser." },
      { question: "Why would I need BMP format?", answer: "Some legacy Windows apps, embedded systems, and industrial software require BMP input." },
      { question: "Is BMP larger than JPG?", answer: "Yes, significantly. BMP is uncompressed, so files are 10-20x larger than equivalent JPGs." },
      { question: "Can I batch convert JPG to BMP?", answer: "Yes. Upload multiple JPG files at once and download them all as BMPs." },
      { question: "Is this tool safe?", answer: "Yes. All conversion happens in your browser. No files are uploaded to any server." },
    ],
  },
  {
    slug: "png-to-bmp",
    fromFormat: "png", toFormat: "bmp",
    fromLabel: "PNG", toLabel: "BMP",
    fromMime: "image/png", toMime: "image/bmp",
    primaryKeyword: "png to bmp converter",
    searchVolume: 4400,
    seoTitle: "Free PNG to BMP Converter — Uncompressed Output",
    seoDescription: "Convert PNG to BMP online free. Uncompressed bitmap for legacy apps. No signup, instant download, browser-based.",
    h1: "Free PNG to BMP Converter",
    whyConvert: "BMP is required by some legacy software and embedded systems. Convert PNG to uncompressed BMP for compatibility.",
    faqs: [
      { question: "How do I convert PNG to BMP?", answer: "Upload your PNG file, click Convert, and download the BMP. No signup, no software needed." },
      { question: "Does PNG to BMP lose transparency?", answer: "Yes. BMP does not support transparency. Transparent areas become white in the BMP output." },
      { question: "Is BMP larger than PNG?", answer: "Yes. BMP is uncompressed, so files are typically 2-5x larger than PNG." },
      { question: "Can I batch convert PNG to BMP?", answer: "Yes. Upload multiple PNG files at once and download them all as BMPs." },
      { question: "Is this converter safe?", answer: "Yes. All processing happens in your browser. No files leave your device." },
    ],
  },
  {
    slug: "webp-to-bmp",
    fromFormat: "webp", toFormat: "bmp",
    fromLabel: "WebP", toLabel: "BMP",
    fromMime: "image/webp", toMime: "image/bmp",
    primaryKeyword: "webp to bmp converter",
    searchVolume: 2400,
    seoTitle: "Free WebP to BMP Converter — Legacy Compatible",
    seoDescription: "Convert WebP to BMP online free. Uncompressed output for legacy systems. No signup, instant download.",
    h1: "Free WebP to BMP Converter",
    whyConvert: "Legacy software that doesn't support WebP may accept BMP. Convert for full backward compatibility.",
    faqs: [
      { question: "How do I convert WebP to BMP?", answer: "Upload your WebP file, click Convert, and download the BMP. No signup, works in any browser." },
      { question: "Why would I convert to BMP?", answer: "Some legacy Windows applications, industrial tools, and embedded systems require BMP format." },
      { question: "Is BMP larger than WebP?", answer: "Yes, much larger. BMP is uncompressed while WebP uses efficient compression." },
      { question: "Can I batch convert WebP to BMP?", answer: "Yes. Upload multiple WebP files at once and download them all as BMPs." },
      { question: "Is this tool safe?", answer: "Yes. All conversion happens in your browser. No files are uploaded to any server." },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // To TIFF conversions
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "jpg-to-tiff",
    fromFormat: "jpg", toFormat: "tiff",
    fromLabel: "JPG", toLabel: "TIFF",
    fromMime: "image/jpeg", toMime: "image/tiff",
    primaryKeyword: "jpg to tiff converter",
    searchVolume: 9900,
    seoTitle: "Free JPG to TIFF Converter — Print-Ready Output",
    seoDescription: "Convert JPG to TIFF online free. Print-ready format for publishing and archiving. No signup, instant download.",
    h1: "Free JPG to TIFF Converter",
    whyConvert: "TIFF is the standard for print publishing and archival storage. Convert JPG to TIFF for professional printing workflows.",
    faqs: [
      { question: "How do I convert JPG to TIFF?", answer: "Upload your JPG file, click Convert, and download the TIFF. No signup, works in any browser." },
      { question: "Is TIFF better than JPG for printing?", answer: "Yes. TIFF supports lossless compression and is the preferred format for professional print workflows." },
      { question: "Does JPG to TIFF improve quality?", answer: "No. The conversion preserves existing quality but cannot recover data lost during original JPG compression." },
      { question: "Can I batch convert JPG to TIFF?", answer: "Yes. Upload multiple JPG files at once and download them all as TIFFs." },
      { question: "Is this tool safe?", answer: "Yes. All conversion happens in your browser. No files are uploaded to any server." },
    ],
  },
  {
    slug: "png-to-tiff",
    fromFormat: "png", toFormat: "tiff",
    fromLabel: "PNG", toLabel: "TIFF",
    fromMime: "image/png", toMime: "image/tiff",
    primaryKeyword: "png to tiff converter",
    searchVolume: 6600,
    seoTitle: "Free PNG to TIFF Converter — Print Quality",
    seoDescription: "Convert PNG to TIFF online free. Lossless print-ready output. No signup, instant download, browser-based.",
    h1: "Free PNG to TIFF Converter",
    whyConvert: "TIFF is the industry standard for professional printing and archival. Convert PNG to TIFF for publishing workflows.",
    faqs: [
      { question: "How do I convert PNG to TIFF?", answer: "Upload your PNG file, click Convert, and download the TIFF. No signup, no software needed." },
      { question: "Is TIFF better than PNG?", answer: "For printing, yes. TIFF is the industry standard for print publishing. For web, PNG is more appropriate." },
      { question: "Is the conversion lossless?", answer: "Yes. Both PNG and TIFF support lossless compression. No quality is lost in the conversion." },
      { question: "Can I batch convert PNG to TIFF?", answer: "Yes. Upload multiple PNG files at once and download them all as TIFFs." },
      { question: "Is this converter safe?", answer: "Yes. All processing happens in your browser. No files leave your device." },
    ],
  },
  {
    slug: "webp-to-tiff",
    fromFormat: "webp", toFormat: "tiff",
    fromLabel: "WebP", toLabel: "TIFF",
    fromMime: "image/webp", toMime: "image/tiff",
    primaryKeyword: "webp to tiff converter",
    searchVolume: 2400,
    seoTitle: "Free WebP to TIFF Converter — Print-Ready",
    seoDescription: "Convert WebP to TIFF online free. Print-ready output for publishing. No signup, instant download.",
    h1: "Free WebP to TIFF Converter",
    whyConvert: "Print shops and publishers require TIFF. Convert web-optimized WebP images to print-ready TIFF format.",
    faqs: [
      { question: "How do I convert WebP to TIFF?", answer: "Upload your WebP file, click Convert, and download the TIFF. No signup, works in any browser." },
      { question: "Why convert WebP to TIFF?", answer: "TIFF is required for professional printing. WebP is a web format not accepted by most print shops." },
      { question: "Is TIFF larger than WebP?", answer: "Yes, significantly. TIFF is uncompressed or lightly compressed, while WebP uses efficient web compression." },
      { question: "Can I batch convert WebP to TIFF?", answer: "Yes. Upload multiple WebP files at once and download them all as TIFFs." },
      { question: "Is this tool safe?", answer: "Yes. All conversion happens in your browser. No files are uploaded to any server." },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ICO conversions
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "png-to-ico",
    fromFormat: "png", toFormat: "ico",
    fromLabel: "PNG", toLabel: "ICO",
    fromMime: "image/png", toMime: "image/x-icon",
    primaryKeyword: "png to ico converter",
    searchVolume: 33100,
    seoTitle: "Free PNG to ICO Converter — Create Favicons",
    seoDescription: "Convert PNG to ICO online free. Create favicons and Windows icons. No signup, instant download, browser-based.",
    h1: "Free PNG to ICO Converter",
    whyConvert: "ICO is required for Windows icons and browser favicons. Convert your PNG logo to ICO for website and app use.",
    faqs: [
      { question: "How do I convert PNG to ICO?", answer: "Upload your PNG file, click Convert, and download the ICO. The image is resized to standard icon dimensions." },
      { question: "What size should my PNG be for a favicon?", answer: "Use a square PNG of at least 256x256 pixels. The converter produces a multi-resolution ICO file." },
      { question: "Can I use ICO as a website favicon?", answer: "Yes. ICO is the traditional favicon format supported by all browsers. Place it in your site root as favicon.ico." },
      { question: "Does PNG to ICO support transparency?", answer: "Yes. Transparent areas in your PNG are preserved in the ICO output." },
      { question: "Is this tool safe?", answer: "Yes. All conversion happens in your browser. No files are uploaded to any server." },
    ],
  },
  {
    slug: "jpg-to-ico",
    fromFormat: "jpg", toFormat: "ico",
    fromLabel: "JPG", toLabel: "ICO",
    fromMime: "image/jpeg", toMime: "image/x-icon",
    primaryKeyword: "jpg to ico converter",
    searchVolume: 9900,
    seoTitle: "Free JPG to ICO Converter — Create Icons Fast",
    seoDescription: "Convert JPG to ICO online free. Create favicons and Windows icons from photos. No signup, instant download.",
    h1: "Free JPG to ICO Converter",
    whyConvert: "Convert any JPG photo to ICO format for use as a Windows icon or website favicon.",
    faqs: [
      { question: "How do I convert JPG to ICO?", answer: "Upload your JPG file, click Convert, and download the ICO. No signup, works in any browser." },
      { question: "What size should my JPG be?", answer: "Use a square image of at least 256x256 pixels for best results. The converter handles resizing." },
      { question: "Can I use a photo as a favicon?", answer: "Yes, but favicons are tiny (16-48px). Simple images and logos work much better than detailed photos." },
      { question: "Does JPG to ICO support transparency?", answer: "No. JPG doesn't support transparency. Use PNG to ICO if you need a transparent favicon." },
      { question: "Is this tool safe?", answer: "Yes. All conversion happens in your browser. No files are uploaded to any server." },
    ],
  },
  {
    slug: "webp-to-ico",
    fromFormat: "webp", toFormat: "ico",
    fromLabel: "WebP", toLabel: "ICO",
    fromMime: "image/webp", toMime: "image/x-icon",
    primaryKeyword: "webp to ico converter",
    searchVolume: 2400,
    seoTitle: "Free WebP to ICO Converter — Create Favicons",
    seoDescription: "Convert WebP to ICO online free. Create favicons and Windows icons. No signup, instant download.",
    h1: "Free WebP to ICO Converter",
    whyConvert: "Convert WebP images to ICO format for website favicons or Windows application icons.",
    faqs: [
      { question: "How do I convert WebP to ICO?", answer: "Upload your WebP file, click Convert, and download the ICO. No signup, works in any browser." },
      { question: "Why convert WebP to ICO?", answer: "ICO is the standard format for favicons and Windows icons. WebP is not accepted as an icon format." },
      { question: "What size WebP should I use?", answer: "Use a square image of at least 256x256 pixels for best results." },
      { question: "Does this preserve transparency?", answer: "Yes. If your WebP has transparency, the ICO output preserves it." },
      { question: "Is this tool safe?", answer: "Yes. All conversion happens in your browser. No files are uploaded to any server." },
    ],
  },
];

/** All primary tool slugs. */
export const ALL_CONVERSION_SLUGS: string[] = CONVERSION_TOOLS.map((t) => t.slug);

/** Lookup a conversion tool by slug. */
export function getConversionTool(slug: string): ConversionTool | undefined {
  return CONVERSION_TOOLS.find((t) => t.slug === slug);
}

/** Check if a slug is a primary conversion tool. */
export function isConversionSlug(slug: string): boolean {
  return ALL_CONVERSION_SLUGS.includes(slug);
}
