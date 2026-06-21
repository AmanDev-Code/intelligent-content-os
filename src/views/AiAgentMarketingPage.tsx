"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Calendar,
  FileText,
  Image as ImageIcon,
  Layers,
  Palette,
  Zap,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { LandingFaq } from "@/components/marketing/LandingFaq";
import { FinalCta } from "@/components/marketing/FinalCta";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

const CAPABILITIES = [
  {
    icon: FileText,
    title: "Text posts",
    body: "Describe your idea — get LinkedIn-ready copy tuned to your Brand Voice and niche.",
  },
  {
    icon: ImageIcon,
    title: "Image posts",
    body: "Generate on-brand visuals and attach them to posts without leaving the Agent.",
  },
  {
    icon: Layers,
    title: "Carousels",
    body: "Multi-slide carousels with AI-written slides and preview before you schedule.",
  },
  {
    icon: Calendar,
    title: "Schedule in flow",
    body: "Pick a time or post now. Scheduled content appears on your visual calendar.",
  },
  {
    icon: Palette,
    title: "Brand Voice",
    body: "Trndinn learns only from examples you provide — never scrapes your feeds.",
  },
  {
    icon: Zap,
    title: "Credits, transparent",
    body: "See costs before you generate, schedule, or publish. No surprise overages.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Connect LinkedIn",
    body: "Link your personal profile and optional Company Pages from Settings.",
  },
  {
    step: "2",
    title: "Teach your brand",
    body: "Add example posts and tone in Brand Kit so drafts sound like you.",
  },
  {
    step: "3",
    title: "Tell the Agent what to publish",
    body: "Describe the post, review drafts, then schedule or publish — all in /agent.",
  },
];

const FAQ = [
  {
    q: "What is Trndinn's AI social media agent?",
    a: "It's the in-app Agent at /agent — a conversational workspace where you describe what to post, get on-brand drafts and media, and schedule or publish to LinkedIn without switching tools.",
  },
  {
    q: "Is the Agent different from MCP or CLI?",
    a: "Yes. The Agent is live today inside Trndinn. MCP server and CLI for Claude, ChatGPT, and Cursor are coming soon — see /mcp for the roadmap.",
  },
  {
    q: "Which platforms does the Agent support?",
    a: "LinkedIn is live today — personal profiles and Company Pages. More channels are on the roadmap; the Agent will grow with them.",
  },
  {
    q: "How much does the Agent cost?",
    a: "Start free with 150 credits — no card required. Generation, scheduling, and publishing each spend credits; see /pricing for plan allotments.",
  },
  {
    q: "Can I automate the Agent with API or webhooks?",
    a: "For programmatic workflows today, use Public API v1 and signed webhooks on Team and Agency plans. The in-app Agent is best for hands-on drafting with human review.",
  },
];

export default function AiAgentMarketingPage({ h1Override }: { h1Override?: string | null }) {
  const { session } = useAuth();
  const title = h1Override ?? "AI social media agent — draft, schedule, and publish";
  const primaryHref = session ? "/agent" : "/auth";
  const primaryLabel = session ? "Open Agent" : "Start free";

  return (
    <MarketingShell>
      <main>
        <section className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,hsl(var(--primary)/0.12),transparent_55%)] dark:bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,rgba(255,138,31,0.26),transparent_55%)]" />
          <div className="pointer-events-none absolute -right-24 top-1/3 -z-10 h-[380px] w-[380px] rounded-full bg-[#ff3d39]/10 blur-3xl dark:bg-[#ff3d39]/20" />

          <div className="mx-auto max-w-3xl px-4 pb-10 pt-10 text-center sm:px-6 sm:pb-16 sm:pt-16 md:pb-20 md:pt-20">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-md dark:bg-white/5 dark:text-white/70">
                <Bot className="h-3.5 w-3.5 text-primary" aria-hidden />
                Live today
              </span>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="mt-5 font-display text-[2rem] font-black leading-[1.1] tracking-tight text-foreground sm:mt-6 sm:text-5xl sm:leading-[1.05] md:text-6xl">
                {title}
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
                Tell Trndinn&apos;s Agent what to publish. Get on-brand LinkedIn posts, images, and
                carousels — then schedule or post immediately. Your examples, your voice, your
                consent at every step.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div className="mt-7 flex flex-col items-center gap-3 sm:mt-9 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] px-8 font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
                  asChild
                >
                  <Link href={primaryHref}>
                    {primaryLabel}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-full border-border bg-background/40 px-8 font-semibold text-foreground backdrop-blur-md hover:bg-muted hover:text-foreground dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:hover:text-white sm:w-auto"
                  asChild
                >
                  <Link href="/features#agentic">How agentic works</Link>
                </Button>
              </div>
            </Reveal>
            <Reveal delay={220}>
              <p className="mt-6 text-sm text-muted-foreground">
                Signed-in users: open the product Agent at{" "}
                <Link href="/agent" className="font-medium text-primary hover:underline">
                  /agent
                </Link>
              </p>
            </Reveal>
          </div>
        </section>

        <Section>
          <SectionHeading
            eyebrow="Capabilities"
            title="One workspace for agentic social posting"
            subtitle="The Agent completes multi-step workflows — draft, media, schedule, publish — without you juggling tabs."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map(({ icon: Icon, title: itemTitle, body }) => (
              <Reveal key={itemTitle}>
                <div className="h-full rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm dark:bg-white/[0.04]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12">
                    <Icon className="h-5 w-5 text-primary" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-foreground">{itemTitle}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        <Section className="pt-0">
          <SectionHeading eyebrow="How it works" title="From prompt to published in three steps" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ step, title: stepTitle, body }) => (
              <Reveal key={step}>
                <div className="relative rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/8 to-card/40 p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary">
                    {step}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-foreground">{stepTitle}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        <Section>
          <div className="relative isolate overflow-hidden rounded-[2rem] border border-border/60 bg-card/70 p-6 sm:p-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-xl">
                <Badge
                  variant="secondary"
                  className="rounded-full border border-primary/20 bg-primary/10 text-primary"
                >
                  Also on the roadmap
                </Badge>
                <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  MCP & CLI for external AI assistants
                </h2>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  Want Claude, ChatGPT, or Cursor to drive Trndinn from outside the dashboard? MCP
                  server and CLI are coming soon — honest roadmap at{" "}
                  <Link href="/mcp" className="font-medium text-primary hover:underline">
                    /mcp
                  </Link>
                  .
                </p>
              </div>
              <Button
                variant="outline"
                className="shrink-0 rounded-full"
                asChild
              >
                <Link href="/mcp">
                  MCP roadmap
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Section>

        <LandingFaq title="AI social media agent FAQ" items={FAQ} />

        <FinalCta
          title="Ready to try the Agent?"
          subtitle="150 free credits. Connect LinkedIn, add your examples, and publish your first post today."
          primaryLabel={primaryLabel}
          primaryHref={primaryHref}
          secondaryLabel="View pricing"
          secondaryHref="/pricing"
        />
      </main>
    </MarketingShell>
  );
}
