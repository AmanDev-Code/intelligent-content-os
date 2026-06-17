"use client";

import Link from "next/link";
import { ArrowLeft, Building2, Heart, ShieldCheck, Sparkles, Target, Users } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Reveal } from "@/components/marketing/Reveal";
import { siteName } from "@/lib/site";
import { DEFAULT_MARKETING_CONTENT } from "@/lib/marketing/siteContent";
import { cn } from "@/lib/utils";

type AboutUsContent = {
  seoTitle?: string;
  seoDescription?: string;
  heroHeadline?: string;
  heroSubtitle?: string;
  heroEyebrow?: string;
  mainContent?: string;
  missionStatement?: string;
  values?: Array<{ title: string; description: string }>;
};

const DEFAULT_CONTENT: AboutUsContent = DEFAULT_MARKETING_CONTENT.about_us as AboutUsContent;

const VALUES_ICONS: Record<string, React.ReactNode> = {
  Transparency: <ShieldCheck className="h-6 w-6 text-primary" />,
  Ownership: <Building2 className="h-6 w-6 text-primary" />,
  Reliability: <Target className="h-6 w-6 text-primary" />,
  Creativity: <Sparkles className="h-6 w-6 text-primary" />,
};

function getValueIcon(title: string) {
  return VALUES_ICONS[title] || <Heart className="h-6 w-6 text-primary" />;
}

export default function AboutUsPage({ content }: { content: Record<string, unknown> | null }) {
  const data: AboutUsContent = content ?? DEFAULT_CONTENT;

  const headline = data.heroHeadline?.trim() || DEFAULT_CONTENT.heroHeadline!;
  const subtitle = data.heroSubtitle?.trim() || DEFAULT_CONTENT.heroSubtitle!;
  const eyebrow = data.heroEyebrow?.trim() || DEFAULT_CONTENT.heroEyebrow!;
  const mission = data.missionStatement?.trim() || DEFAULT_CONTENT.missionStatement!;
  const values = data.values?.length ? data.values : DEFAULT_CONTENT.values!;
  const mainContent = data.mainContent?.trim() || DEFAULT_CONTENT.mainContent!;

  const markdownComponents: Components = {
    h1: ({ children }) => (
      <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
        {children}
      </h3>
    ),
    p: ({ children }) => <p className="text-base leading-7 text-muted-foreground">{children}</p>,
    ul: ({ children }) => (
      <ul className="list-disc space-y-2 pl-6 text-muted-foreground">{children}</ul>
    ),
    li: ({ children }) => <li className="text-base">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    a: ({ children, href }) => (
      <a href={href} className="text-primary hover:underline">
        {children}
      </a>
    ),
  };

  return (
    <MarketingShell>
      <main className="relative">
        {/* Hero Section */}
        <section className="relative isolate overflow-hidden">
          {/* Background effects */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,hsl(var(--primary)/0.12),transparent_55%)] dark:bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,rgba(255,138,31,0.26),transparent_55%)]" />
          <div className="pointer-events-none absolute -left-32 top-10 -z-10 h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl dark:bg-primary/25" />
          <div className="pointer-events-none absolute -right-24 top-1/3 -z-10 h-[380px] w-[380px] rounded-full bg-[#ff3d39]/10 blur-3xl dark:bg-[#ff3d39]/20" />
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5] dark:opacity-100"
            style={{
              backgroundImage:
                "linear-gradient(to right, hsl(var(--foreground) / 0.07) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground) / 0.07) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse 80% 60% at 50% 25%, black, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 25%, black, transparent 75%)",
            }}
          />

          <div className="mx-auto max-w-5xl px-4 pb-8 pt-10 text-center sm:px-6 sm:pb-12 sm:pt-16 md:pb-16 md:pt-20">
            {/* Back to home link */}
            <Reveal>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/70 transition-colors hover:text-primary focus-visible:text-primary"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back to home
              </Link>
            </Reveal>

            <Reveal delay={60}>
              <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-md dark:bg-white/5 dark:text-white/70">
                <Users className="h-3.5 w-3.5 text-primary" aria-hidden />
                {eyebrow}
              </span>
            </Reveal>

            <Reveal delay={120}>
              <h1 className="mt-5 font-display text-[2rem] font-black leading-[1.1] tracking-tight text-foreground sm:mt-6 sm:text-5xl sm:leading-[1.05] md:text-6xl">
                {headline.split("future of").map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className="text-gradient-brand animate-gradient-x">future of</span>
                    )}
                  </span>
                ))}
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
                {subtitle}
              </p>
            </Reveal>
          </div>
        </section>

        {/* Mission Statement Card */}
        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 md:pb-20">
          <Reveal delay={240}>
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/50 p-8 text-center backdrop-blur-sm sm:p-10 md:p-12">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-[#ff3d39]/5" />
              <div className="relative">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Heart className="h-6 w-6" aria-hidden />
                </span>
                <h2 className="mt-6 font-display text-xl font-semibold tracking-tight sm:text-2xl">
                  Our Mission
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                  {mission}
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Main Content / Story Section */}
        <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 md:pb-20">
          <Reveal delay={300}>
            <div
              className={cn(
                "prose prose-neutral max-w-none dark:prose-invert",
                "prose-headings:font-display prose-headings:tracking-tight",
                "prose-h2:mt-12 prose-h2:text-2xl prose-h2:font-semibold",
                "prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8",
                "prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline",
                "prose-strong:text-foreground prose-strong:font-semibold",
                "prose-li:marker:text-primary/70",
              )}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {mainContent}
              </ReactMarkdown>
            </div>
          </Reveal>
        </section>

        {/* Values Grid */}
        <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 md:pb-24">
          <Reveal delay={360}>
            <div className="text-center">
              <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                Our Values
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
                The principles that guide how we build and operate {siteName}.
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <Reveal key={value.title} delay={420 + index * 60}>
                <div className="group relative overflow-hidden rounded-xl border border-border/60 bg-card/40 p-6 transition-all hover:border-primary/20 hover:bg-card/60">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      {getValueIcon(value.title)}
                    </span>
                    <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">
                      {value.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {value.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
          <Reveal delay={600}>
            <div className="rounded-2xl border border-border/60 bg-card/30 p-8 text-center backdrop-blur-sm sm:p-12">
              <h2 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                Want to learn more?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-base text-muted-foreground">
                Discover how {siteName} can help you publish with confidence.
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/features"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  Explore features
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-border/60 bg-background/50 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-background"
                >
                  Contact us
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
    </MarketingShell>
  );
}
