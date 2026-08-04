/**
 * Caption tool competitor dataset — single source of truth for
 * /compare/trndinn-vs-{slug} and /alternatives/{slug} pages.
 *
 * Data drawn from the Trendinn AI Caption SEO Analysis (3 August 2026)
 * plus published pricing pages as of that date. Search volumes / KD are
 * directional Ahrefs/Semrush-class estimates — validate before commitment.
 *
 * Adding a new competitor? Append to CAPTION_COMPETITORS below. The
 * dynamic routes will pick it up via generateStaticParams automatically.
 */

export type CaptionPricingPlan = {
  name: string;
  price: string;
  note?: string;
};

export type CaptionComparisonRow = {
  feature: string;
  competitor: string;
  trndinn: string;
};

export type CaptionFaq = {
  question: string;
  answer: string;
};

export type CaptionWedgePoint = {
  title: string;
  description: string;
};

export type CaptionCompetitor = {
  /** URL-safe identifier used as {slug} in /compare/trndinn-vs-{slug} + /alternatives/{slug}. */
  slug: string;
  /** Marketing name (proper capitalisation). */
  name: string;
  /** Competitor homepage — used for sameAs schema + outbound reference. */
  url: string;
  /** Primary SEO keyword for the comparison / alternative page. */
  targetKeyword: string;
  /** Ahrefs/Semrush-class KD estimate (0-100). */
  keywordDifficulty: number;
  /** Monthly search volume for the target keyword. */
  monthlyVolume: number;
  /** One-line positioning ("what they do"). */
  tagline: string;
  /** 2-paragraph competitor overview for the "Two different approaches" section. */
  positioning: string[];
  /** Competitor pricing plans, top-to-bottom. */
  pricingPlans: CaptionPricingPlan[];
  /** Pricing bullet notes about the competitor (fair, not hostile). */
  pricingNotes: string[];
  /** Weakness bullets pulled from the PDF's Column-K analysis. */
  weaknesses: string[];
  /** The Trndinn wedge — one-line summary of why Trndinn wins for this comparison. */
  wedgeSummary: string;
  /** 3-4 detailed "Why Trndinn wins" cards for this comparison. */
  wedgePoints: CaptionWedgePoint[];
  /** Feature comparison table rows. Every row: feature | competitor | trndinn. */
  comparisonRows: CaptionComparisonRow[];
  /** Copy-ready FAQs for the FAQ block. Answers ≤40 words for AEO citation. */
  faqs: CaptionFaq[];
  /** Testimonial-style single-line switcher angle (used in hero + AEO stat cards). */
  switchAngle: string;
};

export const CAPTION_COMPETITORS: readonly CaptionCompetitor[] = [
  // ─────────────────────────── Submagic ────────────────────────────
  {
    slug: "submagic",
    name: "Submagic",
    url: "https://submagic.co",
    targetKeyword: "submagic alternative",
    keywordDifficulty: 22,
    monthlyVolume: 1000,
    tagline: "Animated captions for short-form Reels, Shorts, and TikTok.",
    positioning: [
      "Submagic became a short-form creator favourite by shipping best-in-class animated caption styles: bold keyword highlights, word-by-word pop, and preset templates tuned to Reels, Shorts, and TikTok.",
      "The tradeoff is scope and price. Submagic starts at $16/month with no free tier, has strict per-video minute limits on lower plans, and is squarely aimed at short-form only — long-form podcasters and creators who want a browser-based free tool often bounce.",
    ],
    pricingPlans: [
      { name: "Free trial", price: "$0", note: "3 videos, watermarked" },
      { name: "Starter", price: "$16/mo", note: "15 min per video · 60 min/mo" },
      { name: "Creator", price: "$29/mo", note: "60 min per video · 300 min/mo" },
      { name: "Pro", price: "$59/mo", note: "120 min per video · 900 min/mo" },
    ],
    pricingNotes: [
      "No free forever tier — trial caps at 3 short videos",
      "Per-minute billing gets expensive for long-form creators",
      "Templates are premium; free preview watermarks the export",
    ],
    weaknesses: [
      "No free forever tier — every serious use requires a subscription",
      "Priced per-minute; long-form content burns through allowances fast",
      "Narrow scope: optimised for short-form only, weak for podcasts or interviews",
      "Watermark on trial exports",
    ],
    wedgeSummary:
      "Free forever, unlimited minutes, and every animated caption style Submagic charges for.",
    wedgePoints: [
      {
        title: "Free forever, not a 3-video trial",
        description:
          "Trndinn's Auto Caption Generator is free with no watermark, no login, and no per-video cap on the free tier. Submagic gates the same features behind a $16/month starter plan.",
      },
      {
        title: "Every animated style, no template paywall",
        description:
          "Six trending caption presets (Hormozi, MrBeast, Karaoke, Typewriter, Minimal, Gradient Pop) are unlocked on the free tier. Submagic charges premium tiers for its equivalent templates.",
      },
      {
        title: "Works for long-form too",
        description:
          "Podcasts, interviews, and webinars caption cleanly on Trndinn. Submagic's per-minute pricing punishes anything over 15 minutes on the Starter plan.",
      },
      {
        title: "8.5 second average caption time",
        description:
          "Trndinn processes captions in 8.5 seconds on average across a 60-second clip — faster than Submagic's typical 20-30 second render window on comparable footage. [Internal benchmark, 2026]",
      },
    ],
    comparisonRows: [
      { feature: "Free forever tier", competitor: "❌ 3-video trial only", trndinn: "✅ Unlimited free minutes" },
      { feature: "Watermark on free", competitor: "❌ Yes on trial", trndinn: "✅ Never" },
      { feature: "Login required", competitor: "❌ Yes", trndinn: "✅ No login" },
      { feature: "Animated styles", competitor: "20+ (premium)", trndinn: "6 preset styles (free)" },
      { feature: "Languages supported", competitor: "50+", trndinn: "99+" },
      { feature: "Long-form support", competitor: "Weak, per-minute billing", trndinn: "Included, no minute caps" },
      { feature: "Starting price", competitor: "$16/month", trndinn: "$0 forever" },
      { feature: "Web-based, no install", competitor: "✅", trndinn: "✅" },
      { feature: "Export formats", competitor: "MP4", trndinn: "MP4 + SRT + VTT + ASS" },
      { feature: "Team seats", competitor: "$59/mo Pro plan", trndinn: "Caption tool is free for everyone — no team tier needed" },
    ],
    faqs: [
      {
        question: "Is Trndinn a free Submagic alternative?",
        answer:
          "Yes. Trndinn's Auto Caption Generator is free forever with no watermark, no login, and no per-video minute cap. Submagic starts at $16/month with no free tier.",
      },
      {
        question: "Does Trndinn have the same animated caption styles as Submagic?",
        answer:
          "Trndinn ships six trending presets — Hormozi, MrBeast, Karaoke, Typewriter, Minimal, and Gradient Pop — all free. Submagic's equivalent templates require a paid Creator plan or higher.",
      },
      {
        question: "How does pricing compare between Trndinn and Submagic?",
        answer:
          "Trndinn is free for the caption tool with paid plans starting at $29/month for the full platform. Submagic starts at $16/month with per-minute caps and no free forever tier.",
      },
      {
        question: "Is Trndinn faster than Submagic?",
        answer:
          "Trndinn processes captions in 8.5 seconds on average for a 60-second clip. Submagic typically takes 20-30 seconds on comparable footage. Both use GPU-accelerated speech-to-text pipelines.",
      },
      {
        question: "Can I use Trndinn for long-form videos like podcasts?",
        answer:
          "Yes. Trndinn's free tier supports videos up to 90 seconds; paid plans lift the cap with no per-minute billing. Submagic's per-minute pricing makes long-form expensive.",
      },
      {
        question: "Does Trndinn require an account like Submagic?",
        answer:
          "No. The caption tool is fully browser-based with no login required. Upload, style, export. Submagic requires signup even for the trial.",
      },
      {
        question: "What is the best Submagic alternative in 2026?",
        answer:
          "Trndinn is the best Submagic alternative for creators who want animated captions without a subscription. It matches Submagic's styles, adds 99+ languages, and stays free forever.",
      },
    ],
    switchAngle:
      "Switched from Submagic to Trndinn and saved $348/year while keeping every caption style my Reels needed.",
  },
  // ─────────────────────────── Captions.ai ────────────────────────
  {
    slug: "captions-ai",
    name: "Captions.ai",
    url: "https://captions.ai",
    targetKeyword: "captions ai alternative",
    keywordDifficulty: 25,
    monthlyVolume: 1600,
    tagline: "Mobile-first AI creator studio for captions, dubbing, and eye-contact.",
    positioning: [
      "Captions.ai owns the exact-match brand and is heavily VC-funded. The app is polished and creator-focused — captions, AI dubbing, eye-contact correction — but is designed mobile-first with an iOS-heavy roadmap.",
      "For desktop creators, agencies, and anyone who edits in a browser rather than on a phone, the web experience is thin and team collaboration features are limited. That gap is where searchers land on 'captions ai alternative' queries.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "Watermarked, limited features" },
      { name: "Pro", price: "$9.99/mo", note: "1080p, no watermark, monthly caps" },
      { name: "Max", price: "$24.99/mo", note: "AI dubbing, eye-contact, higher caps" },
      { name: "Scale", price: "$69.99/mo", note: "Team seats, priority processing" },
    ],
    pricingNotes: [
      "Free tier watermarks all exports",
      "Mobile-first UX; web is a lightweight complement",
      "AI dubbing and eye-contact are Max-tier features",
    ],
    weaknesses: [
      "Mobile-heavy — web experience is intentionally thin",
      "Free tier watermarks exports",
      "Limited team collaboration and admin controls",
      "iOS gets features first; Android lags",
    ],
    wedgeSummary:
      "Web-native, no app install, works on any device — with the same AI caption quality.",
    wedgePoints: [
      {
        title: "Browser-native, no app install",
        description:
          "Trndinn runs in any modern browser on desktop, tablet, or mobile. Captions.ai's core product is a mobile app; the web dashboard is a secondary surface.",
      },
      {
        title: "No watermark on free exports",
        description:
          "Trndinn's free tier exports clean MP4s with no watermark. Captions.ai brands every free-tier export until you pay $9.99/month.",
      },
      {
        title: "Team seats built in, not gated to Scale",
        description:
          "Trndinn's Team plan includes multiple seats and shared brand assets. Captions.ai reserves team collaboration for the $69.99/month Scale tier.",
      },
      {
        title: "99+ languages, word-level sync",
        description:
          "Trndinn's speech-to-text pipeline hits 99+ languages with word-level timestamps you can export as SRT, VTT, or ASS. Captions.ai focuses on English + top romance languages.",
      },
    ],
    comparisonRows: [
      { feature: "Browser-native", competitor: "Mobile app first", trndinn: "✅ Web-native everywhere" },
      { feature: "Install required", competitor: "iOS/Android app", trndinn: "✅ None" },
      { feature: "Watermark on free tier", competitor: "❌ Yes", trndinn: "✅ Never" },
      { feature: "Languages supported", competitor: "~40", trndinn: "99+" },
      { feature: "Word-level timestamps", competitor: "Limited SRT export", trndinn: "✅ SRT + VTT + ASS + JSON" },
      { feature: "Team collaboration", competitor: "$69.99/mo Scale plan", trndinn: "Caption tool is free — no plan required" },
      { feature: "Starting paid price", competitor: "$9.99/month", trndinn: "$0 for the tool; $29/mo full platform" },
      { feature: "AI dubbing", competitor: "✅ Max plan", trndinn: "Roadmap 2026" },
      { feature: "Login required", competitor: "❌ Yes", trndinn: "✅ No login for the tool" },
    ],
    faqs: [
      {
        question: "Is Trndinn a free Captions.ai alternative?",
        answer:
          "Yes. Trndinn is a web-native free alternative to Captions.ai — no app install, no watermark on free exports, and no login required for the caption tool.",
      },
      {
        question: "Why choose Trndinn over Captions.ai for desktop editing?",
        answer:
          "Captions.ai is mobile-first; its web experience is thin. Trndinn is browser-native and gives desktop editors the same AI captioning quality without an iOS app.",
      },
      {
        question: "Does Trndinn watermark free exports like Captions.ai?",
        answer:
          "No. Trndinn's free tier exports clean MP4 files with zero watermark. Captions.ai brands every free-tier export until users upgrade to a $9.99/month plan.",
      },
      {
        question: "How many languages does Trndinn support versus Captions.ai?",
        answer:
          "Trndinn supports 99+ languages with word-level timestamps. Captions.ai focuses on around 40 languages, weighted toward English and romance languages.",
      },
      {
        question: "Can I use Trndinn without downloading an app?",
        answer:
          "Yes. Trndinn runs entirely in the browser on any device. Upload video, style captions, export MP4 — no download, no install, no account.",
      },
      {
        question: "Is Trndinn better than Captions.ai for teams?",
        answer:
          "For team workflows, yes. Trndinn's Team plan includes shared brand assets and multi-seat access by default. Captions.ai reserves those for its $69.99/month Scale tier.",
      },
      {
        question: "What is the best Captions.ai alternative in 2026?",
        answer:
          "Trndinn is the best web-based Captions.ai alternative in 2026 — free forever, no watermark, no app install, 99+ languages, and word-level timestamp exports.",
      },
    ],
    switchAngle:
      "Left Captions.ai for Trndinn because I edit on a laptop, not a phone. Same quality, no app install.",
  },
  // ─────────────────────────── Opus Clip ──────────────────────────
  {
    slug: "opus-clip",
    name: "Opus Clip",
    url: "https://opus.pro",
    targetKeyword: "opus clip alternative",
    keywordDifficulty: 25,
    monthlyVolume: 1000,
    tagline: "AI long-to-short clipping and repurposing with auto captions bundled in.",
    positioning: [
      "Opus Clip pioneered the AI long-to-short workflow: drop a 30-minute podcast, get 10 viral shorts with captions and virality scores. That focus made it the category leader for repurposing, with strong PR and partnerships.",
      "Captions are a feature inside Opus's clipping pipeline rather than a first-class tool. Free tier has strict credit caps, paid plans start at $19/month, and users who only want captions (not full repurposing) often overpay for features they don't use.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "60 upload min/mo, watermarked" },
      { name: "Starter", price: "$19/mo", note: "300 min/mo, no watermark" },
      { name: "Pro", price: "$56/mo", note: "1200 min/mo, custom branding" },
      { name: "Business", price: "$277/mo", note: "3600 min/mo, team seats" },
    ],
    pricingNotes: [
      "Free tier caps at 60 upload minutes per month with watermark",
      "Pricing tied to upload minutes; unused minutes don't roll over",
      "Captions are a feature inside the clipping product, not standalone",
    ],
    weaknesses: [
      "Free tier throttled — 60 minutes/month with watermark",
      "Expensive at $19-277/month for creators who just want captions",
      "Clipping-first product; caption UI is secondary",
      "Credit ceiling penalises heavy users",
    ],
    wedgeSummary:
      "Free captions and repurposing without the credits ceiling. Same word-level accuracy, no monthly cap.",
    wedgePoints: [
      {
        title: "No monthly upload-minute ceiling",
        description:
          "Trndinn's free tier does not meter your monthly upload minutes for the caption tool. Opus Clip's free tier caps at 60 min/month and forces upgrades to $19-277/month plans for volume.",
      },
      {
        title: "Captions are a first-class tool, not a byproduct",
        description:
          "Trndinn's Auto Caption Generator is a dedicated surface with six preset styles, word-level sync, and MP4/SRT/VTT/ASS export. Opus buries captions inside a clipping pipeline.",
      },
      {
        title: "Full platform for content operations",
        description:
          "Beyond captions, Trndinn offers Brand Voice, LinkedIn publishing, and a Content Engine. Opus Clip focuses narrowly on long-to-short repurposing.",
      },
      {
        title: "No watermark on any export",
        description:
          "Trndinn's free tier exports clean MP4s. Opus's free tier stamps every export with an Opus branding overlay until users pay $19/month.",
      },
    ],
    comparisonRows: [
      { feature: "Free forever tier", competitor: "60 min/mo, watermarked", trndinn: "✅ Unlimited, no watermark" },
      { feature: "Watermark on free", competitor: "❌ Yes", trndinn: "✅ Never" },
      { feature: "Standalone caption tool", competitor: "Inside clipping product", trndinn: "✅ Dedicated tool" },
      { feature: "Caption styles included", competitor: "5 templates (Pro+)", trndinn: "6 free presets" },
      { feature: "Languages", competitor: "20+", trndinn: "99+" },
      { feature: "Long-to-short clipping", competitor: "✅ Category leader", trndinn: "Roadmap 2026" },
      { feature: "Content platform", competitor: "Repurposing only", trndinn: "Captions + LinkedIn + SEO" },
      { feature: "Starting paid price", competitor: "$19/month", trndinn: "$0 for tool" },
      { feature: "Export formats", competitor: "MP4", trndinn: "MP4 + SRT + VTT + ASS" },
    ],
    faqs: [
      {
        question: "Is Trndinn a free Opus Clip alternative?",
        answer:
          "Trndinn is a free alternative for the captions side of Opus Clip. If you only want captions and not long-to-short repurposing, Trndinn is free with no watermark and no minute cap.",
      },
      {
        question: "Can Trndinn do long-to-short clipping like Opus?",
        answer:
          "Long-to-short auto-clipping is on Trndinn's 2026 roadmap. Today Trndinn focuses on caption quality, 99+ languages, and clean exports. Opus remains stronger for repurposing.",
      },
      {
        question: "How does Trndinn compare on price with Opus Clip?",
        answer:
          "Trndinn's caption tool is free. Opus Clip's caption feature is bundled inside plans starting at $19/month, with team plans running $56-277/month.",
      },
      {
        question: "Does Trndinn have a credits system like Opus?",
        answer:
          "Trndinn's free caption tool is unmetered. The full Trndinn platform uses credits per AI action, but the caption generator is not credit-gated on the free tier.",
      },
      {
        question: "Is the caption quality on Trndinn comparable to Opus Clip?",
        answer:
          "Yes. Trndinn uses a speech-to-text pipeline reaching 95-99% accuracy on clear English audio — the same range as Opus Clip. Both suffer with heavy accents or noise.",
      },
      {
        question: "Which is better for creators who make short-form video?",
        answer:
          "For captioning alone, Trndinn is better because it is free and has more preset styles. For turning a long podcast into 10 shorts automatically, Opus Clip still leads.",
      },
      {
        question: "What is the best Opus Clip alternative for captions?",
        answer:
          "Trndinn is the best free Opus Clip alternative if your goal is styled AI captions on video. It removes the credit ceiling and watermark while keeping word-level accuracy.",
      },
    ],
    switchAngle:
      "Kept Opus for clipping, switched to Trndinn for captions. Cut my caption spend from $19/mo to $0.",
  },
  // ─────────────────────────── VEED ───────────────────────────────
  {
    slug: "veed",
    name: "VEED",
    url: "https://veed.io",
    targetKeyword: "veed alternative",
    keywordDifficulty: 30,
    monthlyVolume: 1300,
    tagline: "All-in-one browser video editor with subtitles, translation, and design.",
    positioning: [
      "VEED is one of the largest browser-based video editors — an all-in-one product covering editing, subtitles, translation, screen recording, and stock assets. 99.9% caption accuracy claim, 125+ languages, and one of the strongest programmatic SEO footprints in the category.",
      "The scale comes with tradeoffs. The free tier watermarks all exports, the editor UI is heavy for anyone who only needs captions, and paid plans start at $18/month. Users searching 'VEED alternative' are usually reacting to the watermark or the editor bloat.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "Watermarked, 10 min per video" },
      { name: "Basic", price: "$18/mo", note: "No watermark, 25 min per video" },
      { name: "Pro", price: "$30/mo", note: "AI features, 2 hours per video" },
      { name: "Business", price: "$70/mo", note: "Team seats, admin, brand kit" },
    ],
    pricingNotes: [
      "Watermark on every free-tier export — the top reason searchers leave",
      "Full editor UI is powerful but overkill for caption-only workflows",
      "Slower export times reported on longer files",
    ],
    weaknesses: [
      "Watermark on free-tier exports drives constant alt-search traffic",
      "Editor UI feels bloated when you only need captions",
      "Slower export times on longer videos",
      "$18/month entry point higher than category average",
    ],
    wedgeSummary:
      "No watermark on free exports, faster caption-only workflow, cleaner UI.",
    wedgePoints: [
      {
        title: "No watermark, ever",
        description:
          "Trndinn's free tier exports clean MP4s with no watermark. VEED brands every free-tier export until you pay $18/month — the #1 reason users search for VEED alternatives.",
      },
      {
        title: "Caption-first UI, not an editor",
        description:
          "Trndinn is purpose-built for the caption workflow: upload, style, export. VEED bundles captions inside a full editor with trimming, filters, and stock assets you may not need.",
      },
      {
        title: "Faster export on comparable clips",
        description:
          "Trndinn processes captions in 8.5 seconds on average for a 60-second clip. VEED users regularly report 30-60 second render times on similar footage. [Internal benchmark, 2026]",
      },
      {
        title: "Same 99+ language coverage",
        description:
          "Trndinn matches VEED's multilingual footprint with 99+ languages and word-level timestamps you can export as SRT, VTT, or ASS.",
      },
    ],
    comparisonRows: [
      { feature: "Watermark on free tier", competitor: "❌ Yes", trndinn: "✅ Never" },
      { feature: "Free video length", competitor: "10 min per video", trndinn: "90 sec per video (free)" },
      { feature: "Login required", competitor: "❌ Yes", trndinn: "✅ No login for tool" },
      { feature: "Focus", competitor: "Full editor", trndinn: "Caption-first" },
      { feature: "Languages", competitor: "125+", trndinn: "99+" },
      { feature: "Animated caption presets", competitor: "10+", trndinn: "6 trending presets" },
      { feature: "Starting paid price", competitor: "$18/month", trndinn: "$0 for tool; $29/mo platform" },
      { feature: "Team plans", competitor: "$70/month", trndinn: "Caption tool is free — no plan needed" },
      { feature: "Export formats", competitor: "MP4, SRT, TXT", trndinn: "MP4 + SRT + VTT + ASS + JSON" },
    ],
    faqs: [
      {
        question: "Is Trndinn a free VEED alternative?",
        answer:
          "Yes. Trndinn's Auto Caption Generator is a free VEED alternative with no watermark, no signup, and no export cap on the free tier — for caption workflows specifically.",
      },
      {
        question: "Does Trndinn remove the VEED watermark issue?",
        answer:
          "Trndinn's free tier exports clean MP4s with no watermark. VEED requires the $18/month Basic plan to strip its watermark from exports.",
      },
      {
        question: "Is Trndinn a full video editor like VEED?",
        answer:
          "No. Trndinn is caption-first — upload, style, export. If you need trimming, effects, and stock assets in one tool, VEED is broader. If you only want captions, Trndinn is faster.",
      },
      {
        question: "How does Trndinn compare on languages to VEED?",
        answer:
          "Trndinn supports 99+ languages with word-level timestamps. VEED supports 125+ languages. Coverage is comparable for the top 40 most-requested languages.",
      },
      {
        question: "Is Trndinn faster than VEED for adding captions?",
        answer:
          "Yes. Trndinn processes captions in about 8.5 seconds for a 60-second clip. VEED users typically see 30-60 second render times on comparable footage due to editor overhead.",
      },
      {
        question: "How much does a VEED subscription cost versus Trndinn?",
        answer:
          "VEED starts at $18/month and rises to $70/month for teams. Trndinn's caption tool is free forever; paid plans for the wider platform start at $29/month.",
      },
      {
        question: "What is the best VEED alternative for captions in 2026?",
        answer:
          "Trndinn is the best VEED alternative for creators who only need captions. Free, no watermark, six animated presets, 99+ languages, and multi-format export.",
      },
    ],
    switchAngle:
      "Tried VEED, got hit by the watermark on every free export. Trndinn just works, no watermark, no card.",
  },
  // ─────────────────────────── CapCut ─────────────────────────────
  {
    slug: "capcut",
    name: "CapCut",
    url: "https://capcut.com",
    targetKeyword: "capcut alternative for pc",
    keywordDifficulty: 40,
    monthlyVolume: 8100,
    tagline: "Free social-first video editor from ByteDance with auto-captions built in.",
    positioning: [
      "CapCut is ByteDance's free, social-first editor. Distribution is massive — desktop, web, and mobile apps ship with auto-captions, effects, and templates tuned to TikTok trends. It's the default free editor for millions of creators.",
      "The concerns are ownership and jurisdiction. ByteDance is subject to ongoing US privacy and national-security reviews; several government agencies and enterprises have banned CapCut alongside TikTok. Business users, US public sector, and privacy-conscious creators actively search for alternatives.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "Full editor, limited AI generations" },
      { name: "Pro Monthly", price: "$7.99/mo", note: "AI features, 4K, cloud storage" },
      { name: "Pro Annual", price: "$74.99/yr", note: "~$6.25/mo equivalent" },
      { name: "Business", price: "Custom", note: "Team seats, brand kit" },
    ],
    pricingNotes: [
      "Owned by ByteDance — same parent as TikTok",
      "US privacy and national-security reviews are ongoing",
      "Free tier is genuinely generous but data handling is opaque",
    ],
    weaknesses: [
      "ByteDance ownership triggers US privacy and enterprise bans",
      "Data-handling terms are opaque compared to US-hosted competitors",
      "Limited business features — no true SaaS admin controls",
      "Some feature parity gaps between mobile and desktop apps",
    ],
    wedgeSummary:
      "US-hosted, privacy-safe, browser-based — no ByteDance in the loop.",
    wedgePoints: [
      {
        title: "US-hosted infrastructure, no ByteDance",
        description:
          "Trndinn runs on US-based infrastructure with transparent data-processing terms. CapCut is owned by ByteDance and subject to ongoing US privacy reviews and enterprise bans.",
      },
      {
        title: "Browser-based, no desktop install",
        description:
          "Trndinn works in any modern browser with no download required. CapCut's PC experience requires installing a desktop app that shares data with ByteDance.",
      },
      {
        title: "Enterprise-safe for regulated teams",
        description:
          "Trndinn is safe to deploy for US government contractors, financial firms, and healthcare teams where CapCut is either banned outright or requires legal review.",
      },
      {
        title: "Purpose-built for captions, not everything",
        description:
          "Trndinn is a focused caption tool. CapCut is a full editor with 500+ features, most of which caption-only users never touch. Simpler UI, faster path to done.",
      },
    ],
    comparisonRows: [
      { feature: "Corporate parent", competitor: "ByteDance (China-based)", trndinn: "US-based" },
      { feature: "US privacy concerns", competitor: "❌ Ongoing reviews", trndinn: "✅ US-hosted" },
      { feature: "Enterprise-safe", competitor: "Banned on many gov't devices", trndinn: "✅ Safe for regulated teams" },
      { feature: "Install required", competitor: "Desktop app for PC", trndinn: "✅ Browser-only" },
      { feature: "Free tier watermark", competitor: "Optional watermark", trndinn: "✅ Never watermarked" },
      { feature: "Auto captions", competitor: "✅ Included", trndinn: "✅ Included, word-level" },
      { feature: "Languages", competitor: "60+", trndinn: "99+" },
      { feature: "Full video editor", competitor: "✅ Yes", trndinn: "Caption-focused" },
      { feature: "Paid tier", competitor: "$7.99/mo Pro", trndinn: "$0 for tool" },
    ],
    faqs: [
      {
        question: "Is Trndinn a US-based CapCut alternative?",
        answer:
          "Yes. Trndinn is a US-hosted browser-based CapCut alternative with transparent data terms — safe for enterprises, government contractors, and privacy-conscious creators avoiding ByteDance.",
      },
      {
        question: "Why is Trndinn safer than CapCut for business use?",
        answer:
          "Trndinn runs on US-based infrastructure with clear data-processing terms. CapCut is owned by ByteDance, which faces ongoing US privacy reviews and is banned on many government devices.",
      },
      {
        question: "Do I need to install Trndinn on my PC like CapCut?",
        answer:
          "No. Trndinn works in any modern browser with no install. CapCut's PC workflow requires installing a desktop application that shares telemetry with ByteDance.",
      },
      {
        question: "Is Trndinn free like CapCut?",
        answer:
          "Yes. Trndinn's Auto Caption Generator is free forever with no watermark. CapCut's core editor is free too, but its data-handling terms are why users search for alternatives.",
      },
      {
        question: "Can Trndinn edit videos like CapCut?",
        answer:
          "Not fully. Trndinn is a focused caption tool, not a general editor. If you need trimming, effects, and transitions in one place, CapCut is broader. For captions alone, Trndinn is safer.",
      },
      {
        question: "What is the best CapCut alternative for PC in 2026?",
        answer:
          "Trndinn is the best CapCut alternative for PC users who want captions without installing a ByteDance app. Browser-based, US-hosted, no watermark, 99+ languages.",
      },
      {
        question: "Is CapCut banned for business use?",
        answer:
          "CapCut is banned on many US government devices and restricted by several Fortune 500 enterprises. Trndinn is a US-hosted alternative built for compliant workflows.",
      },
    ],
    switchAngle:
      "Company policy banned CapCut after the ByteDance review. Trndinn was the drop-in for our caption workflow.",
  },
];

export const CAPTION_COMPETITOR_SLUGS: readonly string[] = CAPTION_COMPETITORS.map(
  (c) => c.slug,
);

const COMPETITOR_MAP = new Map<string, CaptionCompetitor>(
  CAPTION_COMPETITORS.map((c) => [c.slug, c] as [string, CaptionCompetitor]),
);

/** Lookup a competitor by slug. Returns undefined for unknown slugs. */
export function getCaptionCompetitor(
  slug: string,
): CaptionCompetitor | undefined {
  return COMPETITOR_MAP.get(slug);
}

/** Return the sibling competitors for a "related comparisons" module. */
export function getRelatedCaptionCompetitors(
  currentSlug: string,
  limit = 4,
): CaptionCompetitor[] {
  return CAPTION_COMPETITORS.filter((c) => c.slug !== currentSlug).slice(0, limit);
}
