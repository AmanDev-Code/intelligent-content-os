"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrndinnLogo } from "@/components/brand/TrndinnLogo";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { BLOG_BASE_PATH } from "@/lib/blogPublic";
import { siteName } from "@/lib/site";

function isBlogRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === BLOG_BASE_PATH ||
    pathname === `${BLOG_BASE_PATH}/` ||
    pathname.startsWith(`${BLOG_BASE_PATH}/`)
  );
}

export function MarketingFooter() {
  const pathname = usePathname();
  const hideNewsletter = isBlogRoute(pathname);

  return (
    <footer className="relative pb-12 pt-16">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-[radial-gradient(ellipse_80%_100%_at_50%_0%,hsl(var(--primary)/0.06),transparent_70%)] dark:bg-[radial-gradient(ellipse_80%_100%_at_50%_0%,hsl(var(--primary)/0.1),transparent_70%)]"
        aria-hidden
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {!hideNewsletter ? (
          <div
            aria-label="Newsletter signup"
            className="border-b border-border/40 py-8"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/65">
              Subscribe to our newsletter
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              AI, content, and growth tips — no spam.
            </p>
            <div className="mt-4 max-w-md">
              <NewsletterSignup variant="inline" source="website" />
            </div>
          </div>
        ) : null}

        <div className="grid gap-10 py-8 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-3">
            <TrndinnLogo variant="wordmark" className="opacity-95" />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              One calm command center for your social presence. Create with AI, schedule with confidence, and
              learn what actually moves your audience.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:col-span-9 lg:grid-cols-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground/65">Product</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/features" className="cursor-pointer text-foreground/90 transition-colors hover:text-primary">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="cursor-pointer text-foreground/90 transition-colors hover:text-primary">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href={BLOG_BASE_PATH} className="cursor-pointer text-foreground/90 transition-colors hover:text-primary">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/auth" className="cursor-pointer text-foreground/90 transition-colors hover:text-primary">
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground/65">Compare</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/vs/buffer" className="cursor-pointer text-foreground/90 transition-colors hover:text-primary">
                    vs Buffer
                  </Link>
                </li>
                <li>
                  <Link href="/vs/hootsuite" className="cursor-pointer text-foreground/90 transition-colors hover:text-primary">
                    vs Hootsuite
                  </Link>
                </li>
                <li>
                  <Link href="/vs/predis" className="cursor-pointer text-foreground/90 transition-colors hover:text-primary">
                    vs Predis.ai
                  </Link>
                </li>
                <li>
                  <Link href="/vs/postiz" className="cursor-pointer text-foreground/90 transition-colors hover:text-primary">
                    vs Postiz
                  </Link>
                </li>
                <li>
                  <Link href="/vs/taplio" className="cursor-pointer text-foreground/90 transition-colors hover:text-primary">
                    vs Taplio
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground/65">Company</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/about-us" className="cursor-pointer text-foreground/90 transition-colors hover:text-primary">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="cursor-pointer text-foreground/90 transition-colors hover:text-primary">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="cursor-pointer text-foreground/90 transition-colors hover:text-primary">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/legal/refund" className="cursor-pointer text-foreground/90 transition-colors hover:text-primary">
                    Refunds
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground/65">Guides</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/guides/ai-social-media-marketing" className="cursor-pointer text-foreground/90 transition-colors hover:text-primary">
                    AI Social Media Marketing
                  </Link>
                </li>
                <li>
                  <Link href="/guides/linkedin-automation" className="cursor-pointer text-foreground/90 transition-colors hover:text-primary">
                    LinkedIn Automation
                  </Link>
                </li>
                <li>
                  <Link href="/guides/content-repurposing" className="cursor-pointer text-foreground/90 transition-colors hover:text-primary">
                    Content Repurposing
                  </Link>
                </li>
                <li>
                  <Link href="/guides/social-media-scheduling" className="cursor-pointer text-foreground/90 transition-colors hover:text-primary">
                    Social Media Scheduling
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground/65">Legal</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/legal/privacy" className="cursor-pointer text-foreground/90 transition-colors hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terms" className="cursor-pointer text-foreground/90 transition-colors hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/legal/cookies" className="cursor-pointer text-foreground/90 transition-colors hover:text-primary">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="/legal/dpa" className="cursor-pointer text-foreground/90 transition-colors hover:text-primary">
                    DPA
                  </Link>
                </li>
                <li>
                  <Link href="/legal/subprocessors" className="cursor-pointer text-foreground/90 transition-colors hover:text-primary">
                    Sub-processors
                  </Link>
                </li>
                <li>
                  <Link href="/legal/data-rights" className="cursor-pointer text-foreground/90 transition-colors hover:text-primary">
                    Your Privacy Choices
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 pt-8">
          <p className="text-center text-xs text-muted-foreground sm:text-left">
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
