import { cn } from "@/lib/utils";

/** Preset editorial categories shown in CMS and chips on the marketing blog index. Order is admin dropdown order. */
export const BLOG_CONTENT_CATEGORY_PRESETS = [
  "Product",
  "Marketing",
  "Case Study",
  "Growth",
  "Daily",
  "Company",
  "SEO",
  "Distribution",
  "Engineering",
  "Announcement",
  "Guide",
  "Interview",
  "Thought Leadership",
  "Customer Story",
  "Product Update",
  "Partnerships",
  "Tutorial",
  "Analytics",
  "Behind the scenes",
] as const;

export type BlogContentCategoryPreset = (typeof BLOG_CONTENT_CATEGORY_PRESETS)[number];

export const BLOG_CATEGORY_SELECT_NONE = "__none__";
export const BLOG_CATEGORY_SELECT_CUSTOM = "__custom__";

const CUSTOM_SENTINEL = BLOG_CATEGORY_SELECT_CUSTOM;
const NONE_SENTINEL = BLOG_CATEGORY_SELECT_NONE;

export function presetSelectValueFromStored(stored: string | null | undefined): {
  preset: string;
  custom: string;
} {
  const s = typeof stored === "string" ? stored.trim() : "";
  if (!s) return { preset: NONE_SENTINEL, custom: "" };
  if ((BLOG_CONTENT_CATEGORY_PRESETS as readonly string[]).includes(s)) {
    return { preset: s, custom: "" };
  }
  return { preset: CUSTOM_SENTINEL, custom: s };
}

export function resolvedContentCategoryFromForm(preset: string, customTrimmed: string): string | null {
  if (!preset || preset === NONE_SENTINEL) return null;
  if (preset === CUSTOM_SENTINEL) {
    const c = customTrimmed.trim();
    return c.length ? c : null;
  }
  return preset;
}

/** Public label for cards: editorial category first, else formatted structural kind; empty string if neither applies. */
export function displayCategoryLabel(
  content_category: string | null | undefined,
  post_kind?: string | null,
  kindLabels?: Record<string, string>,
): string {
  const cc = typeof content_category === "string" ? content_category.trim() : "";
  if (cc) return cc;
  if (post_kind && kindLabels?.[post_kind]) return kindLabels[post_kind];
  if (post_kind) return post_kind.replace(/-/g, " ");
  return "";
}

const PILL_SURFACE = [
  "bg-amber-100 text-amber-950 ring-amber-200/70 dark:bg-amber-950/45 dark:text-amber-50 dark:ring-amber-800/50",
  "bg-rose-100 text-rose-950 ring-rose-200/70 dark:bg-rose-950/45 dark:text-rose-50 dark:ring-rose-800/50",
  "bg-emerald-100 text-emerald-950 ring-emerald-200/70 dark:bg-emerald-950/45 dark:text-emerald-50 dark:ring-emerald-800/50",
  "bg-sky-100 text-sky-950 ring-sky-200/70 dark:bg-sky-950/45 dark:text-sky-50 dark:ring-sky-800/50",
  "bg-violet-100 text-violet-950 ring-violet-200/70 dark:bg-violet-950/45 dark:text-violet-50 dark:ring-violet-800/50",
  "bg-orange-100 text-orange-950 ring-orange-200/70 dark:bg-orange-950/45 dark:text-orange-50 dark:ring-orange-800/50",
  "bg-teal-100 text-teal-950 ring-teal-200/70 dark:bg-teal-950/45 dark:text-teal-50 dark:ring-teal-800/50",
  "bg-fuchsia-100 text-fuchsia-950 ring-fuchsia-200/70 dark:bg-fuchsia-950/45 dark:text-fuchsia-50 dark:ring-fuchsia-800/50",
];

function hashSlug(s: string): number {
  let h = 2166136261;
  const str = s.toLowerCase();
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Soft pill colors keyed by slugified category string (stable across pages). */
export function blogCategoryPillClass(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "uncategorized";
  return cn(
    "inline-flex shrink-0 items-center rounded-full px-3 py-0.5 text-[11px] font-semibold tracking-wide ring-1 ring-inset",
    PILL_SURFACE[hashSlug(slug) % PILL_SURFACE.length],
  );
}
