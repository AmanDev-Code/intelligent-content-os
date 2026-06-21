import type { User } from "@supabase/supabase-js";
import {
  BLOG_CATEGORY_SELECT_NONE,
  presetSelectValueFromStored,
} from "@/lib/blogContentCategory";

export type BlogPostFormState = {
  title: string;
  slug: string;
  parent_id: string;
  post_kind: string;
  category_preset: string;
  category_custom: string;
  status: string;
  excerpt: string;
  body: string;
  tags: string;
  subtitle: string;
  featured_image_url: string;
  featured_image_object_position: string;
  reading_minutes: string;
  author_display_name: string;
  author_bio: string;
  author_avatar_url: string;
  author_role: string;
  author_linkedin_url: string;
  scheduled_publish_at: string;
  published_at: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  canonical_url: string;
  og_image_url: string;
  twitter_card: string;
  robots: string;
  hero_style: string;
  locale: string;
  custom_css: string;
  faq_json: string;
};

export const emptyBlogPostForm = (): BlogPostFormState => ({
  title: "",
  slug: "",
  parent_id: "",
  post_kind: "article",
  category_preset: BLOG_CATEGORY_SELECT_NONE,
  category_custom: "",
  status: "draft",
  excerpt: "",
  body: "",
  tags: "",
  subtitle: "",
  featured_image_url: "",
  featured_image_object_position: "",
  reading_minutes: "",
  author_display_name: "",
  author_bio: "",
  author_avatar_url: "",
  author_role: "",
  author_linkedin_url: "",
  scheduled_publish_at: "",
  published_at: "",
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  canonical_url: "",
  og_image_url: "",
  twitter_card: "summary_large_image",
  robots: "index,follow",
  hero_style: "default",
  locale: "en",
  custom_css: "",
  faq_json: "",
});

function trimAuth(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function displayNameFromAuthUser(user: User | null): string {
  if (!user) return "";
  const m = user.user_metadata || {};
  return (
    trimAuth(m.full_name) ||
    trimAuth(m.name) ||
    [trimAuth(m.given_name), trimAuth(m.family_name)].filter(Boolean).join(" ").trim() ||
    trimAuth(m.preferred_username) ||
    trimAuth((m as { user_name?: string }).user_name) ||
    trimAuth(user.email?.split("@")[0])
  );
}

function avatarUrlFromAuthUser(user: User | null): string {
  if (!user) return "";
  const m = user.user_metadata || {};
  return trimAuth(m.avatar_url) || trimAuth(m.picture) || trimAuth((m as { image?: string }).image);
}

function linkedInUrlFromAuthIdentities(user: User | null): string {
  const id = user?.identities?.find((i) => /linkedin/i.test(String(i.provider)));
  if (!id?.identity_data || typeof id.identity_data !== "object") return "";
  const d = id.identity_data as Record<string, unknown>;
  const vn =
    trimAuth(d.vanity_name) ||
    trimAuth(d.vanityName) ||
    trimAuth(d.public_identifier) ||
    trimAuth(d.profile);
  if (!vn) return "";
  if (/^https?:\/\//i.test(vn)) return vn;
  const clean = vn.replace(/^\/+|\/+$/g, "");
  return clean ? `https://www.linkedin.com/in/${clean}` : "";
}

export function authorDefaultsFromProfile(
  profile: {
    full_name?: string | null;
    avatar_url?: string | null;
    author_bio?: string | null;
    author_role?: string | null;
    author_avatar_url?: string | null;
    author_linkedin_url?: string | null;
  } | null,
  user: User | null,
): Pick<
  BlogPostFormState,
  "author_display_name" | "author_bio" | "author_avatar_url" | "author_role" | "author_linkedin_url"
> {
  const avatar =
    profile?.author_avatar_url?.trim() ||
    profile?.avatar_url?.trim() ||
    avatarUrlFromAuthUser(user) ||
    "";
  const linkedin =
    profile?.author_linkedin_url?.trim() || linkedInUrlFromAuthIdentities(user) || "";

  return {
    author_display_name: profile?.full_name?.trim() || displayNameFromAuthUser(user) || "",
    author_bio: profile?.author_bio?.trim() || "",
    author_role: profile?.author_role?.trim() || "",
    author_avatar_url: avatar,
    author_linkedin_url: linkedin,
  };
}

export function blogPostFormFromRecord(p: Record<string, unknown>): BlogPostFormState {
  const tags = Array.isArray(p.tags) ? (p.tags as string[]).join(", ") : "";
  const storedCat = typeof p.content_category === "string" ? p.content_category : null;
  const { preset, custom } = presetSelectValueFromStored(storedCat);
  return {
    title: String(p.title || ""),
    slug: String(p.slug || ""),
    parent_id: p.parent_id ? String(p.parent_id) : "",
    post_kind: String(p.post_kind || "article"),
    category_preset: preset,
    category_custom: custom,
    status: String(p.status || "draft"),
    excerpt: String(p.excerpt || ""),
    body: String(p.body || ""),
    tags,
    subtitle: String(p.subtitle || ""),
    featured_image_url: String(p.featured_image_url || ""),
    featured_image_object_position: String(p.featured_image_object_position || "").toLowerCase(),
    reading_minutes: p.reading_minutes != null ? String(p.reading_minutes) : "",
    author_display_name: String(p.author_display_name || ""),
    author_bio: String(p.author_bio || ""),
    author_avatar_url: String(p.author_avatar_url || ""),
    author_role: String(p.author_role || ""),
    author_linkedin_url: String(p.author_linkedin_url || ""),
    scheduled_publish_at: p.scheduled_publish_at
      ? new Date(String(p.scheduled_publish_at)).toISOString().slice(0, 16)
      : "",
    published_at: p.published_at ? new Date(String(p.published_at)).toISOString().slice(0, 16) : "",
    seo_title: String(p.seo_title || ""),
    seo_description: String(p.seo_description || ""),
    seo_keywords: String(p.seo_keywords || ""),
    canonical_url: String(p.canonical_url || ""),
    og_image_url: String(p.og_image_url || ""),
    twitter_card: String(p.twitter_card || "summary_large_image"),
    robots: String(p.robots || "index,follow"),
    hero_style: String(p.hero_style || "default"),
    locale: String(p.locale || "en"),
    custom_css: String(p.custom_css || ""),
    faq_json: Array.isArray(p.faq_json) ? JSON.stringify(p.faq_json, null, 2) : "",
  };
}
