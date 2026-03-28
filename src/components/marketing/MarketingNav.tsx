"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { TrndinnLogo } from "@/components/brand/TrndinnLogo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const links = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
] as const;

export function MarketingNav() {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const { session } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";
  const primaryHref = session ? "/dashboard" : "/auth";
  const primaryLabel = session ? "Dashboard" : "Get started";

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/65 dark:border-white/10">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label="Trndinn home">
          <TrndinnLogo variant="full" priority className="max-w-[190px] sm:max-w-[220px]" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            disabled={!mounted}
          >
            {!mounted ? <Sun className="h-4 w-4 opacity-50" /> : isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex rounded-full" asChild>
            <Link href="/auth">Sign in</Link>
          </Button>
          <Button
            size="sm"
            className="hidden rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff5d4f] px-4 font-semibold text-white shadow-lg shadow-primary/20 sm:inline-flex"
            asChild
          >
            <Link href={primaryHref}>{primaryLabel}</Link>
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100%,320px)] border-border/50 bg-background/95 backdrop-blur-xl">
              <div className="mt-8 flex flex-col gap-1">
                {links.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-xl px-3 py-3 text-base font-medium",
                      pathname === href ? "bg-primary/15 text-primary" : "text-foreground",
                    )}
                  >
                    {label}
                  </Link>
                ))}
                <Link href="/auth" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-base font-medium">
                  Sign in
                </Link>
                <Link
                  href={primaryHref}
                  onClick={() => setOpen(false)}
                  className="mt-2 rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff5d4f] px-4 py-3 text-center font-semibold text-white"
                >
                  {primaryLabel}
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
