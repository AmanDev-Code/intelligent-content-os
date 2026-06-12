/**
 * Verify marketing pages have no horizontal overflow at 375px viewport.
 * Usage: node scripts/verify-mobile-overflow.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:8080";
const PAGES = ["/", "/features", "/contact"];
const VIEWPORT = { width: 375, height: 812 };

function summarizeOverflowElements(page, limit = 8) {
  return page.evaluate((max) => {
    const vw = window.innerWidth;
    const offenders = [];
    for (const el of document.querySelectorAll("body *")) {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) continue;
      if (rect.right > vw + 1) {
        const cls =
          typeof el.className === "string"
            ? el.className.split(/\s+/).slice(0, 4).join(" ")
            : "";
        offenders.push({
          tag: el.tagName.toLowerCase(),
          class: cls,
          right: Math.round(rect.right),
          overflowPx: Math.round(rect.right - vw),
        });
      }
    }
    offenders.sort((a, b) => b.overflowPx - a.overflowPx);
    const doc = document.documentElement;
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      pageOverflow: doc.scrollWidth > doc.clientWidth,
      pageOverflowPx: doc.scrollWidth - doc.clientWidth,
      offenderCount: offenders.length,
      topOffenders: offenders.slice(0, max),
    };
  }, limit);
}

const browser = await chromium.launch({ headless: true });
let failed = false;

for (const path of PAGES) {
  const page = await browser.newPage();
  await page.setViewportSize(VIEWPORT);
  const res = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 60000 });
  if (!res?.ok()) {
    console.error(`FAIL ${path}: HTTP ${res?.status()}`);
    failed = true;
    await page.close();
    continue;
  }
  await page.waitForTimeout(500);
  const summary = await summarizeOverflowElements(page);
  const status = summary.pageOverflow ? "FAIL" : "PASS";
  if (summary.pageOverflow) failed = true;
  console.log(`\n${status} ${path}`);
  console.log(
    `  scrollWidth=${summary.scrollWidth} clientWidth=${summary.clientWidth} overflow=${summary.pageOverflowPx}px`,
  );
  if (summary.offenderCount > 0) {
    console.log(`  elements past viewport edge: ${summary.offenderCount}`);
    for (const o of summary.topOffenders) {
      console.log(`    - <${o.tag}.${o.class}> +${o.overflowPx}px`);
    }
  }
  await page.close();
}

await browser.close();
process.exit(failed ? 1 : 0);
