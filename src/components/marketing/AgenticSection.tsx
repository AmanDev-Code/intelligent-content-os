"use client";

import Link from "next/link";
import { ArrowRight, Bot, Globe, Webhook } from "lucide-react";
import { Section } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";
import { Button } from "@/components/ui/button";

const PILLARS = [
  {
    icon: Bot,
    title: "In-app Agent",
    body: "Describe a post; get on-brand drafts, images, and carousels. Schedule in the same flow.",
  },
  {
    icon: Webhook,
    title: "API & webhooks",
    body: "Let your automation stack create, schedule, and react to publish events via Public API v1.",
  },
  {
    icon: Globe,
    title: "Content Engine",
    body: "Agents don't stop at social: generate SEO articles, distribute to 31 platforms, interlink, and newsletter.",
  },
];

export function AgenticSection() {
  return (
    <Section id="agentic" className="pt-0 sm:pt-2">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-primary/10 via-card/60 to-card/40 p-6 sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold tracking-wide text-primary">
              <Bot className="h-3.5 w-3.5" aria-hidden />
              Agentic by design
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
              AI agents that act — not just suggest
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Trndinn completes multi-step workflows — draft, schedule, publish, distribute — with your
              consent at every boundary. Brand Voice comes only from examples you provide; we never scrape
              your feeds.
            </p>
          </div>

          <div className="relative mt-8 grid gap-4 sm:grid-cols-3">
            {PILLARS.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl bg-background/50 p-5 backdrop-blur-sm dark:bg-white/[0.04]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12">
                  <Icon className="h-5 w-5 text-primary" aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>

          <p className="relative mt-6 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Coming soon:</span> MCP server and CLI to connect
            Claude, ChatGPT, and Cursor — with Trndinn&apos;s Brand Voice and Content Engine baked in.
          </p>

          <Button
            size="lg"
            className="relative mt-6 h-12 rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] px-8 font-semibold text-white"
            asChild
          >
            <Link href="/auth">
              Start free — 150 credits
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Reveal>
    </Section>
  );
}
