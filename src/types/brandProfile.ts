/**
 * Brand Kit (Sprint 1.5). Mirrors the backend `brand_profiles` row + the
 * write payload accepted by the brand-profiles API.
 */

export interface BrandAsset {
  url: string;
  label?: string;
  kind?: string;
}

export interface BrandProfile {
  id: string;
  user_id: string;
  name: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  tone: string | null;
  target_audience: string | null;
  voice_examples: string[];
  do_use: string[];
  do_not_use: string[];
  additional_information: string | null;
  assets: BrandAsset[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BrandProfileInput {
  name: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;
  tone?: string | null;
  targetAudience?: string | null;
  voiceExamples?: string[];
  doUse?: string[];
  doNotUse?: string[];
  additionalInformation?: string | null;
  assets?: BrandAsset[];
  metadata?: Record<string, unknown>;
}

/** Result of POST /brand-profiles/extract — a suggestion to review, not saved. */
export interface ExtractedBrandKit {
  name?: string;
  tone?: string;
  targetAudience?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  voiceExamples?: string[];
  doUse?: string[];
  doNotUse?: string[];
  additionalInformation?: string;
}
