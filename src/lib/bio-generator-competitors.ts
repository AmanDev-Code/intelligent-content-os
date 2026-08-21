/**
 * Bio Generator competitor dataset — single source of truth for
 * /alternatives/{slug} and /compare/trndinn-vs-{slug} pages.
 *
 * Same shape as caption-competitors.ts + reel-downloader-competitors.ts.
 * Adding a competitor? Append below — dynamic routes pick it up via
 * generateStaticParams.
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
  // ─────────────────────────── Taplio ───────────────────────────
  {
    slug: "taplio-bio-generator",
    name: "Taplio",
    url: "https://taplio.com",
    targetKeyword: "taplio alternative",
    keywordDifficulty: 22,
    monthlyVolume: 1600,
    tagline: "LinkedIn-only content platform with a headline + summary generator bolted on.",
    positioning: [
      "Taplio is a LinkedIn-first content tool priced at $49/month. Its Headline Generator and Summary Generator are free lead magnets designed to funnel visitors into the paid product, and they're squarely LinkedIn-only — no Instagram, X, TikTok, or GitHub.",
      "The gap: the free tier caps at 3 headlines and gates deeper generation behind an email form or paid upgrade. Creators who want multi-platform bios or unlimited runs bounce hard.",
    ],
    pricingPlans: [
      { name: "Free headline tool", price: "$0", note: "3 headlines, email gate for more" },
      { name: "Standard", price: "$49/mo", note: "Full LinkedIn content platform" },
      { name: "Pro", price: "$149/mo", note: "Team seats, analytics, ghostwriter" },
    ],
    pricingNotes: [
      "Free tier caps at 3 headlines with an email gate for more",
      "$49/mo entry is expensive for anyone who just wants bios",
      "LinkedIn-only — no Instagram, X, TikTok, or GitHub coverage",
    ],
    weaknesses: [
      "LinkedIn-only — no multi-platform batch mode",
      "Free tier gates at 3 headlines; deeper use needs email or upgrade",
      "No dedicated Instagram / X / TikTok bio generators",
      "$49/mo entry point punishes bio-only users",
    ],
    wedgeSummary: "Free forever, 6 platforms in one run, unlimited generations, no email gate.",
    wedgePoints: [
      {
        title: "6 platforms, not just LinkedIn",
        description:
          "Trndinn generates bios for LinkedIn, Instagram, X, TikTok, GitHub, and YouTube in a single run. Taplio only writes for LinkedIn — you'd need 5 other tools to match it.",
      },
      {
        title: "No email gate, no 3-headline cap",
        description:
          "Trndinn is unlimited and login-free for the bio tool. Taplio caps free at 3 headlines and requires an email to unlock more of what should be free.",
      },
      {
        title: "3 angles per platform, side-by-side",
        description:
          "Trndinn ships credibility, outcome, and story-angle variations for every platform. Taplio delivers 3 total and doesn't split them by angle.",
      },
      {
        title: "Score every draft 0-100",
        description:
          "Trndinn scores every bio on hook, clarity, platform fit, impact, and originality with 3 specific fixes. Taplio has no built-in quality scoring.",
      },
    ],
    comparisonRows: [
      { feature: "Free forever tier", competitor: "3 headlines cap, email gate", trndinn: "✅ Unlimited, no gate" },
      { feature: "Multi-platform", competitor: "❌ LinkedIn only", trndinn: "✅ LinkedIn + IG + X + TikTok + GitHub + YouTube" },
      { feature: "Variations per platform", competitor: "3 (single angle)", trndinn: "3 (credibility / outcome / story)" },
      { feature: "Bio scoring", competitor: "❌ None", trndinn: "✅ 0-100 with 5-dim breakdown + tips" },
      { feature: "Recruiter keyword highlights", competitor: "❌ Generic advice only", trndinn: "✅ Flagged in-output" },
      { feature: "Anti-buzzword linter", competitor: "❌ Manual list", trndinn: "✅ Automatic flagging" },
      { feature: "Regenerate one card", competitor: "❌ Full re-run", trndinn: "✅ Per-card regen" },
      { feature: "Live char counter", competitor: "❌ No live counter", trndinn: "✅ Live counter tied to platform limit" },
      { feature: "Login required", competitor: "❌ Email for deeper use", trndinn: "✅ No login for bio tool" },
      { feature: "Starting paid price", competitor: "$49/month", trndinn: "$0 forever; $29/mo full platform" },
    ],
    faqs: [
      {
        question: "Is Trndinn a free Taplio alternative?",
        answer:
          "Yes. Trndinn's Bio Generator is a free Taplio alternative — no 3-headline cap, no email gate, and it covers 6 platforms instead of LinkedIn only.",
      },
      {
        question: "Does Trndinn work for LinkedIn like Taplio?",
        answer:
          "Yes, and it goes deeper. Trndinn writes LinkedIn About sections front-loaded for the 210-char desktop cut with recruiter keywords woven in — the mechanics Taplio teaches but doesn't automate.",
      },
      {
        question: "Can Trndinn write Instagram or X bios like Taplio?",
        answer:
          "Yes — Taplio can't. Trndinn writes Instagram (150 chars), X (160 chars), TikTok (80 chars), GitHub (160 chars), and YouTube (1,000 chars) bios in one run. Taplio is LinkedIn-only.",
      },
      {
        question: "How does Trndinn's bio scoring compare to Taplio?",
        answer:
          "Trndinn scores each bio 0-100 across hook, clarity, platform fit, impact, and originality with 3 specific fixes. Taplio provides generic writing tips but no per-bio quality score.",
      },
      {
        question: "Do I need to sign up like Taplio?",
        answer:
          "No. Trndinn's Bio Generator works without an account. Taplio requires an email for anything beyond the first 3 headlines and $49/mo for the full product.",
      },
      {
        question: "How much does Taplio cost versus Trndinn?",
        answer:
          "Taplio starts at $49/mo for LinkedIn tools; Trndinn's Bio Generator is free forever. Trndinn's full platform starts at $29/mo when you want scheduling + analytics.",
      },
      {
        question: "What is the best Taplio alternative in 2026?",
        answer:
          "Trndinn is the best Taplio alternative in 2026 for bio generation — free forever, 6 platforms in one run, 3 angles per platform, 0-100 scoring, no email gate.",
      },
    ],
    switchAngle:
      "Left Taplio because I needed Instagram and X bios too. Trndinn does all six in one run for $0.",
  },
  // ─────────────────────────── Postiz ───────────────────────────
  {
    slug: "postiz-bio-generator",
    name: "Postiz",
    url: "https://postiz.com",
    targetKeyword: "postiz alternative",
    keywordDifficulty: 20,
    monthlyVolume: 800,
    tagline: "Open-source scheduler with per-platform bio and headline generator tools.",
    positioning: [
      "Postiz is an open-source social scheduler with a growing library of free tools including bio generators. Its LinkedIn Bio Generator surfaces LinkedIn-specific mechanics (About cap, recruiter search, story-arc structure) — best-in-class prompt engineering for that one platform.",
      "The gap: each tool is a separate URL, one-platform-at-a-time. Users who want LinkedIn + Instagram + X bios must run three tools. No side-by-side variations, no scoring, no regenerate-one-card.",
    ],
    pricingPlans: [
      { name: "Free bio tools", price: "$0", note: "Public tools, no login required" },
      { name: "Postiz Standard", price: "$29/mo", note: "Scheduler, 5 channels, 400 posts/mo" },
      { name: "Postiz Team", price: "$49/mo", note: "10 channels, unlimited posts, team seats" },
    ],
    pricingNotes: [
      "Free bio tools split across separate URLs by platform",
      "No side-by-side multi-platform mode",
      "$29/mo for scheduler when captions/bios need a platform",
    ],
    weaknesses: [
      "One tool per platform — no batch mode",
      "No 3-variation side-by-side comparison",
      "No per-card scoring or regenerate",
      "No anti-buzzword linter",
    ],
    wedgeSummary: "One input, 6 platforms, 3 angles side-by-side. Scoring and regenerate on every card.",
    wedgePoints: [
      {
        title: "Batch mode across 6 platforms",
        description:
          "Trndinn writes for LinkedIn, Instagram, X, TikTok, GitHub, and YouTube in one run. Postiz makes you visit one URL per platform and rerun the input every time.",
      },
      {
        title: "3 variations per platform, three angles",
        description:
          "Trndinn's variations are labeled credibility, outcome, and story — deliberate diversity, not three near-duplicates. Postiz gives one output per run.",
      },
      {
        title: "Score + regenerate + edit per card",
        description:
          "Trndinn ships per-card copy, regenerate, and 0-100 scoring with 3 specific fixes. Postiz has no in-tool scoring or per-card refresh.",
      },
      {
        title: "Anti-buzzword linter built in",
        description:
          "Trndinn flags 'passionate about', 'ninja', 'guru' and 15 other filler phrases automatically. Postiz relies on prompt engineering alone.",
      },
    ],
    comparisonRows: [
      { feature: "Batch mode", competitor: "❌ One platform per URL", trndinn: "✅ All 6 in one run" },
      { feature: "Variations per platform", competitor: "1 output per run", trndinn: "3 (credibility / outcome / story)" },
      { feature: "Bio scoring", competitor: "❌ None", trndinn: "✅ 0-100 + 5-dim + tips" },
      { feature: "Regenerate one card", competitor: "❌ Full rerun", trndinn: "✅ Per-card regen" },
      { feature: "Anti-buzzword linter", competitor: "❌ Prompt-only", trndinn: "✅ Automatic flagging" },
      { feature: "LinkedIn desktop-cut awareness", competitor: "✅ In prompt", trndinn: "✅ In prompt + UI marker" },
      { feature: "Login required", competitor: "✅ None", trndinn: "✅ None" },
      { feature: "Open source", competitor: "✅ AGPL", trndinn: "❌ Proprietary" },
      { feature: "Starting paid price", competitor: "$29/month scheduler", trndinn: "$0 for tool; $29/mo full platform" },
    ],
    faqs: [
      {
        question: "Is Trndinn a Postiz alternative for bio generation?",
        answer:
          "Yes. Trndinn writes bios for LinkedIn, Instagram, X, TikTok, GitHub, and YouTube in one run. Postiz splits each platform into a separate URL — you'd run six tools to match one Trndinn generation.",
      },
      {
        question: "Does Trndinn have LinkedIn prompt expertise like Postiz?",
        answer:
          "Yes. Trndinn's LinkedIn output front-loads the 210-char desktop cut, weaves in recruiter keywords, and structures the About section as hook → context → proof → CTA — the same mechanics Postiz encodes, applied in batch.",
      },
      {
        question: "Can Trndinn score my bio like Postiz?",
        answer:
          "Trndinn scores every bio 0-100 across hook, clarity, platform fit, impact, and originality with 3 specific fixes. Postiz has no built-in quality score for bios.",
      },
      {
        question: "Is Postiz open source and Trndinn is not?",
        answer:
          "Postiz is open source (AGPL). Trndinn is proprietary. If self-hosting is a hard requirement, Postiz is your answer. If you want unified multi-platform batch generation with scoring, Trndinn wins.",
      },
      {
        question: "How does Trndinn's pricing compare with Postiz?",
        answer:
          "Both offer free bio tools with no login required. For the full platform (scheduling + analytics), both start at $29/month.",
      },
      {
        question: "What is the best Postiz alternative for bios in 2026?",
        answer:
          "Trndinn is the best Postiz alternative for bio generation in 2026 — batch mode across 6 platforms, 3 angles per bio, 0-100 scoring, and an anti-buzzword linter that Postiz lacks.",
      },
    ],
    switchAngle:
      "Kept Postiz's scheduler mindset but switched bios to Trndinn because I got all 6 platforms in one shot.",
  },
  // ─────────────────────────── Copy.ai ───────────────────────────
  {
    slug: "copy-ai-bio-generator",
    name: "Copy.ai",
    url: "https://copy.ai",
    targetKeyword: "copy ai alternative for bios",
    keywordDifficulty: 34,
    monthlyVolume: 2400,
    tagline: "General-purpose AI copywriter with a bio template among 90+ others.",
    positioning: [
      "Copy.ai is a horizontal AI writing platform — email, landing pages, product descriptions, and bios are all templates in the same $49/month product. Its LinkedIn Bio and Instagram Bio templates are competent but generic; there's no platform-specific mechanics (LinkedIn desktop-cut, recruiter Boolean, etc.).",
      "The gap: the free plan caps at 2,000 words/month and single-workspace, and every output is one variation. To match Trndinn's 6 platforms × 3 angles, you'd burn most of a month's free credits.",
    ],
    pricingPlans: [
      { name: "Free", price: "$0", note: "2,000 words/mo total across all templates" },
      { name: "Pro", price: "$49/mo", note: "Unlimited words, 1 seat" },
      { name: "Team", price: "$249/mo", note: "5 seats, team workflows" },
    ],
    pricingNotes: [
      "Free tier's 2,000 word cap burns fast on multi-platform bio generation",
      "$49/mo Pro is expensive for creators who only need bios",
      "No platform-specific mechanics baked in — generic prompts",
    ],
    weaknesses: [
      "Generic bio templates — no LinkedIn/IG/X-specific mechanics",
      "Free tier's 2,000-word monthly cap",
      "One variation per generation",
      "No per-bio quality scoring",
    ],
    wedgeSummary: "Bio-specialist tool with encoded platform mechanics — not another generic template.",
    wedgePoints: [
      {
        title: "Bio-specialist, not a template library",
        description:
          "Trndinn is purpose-built for bios with LinkedIn desktop-cut awareness, Instagram emoji layouts, and TikTok tagline mechanics. Copy.ai bundles bios as one of 90+ templates with generic prompts.",
      },
      {
        title: "No word budget",
        description:
          "Trndinn is free with a 15/hr rate limit. Copy.ai's free tier caps at 2,000 words/month total — a single 6-platform run can eat 25% of that.",
      },
      {
        title: "3 angles side-by-side per platform",
        description:
          "Trndinn generates credibility / outcome / story variations in parallel. Copy.ai runs the template once and gives you one output — you'd rerun three times to match.",
      },
      {
        title: "Score every draft with tips",
        description:
          "Trndinn scores each bio 0-100 across 5 dimensions with 3 specific fixes. Copy.ai has no per-output quality scoring.",
      },
    ],
    comparisonRows: [
      { feature: "Bio specialist", competitor: "Bio is one of 90+ templates", trndinn: "✅ Purpose-built" },
      { feature: "LinkedIn desktop-cut aware", competitor: "❌ Generic prompt", trndinn: "✅ Front-loads 210 chars" },
      { feature: "Variations per run", competitor: "1", trndinn: "3 angles" },
      { feature: "Batch multi-platform", competitor: "❌ One template per run", trndinn: "✅ 6 platforms in one run" },
      { feature: "Bio scoring", competitor: "❌ None", trndinn: "✅ 0-100 + tips" },
      { feature: "Free tier cap", competitor: "2,000 words/month total", trndinn: "15 generations/hr" },
      { feature: "Login required", competitor: "❌ Yes", trndinn: "✅ No login" },
      { feature: "Starting paid price", competitor: "$49/month", trndinn: "$0 forever" },
    ],
    faqs: [
      {
        question: "Is Trndinn a free Copy.ai alternative for bios?",
        answer:
          "Yes. Trndinn is a bio-specialist tool that's free with no monthly word cap. Copy.ai's free tier limits you to 2,000 words per month across all its templates.",
      },
      {
        question: "Why is Trndinn better than Copy.ai for LinkedIn bios?",
        answer:
          "Trndinn front-loads the LinkedIn 210-char desktop cut, weaves in recruiter Boolean keywords, and structures the About section as hook → context → proof → CTA. Copy.ai's LinkedIn template uses a generic bio prompt.",
      },
      {
        question: "Can Trndinn write general marketing copy like Copy.ai?",
        answer:
          "No — Trndinn is a bio specialist, not a horizontal copywriter. If you need email sequences, landing page copy, or ad variants, Copy.ai is broader. For bios, Trndinn is deeper.",
      },
      {
        question: "Do I need to sign up for Trndinn like Copy.ai?",
        answer:
          "No. Trndinn's Bio Generator works without an account. Copy.ai requires signup to use any template, even on the free tier.",
      },
      {
        question: "How does Trndinn's pricing compare with Copy.ai?",
        answer:
          "Trndinn's Bio Generator is free with a 15/hr rate limit. Copy.ai is free up to 2,000 words/month, then $49/month for unlimited.",
      },
      {
        question: "What is the best Copy.ai alternative for bio generation?",
        answer:
          "Trndinn is the best Copy.ai alternative for bio generation in 2026 — bio specialist, 6-platform batch, 3-angle variations, 0-100 scoring, no word cap, no login.",
      },
    ],
    switchAngle:
      "Used Copy.ai for a year, burned through the free tier on bios alone. Trndinn does 6 platforms in one shot for free.",
  },
  // ─────────────────────────── Jasper ───────────────────────────
  {
    slug: "jasper-bio-generator",
    name: "Jasper",
    url: "https://jasper.ai",
    targetKeyword: "jasper alternative for bios",
    keywordDifficulty: 40,
    monthlyVolume: 1900,
    tagline: "Enterprise AI writing platform with a LinkedIn bio template.",
    positioning: [
      "Jasper is the enterprise end of AI copywriting — $49-125/month, workspaces, brand voice training, and integrations. Its LinkedIn Bio Generator template lives in the same product as blog posts, ad copy, and email sequences.",
      "The gap: no free tier for the bio tool (7-day trial only), and the platform's power (brand voice training, workspaces) is overkill for anyone who just wants a bio. Cost per bio is high.",
    ],
    pricingPlans: [
      { name: "7-day trial", price: "$0", note: "Trial only, credit card required" },
      { name: "Creator", price: "$49/mo", note: "1 seat, 1 brand voice" },
      { name: "Pro", price: "$69/mo", note: "3 seats, 3 brand voices" },
      { name: "Business", price: "Custom", note: "Enterprise workspaces + SSO" },
    ],
    pricingNotes: [
      "No free tier — 7-day trial with credit card only",
      "$49/mo entry point is enterprise-priced",
      "Brand voice training is overkill for bio-only users",
    ],
    weaknesses: [
      "No free tier — trial only, credit card required",
      "$49/mo entry point punishes bio-only users",
      "Bio is one template in a horizontal enterprise product",
      "Brand voice training and workspaces are overkill for individuals",
    ],
    wedgeSummary: "Free forever bio specialist — no credit card, no enterprise pricing.",
    wedgePoints: [
      {
        title: "Free forever, no credit card",
        description:
          "Trndinn's Bio Generator is free with a 15/hr rate limit and no signup. Jasper requires a credit card even for the 7-day trial and charges $49/month after.",
      },
      {
        title: "Bio specialist, not enterprise horizontal",
        description:
          "Trndinn is purpose-built for bios with platform-specific mechanics. Jasper is a horizontal enterprise tool where bios are one of 50+ templates competing for prompt polish.",
      },
      {
        title: "3 angles per platform side-by-side",
        description:
          "Trndinn generates credibility / outcome / story variations in parallel. Jasper's template ships one output per run.",
      },
      {
        title: "Score + regenerate every draft",
        description:
          "Trndinn scores each bio 0-100 with 3 fixes and regenerates individual cards. Jasper has no per-bio scoring built in.",
      },
    ],
    comparisonRows: [
      { feature: "Free tier", competitor: "❌ 7-day trial, CC required", trndinn: "✅ Free forever, no login" },
      { feature: "Bio specialist", competitor: "One of 50+ templates", trndinn: "✅ Purpose-built" },
      { feature: "Variations per run", competitor: "1", trndinn: "3 angles" },
      { feature: "Batch multi-platform", competitor: "❌ One template at a time", trndinn: "✅ 6 platforms in one run" },
      { feature: "Bio scoring", competitor: "❌ None", trndinn: "✅ 0-100 + tips" },
      { feature: "Regenerate one card", competitor: "❌ Full rerun", trndinn: "✅ Per-card regen" },
      { feature: "Anti-buzzword linter", competitor: "❌ None", trndinn: "✅ Automatic flagging" },
      { feature: "Starting paid price", competitor: "$49/month", trndinn: "$0 forever" },
    ],
    faqs: [
      {
        question: "Is Trndinn a free Jasper alternative?",
        answer:
          "Yes. Trndinn's Bio Generator is free forever with no signup. Jasper offers a 7-day trial requiring a credit card, then $49-125/month.",
      },
      {
        question: "Why choose Trndinn over Jasper for bios?",
        answer:
          "Trndinn is a bio specialist with platform-specific mechanics (LinkedIn desktop-cut, recruiter keywords, IG emoji layouts). Jasper is a horizontal enterprise copywriter where bios are one of 50+ templates.",
      },
      {
        question: "Can Trndinn train on my brand voice like Jasper?",
        answer:
          "Not yet on the free tier — brand voice training is a Trndinn platform feature. Jasper's brand voice is powerful but priced for teams ($49-125/month).",
      },
      {
        question: "Do I need a credit card for Trndinn like Jasper?",
        answer:
          "No. Trndinn's Bio Generator works with no signup and no credit card. Jasper requires a credit card even for the trial.",
      },
      {
        question: "How does Trndinn's price compare with Jasper?",
        answer:
          "Trndinn's Bio Generator is free with a 15/hr rate limit. Jasper starts at $49/month and rises to $125+ for Pro tiers.",
      },
      {
        question: "What is the best Jasper alternative for bios in 2026?",
        answer:
          "Trndinn is the best Jasper alternative for bio generation in 2026 — free forever, bio-specialist, 6-platform batch, 3-angle variations, 0-100 scoring.",
      },
    ],
    switchAngle:
      "Cancelled Jasper after realizing I only used it for bios. Trndinn does the same job for free.",
  },
  // ─────────────────────────── HyperWrite ───────────────────────────
  {
    slug: "hyperwrite-bio-generator",
    name: "HyperWrite",
    url: "https://hyperwriteai.com",
    targetKeyword: "hyperwrite alternative for bios",
    keywordDifficulty: 24,
    monthlyVolume: 700,
    tagline: "General AI writing assistant with Chrome extension and bio template.",
    positioning: [
      "HyperWrite is a Chrome-extension-first AI writing assistant. Its bio generator template is one of dozens; the free tier limits generations per day and paid plans start at $19.99/month.",
      "The gap: no platform-specific bio mechanics, no multi-platform batch, no scoring. The Chrome extension is powerful for inline rewriting but adds friction when you just want a bio.",
    ],
    pricingPlans: [
      { name: "Starter", price: "$0", note: "15 generations/day, limited templates" },
      { name: "Premium", price: "$19.99/mo", note: "Unlimited generations, all templates" },
      { name: "Ultra", price: "$44.99/mo", note: "Priority access, personalized AI" },
    ],
    pricingNotes: [
      "Free tier limited to 15 generations/day across all templates",
      "Chrome extension required for the best experience",
      "$19.99/mo unlocks unlimited, still no bio-specific mechanics",
    ],
    weaknesses: [
      "Chrome extension required for the best UX",
      "No platform-specific bio mechanics",
      "No multi-platform batch mode",
      "Free tier's 15/day cap applies across all templates",
    ],
    wedgeSummary: "Browser-native bio specialist — no extension, no daily cap on the bio flow.",
    wedgePoints: [
      {
        title: "No Chrome extension needed",
        description:
          "Trndinn runs in any browser with no install. HyperWrite's inline rewriting requires their Chrome extension for the best experience.",
      },
      {
        title: "Platform-specific bio mechanics",
        description:
          "Trndinn encodes LinkedIn desktop-cut, IG emoji layouts, and TikTok tagline mechanics. HyperWrite uses a generic bio template regardless of target platform.",
      },
      {
        title: "6 platforms per run",
        description:
          "Trndinn generates for LinkedIn, Instagram, X, TikTok, GitHub, and YouTube in one submission. HyperWrite runs one template at a time.",
      },
      {
        title: "Score + regenerate every draft",
        description:
          "Trndinn scores each bio 0-100 and lets you regenerate individual cards. HyperWrite has no per-bio quality scoring.",
      },
    ],
    comparisonRows: [
      { feature: "Chrome extension required", competitor: "For best UX", trndinn: "✅ Browser-native, no install" },
      { feature: "Free tier cap", competitor: "15 generations/day (all templates)", trndinn: "15/hr for bio tool" },
      { feature: "Bio specialist", competitor: "One of many templates", trndinn: "✅ Purpose-built" },
      { feature: "Platform-specific mechanics", competitor: "❌ Generic template", trndinn: "✅ LinkedIn/IG/X/TikTok tuned" },
      { feature: "Batch multi-platform", competitor: "❌ One at a time", trndinn: "✅ 6 in one run" },
      { feature: "Variations per run", competitor: "1", trndinn: "3 angles" },
      { feature: "Bio scoring", competitor: "❌ None", trndinn: "✅ 0-100 + tips" },
      { feature: "Starting paid price", competitor: "$19.99/month", trndinn: "$0 forever" },
    ],
    faqs: [
      {
        question: "Is Trndinn a free HyperWrite alternative for bios?",
        answer:
          "Yes. Trndinn is a browser-native bio specialist — no Chrome extension needed, no daily cap on the bio flow, and platform-specific mechanics for LinkedIn / IG / X / TikTok.",
      },
      {
        question: "Why choose Trndinn over HyperWrite for bios?",
        answer:
          "Trndinn is bio-specialist with encoded platform mechanics. HyperWrite is a horizontal writing assistant where bios are one of many templates with a generic prompt.",
      },
      {
        question: "Does Trndinn need a Chrome extension like HyperWrite?",
        answer:
          "No. Trndinn works entirely in the browser with no install. HyperWrite requires a Chrome extension for its inline rewriting features.",
      },
      {
        question: "How does the free tier compare?",
        answer:
          "Trndinn gives 15 generations/hour on the bio tool. HyperWrite gives 15 generations/day total across all its templates on the free plan.",
      },
      {
        question: "Can Trndinn write general content like HyperWrite?",
        answer:
          "Not yet on the free tools — HyperWrite is a broader writing assistant. Trndinn's platform (paid) handles LinkedIn posts, carousels, and hooks separately.",
      },
      {
        question: "What is the best HyperWrite alternative for bios?",
        answer:
          "Trndinn is the best HyperWrite alternative for bio generation in 2026 — no extension, no daily cap on the bio flow, and 6-platform batch mode with scoring.",
      },
    ],
    switchAngle:
      "Uninstalled HyperWrite's extension after finding Trndinn — same job, no browser install.",
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
