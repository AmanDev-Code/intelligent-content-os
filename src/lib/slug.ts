/**
 * Convert a string to a URL-friendly slug
 * Example: "AI-Assisted Rewrite: Navigating the Future" -> "ai-assisted-rewrite-navigating-the-future"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

/**
 * Create a slug from title only (SEO-friendly, no UUID)
 * Example: "ai-assisted-rewrite-navigating-the-future"
 */
export function createPostSlug(title: string): string {
  return slugify(title);
}

/**
 * Convert slug back to searchable title
 * Example: "ai-assisted-rewrite-navigating-the-future" -> "ai assisted rewrite navigating the future"
 */
export function slugToTitle(slug: string): string {
  return slug.replace(/-/g, ' ');
}
