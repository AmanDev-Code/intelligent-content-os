/**
 * Bio Generator — Frontend type definitions.
 * Mirrors backend types.ts for SSE payloads and API responses.
 */

export type BioPlatform =
  | "linkedin"
  | "instagram"
  | "twitter"
  | "tiktok"
  | "github"
  | "youtube"
  | "general";

export type BioTone =
  | "professional"
  | "casual"
  | "creative"
  | "witty"
  | "authoritative"
  | "storytelling"
  | "inspirational"
  | "friendly"
  | "sarcastic"
  | "confident"
  | "humble"
  | "humorous";

export type BioLength = "short" | "medium" | "long";

export type BioType = "personal" | "brand";

export interface BioVariation {
  text: string;
  charCount: number;
  keywordsFound?: string[];
  buzzwordsFound?: string[];
  withinLimit: boolean;
}

export interface BioPlatformResult {
  platform: BioPlatform;
  variations: BioVariation[];
  limit: number;
  softFold: number;
}

export interface BioScoreResult {
  overall: number;
  dimensions: {
    hook: number;
    clarity: number;
    platformFit: number;
    impact: number;
    originality: number;
  };
  tips: string[];
}

export interface BioGeneratorViewHeroVariant {
  h1Prefix: string;
  h1Highlight: string;
  h1Suffix: string;
  eyebrow: string;
  subline: string;
}

export interface BioGeneratorViewProps {
  /** Alias-driven H1/hero copy. When absent, the primary hero copy renders. */
  heroVariant?: BioGeneratorViewHeroVariant;
  /** Which platform to preselect when the page loads (alias hint). */
  defaultPlatform?: BioPlatform;
  /** FAQ list rendered in the FAQ section. */
  faqs: Array<{ question: string; answer: string }>;
}

export interface BioFormState {
  role: string;
  facts: string;
  goal: string;
  audience: string;
  length: BioLength;
  emojis: boolean;
  tone: BioTone;
  bioType: BioType;
  focusAreas: string[];
  platforms: BioPlatform[];
}
