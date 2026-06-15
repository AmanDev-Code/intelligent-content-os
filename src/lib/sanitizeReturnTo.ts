const DEFAULT_RETURN_PATH = "/dashboard";

/**
 * Validates a post-auth redirect path to prevent open redirects.
 * Only same-origin relative paths are allowed.
 */
export function sanitizeReturnTo(
  returnTo: unknown,
  defaultPath = DEFAULT_RETURN_PATH,
): string {
  if (typeof returnTo !== "string") {
    return defaultPath;
  }

  const trimmed = returnTo.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("://")
  ) {
    return defaultPath;
  }

  return trimmed;
}
