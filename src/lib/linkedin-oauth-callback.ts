export const LINKEDIN_PAGE_PICKER_PENDING_KEY = "trndinn:linkedin:open-page-picker";

export function readPagePickerPending(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(LINKEDIN_PAGE_PICKER_PENDING_KEY) === "1";
}

export function markPagePickerPending(): void {
  sessionStorage.setItem(LINKEDIN_PAGE_PICKER_PENDING_KEY, "1");
}

export function clearPagePickerPending(): void {
  sessionStorage.removeItem(LINKEDIN_PAGE_PICKER_PENDING_KEY);
}

/**
 * Determine if page picker should open after OAuth callback.
 * Returns true if:
 * - Legacy 'connect-pages' flow (deprecated), OR
 * - Unified flow signaled has_org_pages=true from backend
 */
export function shouldOpenPagePickerAfterOAuth(
  flowParam: string | null,
  hasOrgPagesParam: string | null,
): boolean {
  // Legacy flow (deprecated — unified flow now handles this)
  if (flowParam === "connect-pages") return true;
  // Unified flow: backend detected user has org pages
  if (hasOrgPagesParam === "true") return true;
  return false;
}

export function buildCleanPath(pathname: string, searchParams: URLSearchParams): string {
  const params = new URLSearchParams(searchParams.toString());
  params.delete("linkedin");
  params.delete("reason");
  params.delete("flow");
  params.delete("has_org_pages");
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
