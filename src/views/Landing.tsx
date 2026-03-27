"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clapperboard,
  Linkedin,
  Sparkles,
  Target,
  Video,
  Zap,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaRedditAlien,
  FaTwitch,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const channels = [
  { name: "LinkedIn", Icon: FaLinkedinIn, status: "Live", tone: "text-sky-300 bg-sky-500/10" },
  { name: "X", Icon: FaXTwitter, status: "Roadmap", tone: "text-zinc-300 bg-zinc-500/10" },
  { name: "Instagram", Icon: FaInstagram, status: "Roadmap", tone: "text-pink-300 bg-pink-500/10" },
  { name: "Facebook", Icon: FaFacebookF, status: "Roadmap", tone: "text-blue-300 bg-blue-500/10" },
  { name: "YouTube", Icon: FaYoutube, status: "Roadmap", tone: "text-red-300 bg-red-500/10" },
  { name: "Twitch", Icon: FaTwitch, status: "Roadmap", tone: "text-purple-300 bg-purple-500/10" },
  { name: "Reddit", Icon: FaRedditAlien, status: "Roadmap", tone: "text-orange-300 bg-orange-500/10" },
];

const roadmap = [
  {
    quarter: "Q2",
    status: "Live now",
    title: "LinkedIn + Core OS",
    body: "AI creation, calendar scheduling, media library, analytics, and billing are in production.",
  },
  {
    quarter: "Q3",
    status: "In progress",
    title: "Multi-channel publishing",
    body: "X, Instagram, Facebook, and YouTube scheduling with unified queue and reporting.",
  },
  {
    quarter: "Q3",
    status: "In progress",
    title: "LinkedIn outreach engine",
    body: "Intent-based connection paths to build a network and lead pipeline that fits your ICP.",
  },
  {
    quarter: "Q4",
    status: "Planned",
    title: "Twitch + Reddit expansion",
    body: "Community-led workflows and format-aware automation for conversation channels.",
  },
];

export default function Landing() {
  const { session } = useAuth();
  const primaryHref = session ? "/dashboard" : "/auth";
  const primaryLabel = session ? "Open your workspace" : "Start free";

  return (
    <MarketingShell>
      <main>
        <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pt-16">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_20%,rgba(255,138,31,0.16),transparent_45%)]" />
          <div className="mx-auto max-w-6xl">
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-card/80 via-card/55 to-primary/[0.08] p-8 shadow-2xl backdrop-blur-2xl sm:p-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-background/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                The Kinetic Curator Social OS
              </span>
              <h1 className="mt-6 max-w-5xl font-heading text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl lg:leading-[1.02]">
                One pulse for{" "}
                <span className="bg-gradient-to-r from-[#ffc14a] via-[#ff8a1f] to-[#ff5d4f] bg-clip-text text-transparent">
                  all your channels
                </span>
                .
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Trndinn is the premium operating system for modern creators and teams. Build content, schedule across
                channels, generate AI reels, and track engagement from one glass-like control layer.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] px-8 font-semibold text-white shadow-xl shadow-primary/25"
                  asChild
                >
                  <Link href={primaryHref}>
                    {primaryLabel}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 rounded-full border-white/20 bg-background/45" asChild>
                  <Link href="/features">See the platform</Link>
                </Button>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {channels.map(({ name, Icon, status, tone }) => (
                  <div key={name} className="flex items-center justify-between rounded-xl border border-white/10 bg-card/35 px-4 py-3">
                    <span className={cn("inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold", tone)}>
                      <Icon className="h-3.5 w-3.5" />
                      {name}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/5 bg-muted/20 py-10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-4 text-sm text-muted-foreground sm:px-6">
            <span className="font-semibold uppercase tracking-[0.16em]">Built for multi-platform growth</span>
            <span className="inline-flex items-center gap-2"><Linkedin className="h-4 w-4 text-primary" /> LinkedIn live</span>
            <span className="inline-flex items-center gap-2"><Clapperboard className="h-4 w-4 text-primary" /> AI reels coming</span>
            <span className="inline-flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Outreach in Q3</span>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="rounded-3xl border border-white/10 bg-card/40 p-8 backdrop-blur-xl lg:col-span-7">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">The Engine</span>
              <h2 className="mt-3 font-heading text-3xl font-bold">AI content creation with brand memory</h2>
              <p className="mt-3 max-w-lg text-muted-foreground">
                Go from rough idea to post-ready drafts, hooks, variants, and repurposed threads with your tone baked in.
              </p>
              <div className="mt-8 rounded-2xl border border-white/10 bg-background/50 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                  <Zap className="h-4 w-4 text-primary" />
                  Prompt-to-publish pipeline
                </div>
                <div className="space-y-2">
                  <div className="h-2 rounded bg-white/10" />
                  <div className="h-2 w-2/3 rounded bg-white/10" />
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-card/40 p-8 backdrop-blur-xl lg:col-span-5">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">The Matrix</span>
              <h2 className="mt-3 font-heading text-3xl font-bold">Scheduling that feels effortless</h2>
              <p className="mt-3 text-muted-foreground">
                Plan weekly and monthly drops with confidence. Queue, retry, and performance windows are all in one calendar.
              </p>
              <div className="mt-8 grid grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "aspect-square rounded-lg border",
                      i === 2 || i === 5
                        ? "border-primary/40 bg-primary/20"
                        : "border-white/10 bg-background/45",
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-card/40 p-8 backdrop-blur-xl lg:col-span-5">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">The Studio</span>
              <h2 className="mt-3 font-heading text-3xl font-bold">One clip, all reels</h2>
              <p className="mt-3 text-muted-foreground">
                Upload once, auto-cut for vertical channels, generate caption layers, then schedule by channel.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Smart face tracking</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Kinetic subtitle styles</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Hook-level analytics</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-card/40 p-8 backdrop-blur-xl lg:col-span-7">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">The Intelligence</span>
              <h2 className="mt-3 font-heading text-3xl font-bold">Predictive analytics, not vanity dashboards</h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Track cadence quality, engagement quality, and winning content patterns so the next post is smarter.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-5">
                {[35, 52, 40, 68, 88].map((h, idx) => (
                  <div key={idx} className="rounded-xl border border-primary/20 bg-gradient-to-t from-primary/30 to-transparent p-2">
                    <div className="h-24 w-full rounded bg-primary/20" style={{ clipPath: `inset(${100 - h}% 0 0 0)` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background/60 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-center font-heading text-3xl font-black sm:text-4xl">Evolution timeline</h2>
            <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
              Clear execution path from LinkedIn-first to full multi-channel growth OS.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {roadmap.map((item) => (
                <div key={`${item.quarter}-${item.title}`} className="rounded-2xl border border-white/10 bg-card/35 p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">{item.quarter}</span>
                    <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">
                      {item.status}
                    </span>
                  </div>
                  <h3 className="mt-3 font-heading text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-5xl rounded-[2rem] border border-primary/25 bg-gradient-to-r from-primary/15 via-card/45 to-red-500/10 px-8 py-12 text-center backdrop-blur-2xl">
            <Video className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-4 font-heading text-3xl font-black tracking-tight sm:text-4xl">
              Ready to orchestrate your growth?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Replace tool chaos with one premium workflow for planning, publishing, outreach, and performance.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button className="rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] px-8 font-semibold text-white" asChild>
                <Link href={primaryHref}>{primaryLabel}</Link>
              </Button>
              <Button variant="outline" className="rounded-full border-white/20 bg-background/40" asChild>
                <Link href="/pricing">View pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
