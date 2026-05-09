/** Stored API values for `featured_image_object_position`. */
export const BLOG_FEATURED_IMAGE_POSITION_PRESETS = [
  "",
  "left",
  "center",
  "right",
  "top",
  "bottom",
] as const;

export type BlogFeaturedImagePositionPreset = (typeof BLOG_FEATURED_IMAGE_POSITION_PRESETS)[number];

/** CSS object-position strings for presets (two-keyword form where helpful). */
const PRESET_TO_CSS: Record<Exclude<BlogFeaturedImagePositionPreset, "">, string> = {
  left: "left center",
  center: "center",
  right: "right center",
  top: "center top",
  bottom: "center bottom",
};

/** Resolved CSS when no DB value — listings favor right focal point; hero favors center. */
export function cssObjectPositionForFeaturedImage(
  dbValue: string | null | undefined,
  context: "listing" | "hero",
): string {
  const key = String(dbValue || "")
    .trim()
    .toLowerCase();
  if (key && key in PRESET_TO_CSS) {
    return PRESET_TO_CSS[key as keyof typeof PRESET_TO_CSS];
  }
  return context === "listing" ? "center right" : "center";
}
