const CREDENTIAL_PATH_PREFIXES = [
  "/auth",
  "/reset-password",
  "/invite",
  "/verify-email",
] as const;

function normalizePath(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
}

/** Auth and credential-entry routes where GA must not load and pages are noindex. */
export function isCredentialPath(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return CREDENTIAL_PATH_PREFIXES.some(
    (prefix) =>
      normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}
