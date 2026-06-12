import Link from "next/link";
import { TrndinnLogo } from "@/components/brand/TrndinnLogo";
import { BLOG_BASE_PATH } from "@/lib/blogPublic";
import { siteName } from "@/lib/site";

export function MarketingFooter() {
  return (
    <footer className="relative pb-12 pt-16">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-[radial-gradient(ellipse_80%_100%_at_50%_0%,hsl(var(--primary)/0.06),transparent_70%)] dark:bg-[radial-gradient(ellipse_80%_100%_at_50%_0%,hsl(var(--primary)/0.1),transparent_70%)]"
        aria-hidden
      />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <TrndinnLogo variant="wordmark" className="opacity-95" />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              One calm command center for your social presence. Create with AI, schedule with confidence, and
              learn what actually moves your audience.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</p>
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
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</p>
              <ul className="mt-3 space-y-2 text-sm">
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
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Legal</p>
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
        <p className="mt-10 text-center text-xs text-muted-foreground md:text-left">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
