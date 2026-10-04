/**
 * Image Edit & Compression tool data — single source of truth for 9 tools:
 *   Compression: compress-jpg, compress-png, compress-webp, compress-gif
 *   Edit/Transform: image-resizer, image-cropper, image-rotator, watermark-image, image-workbench
 *
 * Each entry drives: tool page UI, SEO metadata, JSON-LD schemas, sitemap,
 * and the view components. Adding a tool? Append below — dynamic routes pick
 * it up automatically via generateStaticParams.
 */

export interface EditTool {
  slug: string;
  name: string;
  primaryKeyword: string;
  searchVolume: number;
  /** SEO title — ≤50 chars (template appends " | Trndinn"). */
  seoTitle: string;
  /** SEO meta description — 140-160 chars. */
  seoDescription: string;
  h1: string;
  faqs: Array<{ question: string; answer: string }>;
  /** 1-2 sentences shown in the tool UI below the h1. */
  description: string;
}

export const EDIT_TOOLS: EditTool[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Compression family
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "compress-jpg",
    name: "JPG Compressor",
    primaryKeyword: "compress jpg online free",
    searchVolume: 60500,
    seoTitle: "Free JPG Compressor — Reduce File Size Online",
    seoDescription: "Compress JPG images online free. Adjust quality, reduce file size up to 90%. No signup, no uploads — runs entirely in your browser. Instant download.",
    h1: "Free JPG Compressor",
    description: "Reduce JPG file size without noticeable quality loss. Adjust the quality slider and compress in seconds — no uploads, no signup.",
    faqs: [
      {
        question: "How do I compress a JPG without losing quality?",
        answer: "Use a quality setting of 75-85% to reduce file size by 50-70% with minimal visible loss. Trndinn's JPG compressor runs in your browser — no server upload, no quality deterioration from re-encoding.",
      },
      {
        question: "How much can I reduce a JPG file size?",
        answer: "Depending on the original image, you can reduce JPG file size by 40-90% using lossy compression. A quality of 80% typically cuts size in half with imperceptible quality change.",
      },
      {
        question: "Is compressing JPGs free on Trndinn?",
        answer: "Yes. Trndinn's JPG compressor is completely free with no signup, no watermark, no daily limit, and no file size cap. Your images never leave your device.",
      },
      {
        question: "What quality setting should I use to compress JPG?",
        answer: "For web and social sharing, 75-85% is the sweet spot — files are 50-70% smaller with no visible quality loss. For print or archiving, use 90%+ to preserve fine detail.",
      },
      {
        question: "Does compressing a JPG reduce image dimensions?",
        answer: "No. Trndinn's JPG compressor only reduces file size through quality compression, not dimensions. Your image stays at the same pixel width and height.",
      },
    ],
  },
  {
    slug: "compress-png",
    name: "PNG Compressor",
    primaryKeyword: "compress png online free",
    searchVolume: 40500,
    seoTitle: "Free PNG Compressor — Reduce PNG Size Online",
    seoDescription: "Compress PNG images online free. Reduce file size up to 80% using lossless and lossy compression. No signup, browser-based. Instant download.",
    h1: "Free PNG Compressor",
    description: "Compress PNG files to reduce size while preserving transparency. Browser-based — your images stay on your device.",
    faqs: [
      {
        question: "Can I compress a PNG without losing transparency?",
        answer: "Yes. Trndinn's PNG compressor preserves the alpha channel during compression, so transparent backgrounds remain intact after reducing file size.",
      },
      {
        question: "What is the best way to compress a PNG file?",
        answer: "For most use cases, a quality setting of 70-85% reduces PNG file size by 60-80% while keeping the image visually lossless. Trndinn's compressor handles this automatically in the browser.",
      },
      {
        question: "How much smaller can a PNG get after compression?",
        answer: "PNG files can typically be reduced by 40-80% depending on image content. Images with large flat-color areas compress most aggressively.",
      },
      {
        question: "Is PNG compression lossless?",
        answer: "Standard PNG compression is lossless. Trndinn also supports lossy PNG compression (reducing color palette), which yields smaller files at a slight quality tradeoff.",
      },
      {
        question: "Why is my PNG still large after compression?",
        answer: "High-detail photos saved as PNG retain many color values that resist compression. Consider converting to WebP or JPG for photos — PNGs compress best on graphics, logos, and illustrations.",
      },
    ],
  },
  {
    slug: "compress-webp",
    name: "WebP Compressor",
    primaryKeyword: "compress webp online free",
    searchVolume: 12100,
    seoTitle: "Free WebP Compressor — Reduce WebP Size Online",
    seoDescription: "Compress WebP images online free. Reduce WebP file size with quality control. No signup, browser-based, instant download. Images never leave your device.",
    h1: "Free WebP Compressor",
    description: "Compress WebP images to get even smaller file sizes for faster websites. Adjust quality and download — no uploads needed.",
    faqs: [
      {
        question: "Can I compress a WebP file further?",
        answer: "Yes. Even though WebP is already an efficient format, you can reduce file size a further 20-50% by adjusting the quality setting. Trndinn's compressor runs this entirely in your browser.",
      },
      {
        question: "What quality setting is best for WebP compression?",
        answer: "A quality of 75-80% for WebP is the typical web standard — files are noticeably smaller with no perceivable quality difference at normal screen sizes.",
      },
      {
        question: "Does WebP compression affect animation?",
        answer: "Trndinn's WebP compressor targets static WebP images. Animated WebP files are compressed on the first frame only at this time.",
      },
      {
        question: "Is WebP better than JPG after compression?",
        answer: "Yes — even at equivalent quality settings, WebP files are typically 25-35% smaller than JPG. Compressing WebP further widens that gap.",
      },
      {
        question: "Do I need to upload my WebP to compress it?",
        answer: "No. Trndinn's WebP compressor uses the Canvas API in your browser — your file is never uploaded to any server.",
      },
    ],
  },
  {
    slug: "compress-gif",
    name: "GIF Compressor",
    primaryKeyword: "compress gif online free",
    searchVolume: 18100,
    seoTitle: "Free GIF Compressor — Reduce GIF File Size",
    seoDescription: "Compress GIF images online free. Reduce animated or static GIF file size without losing quality. No signup, no uploads, browser-based. Instant download.",
    h1: "Free GIF Compressor",
    description: "Reduce GIF file size for faster loading. Works on both animated and static GIFs — entirely in your browser, no uploads.",
    faqs: [
      {
        question: "How do I make a GIF file smaller?",
        answer: "Reducing GIF quality via color palette and dithering is the most effective way to shrink GIF file size. Trndinn's GIF compressor does this in the browser without uploading your file.",
      },
      {
        question: "Will compressing a GIF ruin the animation?",
        answer: "No. Trndinn's GIF compressor reduces palette size and applies dithering, keeping animation frames intact while significantly reducing file size.",
      },
      {
        question: "How much can I reduce a GIF file size?",
        answer: "Depending on the original palette and content, GIF files can be reduced by 30-70% with minimal visible degradation.",
      },
      {
        question: "Is there a file size limit for GIF compression?",
        answer: "No. Trndinn's GIF compressor is browser-based and handles any file size your device can load.",
      },
      {
        question: "Is it free to compress a GIF online?",
        answer: "Yes. Trndinn's GIF compressor is completely free — no signup, no watermark, no daily upload limit.",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Edit / Transform family
  // ═══════════════════════════════════════════════════════════════════════════
  {
    slug: "image-resizer",
    name: "Image Resizer",
    primaryKeyword: "image resizer online free",
    searchVolume: 90500,
    seoTitle: "Free Image Resizer Online — Resize Any Image",
    seoDescription: "Resize images online free. Platform presets for LinkedIn, Instagram, Twitter, YouTube, Facebook or enter custom dimensions. No signup, browser-based.",
    h1: "Free Online Image Resizer",
    description: "Resize any image to exact pixel dimensions or pick a platform preset for LinkedIn, Instagram, Twitter, YouTube, or Facebook. Runs entirely in your browser.",
    faqs: [
      {
        question: "How do I resize an image online for free?",
        answer: "Upload your image to Trndinn's Image Resizer, enter custom dimensions or pick a platform preset (LinkedIn, Instagram, etc.), and click Resize. Download your resized image instantly. No signup needed.",
      },
      {
        question: "What is the correct image size for LinkedIn posts?",
        answer: "LinkedIn post images should be 1200×628 px. Profile photos should be 400×400 px and banners 1584×396 px. Trndinn's Image Resizer includes all three LinkedIn presets.",
      },
      {
        question: "Can I resize an image without losing quality?",
        answer: "Upscaling always involves some quality tradeoff, but downscaling (making images smaller) preserves quality well. Trndinn uses high-quality canvas interpolation for minimal quality loss.",
      },
      {
        question: "What is the best Instagram image size in 2026?",
        answer: "Instagram square posts: 1080×1080 px. Stories/Reels: 1080×1920 px. Portrait feed: 1080×1350 px. Trndinn's resizer has one-click presets for all three.",
      },
      {
        question: "Can I maintain the aspect ratio when resizing?",
        answer: "Yes. Check the 'Maintain aspect ratio' checkbox and entering either width or height will automatically calculate the other dimension to avoid stretching.",
      },
    ],
  },
  {
    slug: "image-cropper",
    name: "Image Cropper",
    primaryKeyword: "crop image online free",
    searchVolume: 74000,
    seoTitle: "Free Image Cropper Online — Crop Any Photo",
    seoDescription: "Crop images online free. Set exact crop area with pixel controls. No signup, no uploads, runs in your browser. Instant download. Works on all devices.",
    h1: "Free Online Image Cropper",
    description: "Crop any image to your exact dimensions using pixel coordinates. No uploads, no signup — all processing happens in your browser.",
    faqs: [
      {
        question: "How do I crop an image online for free?",
        answer: "Upload your image, set the X/Y offset and width/height of your crop area, then click Crop. Download the cropped image instantly. No signup, no watermark.",
      },
      {
        question: "Can I crop an image to a circle online?",
        answer: "Set equal width and height values in Trndinn's Image Cropper to get a square crop, then apply it. For circular output, use the circle crop option in the advanced settings.",
      },
      {
        question: "Does cropping an image reduce file size?",
        answer: "Yes. Cropping removes pixels, which reduces the file size proportionally to how much of the image you remove.",
      },
      {
        question: "What is the best way to crop a photo for Instagram?",
        answer: "For Instagram square posts, crop to 1:1 (1080×1080 px). For portrait, use 4:5 (1080×1350 px). For Stories, use 9:16. Trndinn's cropper lets you enter exact pixel dimensions.",
      },
      {
        question: "Is there a file size limit for the image cropper?",
        answer: "No. Trndinn's image cropper is entirely browser-based — your file is never uploaded, so there is no server-side size limit.",
      },
    ],
  },
  {
    slug: "image-rotator",
    name: "Image Rotator",
    primaryKeyword: "rotate image online free",
    searchVolume: 33100,
    seoTitle: "Free Image Rotator Online — Rotate or Flip",
    seoDescription: "Rotate images online free. Rotate 90°, 180°, 270° or flip horizontally/vertically. No signup, browser-based, instant download. Works on any device.",
    h1: "Free Online Image Rotator",
    description: "Rotate any image 90°, 180°, or 270°, or flip it horizontally and vertically. No uploads — all processing runs in your browser.",
    faqs: [
      {
        question: "How do I rotate a photo online for free?",
        answer: "Upload your image, click the rotation angle (90°, 180°, 270°, or -90°) or flip buttons, then download. No signup required.",
      },
      {
        question: "How do I flip an image horizontally online?",
        answer: "Upload your image in Trndinn's Image Rotator and click the 'Flip Horizontal' button. The mirrored image is ready to download instantly.",
      },
      {
        question: "Does rotating an image reduce quality?",
        answer: "Rotating by 90°, 180°, or 270° is lossless for PNG and lossless WebP. For JPG, rotation is re-encoded once at original quality — quality loss is minimal.",
      },
      {
        question: "Can I rotate a PNG without losing transparency?",
        answer: "Yes. Trndinn's Image Rotator preserves the alpha channel when rotating PNG images, so transparent backgrounds remain intact.",
      },
      {
        question: "What is the difference between rotate and flip?",
        answer: "Rotation turns the image clockwise or counter-clockwise. Flip mirrors the image left-to-right (horizontal) or top-to-bottom (vertical). Both are available in Trndinn's rotator.",
      },
    ],
  },
  {
    slug: "watermark-image",
    name: "Image Watermark Tool",
    primaryKeyword: "add watermark to image online free",
    searchVolume: 27100,
    seoTitle: "Free Image Watermark Tool — Add Text or Logo",
    seoDescription: "Add a watermark to any image online free. Text or image watermark, 9 position presets, opacity control. No signup, browser-based. Instant download.",
    h1: "Free Online Image Watermark Tool",
    description: "Protect your images with a text or image watermark. Choose position, opacity, and font — entirely browser-based, no signup.",
    faqs: [
      {
        question: "How do I add a watermark to a photo for free?",
        answer: "Upload your image, choose text or image watermark, set position and opacity, then click Add Watermark. Download immediately. No account needed.",
      },
      {
        question: "Can I add a logo as a watermark?",
        answer: "Yes. Choose 'Image' as watermark type and upload your logo PNG. It will be placed at your chosen position with your opacity setting.",
      },
      {
        question: "What opacity should I use for a watermark?",
        answer: "For subtle watermarks on professional photos, 20-40% opacity works well. For visible copyright protection, 60-80% is typical. Trndinn lets you set any opacity from 1-100%.",
      },
      {
        question: "Does adding a watermark reduce image quality?",
        answer: "No. The watermark is composited onto the image at full resolution. The output file is the same dimensions as the original.",
      },
      {
        question: "Can I position the watermark anywhere on the image?",
        answer: "Yes. Trndinn's watermark tool offers 9 position presets: top-left, top-center, top-right, center, bottom-left, bottom-center, and bottom-right.",
      },
    ],
  },
  {
    slug: "image-workbench",
    name: "Image Workbench",
    primaryKeyword: "online image editor free",
    searchVolume: 49500,
    seoTitle: "Free Online Image Editor — Multi-Op Workbench",
    seoDescription: "Edit images online free with a multi-step pipeline editor. Resize, crop, rotate, compress, and convert in one run. No signup, browser-based. Instant download.",
    h1: "Free Online Image Workbench",
    description: "Chain multiple image operations — resize, crop, rotate, compress, convert — in a single pipeline. No uploads, no signup, all in your browser.",
    faqs: [
      {
        question: "What is the Image Workbench?",
        answer: "The Image Workbench is Trndinn's multi-operation pipeline editor. You can chain Resize, Crop, Rotate, Compress, and Convert steps in any order and apply them all in one pass.",
      },
      {
        question: "Can I resize and compress an image at the same time?",
        answer: "Yes. Add a Resize step and a Compress step to the pipeline, set their parameters, and click Run Pipeline. All operations are applied sequentially in one pass.",
      },
      {
        question: "Is the Image Workbench free to use?",
        answer: "Yes. Trndinn's Image Workbench is completely free — no signup, no watermark, no daily limit. Your images never leave your browser.",
      },
      {
        question: "What image operations does the Workbench support?",
        answer: "Resize (to exact dimensions or platform presets), Crop (pixel-level control), Rotate/Flip, Compress (quality slider), and Convert (format change). More operations are added regularly.",
      },
      {
        question: "What output formats does the Workbench support?",
        answer: "JPG, PNG, WebP, and GIF. Select your output format in the Convert step or the default is the same as the input format.",
      },
    ],
  },
];

export const ALL_EDIT_SLUGS: string[] = EDIT_TOOLS.map((t) => t.slug);

export function getEditTool(slug: string): EditTool | undefined {
  return EDIT_TOOLS.find((t) => t.slug === slug);
}

export function isEditSlug(slug: string): boolean {
  return ALL_EDIT_SLUGS.includes(slug);
}
