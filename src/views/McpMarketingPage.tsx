"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Code2,
  FileText,
  Image as ImageIcon,
  Key,
  Link as LinkIcon,
  ListChecks,
  MessageSquare,
  Pencil,
  Send,
  Sparkles,
  Target,
  Terminal,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { LandingFaq } from "@/components/marketing/LandingFaq";
import { FinalCta } from "@/components/marketing/FinalCta";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ToolPack = {
  icon: typeof Wrench;
  name: string;
  count: number;
  tools: string[];
};

const AVAILABLE_TOOLS: ToolPack[] = [
  {
    icon: FileText,
    name: "Blog",
    count: 17,
    tools: [
      "Create draft posts",
      "Publish and schedule",
      "Archive and soft-delete",
      "List, search, and get by slug",
      "Update post metadata + body",
    ],
  },
  {
    icon: Pencil,
    name: "AI Writing",
    count: 8,
    tools: [
      "Generate titles and excerpts",
      "Author FAQ blocks",
      "Fill SEO meta title + description",
      "Draft full articles from a brief",
      "Outline a content plan",
    ],
  },
  {
    icon: Sparkles,
    name: "Optimization",
    count: 6,
    tools: [
      "Score AEO signal quality",
      "Score GEO structure",
      "Apply optimization patches",
      "Generate Article + FAQ schema",
    ],
  },
  {
    icon: ImageIcon,
    name: "Images",
    count: 8,
    tools: [
      "Plan hero + inline imagery",
      "Generate with DALL-E",
      "Approve or reject drafts",
      "Insert into post body",
      "Regenerate with new prompts",
    ],
  },
  {
    icon: LinkIcon,
    name: "Internal Links",
    count: 5,
    tools: [
      "Analyze linking opportunities",
      "Suggest anchor + target pairs",
      "Accept, reject, or insert",
    ],
  },
  {
    icon: Target,
    name: "Keywords",
    count: 8,
    tools: [
      "Create keyword records",
      "Bulk import from CSV or list",
      "Assign to posts",
      "Track primary + secondary intent",
    ],
  },
  {
    icon: ListChecks,
    name: "Page SEO",
    count: 5,
    tools: [
      "List route SEO records",
      "Get and upsert per-route metadata",
      "AI-fill missing fields",
    ],
  },
  {
    icon: Send,
    name: "Distributions",
    count: 4,
    tools: [
      "Generate for platform mixes",
      "Publish to connected channels",
      "Mark as published manually",
    ],
  },
  {
    icon: TrendingUp,
    name: "Rankings + Authors",
    count: 6,
    tools: [
      "Track keyword rank changes",
      "Add backlink opportunities",
      "Save author profile metadata",
    ],
  },
];

const TOTAL_TOOLS = AVAILABLE_TOOLS.reduce((sum, p) => sum + p.count, 0);

const WHY_MCP = [
  {
    icon: MessageSquare,
    title: "Just ask, in plain English",
    body: "Tell Claude, ChatGPT, or Cursor what to write and where to publish. Your assistant drafts, optimizes, and ships without copy-paste.",
  },
  {
    icon: Wrench,
    title: "67 tools, one server",
    body: "Full blog CRUD, AEO/GEO scoring, DALL-E images, keyword assignments, page SEO, and distributions — all callable from your AI client.",
  },
  {
    icon: Zap,
    title: "Workflow prompts included",
    body: "Ship-ready prompts like /write_blog_post and /research_and_write orchestrate multiple tools in one call.",
  },
  {
    icon: Key,
    title: "Scoped API keys",
    body: "Every action runs through a Bearer trnd_* key with fine-grained scopes: blog, content-engine, seo, media — never more than needed.",
  },
];

const ASSISTANTS = [
  {
    name: "Claude Code",
    body: "Add Trndinn to your Claude Code MCP config and run the full blog + SEO workflow from the terminal or IDE.",
  },
  {
    name: "Claude Desktop",
    body: "Wire the MCP server into Claude Desktop and ask it to research, write, and publish long-form content.",
  },
  {
    name: "Cursor",
    body: "Draft launch posts and marketing content next to your code without ever leaving the editor.",
  },
  {
    name: "ChatGPT",
    body: "Add Trndinn as a custom connector in ChatGPT settings and manage your content pipeline from any device.",
  },
];

const EXAMPLE_PROMPTS = [
  {
    slug: "/write_blog_post",
    description: "Draft, optimize with AEO + GEO, add images, and publish in one flow.",
  },
  {
    slug: "/refresh_blog_post",
    description: "Update an existing post for current accuracy, links, and rankings.",
  },
  {
    slug: "/optimize_blog_post",
    description: "Run AEO and GEO scoring against a live post and apply the patches.",
  },
  {
    slug: "/bulk_seo_pages",
    description: "Fill title, description, and canonical for multiple routes at once.",
  },
  {
    slug: "/research_and_write",
    description: "Keyword research, cluster mapping, and a pillar-page draft end-to-end.",
  },
];

const CONFIG_SNIPPET = `{
  "mcpServers": {
    "trndinn": {
      "url": "https://trndinn.com/mcp",
      "transport": "http",
      "headers": {
        "Authorization": "Bearer trnd_YOUR_KEY_HERE"
      }
    }
  }
}`;

const FAQ = [
  {
    q: "Is Trndinn MCP available today?",
    a: "Yes. The MCP server is live at https://trndinn.com/mcp with 67 tools across 10 capability packs. It is platform-admin-only during this rollout and will open to Team and Agency plans in a future release.",
  },
  {
    q: "Which AI assistants work with Trndinn MCP?",
    a: "Any client that speaks Model Context Protocol — Claude Code, Claude Desktop, Cursor, and ChatGPT (via custom connectors). Add the server URL plus a Bearer trnd_* API key and the tools appear in your assistant.",
  },
  {
    q: "Who can use it right now?",
    a: "Platform admins only for the current phase. We are validating stability, credit metering, and audit logs before opening to Team and Agency plans.",
  },
  {
    q: "What can it do end-to-end?",
    a: "It runs the full blog and SEO workflow: create draft posts, generate titles and copy, add DALL-E images, score AEO + GEO, apply optimization patches, assign keywords, upsert page SEO, publish distributions, and track rankings.",
  },
  {
    q: "Does it cost extra?",
    a: "No. MCP access is included with your plan. Actions consume credits the same way as the in-app Agent and API — no separate billing.",
  },
];

export default function McpMarketingPage({ h1Override }: { h1Override?: string | null }) {
  const title =
    h1Override ??
    `Run Trndinn from Claude, ChatGPT, and Cursor — ${TOTAL_TOOLS} MCP tools live now`;

  return (
    <MarketingShell>
      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,hsl(var(--primary)/0.12),transparent_55%)]" />
          <div className="pointer-events-none absolute -left-32 top-10 -z-10 h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl dark:bg-primary/25" />

          <div className="mx-auto max-w-3xl px-4 pb-10 pt-10 text-center sm:px-6 sm:pb-16 sm:pt-16 md:pb-20 md:pt-20">
            <Reveal>
              <Badge
                variant="secondary"
                className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400"
              >
                <span
                  className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"
                  aria-hidden
                />
                Live now
              </Badge>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="mt-5 font-display text-[2rem] font-black leading-[1.1] tracking-tight text-foreground sm:mt-6 sm:text-5xl sm:leading-[1.05] md:text-6xl">
                {title}
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
                Trndinn ships a full Model Context Protocol server at{" "}
                <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
                  /mcp
                </code>{" "}
                so your assistant can run the entire blog, SEO, and content engine — create drafts,
                score AEO + GEO, generate images, publish distributions. {TOTAL_TOOLS} tools, 5 prompts,
                one Bearer key.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div className="mt-7 flex flex-col items-center gap-3 sm:mt-9 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  className="h-12 w-full rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] px-8 font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
                  asChild
                >
                  <Link href="/dashboard/api-keys">
                    Create an API key
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 w-full rounded-full border-border bg-background/40 px-8 font-semibold text-foreground backdrop-blur-md hover:bg-muted hover:text-foreground dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:hover:text-white sm:w-auto"
                  asChild
                >
                  <Link href="#tools">Browse all {TOTAL_TOOLS} tools</Link>
                </Button>
              </div>
            </Reveal>
            <Reveal delay={220}>
              <p className="mt-6 text-sm text-muted-foreground">
                Platform-admin only during rollout. Team + Agency plan access coming soon.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Why MCP */}
        <Section>
          <SectionHeading
            eyebrow="Why MCP"
            title="Your AI assistant, wired into the whole platform"
            subtitle="MCP is how Claude, ChatGPT, and Cursor plug into the apps you already use. Trndinn's server turns those conversations into shipped content."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {WHY_MCP.map(({ icon: Icon, title: itemTitle, body }) => (
              <Reveal key={itemTitle}>
                <div className="h-full rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm dark:bg-white/[0.04]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12">
                    <Icon className="h-5 w-5 text-primary" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                    {itemTitle}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Quick Start */}
        <Section className="pt-0">
          <SectionHeading
            eyebrow="Quick start"
            title="Three steps from install to your first post"
            subtitle="You'll need admin access to your Trndinn workspace and a supported MCP client."
          />
          <div className="mx-auto mt-10 max-w-3xl space-y-4">
            <Reveal>
              <div className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm sm:p-6 dark:bg-white/[0.04]">
                <div className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/12 font-heading text-sm font-bold text-primary">
                    1
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="flex items-center gap-2 font-display text-base font-bold text-foreground sm:text-lg">
                      <Key className="h-4 w-4 text-primary" aria-hidden />
                      Create an API key
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Head to{" "}
                      <Link
                        href="/dashboard/api-keys"
                        className="font-medium text-primary hover:underline"
                      >
                        /dashboard/api-keys
                      </Link>{" "}
                      (admin only) and generate a key with the scopes you need:{" "}
                      <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-xs text-foreground">
                        blog:read
                      </code>
                      ,{" "}
                      <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-xs text-foreground">
                        blog:write
                      </code>
                      ,{" "}
                      <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-xs text-foreground">
                        content-engine:read
                      </code>
                      ,{" "}
                      <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-xs text-foreground">
                        content-engine:write
                      </code>
                      ,{" "}
                      <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-xs text-foreground">
                        seo:read
                      </code>
                      ,{" "}
                      <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-xs text-foreground">
                        seo:write
                      </code>
                      , or{" "}
                      <code className="rounded bg-muted/60 px-1.5 py-0.5 font-mono text-xs text-foreground">
                        media:write
                      </code>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm sm:p-6 dark:bg-white/[0.04]">
                <div className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/12 font-heading text-sm font-bold text-primary">
                    2
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="flex items-center gap-2 font-display text-base font-bold text-foreground sm:text-lg">
                      <Code2 className="h-4 w-4 text-primary" aria-hidden />
                      Add to your MCP client
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Paste the block below into your Claude Code, Claude Desktop, or Cursor config.
                      Restart the client to pick up the new server.
                    </p>
                    <pre className="mt-3 overflow-x-auto rounded-lg border border-border/60 bg-muted/40 p-4 text-xs leading-relaxed text-foreground dark:bg-white/[0.03]">
                      <code className="font-mono">{CONFIG_SNIPPET}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm sm:p-6 dark:bg-white/[0.04]">
                <div className="flex items-start gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/12 font-heading text-sm font-bold text-primary">
                    3
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="flex items-center gap-2 font-display text-base font-bold text-foreground sm:text-lg">
                      <Terminal className="h-4 w-4 text-primary" aria-hidden />
                      Try your first prompt
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      In your assistant, type a workflow prompt like:
                    </p>
                    <pre className="mt-3 overflow-x-auto rounded-lg border border-border/60 bg-muted/40 p-4 text-xs leading-relaxed text-foreground dark:bg-white/[0.03]">
                      <code className="font-mono">
                        /write_blog_post about AI-native social media
                      </code>
                    </pre>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      Your assistant will call the right tools in order — research, draft, optimize,
                      illustrate, and publish.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* Tools grid */}
        <Section id="tools" className="pt-0">
          <SectionHeading
            eyebrow={`${TOTAL_TOOLS} tools`}
            title="10 capability packs, one MCP server"
            subtitle="Every tool is scoped, audited, and metered against your plan credits — the same way in-app actions are."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AVAILABLE_TOOLS.map(({ icon: Icon, name, count, tools }) => (
              <Reveal key={name}>
                <div className="h-full rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm dark:bg-white/[0.04]">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12">
                      <Icon className="h-5 w-5 text-primary" aria-hidden />
                    </span>
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary"
                    >
                      {count} tools
                    </Badge>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-foreground">{name}</h3>
                  <ul className="mt-3 space-y-2">
                    {tools.map((tool) => (
                      <li
                        key={tool}
                        className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground"
                      >
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                          aria-hidden
                        />
                        <span>{tool}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Example prompts */}
        <Section className="pt-0">
          <SectionHeading
            eyebrow="Workflow prompts"
            title="Five ready-made prompts that orchestrate the tools"
            subtitle="Prompts chain multiple tool calls into a single, reviewable action — great for repeat workflows."
          />
          <div className="mx-auto mt-10 max-w-3xl space-y-3">
            {EXAMPLE_PROMPTS.map(({ slug, description }) => (
              <Reveal key={slug}>
                <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-sm sm:flex-row sm:items-center sm:gap-6 dark:bg-white/[0.04]">
                  <code className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-muted/60 px-3 py-1.5 font-mono text-sm font-semibold text-primary sm:min-w-[200px]">
                    <Terminal className="h-3.5 w-3.5" aria-hidden />
                    {slug}
                  </code>
                  <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* Assistants */}
        <Section className="pt-0">
          <SectionHeading
            eyebrow="Works with"
            title="One MCP link for the assistants you already use"
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

        <LandingFaq title="Trndinn MCP server FAQ" items={FAQ} />

        <FinalCta
          title="Ready to run Trndinn from Claude?"
          subtitle="Generate a scoped API key, drop the config into your assistant, and ship content from any chat window."
          primaryLabel="Create an API key"
          primaryHref="/dashboard/api-keys"
          secondaryLabel={`See all ${TOTAL_TOOLS} tools`}
          secondaryHref="#tools"
        />
      </main>
    </MarketingShell>
  );
}
