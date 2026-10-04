# Media Tools Premium Redesign — Design Specification

> Reference images: `.design-refs/11.png` through `.design-refs/21.png`
> Read each image with the Read tool before implementing its tool page.

## Global Design System

### Theme
- **Dark mode primary** — deep navy/charcoal background (`hsl(var(--tool-bg))`)
- **Orange accent** — gradient `linear-gradient(135deg, #F97316, #F59E0B)` for CTAs, highlights, active states
- **Purple/violet accents** for secondary highlights
- **Warm glow effects** — subtle radial gradients behind 3D illustrations

### Layout (ALL tool pages)
- **Sticky sidebar** (210px) on left — shared `ImageToolsSidebar` with POPULAR/CONVERT/OPTIMIZE/EDIT/GENERATE
- **Main content** scrolls independently
- **Header** sticky at top (64px)
- **Max content width** ~1200px within main area

### Common Sections (top to bottom)
1. **Eyebrow badge** — orange/gradient pill with tool name + tech (e.g. "FREE AI BACKGROUND REMOVER — ONNX, BROWSER-LOCAL")
2. **Hero headline** — large bold text, key word in orange gradient, rest in white/foreground
3. **Hero description** — 1-2 lines explaining the tool
4. **3D illustration** — floating on right side of hero, tool-specific decorative elements with glow
5. **Trust badges row** — 4-5 pill badges: "No signup required", "100% private", "Runs in browser", tool-specific
6. **Tool workspace** — dark card with the actual tool UI (see per-tool specs below)
7. **Trust strip** — 4 feature cards below the tool (icon + title + description)
8. **Content sections** — "What is X?", "Need more?", info cards with 3D illustrations
9. **"More tools you'll love"** — horizontal scroll of related tool cards

### Tool Workspace Pattern
- **Numbered step progress bar**: `1 → 2 → 3` with orange active number, labels below
- **Tabbed input**: "Upload Image" (orange active), "Paste URL"/"Enter URL", "Sample Images"/"Try Sample"
- **Dropzone**: dashed border, upload icon, "Drag & drop your image here" + "or click to browse" link
- **Sample image strip**: row of thumbnail images below dropzone with `+` button
- **Preview panel**: on the right side, showing original vs result
- **Settings/options panel**: collapsible "Advanced Settings"/"Advanced Options"
- **Big orange CTA button**: full width, gradient orange, arrow icon, tool-specific text

### Typography
- Headlines: `font-display` (Space Grotesk), bold, large clamp sizes
- Body: `font-sans` (Poppins)
- Small labels: 10-12px, uppercase tracking, muted

### Colors (use CSS vars)
- Background: `hsl(var(--tool-bg))`
- Surface: `hsl(var(--tool-surface))`
- Surface dim: `hsl(var(--tool-surface-dim))`
- Border: `hsl(var(--tool-border))`
- Orange accent: `#F97316` / `hsl(var(--primary))`
- Amber accent: `#F59E0B` / `hsl(var(--chart-3))`

---

## Per-Tool Specifications

### Image 11 — JPG to ICO Converter
**File**: `.design-refs/11.png`
**Slug**: `jpg-to-ico` (applies to all converters)
- Hero: "Turn any image into a **perfect icon** — instantly."
- 3D illustration: floating format cards (JPG → ICO) with neon glow, "From this / To this" labels
- Trust badges: "Instant conversion / No waiting", "100% private / Files never uploaded", "Works offline / In your browser"
- Workspace: 3-column layout:
  - Left: Tabbed upload (Upload Image / Enter URL / Search Image NEW) + dropzone + sample strip
  - Center: Original JPG preview + Converted ICO Preview (multiple sizes: 64x64, 32x32, 16x16)
  - Right: "Advanced Settings" panel — Icon Sizes checkboxes (16x16, 32x32, 64x64, 128x128), Background (Keep original / Make transparent), Crop & Fit (Auto center / Manual adjust)
- CTA: "Convert to ICO →" full-width orange button
- Trust strip: "No signup / Get started instantly", "Private & secure / Files never leave device", "High quality output / Multiple icon sizes", "Windows & Web ready / Perfect for apps and favicons"
- Content: "What is ICO format?" card with 3D illustration, "Need more?" card with "Create with Trndinn →"
- Bottom: "More image tools you'll love" strip

### Image 12 — Favicon Generator
**File**: `.design-refs/12.png`
**Slug**: `favicon-generator`
- Eyebrow: "FREE FAVICON GENERATOR" (orange text, no pill)
- Hero: "**Favicon generator** — all sizes, one click."
- 3D illustration: floating favicon icons at different sizes (16px, 32px, 48px, 180px, 192px, 512px) + ICO badge + webmanifest badge + code snippet badge
- Description: "Upload any image and get a complete favicon package: favicon.ico (16/32/48px), apple-touch-icon (180px), android-chrome (192px and 512px), and a site.webmanifest — all in a single ZIP download."
- Trust badges: pills — "No signup required", "100% private", "All sizes + webmanifest", "Works offline"
- Workspace: 3-column:
  - Left: Tabbed (Upload Image / Enter URL / Search Image NEW) + dropzone + sample strip
  - Center: "Preview (Square crop)" with crop overlay on image + "Auto crop & optimize" button
  - Right: "Advanced Options" — Icon Sizes checkboxes (16x16 favicon.ico, 32x32, 48x48, 180x180 Apple Touch, 192x192 Android Chrome, 512x512 Android Chrome), Background (Keep original / Make transparent), Crop & Fit
- CTA: "Generate Favicon Package →" full-width orange
- Result section: "Conversion Result (Preview)" — "Your favicon package is ready!" with generated files grid (16x16, 32x32, 48x48, 180x180, 192x192, 512x512, site.webmanifest) + "Download All Files (ZIP)" orange button + "Preview Files" button
- Trust strip: "Instant generation", "100% private", "Browser-based", "Perfect for all platforms"
- Content: "What's included in the ZIP?" with file breakdown, "Works everywhere" with browser/platform icons (Chrome, Edge, Safari, Firefox, Windows, macOS, Android, iOS)
- "Need more?" CTA with social icons

### Image 13 — Profile Picture Creator
**File**: `.design-refs/13.png`
**Slug**: `profile-pic-creator`
- Eyebrow: "FREE PROFILE PICTURE CREATOR" orange pill
- Hero: "Profile Picture Creator — **emoji avatar** free PNG download."
- 3D illustration: floating 3D emoji faces with glow effects, "Turn any emoji into a cool avatar" handwritten label
- Side badges: "Custom styles", "Any background", "Multiple sizes", "Instant download"
- Trust badges: "No signup required", "No upload needed", "80+ emojis", "High quality PNG"
- Workspace: numbered steps 1→2→3 (Choose Emoji / Customize / Download)
  - Left column: Emoji search bar + category tabs (Smileys/People/Animals/Objects/Symbols/Popular) + emoji grid + Background Color swatches + Shape buttons (Circle/Square/Rounded)
  - Right column: "Live Preview" (512x512px) + emoji thumbnail strip + "Recommended sizes by platform" table (LinkedIn 400x400, Instagram 110x110, Twitter/X 400x400, Facebook 170x170, Discord 128x128, Slack 512x512) + "Download 512x512px PNG" orange button
- Below: "Popular Styles" — Gradient, Neon, Glass, 3D, Minimal, Dark, Pastel style cards
- Trust strip: "100% Free", "Instant download", "No upload needed", "Multiple sizes"

### Image 14 — Background Remover
**File**: `.design-refs/14.png`  
**Slug**: `background-remover`
- Shows the SIDEBAR design clearly — POPULAR (Remove Background active with green), Profile Picture Creator, Favicon Generator + CONVERT + OPTIMIZE + GENERATE + trndinn CTA
- Eyebrow: "FREE AI BACKGROUND REMOVER — ONNX, BROWSER-LOCAL" pill
- Hero: "Remove **image background** with AI — free."
- 3D illustration: photo with "From this" → "To this" transformation, original photo → transparent PNG
- Trust badges: "No signup required", "100% private", "Images never uploaded", "AI runs in browser", "High quality edges"
- Workspace: Tabbed (Upload Image / Paste URL / Samples) + AI Model (ONNX) dropdown + dropzone + sample strip
  - Center: "Original Image" and "Background Removed" side-by-side
  - Right: "Edit Options" panel — Background (Transparent/Solid color/Custom color + hex), Refine edges toggle, Remove shadows toggle, Auto enhance toggle
- CTA: "Download PNG" orange button
- Trust strip: "Lightning fast", "100% private", "No upload", "High quality"
- Content: "Works with any image", "Perfect for", "Export ready" cards with image grids

### Image 15 — Base64 to Image Decoder
**File**: `.design-refs/15.png`
**Slug**: `base64-to-image`
- Eyebrow: "FREE BASE64 TO IMAGE DECODER — BROWSER-BASED" pill
- Hero: "Decode **Base64** to image — free, instant."
- 3D illustration: floating code snippet with "Decoded Image" label, data:image/png;base64 text, PNG/JPG badges
- Trust badges: "No signup required", "100% private", "Runs in browser", "Supports data URI & raw"
- Workspace: Tabbed (Paste Base64 / Upload File / Try Sample / Clear)
  - Left: Code editor textarea with line numbers, placeholder "Paste your Base64 string here...", character count
  - Below textarea: "Output Format" toggle — PNG / JPG buttons (orange active)
  - Right: "Image Preview" panel — "Waiting for input" state, then image preview with Image Info (Dimensions, File size, Format) + Download button
- CTA: "Decode Image →" full-width orange with sparkle icon
- Trust strip: "Instant decoding", "100% private", "No upload required", "Supports all formats"
- Content: "What is Base64?" info card, "Need to encode an image instead?" cross-link card

### Image 16 — Image Workbench
**File**: `.design-refs/16.png`
**Slug**: `image-workbench`
- Eyebrow: "FREE ONLINE IMAGE WORKBENCH" orange pill
- Hero: "Edit, convert, optimize — **all in one place.**"
- 3D illustration: floating operation cards (Resize, Crop, Rotate, Compress) + format badges (JPG, PNG, WEBP, GIF, TIFF), "One image / Multiple operations" label
- Trust badges: "No signup required", "100% private", "Runs in your browser", "Support multiple formats"
- Workspace: 3 numbered steps:
  1. "Upload your image" — Tabbed (Upload Image / Paste URL / Sample Images) + dropzone
  2. "Add operation" — operation list (Resize, Crop, Rotate/Flip, Compress, Convert Format) with + buttons, "Reset all" link
  3. "Build pipeline" — operation chain cards (Resize → Compress → Convert → Rotate) with → arrows, "+ Add operation" at end
- Below pipeline: Output format dropdown + Estimated size ("~380 KB, 75% smaller" in green) + "Advanced settings" button + "Run Pipeline →" pink/gradient CTA
- Trust strip: "Works entirely in your browser", "Multi-operation pipeline", "Supports all formats", "High quality output"

### Image 17 — QR Code Generator
**File**: `.design-refs/17.png`
**Slug**: `qr-code-generator`
- Eyebrow: "FREE QR CODE GENERATOR — CUSTOM COLORS, PNG & SVG" orange pill
- Hero: "QR Code Generator — **custom colors** free PNG & SVG."
- 3D illustration: floating QR code with content type labels (Links, Text, Contact, Wi-Fi, Email, WhatsApp), "Turn anything into a QR code" handwritten label
- Trust badges: "No signup required", "100% private", "Runs in browser", "PNG & SVG download"
- Workspace: numbered steps 1→2→3 (Enter content / Customize / Download)
  - Left: Content type tabs (URL active / Text / Contact / Wi-Fi / Email / Phone / SMS / WhatsApp) + URL input field
  - Below: "Customize Design" / "Add Logo PRO" / "Advanced" tabs + Foreground Color swatches + Background Color swatches + hex input + Style grid (dot patterns) + Corner Style options + Dots Style grid
  - Right: "Live Preview" (400x400px) with QR code + "Looks good!" green check + "Download PNG" orange button + "Download SVG" outline button + size/quality info
- Trust strip: "Instant generation", "100% private", "Fully customizable", "Multiple formats"
- Content: "Popular use cases" — icon grid (Website, Text, Contact, Wi-Fi, Email, Phone, WhatsApp, Social Media)

### Image 18 — Image to Text (OCR)
**File**: `.design-refs/18.png`
**Slug**: `image-to-text`
- Eyebrow: "FREE IMAGE TO TEXT OCR — TESSERACT.JS, BROWSER-LOCAL" pill
- Hero: "Extract text **from an image** — free OCR online."
- 3D illustration: image transforming into extracted text, "Turn images into editable text instantly" label, floating "Image" and "Extracted Text" cards
- Trust badges: "No signup required", "100% private", "Runs in browser", "8+ languages"
- Workspace: 3 numbered steps (Upload Image / Select Language / Extract & Copy)
  - Left: dropzone + sample strip + "Image Tips" card (Use clear high contrast images, Avoid blurry, Works best with printed or typed text)
  - Center: "Language" dropdown (English Default) + "Advanced Options" (OCR Engine: Tesseract.js Best / Fast, Improve image contrast toggle, Preserve text formatting toggle)
  - Right: "Result" panel with "Text extracted successfully!" badge + textarea with extracted text + "Copy Text" orange button + "Download .txt" button + "Preview (Highlighted Text)" with overlaid text boxes on original image
- CTA: "Extract Text →" orange button
- Trust strip: "Instant & accurate", "100% private", "Multiple languages", "Download or copy"

### Image 19 — Watermark Tool
**File**: `.design-refs/19.png`
**Slug**: `watermark-image`
- Eyebrow: "FREE IMAGE WATERMARK TOOL — BROWSER-BASED" pill
- Hero: "Add **watermark** to your image — free & easy."
- 3D illustration: photo with watermark overlay, "Your helmet / Your style" + "Protect your content" + "Pour watermark / Your style" handwritten labels
- Trust badges: "No signup required", "100% private", "Works offline in browser", "Both text & image watermark"
- Workspace: 3 numbered steps (Upload your image / Watermark settings / Preview)
  - Left: Tabbed (Upload Image / Paste URL / Sample Images) + dropzone
  - Center: "Watermark settings" section — "Text Watermark" (orange active) / "Image / Logo" tabs + watermark text input + Font dropdown (Poppins) + Font size slider (36px) + Text color + hex input + Opacity slider (60%) + Position grid (3x3) + Add shadow toggle + Add background toggle + Rotate dropdown + Tile watermark toggle
  - Right: "Preview" with watermarked image + sample strip + image info (Original size, Output size, format, file size) + "Download Image →" orange/red CTA
- Trust strip: "Fully customizable", "Both text & image", "100% private", "Instant download"

### Image 20 — Image Cropper  
**File**: `.design-refs/20.png`
**Slug**: `image-cropper`
- Shows sidebar with EDIT section visible: Image Cropper (active, orange), Image Rotator, Flip Image, Image Effects
- Eyebrow: "FREE IMAGE CROPPER — BROWSER-BASED" orange pill
- Hero: "Free **Image Cropper** Crop images to exact size."
- 3D illustration: photo with crop handles, format badges (JPG, PNG, WEBP, GIF, TIFF), "Crop to exact size" label
- Trust badges: "No signup required", "100% private", "Runs in browser", "Supports all formats"
- Workspace: 3 numbered steps (Upload Image / Set Crop Area / Download)
  - Left: dropzone + "Try a sample image:" strip
  - Below: "Crop area (pixels)" — X offset, Y offset, Width, Height inputs + "Aspect ratio" dropdown (Free) + ratio buttons (Free/1:1/16:9/4:3/3:2/9:16)
  - Right: "Live Preview" with crop handles on image, "Fit to screen" button + "Original size" and "Cropped size" info + Output format dropdown
- CTA: "Crop & Download Image" orange/pink gradient button
- Trust strip: "Instant cropping", "100% private", "Multiple aspect ratios", "Supports all formats"

### Image 21 — Image Resizer (NOT IN CURRENT SET — check if exists)
**File**: `.design-refs/21.png` — This appears to be the Image Cropper from a different angle or the same as 20.

---

## Audio/Video Sidebar Specs
- Audio tools sidebar: scoped to audio-only tools (MP3 converter, WAV converter, audio trimmer, audio joiner)
- Video tools sidebar: scoped to video-only tools (MP4 converter, video trimmer, webcam recorder, screen recorder)
- Same visual design as image sidebar but with audio/video tool categories

## Implementation Priority
1. Write a shared premium tool page layout component (trust badges, step bar, tabbed upload, trust strip)
2. Redesign each tool page to match its reference image
3. Create audio/video sidebars
4. Component-based tool switching
