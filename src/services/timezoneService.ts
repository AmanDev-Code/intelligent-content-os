const STORAGE_KEY = "trndinn:timezone";
const STORAGE_TS_KEY = "trndinn:timezone:ts";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function readCachedTimezone(): string | null {
  if (typeof window === "undefined") return null;
  const tz = window.localStorage.getItem(STORAGE_KEY);
  const ts = Number(window.localStorage.getItem(STORAGE_TS_KEY) || "0");
  if (!tz || !ts) return null;
  if (Date.now() - ts > CACHE_TTL_MS) return null;
  return tz;
}

function writeCachedTimezone(tz: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, tz);
  window.localStorage.setItem(STORAGE_TS_KEY, String(Date.now()));
}

async function fetchWithTimeout(url: string, timeoutMs = 2500): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Returns the best-known timezone immediately (cached/browser fallback).
 * Use resolveTimezone() to perform IP-based detection and refresh cache.
 */
export function getPreferredTimezoneSync(): string {
  const browserTz = browserTimezone();
  if (browserTz && browserTz !== "UTC") {
    // Browser/device timezone is the most accurate for scheduling UI.
    writeCachedTimezone(browserTz);
    return browserTz;
  }
  return readCachedTimezone() || "UTC";
}

/**
 * Free timezone detection from IP with browser fallback.
 * Primary: ipapi.co, fallback: ipwho.is
 */
export async function resolveTimezone(): Promise<string> {
  const browserTz = browserTimezone();
  const cached = readCachedTimezone();
  if (cached) {
    // Prefer the device/browser timezone so users always see local wall time.
    if (browserTz && browserTz !== "UTC" && cached !== browserTz) {
      writeCachedTimezone(browserTz);
      return browserTz;
    }
    return cached;
  }

  if (browserTz && browserTz !== "UTC") {
    writeCachedTimezone(browserTz);
    return browserTz;
  }

  try {
    const ipapi = await fetchWithTimeout("https://ipapi.co/json/");
    const tz = ipapi?.timezone;
    if (typeof tz === "string" && tz.length > 0) {
      writeCachedTimezone(tz);
      return tz;
    }
  } catch {
    // try fallback
  }

  try {
    const ipwho = await fetchWithTimeout("https://ipwho.is/");
    const tz = ipwho?.timezone?.id;
    if (typeof tz === "string" && tz.length > 0) {
      writeCachedTimezone(tz);
      return tz;
    }
  } catch {
    // final fallback below
  }

  const fallback = browserTz || "UTC";
  writeCachedTimezone(fallback);
  return fallback;
}

export function formatInTimezone(
  dateInput: string | Date,
  timezone = getPreferredTimezoneSync(),
  options: Intl.DateTimeFormatOptions = {},
): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: timezone,
    ...options,
  }).format(date);
}

