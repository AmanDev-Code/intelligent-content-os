/**
 * Bio Generator — Static catalogs shared by form + output components.
 */

import type { ComponentType, SVGProps } from "react";
import {
  Award,
  BarChart3,
  BookOpen,
  Camera,
  Flame,
  Github,
  Globe,
  Handshake,
  HelpCircle,
  Laugh,
  Leaf,
  Linkedin,
  PenLine,
  Rocket,
  Smile,
  Sparkles,
  Target,
  Trophy,
  Wand2,
  Youtube,
} from "lucide-react";
import type { BioPlatform, BioTone } from "./types";

export type IconType = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

/** X (Twitter) — Lucide doesn't ship this brand mark. */
export const XLogo: IconType = (props) => (
  <svg viewBox="0 0 1200 1227" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M714.163 519.284L1160.89 0h-105.86L667.137 450.887 357.328 0H0l468.492 681.821L0 1226.37h105.866l409.625-476.152 327.181 476.152H1200L714.137 519.284h.026zM569.165 687.828l-47.468-67.894L144.011 79.694h162.604l304.797 435.991 47.468 67.894 396.2 566.721H892.476L569.165 687.854v-.026z" />
  </svg>
);

/** TikTok — brand-accurate glyph. */
export const TikTokLogo: IconType = (props) => (
  <svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M224 72a48 48 0 0 1-48-48h-32v144a32 32 0 1 1-32-32 8 8 0 0 0 8-8V96a8 8 0 0 0-8-8 64 64 0 1 0 64 64V115.6a79.6 79.6 0 0 0 48 16.4 8 8 0 0 0 8-8V80a8 8 0 0 0-8-8Z" />
  </svg>
);

export const PLATFORMS: Array<{
  id: BioPlatform;
  label: string;
  Icon: IconType;
  maxChars: number;
  softFold: number;
  hint: string;
}> = [
  { id: "linkedin",  label: "LinkedIn",  Icon: Linkedin,    maxChars: 2600, softFold: 210, hint: "2,600 chars • first 210 visible" },
  { id: "instagram", label: "Instagram", Icon: Camera,      maxChars: 150,  softFold: 150, hint: "150 chars • line breaks work" },
  { id: "twitter",   label: "Twitter",   Icon: XLogo,       maxChars: 160,  softFold: 160, hint: "160 chars • every word counts" },
  { id: "tiktok",    label: "TikTok",    Icon: TikTokLogo,  maxChars: 80,   softFold: 80,  hint: "80 chars • one punchy line" },
  { id: "github",    label: "GitHub",    Icon: Github,      maxChars: 160,  softFold: 160, hint: "160 chars • developer-native" },
  { id: "youtube",   label: "YouTube",   Icon: Youtube,     maxChars: 1000, softFold: 100, hint: "1,000 chars • first 100 visible" },
  { id: "general",   label: "General",   Icon: Globe,       maxChars: 300,  softFold: 300, hint: "300 chars • speaker/author-ready" },
];

export const TONES: Array<{ id: BioTone; label: string; Icon: IconType }> = [
  { id: "professional",  label: "Professional",  Icon: Target      },
  { id: "casual",        label: "Casual",        Icon: Smile       },
  { id: "creative",      label: "Creative",      Icon: PenLine     },
  { id: "witty",         label: "Witty",         Icon: Sparkles    },
  { id: "authoritative", label: "Authoritative", Icon: BarChart3   },
  { id: "storytelling",  label: "Storytelling",  Icon: BookOpen    },
  { id: "inspirational", label: "Inspirational", Icon: Rocket      },
  { id: "friendly",      label: "Friendly",      Icon: Handshake   },
  { id: "sarcastic",     label: "Sarcastic",     Icon: HelpCircle  },
  { id: "confident",     label: "Confident",     Icon: Flame       },
  { id: "humble",        label: "Humble",        Icon: Leaf        },
  { id: "humorous",      label: "Humorous",      Icon: Laugh       },
];

export const FOCUS_AREAS: Array<{ id: string; label: string; Icon: IconType }> = [
  { id: "credibility",  label: "Credibility",  Icon: Award   },
  { id: "achievements", label: "Achievements", Icon: Trophy  },
  { id: "skills",       label: "Skills",       Icon: Wand2   },
  { id: "personality",  label: "Personality",  Icon: Smile   },
  { id: "mission",      label: "Mission",      Icon: Target  },
  { id: "creativity",   label: "Creativity",   Icon: PenLine },
  { id: "leadership",   label: "Leadership",   Icon: Rocket  },
  { id: "contrarian",   label: "Contrarian",   Icon: Flame   },
];

export const ROLE_TEMPLATES: Array<{ label: string; role: string; facts: string; goal: string; audience: string }> = [
  {
    label: "Senior engineer",
    role: "Senior software engineer at a Series B fintech",
    facts: "Python, TypeScript, distributed systems, 8 years, ex-Stripe",
    goal: "Get recruiter DMs from Series B+ startups",
    audience: "Recruiters",
  },
  {
    label: "Product designer",
    role: "Senior product designer at a healthcare SaaS",
    facts: "Design systems, Figma, 200+ shipped features, ex-Notion",
    goal: "Find inbound freelance clients",
    audience: "Potential clients",
  },
  {
    label: "Founder",
    role: "Co-founder of an AI content platform, ex-Airbnb PM",
    facts: "Raised $2M seed, 10K users, YC W25 batch",
    goal: "Meet other operators and prospective hires",
    audience: "Industry peers",
  },
  {
    label: "Marketer",
    role: "Head of growth at a B2B SaaS with $8M ARR",
    facts: "SEO, paid, product-led growth, 40+ playbooks published",
    goal: "Speaking gigs and consulting inbound",
    audience: "Industry peers",
  },
  {
    label: "Creator",
    role: "Newsletter writer covering AI tools for solopreneurs",
    facts: "12K subscribers, weekly Tuesday drop, ex-Substack",
    goal: "Grow inbound sponsor interest",
    audience: "Followers / fans",
  },
  {
    label: "Job seeker",
    role: "Product manager laid off from a Series C SaaS, 6 years total",
    facts: "Shipped B2B analytics, marketplace, and payments products",
    goal: "Land a senior PM role at a Series A-B startup",
    audience: "Recruiters",
  },
  {
    label: "Coach / consultant",
    role: "Executive coach for mid-career leaders in India and the Middle East",
    facts: "ICF PCC-certified, 500+ hours coached, published in HBR India",
    goal: "Attract inbound coaching clients from Series A-C startups",
    audience: "Potential clients",
  },
  {
    label: "Educator / academic",
    role: "PhD researcher in climate policy at the University of São Paulo",
    facts: "3 peer-reviewed papers, Fulbright alum, keynote at COP28",
    goal: "Speaker invitations and research collaborations",
    audience: "Industry peers",
  },
  {
    label: "Small business owner",
    role: "Owner of a Lagos-based fashion brand shipping across West Africa",
    facts: "50K Instagram followers, featured in Vogue Africa, 5 years in business",
    goal: "Grow wholesale partnerships and press coverage",
    audience: "Potential clients",
  },
];

export const AUDIENCE_OPTIONS = [
  "General audience",
  "Recruiters",
  "Potential clients",
  "Industry peers",
  "Followers / fans",
] as const;

export function platformById(id: BioPlatform) {
  return PLATFORMS.find((p) => p.id === id) ?? PLATFORMS[0]!;
}
