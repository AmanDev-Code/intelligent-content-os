/**
 * Bio Generator competitor dataset — single source of truth for
 * /alternatives/{slug} and /compare/trndinn-vs-{slug} pages.
 *
 * Same shape as caption-competitors.ts + reel-downloader-competitors.ts.
 * Adding a competitor? Append below — dynamic routes pick it up via
 * generateStaticParams.
 *
 * 10 competitors sourced from SEO expert PDF analysis, sorted P1→P2→P3.
 */

export type BioPricingPlan = {
  name: string;
  price: string;
  note?: string;
};

export type BioComparisonRow = {
  feature: string;
  competitor: string;
  trndinn: string;
};

export type BioFaq = {
  question: string;
  answer: string;
};

export type BioWedgePoint = {
  title: string;
  description: string;
};

export type BioCompetitor = {
  slug: string;
  name: string;
  url: string;
  targetKeyword: string;
  keywordDifficulty: number;
  monthlyVolume: number;
  tagline: string;
  positioning: string[];
  pricingPlans: BioPricingPlan[];
  pricingNotes: string[];
  weaknesses: string[];
  wedgeSummary: string;
  wedgePoints: BioWedgePoint[];
  comparisonRows: BioComparisonRow[];
  faqs: BioFaq[];
  switchAngle: string;
};

export const BIO_COMPETITORS: readonly BioCompetitor[] = [
  // ═══════════════════════════ P1 — Build First ═══════════════════════════

  // ─────────────────────────── Ahrefs ───────────────────────────
  {
    slug: "ahrefs-bio-generator",
    name: "Ahrefs",
    url: "https://ahrefs.com/writing-tools",
    targetKeyword: "ahrefs bio generator alternative",
    keywordDifficulty: 15,
    monthlyVolume: 480,
    tagline: "SEO powerhouse with a free writing-tools suite — bio output is generic and English-only.",
    positioning: [
      "Ahrefs is the DR91 SEO authority that bolted on free writing tools (bio generator, paragraph rewriter, etc.) as top-of-funnel lead magnets. The bio tool produces grammatically correct output but lacks tone control, persona templates, and any platform-specific awareness.",
      "The gap: output is English-only, single-variation, and reads corporate. No character-limit intelligence, no saved variations, no emoji/CTA control — it is a keyword play, not a product.",
    ],
    pricingPlans: [
      { name: "Free writing tools", price: "$0", note: "Unlimited runs, English only" },
      { name: "Lite", price: "$129/mo", note: "SEO platform, not bio tool" },
      { name: "Standard", price: "$249/mo", note: "Full SEO suite" },
    ],
    pricingNotes: [
      "Bio tool is free but English-only with no tone control",
      "Paid plans are SEO tools, not bio/content generators",
      "No way to save, compare, or iterate on generated bios",
    ],
    weaknesses: [
      "Output is generic — no tone or persona control",
      "English-only, no multilingual support",
      "No character-limit awareness for any platform",
      "Single variation per run — no side-by-side comparison",
    ],
    wedgeSummary: "Platform-aware character limits + tone control + niche personas + multilingual + 5 saved variations.",
    wedgePoints: [
      {
        title: "Platform-aware character limits",
        description:
          "Trndinn encodes LinkedIn's 210-char desktop cut, Instagram's 150 chars, X's 160, TikTok's 80, and more. Ahrefs generates a generic paragraph with no platform intelligence.",
      },
      {
        title: "Tone and persona control",
        description:
          "Trndinn lets you pick from 12+ tones (witty, professional, Gen-Z, founder) and niche personas (SaaS founder, fitness coach, indie hacker). Ahrefs has zero tone settings.",
      },
      {
        title: "Multilingual output",
        description:
          "Trndinn generates bios in 20+ languages natively. Ahrefs is English-only — creators with non-English audiences are locked out.",
      },
      {
        title: "5 saved variations with scoring",
        description:
          "Trndinn saves up to 5 variations per platform, scores each 0-100, and lets you A/B test. Ahrefs shows one output with no save, no score, no history.",
      },
    ],
    comparisonRows: [
      { feature: "Free tier", competitor: "✅ Unlimited (English only)", trndinn: "✅ Unlimited, 20+ languages" },
      { feature: "Signup required", competitor: "❌ No signup", trndinn: "❌ No signup" },
      { feature: "Platforms supported", competitor: "❌ Generic (no platform awareness)", trndinn: "✅ LinkedIn, IG, X, TikTok, GitHub, YouTube" },
      { feature: "Character limit awareness", competitor: "❌ None", trndinn: "✅ Per-platform live counter" },
      { feature: "Tone/persona control", competitor: "❌ None", trndinn: "✅ 12+ tones, niche personas" },
      { feature: "Variations count", competitor: "1 per run", trndinn: "3-5 per platform" },
      { feature: "Bio scoring", competitor: "❌ None", trndinn: "✅ 0-100 with 5-dim breakdown" },
      { feature: "Emoji control", competitor: "❌ None", trndinn: "✅ Emoji density slider" },
      { feature: "Output quality", competitor: "Generic, corporate tone", trndinn: "Platform-native, creator-first" },
      { feature: "Multilingual", competitor: "❌ English only", trndinn: "✅ 20+ languages" },
    ],
    faqs: [
      {
        question: "Is Trndinn a free Ahrefs bio generator alternative?",
        answer:
          "Yes. Trndinn is a free bio generator alternative to Ahrefs with platform-specific character limits, tone control, multilingual output, and 5 saved variations — features Ahrefs' writing tool lacks entirely.",
      },
      {
        question: "Why is Trndinn better than Ahrefs for social media bios?",
        answer:
          "Ahrefs produces generic English-only paragraphs with no platform awareness. Trndinn encodes platform-specific character limits (LinkedIn 210, IG 150, X 160), offers 12+ tones, and generates in 20+ languages.",
      },
      {
        question: "Does Ahrefs bio generator support multiple platforms?",
        answer:
          "No. Ahrefs' bio tool generates a generic bio with no platform targeting. Trndinn generates optimized bios for LinkedIn, Instagram, X, TikTok, GitHub, and YouTube in one run.",
      },
      {
        question: "Can I save bio variations in Ahrefs vs Trndinn?",
        answer:
          "Ahrefs shows one output with no save or history. Trndinn saves up to 5 variations per platform, scores each 0-100, and lets you compare side-by-side.",
      },
      {
        question: "What is the best Ahrefs bio generator alternative in 2026?",
        answer:
          "Trndinn is the best Ahrefs bio generator alternative in 2026 — same free price, but with platform-aware limits, tone/persona control, multilingual output, 5 saved variations, and 0-100 scoring.",
      },
    ],
    switchAngle:
      "Ahrefs' bio tool gave me one generic paragraph. Trndinn gives me 5 platform-specific variations with tone control and scoring — still free.",
  },

  // ─────────────────────────── Pallyy ───────────────────────────
  {
    slug: "pallyy",
    name: "Pallyy",
    url: "https://pallyy.com/tools/bio-generator",
    targetKeyword: "pallyy alternative",
    keywordDifficulty: 18,
    monthlyVolume: 590,
    tagline: "Creator-native scheduler with a polished free bio generator — but limited to basics.",
    positioning: [
      "Pallyy is a visual-first social media scheduler popular with creators. Its free bio generator is a UX benchmark — clean interface, creator-native tone, and some platform awareness. It is the closest competitor in feel to Trndinn's bio tool.",
      "The gap: English-only, no multilingual support, limited tone options, and no deeper creator suite (no caption generator, no hashtag tools, no reel downloader) around the bio tool.",
    ],
    pricingPlans: [
      { name: "Free bio tool", price: "$0", note: "Unlimited, no login" },
      { name: "Premium", price: "$25/mo", note: "Scheduler, analytics, 1 social set" },
      { name: "Premium (extra sets)", price: "$25/mo + $25/set", note: "Additional social sets" },
    ],
    pricingNotes: [
      "Free bio tool is genuinely free with no gates",
      "$25/mo for the scheduler — reasonable but bio-only users don't need it",
      "No multilingual support on the free tool",
    ],
    weaknesses: [
      "English-only — no multilingual bio generation",
      "Limited tone options compared to Trndinn's 12+",
      "No surrounding creator suite (captions, hashtags, reel tools)",
      "No bio scoring or quality feedback",
    ],
    wedgeSummary: "Same creator delight + multilingual + deeper creator suite + scoring + saved variations.",
    wedgePoints: [
      {
        title: "Multilingual where Pallyy is English-only",
        description:
          "Trndinn generates bios in 20+ languages natively. Pallyy only outputs English — a dealbreaker for non-English creators and multilingual audiences.",
      },
      {
        title: "Full creator tool suite",
        description:
          "Trndinn wraps bio generation in a suite: caption generator, hashtag finder, reel downloader, post scheduler. Pallyy's free tools are isolated from each other.",
      },
      {
        title: "12+ tone presets vs limited options",
        description:
          "Trndinn offers witty, professional, Gen-Z, founder, coach, and more tones with fine-grained control. Pallyy has basic tone settings that limit creative range.",
      },
      {
        title: "0-100 scoring with actionable tips",
        description:
          "Trndinn scores every bio across hook, clarity, platform fit, impact, and originality with 3 specific fixes. Pallyy generates output with no quality feedback loop.",
      },
    ],
    comparisonRows: [
      { feature: "Free tier", competitor: "✅ Unlimited, no login", trndinn: "✅ Unlimited, no login" },
      { feature: "Signup required", competitor: "❌ No signup", trndinn: "❌ No signup" },
      { feature: "Platforms supported", competitor: "✅ Some platform awareness", trndinn: "✅ 6 platforms with char limits" },
      { feature: "Character limit awareness", competitor: "Partial", trndinn: "✅ Per-platform live counter" },
      { feature: "Tone/persona control", competitor: "Basic tones", trndinn: "✅ 12+ tones, niche personas" },
      { feature: "Variations count", competitor: "1-3 per run", trndinn: "3-5 per platform" },
      { feature: "Bio scoring", competitor: "❌ None", trndinn: "✅ 0-100 with 5-dim breakdown" },
      { feature: "Emoji control", competitor: "Limited", trndinn: "✅ Emoji density slider" },
      { feature: "Output quality", competitor: "Creator-native, clean", trndinn: "Creator-native + scored + multilingual" },
      { feature: "Multilingual", competitor: "❌ English only", trndinn: "✅ 20+ languages" },
    ],
    faqs: [
      {
        question: "Is Trndinn a good Pallyy alternative for bio generation?",
        answer:
          "Yes. Trndinn matches Pallyy's creator-native UX and adds multilingual output, 12+ tone presets, 0-100 bio scoring, and a surrounding creator suite (captions, hashtags, reels).",
      },
      {
        question: "How does Trndinn compare to Pallyy's bio generator?",
        answer:
          "Both are free with no signup. Trndinn adds multilingual support (20+ languages), deeper tone/persona control, per-bio scoring with tips, and integration with caption and hashtag tools.",
      },
      {
        question: "Does Pallyy support non-English bios?",
        answer:
          "No. Pallyy's bio generator is English-only. Trndinn generates natively in 20+ languages — ideal for creators with multilingual or international audiences.",
      },
      {
        question: "Which is better for creators: Pallyy or Trndinn?",
        answer:
          "Both are creator-native. Pallyy is a polished single tool. Trndinn is a deeper suite: bio + caption + hashtag + reel tools, all free, with scoring and multilingual support.",
      },
      {
        question: "What is the best Pallyy alternative in 2026?",
        answer:
          "Trndinn is the best Pallyy alternative in 2026 — same creator-first UX, plus multilingual output, 12+ tones, 0-100 scoring, and a full free creator tool suite.",
      },
    ],
    switchAngle:
      "Loved Pallyy's clean UX but needed multilingual bios and scoring. Trndinn delivers both with the same creator-first feel.",
  },

  // ─────────────────────────── Copy.ai ───────────────────────────
  {
    slug: "copy-ai",
    name: "Copy.ai",
    url: "https://copy.ai/tools/free-bio-generator",
    targetKeyword: "copy.ai alternative",
    keywordDifficulty: 30,
    monthlyVolume: 2900,
    tagline: "Horizontal AI copywriter that nudges signup and reads corporate — bios are an afterthought.",
    positioning: [
      "Copy.ai is a horizontal AI writing platform with 90+ templates including bio generators. It nudges signup before generating and the output skews corporate/marketing — not creator-native.",
      "The gap: requires signup to use, reads corporate rather than creator/Gen-Z, no platform-specific character limits built in, and free tier caps at 2,000 words/month across all templates.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "2,000 words/mo, signup required" },
      { name: "Pro", price: "$49/mo", note: "Unlimited words, 1 seat" },
      { name: "Team", price: "$249/mo", note: "5 seats, workflows, brand voice" },
    ],
    pricingNotes: [
      "Free tier's 2,000-word cap burns fast on multi-platform bios",
      "Signup required even for the free tier",
      "$49/mo Pro is expensive for creators who only need bios",
    ],
    weaknesses: [
      "Requires signup — friction before first output",
      "Output reads corporate, not creator/Gen-Z native",
      "No platform-specific character limits built in",
      "Free tier capped at 2,000 words/month total",
    ],
    wedgeSummary: "No signup, creator/Gen-Z tone, platform character limits built in, truly free.",
    wedgePoints: [
      {
        title: "No signup required",
        description:
          "Trndinn generates bios instantly with zero signup. Copy.ai requires an account before you see any output — friction that kills conversion for casual users.",
      },
      {
        title: "Creator/Gen-Z tone, not corporate",
        description:
          "Trndinn's tone presets include Gen-Z, witty, indie hacker, and fitness coach. Copy.ai defaults to corporate marketing speak that feels out of place on Instagram or TikTok.",
      },
      {
        title: "Platform character limits built in",
        description:
          "Trndinn respects LinkedIn's 210-char cut, IG's 150, X's 160, and TikTok's 80 natively with a live counter. Copy.ai generates without any character awareness.",
      },
      {
        title: "No word budget — truly free",
        description:
          "Trndinn has no monthly word cap. Copy.ai's free tier is 2,000 words/month total — a single 6-platform batch run can eat 25% of that budget.",
      },
    ],
    comparisonRows: [
      { feature: "Free tier", competitor: "2,000 words/mo cap", trndinn: "✅ Unlimited, no cap" },
      { feature: "Signup required", competitor: "✅ Yes, account needed", trndinn: "❌ No signup" },
      { feature: "Platforms supported", competitor: "❌ Generic templates", trndinn: "✅ 6 platforms with char limits" },
      { feature: "Character limit awareness", competitor: "❌ None", trndinn: "✅ Per-platform live counter" },
      { feature: "Tone/persona control", competitor: "Basic (corporate default)", trndinn: "✅ 12+ tones inc. Gen-Z, creator" },
      { feature: "Variations count", competitor: "1 per run", trndinn: "3-5 per platform" },
      { feature: "Bio scoring", competitor: "❌ None", trndinn: "✅ 0-100 with 5-dim breakdown" },
      { feature: "Emoji control", competitor: "❌ None", trndinn: "✅ Emoji density slider" },
      { feature: "Output quality", competitor: "Corporate, marketing tone", trndinn: "Creator-native, platform-tuned" },
      { feature: "Pricing", competitor: "Free (2k words) / $49/mo Pro", trndinn: "$0 forever, no word cap" },
    ],
    faqs: [
      {
        question: "Is Trndinn a free Copy.ai alternative?",
        answer:
          "Yes. Trndinn is a truly free Copy.ai alternative for bios — no signup, no 2,000-word monthly cap, and creator-native tone instead of corporate speak.",
      },
      {
        question: "Why choose Trndinn over Copy.ai for social bios?",
        answer:
          "Copy.ai requires signup, caps free usage at 2,000 words/month, and outputs corporate tone. Trndinn is instant, unlimited, and tuned for creators with platform-specific character limits.",
      },
      {
        question: "Does Copy.ai have platform character limits like Trndinn?",
        answer:
          "No. Copy.ai generates generic bios with no platform awareness. Trndinn encodes LinkedIn's 210-char cut, IG's 150, X's 160, and TikTok's 80 with a live counter.",
      },
      {
        question: "Do I need to create an account for Trndinn like Copy.ai?",
        answer:
          "No. Trndinn's bio generator works instantly with no account. Copy.ai requires signup before showing any output.",
      },
      {
        question: "What is the best Copy.ai alternative for bios in 2026?",
        answer:
          "Trndinn is the best Copy.ai alternative for bio generation in 2026 — no signup, no word cap, creator/Gen-Z tone, platform limits built in, and 0-100 scoring.",
      },
    ],
    switchAngle:
      "Tired of Copy.ai's signup wall and corporate tone. Trndinn gives creator-native bios instantly, no account needed.",
  },

  // ─────────────────────────── Hootsuite ───────────────────────────
  {
    slug: "hootsuite",
    name: "Hootsuite",
    url: "https://hootsuite.com/social-media-tools",
    targetKeyword: "hootsuite alternative",
    keywordDifficulty: 45,
    monthlyVolume: 8100,
    tagline: "Enterprise social suite — heavy, expensive, and generic for individual creators.",
    positioning: [
      "Hootsuite is the legacy enterprise social media management platform. Its AI-powered tools include a bio/caption generator, but they live inside a $99+/month product designed for teams and agencies, not individual creators.",
      "The gap: overkill for bio generation, enterprise pricing, generic output without creator-native tone or platform-specific mechanics. The free trial requires a credit card.",
    ],
    pricingPlans: [
      { name: "Professional", price: "$99/mo", note: "1 user, 10 social accounts" },
      { name: "Team", price: "$249/mo", note: "3 users, 20 social accounts" },
      { name: "Enterprise", price: "Custom", note: "5+ users, unlimited accounts" },
    ],
    pricingNotes: [
      "No free tier — 30-day trial requires credit card",
      "$99/mo entry is enterprise pricing for a bio generator",
      "AI tools are add-ons within the larger platform",
    ],
    weaknesses: [
      "Enterprise-heavy — $99/mo minimum, overkill for creators",
      "Generic AI output, not creator-native tone",
      "Credit card required for trial",
      "Bio generation is buried inside a massive platform",
    ],
    wedgeSummary: "Lightweight, creator-native, free tools + modern AI — no enterprise baggage.",
    wedgePoints: [
      {
        title: "Free forever vs $99/mo minimum",
        description:
          "Trndinn's bio generator is free with no signup. Hootsuite starts at $99/month with a credit card trial — enterprise pricing that punishes individual creators.",
      },
      {
        title: "Creator-native, not enterprise-generic",
        description:
          "Trndinn is built for creators with Gen-Z tones, niche personas, and platform-specific mechanics. Hootsuite's AI outputs read like they were written for a Fortune 500 social team.",
      },
      {
        title: "Instant access, zero onboarding",
        description:
          "Trndinn generates bios in seconds with no account. Hootsuite requires trial signup, credit card, onboarding flow, and navigation through a complex dashboard to find AI tools.",
      },
      {
        title: "Modern AI with scoring and variations",
        description:
          "Trndinn generates 3-5 scored variations per platform with actionable tips. Hootsuite's AI is a basic generator with no quality scoring or side-by-side comparison.",
      },
    ],
    comparisonRows: [
      { feature: "Free tier", competitor: "❌ 30-day trial, CC required", trndinn: "✅ Free forever, no signup" },
      { feature: "Signup required", competitor: "✅ Yes + credit card", trndinn: "❌ No signup" },
      { feature: "Platforms supported", competitor: "Generic across platforms", trndinn: "✅ 6 platforms with char limits" },
      { feature: "Character limit awareness", competitor: "❌ Generic output", trndinn: "✅ Per-platform live counter" },
      { feature: "Tone/persona control", competitor: "Basic brand voice", trndinn: "✅ 12+ tones, niche personas" },
      { feature: "Variations count", competitor: "1-2 per run", trndinn: "3-5 per platform" },
      { feature: "Bio scoring", competitor: "❌ None", trndinn: "✅ 0-100 with 5-dim breakdown" },
      { feature: "Emoji control", competitor: "❌ None", trndinn: "✅ Emoji density slider" },
      { feature: "Output quality", competitor: "Enterprise/corporate tone", trndinn: "Creator-native, platform-tuned" },
      { feature: "Pricing", competitor: "$99/mo minimum", trndinn: "$0 forever" },
    ],
    faqs: [
      {
        question: "Is Trndinn a free Hootsuite alternative for bios?",
        answer:
          "Yes. Trndinn is a free, lightweight alternative to Hootsuite for bio generation — no $99/month enterprise pricing, no credit card, no complex dashboard to navigate.",
      },
      {
        question: "Why choose Trndinn over Hootsuite for social bios?",
        answer:
          "Hootsuite is an enterprise platform starting at $99/mo with generic AI. Trndinn is a free, instant bio generator with creator-native tones, platform limits, and 0-100 scoring.",
      },
      {
        question: "Does Hootsuite have a free bio generator like Trndinn?",
        answer:
          "No. Hootsuite's AI tools require a paid subscription ($99/mo minimum) or a credit-card trial. Trndinn's bio generator is free forever with no account needed.",
      },
      {
        question: "Is Hootsuite overkill for just generating bios?",
        answer:
          "Yes. Hootsuite is a full enterprise social management suite. If you just need bios, Trndinn is purpose-built, free, and instant — no 30-minute onboarding required.",
      },
      {
        question: "What is the best Hootsuite alternative for creators in 2026?",
        answer:
          "Trndinn is the best Hootsuite alternative for individual creators in 2026 — free bio generation, creator-native tones, platform-specific limits, and no enterprise pricing or complexity.",
      },
    ],
    switchAngle:
      "Hootsuite was $99/mo overkill for bios. Trndinn does it better for free with creator-native tone and platform limits.",
  },

  // ═══════════════════════════ P2 ═══════════════════════════

  // ─────────────────────────── Writesonic ───────────────────────────
  {
    slug: "writesonic",
    name: "Writesonic",
    url: "https://writesonic.com",
    targetKeyword: "writesonic alternative",
    keywordDifficulty: 30,
    monthlyVolume: 1900,
    tagline: "AI writing platform that gates output behind credits — free tier runs dry fast.",
    positioning: [
      "Writesonic is a horizontal AI writing platform with bio templates among 100+ tools. It uses a credit system that gates output — the free tier gives limited credits that deplete quickly, pushing users toward $19-49/month paid plans.",
      "The gap: credit-gated free tier creates uncertainty about whether you can finish a task. No platform-specific bio mechanics, and the tone defaults to generic marketing.",
    ],
    pricingPlans: [
      { name: "Free trial", price: "$0", note: "Limited credits, signup required" },
      { name: "Pro", price: "$19/mo", note: "100 credits/month" },
      { name: "Enterprise", price: "$49/mo", note: "Unlimited credits, team features" },
    ],
    pricingNotes: [
      "Free tier burns through credits fast on multi-platform generation",
      "Credit system creates uncertainty — will you run out mid-task?",
      "Signup required before any generation",
    ],
    weaknesses: [
      "Credit-gated — free tier runs dry quickly",
      "Signup required before generating anything",
      "No platform-specific bio mechanics",
      "Generic marketing tone, not creator-native",
    ],
    wedgeSummary: "Truly free with no credit ceiling — generate unlimited bios without watching a meter.",
    wedgePoints: [
      {
        title: "No credit ceiling, truly free",
        description:
          "Trndinn has no credit system and no word budget. Writesonic gates output behind credits that deplete mid-session, forcing upgrades or waiting.",
      },
      {
        title: "No signup friction",
        description:
          "Trndinn generates instantly with no account. Writesonic requires signup and email verification before showing any output.",
      },
      {
        title: "Platform-specific mechanics",
        description:
          "Trndinn encodes character limits and platform conventions for LinkedIn, IG, X, TikTok, GitHub, and YouTube. Writesonic uses generic prompts regardless of destination.",
      },
      {
        title: "Creator tone, not marketing speak",
        description:
          "Trndinn offers 12+ creator-native tones. Writesonic defaults to generic marketing copy that sounds out of place on social profiles.",
      },
    ],
    comparisonRows: [
      { feature: "Free tier", competitor: "Limited credits, depletes fast", trndinn: "✅ Unlimited, no credits" },
      { feature: "Signup required", competitor: "✅ Yes, email verification", trndinn: "❌ No signup" },
      { feature: "Platforms supported", competitor: "❌ Generic templates", trndinn: "✅ 6 platforms with char limits" },
      { feature: "Character limit awareness", competitor: "❌ None", trndinn: "✅ Per-platform live counter" },
      { feature: "Tone/persona control", competitor: "Basic tone selector", trndinn: "✅ 12+ tones, niche personas" },
      { feature: "Variations count", competitor: "1-3 (costs credits)", trndinn: "3-5 per platform, free" },
      { feature: "Bio scoring", competitor: "❌ None", trndinn: "✅ 0-100 with 5-dim breakdown" },
      { feature: "Emoji control", competitor: "❌ None", trndinn: "✅ Emoji density slider" },
      { feature: "Output quality", competitor: "Generic marketing tone", trndinn: "Creator-native, platform-tuned" },
      { feature: "Pricing", competitor: "Free (limited) / $19-49/mo", trndinn: "$0 forever, no limits" },
    ],
    faqs: [
      {
        question: "Is Trndinn a free Writesonic alternative?",
        answer:
          "Yes. Trndinn is a truly free alternative to Writesonic for bios — no credit system, no word cap, no signup. Generate unlimited bios without watching a meter deplete.",
      },
      {
        question: "Why choose Trndinn over Writesonic for bios?",
        answer:
          "Writesonic gates output behind credits and requires signup. Trndinn is instant, unlimited, and free with platform-specific character limits and creator-native tones.",
      },
      {
        question: "Does Writesonic have platform character limits like Trndinn?",
        answer:
          "No. Writesonic generates generic bios with no platform awareness. Trndinn respects LinkedIn's 210 chars, IG's 150, X's 160, and TikTok's 80 natively.",
      },
      {
        question: "Will I run out of credits on Trndinn like Writesonic?",
        answer:
          "No. Trndinn has no credit system. Generate as many bios as you want without depleting a balance or being forced to upgrade.",
      },
      {
        question: "What is the best Writesonic alternative for bios in 2026?",
        answer:
          "Trndinn is the best Writesonic alternative for bio generation in 2026 — truly free with no credits, platform-specific limits, creator tones, and 0-100 scoring.",
      },
    ],
    switchAngle:
      "Writesonic's credit system ran dry mid-session. Trndinn is truly free — no meter, no ceiling, no surprise paywalls.",
  },

  // ─────────────────────────── QuillBot ───────────────────────────
  {
    slug: "quillbot",
    name: "QuillBot",
    url: "https://quillbot.com/ai-writing-tools/ai-bio-generator",
    targetKeyword: "quillbot alternative",
    keywordDifficulty: 42,
    monthlyVolume: 6600,
    tagline: "Academic paraphraser with a bio generator bolt-on — tone is scholarly, not social.",
    positioning: [
      "QuillBot is primarily a paraphrasing and grammar tool popular with students and academics. Its AI bio generator is a newer addition that applies QuillBot's core competency (rewriting) to bio creation — but the tone skews academic/formal, not social-media native.",
      "The gap: academic DNA means output reads like a resume summary, not an Instagram or TikTok bio. No emoji control, no CTA structures, no platform-specific character awareness.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "Basic features, 125-word paraphrase limit" },
      { name: "Premium", price: "$9.95/mo", note: "Unlimited paraphrasing, all modes" },
      { name: "Premium (annual)", price: "$4.17/mo", note: "Billed annually" },
    ],
    pricingNotes: [
      "Free tier has word limits that apply to bio generation",
      "Premium unlocks full features but tone stays academic",
      "Primary value prop is paraphrasing, not bio creation",
    ],
    weaknesses: [
      "Academic tone — not social-media native",
      "No platform-specific character awareness",
      "No emoji or CTA control",
      "Bio generation is a bolt-on, not a core feature",
    ],
    wedgeSummary: "Social-native tone, platform limits, emoji/CTA control — built for social, not academia.",
    wedgePoints: [
      {
        title: "Social-native tone, not academic",
        description:
          "Trndinn generates bios that sound native to each social platform — Gen-Z for TikTok, professional for LinkedIn. QuillBot's academic DNA produces resume-style output unsuitable for social profiles.",
      },
      {
        title: "Platform character limits built in",
        description:
          "Trndinn encodes LinkedIn's 210, IG's 150, X's 160, and TikTok's 80 char limits with a live counter. QuillBot generates without any character awareness.",
      },
      {
        title: "Emoji and CTA control",
        description:
          "Trndinn has an emoji density slider and CTA suggestions per platform. QuillBot has zero emoji/CTA awareness — academic tools don't think in emojis.",
      },
      {
        title: "Multiple social-tuned variations",
        description:
          "Trndinn generates 3-5 variations per platform in creator tones. QuillBot paraphrases one output in different 'modes' (formal, simple, creative) that all read academic.",
      },
    ],
    comparisonRows: [
      { feature: "Free tier", competitor: "✅ With word limits", trndinn: "✅ Unlimited, no cap" },
      { feature: "Signup required", competitor: "✅ Yes", trndinn: "❌ No signup" },
      { feature: "Platforms supported", competitor: "❌ Generic (no platform awareness)", trndinn: "✅ 6 platforms with char limits" },
      { feature: "Character limit awareness", competitor: "❌ None", trndinn: "✅ Per-platform live counter" },
      { feature: "Tone/persona control", competitor: "Modes (formal/simple/creative)", trndinn: "✅ 12+ social-native tones" },
      { feature: "Variations count", competitor: "1 + paraphrase modes", trndinn: "3-5 per platform" },
      { feature: "Bio scoring", competitor: "❌ None", trndinn: "✅ 0-100 with 5-dim breakdown" },
      { feature: "Emoji control", competitor: "❌ None", trndinn: "✅ Emoji density slider" },
      { feature: "Output quality", competitor: "Academic/formal tone", trndinn: "Social-native, platform-tuned" },
      { feature: "Pricing", competitor: "Free (limited) / $9.95/mo", trndinn: "$0 forever, unlimited" },
    ],
    faqs: [
      {
        question: "Is Trndinn a better QuillBot alternative for social bios?",
        answer:
          "Yes. Trndinn is purpose-built for social media bios with platform-native tones, character limits, and emoji control. QuillBot's academic DNA produces resume-style output that sounds out of place on Instagram or TikTok.",
      },
      {
        question: "Why does QuillBot's bio generator sound academic?",
        answer:
          "QuillBot was built as a paraphrasing tool for students and academics. Its bio generator inherits that formal tone. Trndinn is social-first with Gen-Z, witty, founder, and creator tone presets.",
      },
      {
        question: "Does QuillBot support platform character limits?",
        answer:
          "No. QuillBot generates without character awareness. Trndinn enforces LinkedIn's 210, IG's 150, X's 160, and TikTok's 80 char limits with a live counter.",
      },
      {
        question: "Can I control emojis in QuillBot vs Trndinn?",
        answer:
          "QuillBot has no emoji control — academic tools don't think in emojis. Trndinn has an emoji density slider and platform-appropriate CTA suggestions.",
      },
      {
        question: "What is the best QuillBot alternative for social bios in 2026?",
        answer:
          "Trndinn is the best QuillBot alternative for social media bios in 2026 — social-native tone, platform limits, emoji/CTA control, and 0-100 scoring that QuillBot lacks.",
      },
    ],
    switchAngle:
      "QuillBot made my TikTok bio sound like a PhD thesis. Trndinn writes social-native bios with emoji control and platform limits.",
  },

  // ─────────────────────────── Predis.ai ───────────────────────────
  {
    slug: "predis",
    name: "Predis.ai",
    url: "https://predis.ai",
    targetKeyword: "predis ai alternative",
    keywordDifficulty: 28,
    monthlyVolume: 1000,
    tagline: "AI social content platform that's heavier than needed and paywalled for serious use.",
    positioning: [
      "Predis.ai is an AI-powered social media content creation platform that generates posts, carousels, videos, and captions. Bio generation is part of the broader tool suite but not a standalone offering.",
      "The gap: the product is heavier than needed for bio generation — you navigate a full content creation platform to get a simple bio. Meaningful use is paywalled at $29/month.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "15 posts/month, watermarked" },
      { name: "Solo", price: "$29/mo", note: "60 posts/month, 1 brand" },
      { name: "Starter", price: "$59/mo", note: "150 posts/month, 3 brands" },
    ],
    pricingNotes: [
      "Free tier is heavily limited (15 posts/month total)",
      "Bio generation competes with post creation for monthly quota",
      "Full platform is overkill for anyone who just needs bios",
    ],
    weaknesses: [
      "Heavier product than needed for bio generation",
      "Paywalled at $29/mo for meaningful use",
      "Free tier's 15 posts/month limits bio experiments",
      "Bio is not a standalone tool — buried in platform",
    ],
    wedgeSummary: "Instant, lightweight, free — get a bio in seconds without navigating a content platform.",
    wedgePoints: [
      {
        title: "Instant and lightweight",
        description:
          "Trndinn generates a bio in seconds with a single form. Predis.ai requires navigating a full content creation platform, selecting a project, and finding the right tool.",
      },
      {
        title: "Truly free, no post quota",
        description:
          "Trndinn's bio generator has no monthly limits. Predis.ai's free tier gives 15 posts/month total — bio experiments compete with actual content creation.",
      },
      {
        title: "No signup, no onboarding",
        description:
          "Trndinn works instantly with no account. Predis.ai requires signup, workspace setup, and brand configuration before generating anything.",
      },
      {
        title: "Bio-specialist scoring and variations",
        description:
          "Trndinn scores each bio 0-100 with 3-5 variations per platform. Predis.ai's AI generates content broadly without bio-specific quality feedback.",
      },
    ],
    comparisonRows: [
      { feature: "Free tier", competitor: "15 posts/month (shared quota)", trndinn: "✅ Unlimited, no quota" },
      { feature: "Signup required", competitor: "✅ Yes + workspace setup", trndinn: "❌ No signup" },
      { feature: "Platforms supported", competitor: "Multiple (post-focused)", trndinn: "✅ 6 platforms, bio-specific" },
      { feature: "Character limit awareness", competitor: "Post-level, not bio-specific", trndinn: "✅ Per-platform bio limits" },
      { feature: "Tone/persona control", competitor: "Brand voice settings", trndinn: "✅ 12+ tones, niche personas" },
      { feature: "Variations count", competitor: "Limited by quota", trndinn: "3-5 per platform, unlimited" },
      { feature: "Bio scoring", competitor: "❌ None for bios", trndinn: "✅ 0-100 with 5-dim breakdown" },
      { feature: "Emoji control", competitor: "Basic", trndinn: "✅ Emoji density slider" },
      { feature: "Output quality", competitor: "Good for posts, generic for bios", trndinn: "Bio-specialist, platform-tuned" },
      { feature: "Pricing", competitor: "Free (15/mo) / $29-59/mo", trndinn: "$0 forever, unlimited" },
    ],
    faqs: [
      {
        question: "Is Trndinn a free Predis.ai alternative for bios?",
        answer:
          "Yes. Trndinn is an instant, free bio generator with no monthly quota. Predis.ai's free tier limits you to 15 posts/month total and requires workspace setup.",
      },
      {
        question: "Why choose Trndinn over Predis.ai for bio generation?",
        answer:
          "Predis.ai is a full content platform where bios are buried. Trndinn is purpose-built for bios — instant, free, no signup, with platform-specific limits and 0-100 scoring.",
      },
      {
        question: "Is Predis.ai overkill for just generating bios?",
        answer:
          "Yes. Predis.ai is designed for full social content creation (posts, videos, carousels). If you just need bios, Trndinn is focused, instant, and free.",
      },
      {
        question: "Does Predis.ai have bio-specific scoring?",
        answer:
          "No. Predis.ai provides general content analytics but no bio-specific 0-100 scoring with dimensional breakdown and tips like Trndinn offers.",
      },
      {
        question: "What is the best Predis.ai alternative for bios in 2026?",
        answer:
          "Trndinn is the best Predis.ai alternative for bio generation in 2026 — lightweight, instant, free, with platform character limits and bio-specific scoring.",
      },
    ],
    switchAngle:
      "Predis.ai was overkill — I just needed a bio, not a content studio. Trndinn is instant and free.",
  },

  // ═══════════════════════════ P3 ═══════════════════════════

  // ─────────────────────────── Simplified ───────────────────────────
  {
    slug: "simplified",
    name: "Simplified",
    url: "https://simplified.com",
    targetKeyword: "simplified alternative",
    keywordDifficulty: 32,
    monthlyVolume: 1300,
    tagline: "All-in-one design + writing platform with feature sprawl and inconsistent AI quality.",
    positioning: [
      "Simplified is an all-in-one platform combining graphic design, video editing, social scheduling, and AI writing. Its bio generator is one of 50+ AI writing templates in a tool that tries to do everything.",
      "The gap: feature sprawl means no single tool gets deep attention. Bio output quality is inconsistent — sometimes great, sometimes generic. The interface is cluttered with features you don't need for a bio.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "Limited AI words, basic features" },
      { name: "Pro", price: "$12/mo", note: "More AI words, premium templates" },
      { name: "Business", price: "$24/mo", note: "Team features, unlimited AI" },
    ],
    pricingNotes: [
      "Free tier has strict AI word limits",
      "Platform tries to do design + video + writing + scheduling",
      "Bio quality inconsistent due to generic templates",
    ],
    weaknesses: [
      "Feature sprawl — platform tries to do everything",
      "Inconsistent AI output quality for bios",
      "Cluttered interface for a simple bio task",
      "No bio-specific scoring or platform mechanics",
    ],
    wedgeSummary: "Focused, high-quality output without the bloat — purpose-built for one job done well.",
    wedgePoints: [
      {
        title: "Focused tool, not a feature factory",
        description:
          "Trndinn's bio generator does one thing excellently. Simplified spreads itself across design, video, writing, and scheduling — bio quality suffers from lack of focus.",
      },
      {
        title: "Consistent, high-quality output",
        description:
          "Trndinn uses bio-specific prompts with platform mechanics for consistent quality. Simplified's generic templates produce unpredictable results — sometimes good, sometimes generic.",
      },
      {
        title: "Clean interface, zero clutter",
        description:
          "Trndinn presents a single-purpose form with immediate results. Simplified buries bio generation in a cluttered dashboard competing with design tools, video editors, and schedulers.",
      },
      {
        title: "Bio-specific scoring and feedback",
        description:
          "Trndinn scores each bio 0-100 across 5 dimensions with actionable tips. Simplified has no quality feedback mechanism for its AI writing output.",
      },
    ],
    comparisonRows: [
      { feature: "Free tier", competitor: "Limited AI words", trndinn: "✅ Unlimited, no cap" },
      { feature: "Signup required", competitor: "✅ Yes", trndinn: "❌ No signup" },
      { feature: "Platforms supported", competitor: "❌ Generic templates", trndinn: "✅ 6 platforms with char limits" },
      { feature: "Character limit awareness", competitor: "❌ None", trndinn: "✅ Per-platform live counter" },
      { feature: "Tone/persona control", competitor: "Basic tone selector", trndinn: "✅ 12+ tones, niche personas" },
      { feature: "Variations count", competitor: "1-2 per run", trndinn: "3-5 per platform" },
      { feature: "Bio scoring", competitor: "❌ None", trndinn: "✅ 0-100 with 5-dim breakdown" },
      { feature: "Emoji control", competitor: "❌ None", trndinn: "✅ Emoji density slider" },
      { feature: "Output quality", competitor: "Inconsistent", trndinn: "Consistent, platform-tuned" },
      { feature: "Interface", competitor: "Cluttered (design+video+writing)", trndinn: "Clean, single-purpose" },
    ],
    faqs: [
      {
        question: "Is Trndinn a better Simplified alternative for bios?",
        answer:
          "Yes. Trndinn is focused exclusively on bio generation with consistent quality, platform limits, and scoring. Simplified spreads across design, video, and writing with inconsistent bio output.",
      },
      {
        question: "Why is Simplified's bio quality inconsistent?",
        answer:
          "Simplified tries to be an all-in-one platform (design + video + writing + scheduling). No single tool gets deep attention, so bio templates use generic prompts that produce variable quality.",
      },
      {
        question: "Is Simplified overkill for bio generation?",
        answer:
          "Yes. Simplified's interface is cluttered with design tools, video editors, and schedulers. Trndinn is a clean, single-purpose bio generator that gets you output in seconds.",
      },
      {
        question: "Does Simplified score bios like Trndinn?",
        answer:
          "No. Simplified has no bio-specific scoring. Trndinn scores each bio 0-100 across hook, clarity, platform fit, impact, and originality with 3 actionable tips.",
      },
      {
        question: "What is the best Simplified alternative for bios in 2026?",
        answer:
          "Trndinn is the best Simplified alternative for bio generation in 2026 — focused tool, consistent quality, platform limits, 0-100 scoring, no feature bloat.",
      },
    ],
    switchAngle:
      "Simplified tried to do everything and did bios inconsistently. Trndinn does one thing — bios — and does it consistently well.",
  },

  // ─────────────────────────── Canva (Magic Write) ───────────────────────────
  {
    slug: "canva-magic-write",
    name: "Canva (Magic Write)",
    url: "https://canva.com",
    targetKeyword: "canva magic write alternative",
    keywordDifficulty: 30,
    monthlyVolume: 720,
    tagline: "Design giant where AI writing is buried and generic — bios are an afterthought.",
    positioning: [
      "Canva is the world's largest design platform. Magic Write is its AI text generation feature, buried inside the document/presentation editor. It can write bios, but it is not surfaced as a standalone tool and has no social-media-specific mechanics.",
      "The gap: Magic Write requires navigating Canva's design interface, has generic tone with no platform awareness, and is limited to 250 uses/month on the free tier. Bio generation is not a first-class citizen.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "250 Magic Write uses/month" },
      { name: "Pro", price: "$15/mo", note: "500 Magic Write uses/month" },
      { name: "Teams", price: "$10/mo/person", note: "1000 Magic Write uses/month" },
    ],
    pricingNotes: [
      "Magic Write is buried in the document editor, not a standalone tool",
      "250 uses/month on free tier shared across all writing tasks",
      "No bio-specific features — generic text generation",
    ],
    weaknesses: [
      "Bio writing buried inside design platform — not standalone",
      "Generic tone with no social platform awareness",
      "250 uses/month cap shared with all writing tasks",
      "Requires navigating Canva's full interface for a simple bio",
    ],
    wedgeSummary: "Purpose-built bio/caption tool with platform limits and personas — not buried in a design editor.",
    wedgePoints: [
      {
        title: "Purpose-built, not buried",
        description:
          "Trndinn is a standalone bio generator accessible in one click. Canva's Magic Write requires opening a document, finding the AI feature, and crafting the right prompt — friction for a simple bio.",
      },
      {
        title: "Platform-specific character limits",
        description:
          "Trndinn encodes LinkedIn's 210, IG's 150, X's 160, and TikTok's 80 chars natively. Magic Write generates generic text with no platform awareness.",
      },
      {
        title: "Creator personas and tone presets",
        description:
          "Trndinn offers 12+ tones (Gen-Z, founder, coach) with niche personas. Magic Write has a generic 'tone' concept but no social-media-specific presets.",
      },
      {
        title: "No prompt crafting needed",
        description:
          "Trndinn's form handles the prompting — just fill in your role, niche, and goals. Magic Write requires users to craft their own prompt for good bio output.",
      },
    ],
    comparisonRows: [
      { feature: "Free tier", competitor: "250 uses/month (shared)", trndinn: "✅ Unlimited, bio-specific" },
      { feature: "Signup required", competitor: "✅ Yes (Canva account)", trndinn: "❌ No signup" },
      { feature: "Platforms supported", competitor: "❌ Generic text generation", trndinn: "✅ 6 platforms with char limits" },
      { feature: "Character limit awareness", competitor: "❌ None", trndinn: "✅ Per-platform live counter" },
      { feature: "Tone/persona control", competitor: "Generic tone concept", trndinn: "✅ 12+ social-native tones" },
      { feature: "Variations count", competitor: "1 per prompt", trndinn: "3-5 per platform" },
      { feature: "Bio scoring", competitor: "❌ None", trndinn: "✅ 0-100 with 5-dim breakdown" },
      { feature: "Emoji control", competitor: "❌ None", trndinn: "✅ Emoji density slider" },
      { feature: "Output quality", competitor: "Generic, requires good prompt", trndinn: "Platform-native, zero-prompt" },
      { feature: "Accessibility", competitor: "Buried in design editor", trndinn: "Standalone, one-click access" },
    ],
    faqs: [
      {
        question: "Is Trndinn a better alternative to Canva Magic Write for bios?",
        answer:
          "Yes. Trndinn is a purpose-built bio generator with platform limits, tone presets, and scoring. Magic Write is generic text generation buried inside Canva's design editor.",
      },
      {
        question: "Can Canva Magic Write generate social media bios?",
        answer:
          "Technically yes, but it requires prompt crafting and has no platform-specific mechanics. Trndinn generates platform-optimized bios with character limits and tone control without any prompt crafting.",
      },
      {
        question: "Does Magic Write know platform character limits?",
        answer:
          "No. Magic Write generates generic text regardless of destination. Trndinn enforces LinkedIn's 210, IG's 150, X's 160, and TikTok's 80 char limits automatically.",
      },
      {
        question: "Is Magic Write free for bio generation?",
        answer:
          "Magic Write gives 250 uses/month on Canva's free tier, shared across all writing tasks. Trndinn's bio generator is unlimited and purpose-built.",
      },
      {
        question: "What is the best Canva Magic Write alternative for bios in 2026?",
        answer:
          "Trndinn is the best Canva Magic Write alternative for bio generation in 2026 — standalone tool, no prompt crafting, platform limits, 12+ tones, and 0-100 scoring.",
      },
    ],
    switchAngle:
      "Magic Write needed me to craft prompts and navigate Canva's editor. Trndinn gives me platform-perfect bios in one click.",
  },

  // ─────────────────────────── ChatGPT ───────────────────────────
  {
    slug: "chatgpt-bio",
    name: "ChatGPT",
    url: "https://chat.openai.com",
    targetKeyword: "chatgpt vs bio generator",
    keywordDifficulty: 25,
    monthlyVolume: 590,
    tagline: "General AI chatbot that needs prompting and has no bio UI, limits, or scoring.",
    positioning: [
      "ChatGPT is the world's most popular general AI assistant. It can write bios when prompted correctly, but requires users to know what to ask, specify platform limits manually, and iterate through conversation turns to refine output.",
      "The gap: no dedicated UI, no character-limit awareness, no tone presets, no platform selection, no scoring — users must do the prompt engineering themselves and manually check output length.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "GPT-4o-mini, rate limited" },
      { name: "Plus", price: "$20/mo", note: "GPT-4o, more capacity" },
      { name: "Pro", price: "$200/mo", note: "Unlimited GPT-4o, o1" },
    ],
    pricingNotes: [
      "Free tier is rate-limited and uses smaller model",
      "No bio-specific UI — general chat interface",
      "Quality depends entirely on user's prompt engineering skill",
    ],
    weaknesses: [
      "Requires prompt engineering — no guided bio UI",
      "No character-limit awareness or platform detection",
      "No scoring, variations comparison, or saved outputs",
      "Quality varies wildly based on how you ask",
    ],
    wedgeSummary: "Zero-prompt, character-limit-aware, 5 instant variations with scoring — no prompt engineering needed.",
    wedgePoints: [
      {
        title: "Zero-prompt generation",
        description:
          "Trndinn's form handles the prompting — fill in your role, niche, and goals and get instant results. ChatGPT requires users to craft the right prompt, specify platform limits, and iterate through conversation turns.",
      },
      {
        title: "Character-limit-aware by default",
        description:
          "Trndinn enforces per-platform character limits automatically with a live counter. ChatGPT has no awareness of LinkedIn's 210, IG's 150, or TikTok's 80 — users must specify and verify manually.",
      },
      {
        title: "5 instant variations with scoring",
        description:
          "Trndinn generates 3-5 scored variations per platform in one click. With ChatGPT, you ask for variations, then ask to evaluate them, then ask to refine — multiple turns for what Trndinn does instantly.",
      },
      {
        title: "Dedicated bio UI with save and compare",
        description:
          "Trndinn presents bios in a visual card interface with copy buttons, scoring, and history. ChatGPT gives you plain text in a chat thread that scrolls away.",
      },
    ],
    comparisonRows: [
      { feature: "Free tier", competitor: "✅ Rate-limited, general AI", trndinn: "✅ Unlimited, bio-specific" },
      { feature: "Signup required", competitor: "✅ Yes (OpenAI account)", trndinn: "❌ No signup" },
      { feature: "Platforms supported", competitor: "Only if prompted manually", trndinn: "✅ 6 platforms, auto-selected" },
      { feature: "Character limit awareness", competitor: "❌ Manual specification only", trndinn: "✅ Per-platform live counter" },
      { feature: "Tone/persona control", competitor: "If prompted correctly", trndinn: "✅ 12+ presets, one-click" },
      { feature: "Variations count", competitor: "Must request explicitly", trndinn: "3-5 per platform, automatic" },
      { feature: "Bio scoring", competitor: "If you ask for it", trndinn: "✅ 0-100 automatic, 5 dimensions" },
      { feature: "Emoji control", competitor: "Manual prompt specification", trndinn: "✅ Emoji density slider" },
      { feature: "Output quality", competitor: "Depends on prompt skill", trndinn: "Consistent, platform-tuned" },
      { feature: "Dedicated UI", competitor: "❌ Chat interface", trndinn: "✅ Visual cards + copy + history" },
    ],
    faqs: [
      {
        question: "Is Trndinn better than ChatGPT for writing bios?",
        answer:
          "For bios specifically, yes. Trndinn is a purpose-built bio generator with platform limits, tone presets, scoring, and instant variations. ChatGPT requires prompt engineering and manual iteration for the same result.",
      },
      {
        question: "Why use a bio generator instead of ChatGPT?",
        answer:
          "ChatGPT requires you to know what to ask, specify character limits, request variations, and verify output length. Trndinn handles all of this automatically — zero prompt engineering, instant scored results.",
      },
      {
        question: "Does ChatGPT know Instagram's character limit for bios?",
        answer:
          "ChatGPT has the knowledge but won't enforce it unless you explicitly ask. Trndinn enforces IG's 150, LinkedIn's 210, X's 160, and TikTok's 80 automatically with a live counter.",
      },
      {
        question: "Can ChatGPT score my bio quality?",
        answer:
          "Only if you ask it to and provide scoring criteria. Trndinn scores every bio automatically on a 0-100 scale across hook, clarity, platform fit, impact, and originality with 3 specific tips.",
      },
      {
        question: "What is better: ChatGPT or a dedicated bio generator in 2026?",
        answer:
          "For bio creation, a dedicated tool like Trndinn beats ChatGPT — zero-prompt, character-limit-aware, 5 instant variations with scoring, dedicated UI, no prompt engineering required.",
      },
    ],
    switchAngle:
      "ChatGPT needed 5 prompts to get one decent bio. Trndinn gives me 5 scored variations instantly — zero prompt engineering.",
  },
];

export const BIO_COMPETITOR_SLUGS: readonly string[] = BIO_COMPETITORS.map((c) => c.slug);

const COMPETITOR_MAP = new Map<string, BioCompetitor>(
  BIO_COMPETITORS.map((c) => [c.slug, c] as [string, BioCompetitor]),
);

export function getBioCompetitor(slug: string): BioCompetitor | undefined {
  return COMPETITOR_MAP.get(slug);
}

export function getRelatedBioCompetitors(currentSlug: string, limit = 4): BioCompetitor[] {
  return BIO_COMPETITORS.filter((c) => c.slug !== currentSlug).slice(0, limit);
}
