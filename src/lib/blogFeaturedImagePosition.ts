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

/**
 * Parse a stored position value. Supports:
 * - Preset keywords: "left", "center", "right", "top", "bottom"
 * - Custom x,y percentages: "50,30" (x=50%, y=30%)
 */
export function parseStoredPosition(dbValue: string | null | undefined): {
  type: "preset" | "custom";
  preset?: BlogFeaturedImagePositionPreset;
  x?: number;
  y?: number;
} {
  const raw = String(dbValue || "").trim().toLowerCase();
  
  if (!raw) {
    return { type: "preset", preset: "" };
  }
  
  if (raw in PRESET_TO_CSS || raw === "") {
    return { type: "preset", preset: raw as BlogFeaturedImagePositionPreset };
  }
  
  const match = raw.match(/^(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)$/);
  if (match) {
    const x = Math.min(100, Math.max(0, parseFloat(match[1])));
    const y = Math.min(100, Math.max(0, parseFloat(match[2])));
    return { type: "custom", x, y };
  }
  
  return { type: "preset", preset: "" };
}

/**
 * Convert x,y percentages to a storage string.
 */
export function formatPositionForStorage(x: number, y: number): string {
  return `${Math.round(x)},${Math.round(y)}`;
}

/** Resolved CSS when no DB value — listings favor right focal point; hero favors center. */
export function cssObjectPositionForFeaturedImage(
  dbValue: string | null | undefined,
  context: "listing" | "hero",
): string {
  const parsed = parseStoredPosition(dbValue);
  
  if (parsed.type === "custom" && parsed.x !== undefined && parsed.y !== undefined) {
    return `${parsed.x}% ${parsed.y}%`;
  }
  
  if (parsed.preset && parsed.preset in PRESET_TO_CSS) {
    return PRESET_TO_CSS[parsed.preset as keyof typeof PRESET_TO_CSS];
  }
  
  return context === "listing" ? "center right" : "center";
}
