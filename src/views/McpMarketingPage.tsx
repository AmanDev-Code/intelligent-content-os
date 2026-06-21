"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Clock,
  Globe,
  MessageSquare,
  Plug,
  Sparkles,
  Webhook,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { LandingFaq } from "@/components/marketing/LandingFaq";
import { FinalCta } from "@/components/marketing/FinalCta";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const WHY_MCP = [
  {
    icon: MessageSquare,
    title: "Just ask, in plain English",
    body: "Tell Claude, ChatGPT, or Cursor what to post and when. Your assistant drafts, schedules, and publishes — no copy-pasting between tools.",
  },
  {
    icon: Globe,
    title: "Brand Voice built in",
    body: "Trndinn MCP will respect your Brand Kit — tone, examples, and compliance rules — so agents sound like you, not generic AI.",
  },
  {
    icon: Clock,
    title: "Schedule ahead",
    body: "Plan a week of LinkedIn content in one conversation. Posts land in your Trndinn calendar and publish on time.",
  },
  {
    icon: Plug,
    title: "Connect once",
    body: "Add a single MCP server URL to your AI tool. No custom integrations — the same open standard Claude and ChatGPT already support.",
  },
];

const ASSISTANTS = [
  {
    name: "Claude",
    body: "Desktop app, Claude Code, and Cursor — add Trndinn as an MCP server and schedule posts from your IDE or chat.",
  },
  {
    name: "ChatGPT",
    body: "Custom connectors in ChatGPT settings — paste your Trndinn MCP link and ask it to manage your social calendar.",
  },
  {
    name: "Cursor",
    body: "Wire Trndinn into your dev workflow so coding agents can draft launch posts alongside your ship notes.",
  },
];

const PLANNED_TOOLS = [
  "List connected social accounts",
  "Generate on-brand post drafts",
  "Schedule and publish to LinkedIn",
  "Upload media for posts",
  "Query Content Engine articles and distribution",
];

const FAQ = [
  {
    q: "What is a social media MCP server?",
    a: "MCP (Model Context Protocol) is the open standard that lets AI assistants like Claude, ChatGPT, and Cursor connect to apps you use. A Trndinn MCP server will expose scheduling, generation, and publishing actions so your AI can act as a social media agent.",
  },
  {
    q: "Is the Trndinn MCP server available today?",
    a: "Not yet. We are building it now. Today you can use Trndinn's in-app Agent, Public API v1, and signed webhooks on Team and Agency plans. Join the waitlist via our contact form or follow agentic updates on the Features page.",
  },
  {
    q: "Which AI assistants will work with Trndinn MCP?",
    a: "Any tool that supports MCP — including Claude, Claude Code, ChatGPT (custom connectors), and Cursor. You will add one server URL with your API key, similar to how other MCP integrations work.",
  },
  {
    q: "What can I use instead of MCP today?",
    a: "Use the in-app Agent at /agent for conversational drafting and scheduling, or wire Public API v1 and webhooks into Zapier, Make, n8n, or your own stack. See /features#agentic for the full agentic workflow story.",
  },
  {
    q: "Will MCP cost extra?",
    a: "No — MCP access will be included with your Trndinn plan. Actions still use credits the same way as the in-app Agent and API.",
  },
];

export default function McpMarketingPage({ h1Override }: { h1Override?: string | null }) {
  const title =
    h1Override ?? "The social media MCP server for Claude, ChatGPT, and Cursor";

  return (
    <MarketingShell>
      <main>
        <section className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,hsl(var(--primary)/0.12),transparent_55%)] dark:bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,rgba(255,138,31,0.26),transparent_55%)]" />
          <div className="pointer-events-none absolute -left-32 top-10 -z-10 h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl dark:bg-primary/25" />

          <div className="mx-auto max-w-3xl px-4 pb-10 pt-10 text-center sm:px-6 sm:pb-16 sm:pt-16 md:pb-20 md:pt-20">
            <Reveal>
              <Badge
                variant="secondary"
                className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary"
              >
                Coming soon
              </Badge>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="mt-5 font-display text-[2rem] font-black leading-[1.1] tracking-tight text-foreground sm:mt-6 sm:text-5xl sm:leading-[1.05] md:text-6xl">
                {title}
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
                Connect Trndinn once — then ask your AI assistant to draft, schedule, and publish
                LinkedIn content with your Brand Voice. MCP server and CLI are on the roadmap; API
                and webhooks work today.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div className="mt-7 flex flex-col items-center gap-3 sm:mt-9 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] px-8 font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
                  asChild
                >
                  <Link href="/features#agentic">
                    See agentic workflows
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-full border-border bg-background/40 px-8 font-semibold text-foreground backdrop-blur-md hover:bg-muted hover:text-foreground dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:hover:text-white sm:w-auto"
                  asChild
                >
                  <Link href="/contact">Notify me when MCP ships</Link>
                </Button>
              </div>
            </Reveal>
            <Reveal delay={220}>
              <p className="mt-6 text-sm text-muted-foreground">
                Please keep a human in the loop — review what your AI publishes.
              </p>
            </Reveal>
          </div>
        </section>

        <Section>
          <SectionHeading
            eyebrow="Why MCP"
            title="Let your AI assistant run social — with guardrails"
            subtitle="MCP is how Claude, ChatGPT, and Cursor plug into the apps you already use. Trndinn's server will turn those conversations into scheduled posts."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {WHY_MCP.map(({ icon: Icon, title: itemTitle, body }) => (
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
          <SectionHeading
            eyebrow="Works with"
            title="One MCP link for the assistants you already use"
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {ASSISTANTS.map(({ name, body }) => (
              <Reveal key={name}>
                <div className="h-full rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/8 to-card/40 p-6">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" aria-hidden />
                    <h3 className="font-display text-lg font-bold text-foreground">{name}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        <Section>
          <div className="relative isolate overflow-hidden rounded-[2rem] border border-border/60 bg-card/70 p-6 sm:p-10">
            <SectionHeading
              align="left"
              eyebrow="Available today"
              title="Don't wait for MCP — integrate now"
              subtitle="Team and Agency plans include Public API v1 and signed webhooks. Wire Trndinn into your stack while we finish the MCP server."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-background/50 p-5 dark:bg-white/[0.04]">
                <Webhook className="h-5 w-5 text-primary" aria-hidden />
                <h3 className="mt-3 font-display font-bold text-foreground">Public API v1</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create, list, and cancel posts programmatically. Authenticate with scoped API keys
                  from Settings.
                </p>
                <Link
                  href="/features"
                  className="mt-3 inline-flex items-center text-sm font-semibold text-primary hover:underline"
                >
                  Explore features
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="rounded-2xl bg-background/50 p-5 dark:bg-white/[0.04]">
                <Sparkles className="h-5 w-5 text-primary" aria-hidden />
                <h3 className="mt-3 font-display font-bold text-foreground">In-app Agent</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Describe a post in plain language — get on-brand drafts, images, and scheduling in
                  one flow. Live today at{" "}
                  <Link href="/ai-agent" className="font-medium text-primary hover:underline">
                    /ai-agent
                  </Link>
                  .
                </p>
                <Link
                  href="/auth"
                  className="mt-3 inline-flex items-center text-sm font-semibold text-primary hover:underline"
                >
                  Start free
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </Section>

        <Section className="pt-0">
          <SectionHeading
            eyebrow="Roadmap"
            title="Planned MCP tools"
            subtitle="Surface area will grow with Brand Voice and Content Engine — not just scheduling."
          />
          <Reveal delay={80} className="mx-auto mt-8 max-w-2xl">
            <ul className="space-y-3 rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-6 sm:p-8">
              {PLANNED_TOOLS.map((tool) => (
                <li key={tool} className="flex items-start gap-3 text-sm text-muted-foreground sm:text-base">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                  {tool}
                </li>
              ))}
            </ul>
          </Reveal>
        </Section>

        <LandingFaq title="Social media MCP server FAQ" items={FAQ} />

        <FinalCta
          title="Want early access to Trndinn MCP?"
          subtitle="Tell us how you'd use it — or start with the in-app Agent and API today."
          primaryLabel="Notify me"
          primaryHref="/contact"
          secondaryLabel="See agentic workflows"
          secondaryHref="/features#agentic"
        />
      </main>
    </MarketingShell>
  );
}
