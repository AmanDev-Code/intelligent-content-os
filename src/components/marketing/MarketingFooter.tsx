import Link from "next/link";
import { TrndinnLogo } from "@/components/brand/TrndinnLogo";
import { siteName } from "@/lib/site";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/50 bg-muted/25 py-12 dark:bg-muted/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <TrndinnLogo variant="wordmark" className="opacity-95" />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              One calm command center for your social presence-create with AI, schedule with confidence, and
              learn what actually moves your audience.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/features" className="text-foreground/90 hover:text-primary">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-foreground/90 hover:text-primary">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/auth" className="text-foreground/90 hover:text-primary">
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/contact" className="text-foreground/90 hover:text-primary">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-foreground/90 hover:text-primary">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-use" className="text-foreground/90 hover:text-primary">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Build</p>
              <p className="mt-3 text-sm text-muted-foreground">
                LinkedIn is live today. More channels, AI reels, and outreach are on the roadmap-ship with us.
              </p>
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
