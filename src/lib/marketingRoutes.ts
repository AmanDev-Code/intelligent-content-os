import { isCredentialPath } from "@/lib/credentialRoutes";

function normalizePath(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
}

const APP_PATH_PREFIXES = [
  "/dashboard",
  "/admin",
  "/platform-admin",
  "/calendar",
  "/generate",
  "/agent",
  "/content",
  "/media",
  "/analytics",
  "/billing",
  "/settings",
  "/notifications",
  "/generations",
  "/affiliate",
  "/email-templates",
  "/scheduled-posts",
  "/brand",
  "/blog-admin",
  "/careers-admin",
] as const;

/** Public marketing surfaces (homepage, pricing, blog, legal, etc.). */
export function isMarketingPath(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  if (isCredentialPath(normalized)) return false;
  return !APP_PATH_PREFIXES.some(
    (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}
