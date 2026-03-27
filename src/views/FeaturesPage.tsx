"use client";

import Link from "next/link";
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clapperboard,
  Globe2,
  Linkedin,
  MessageCircle,
  Sparkles,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaRedditAlien, FaTwitch, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const channelRows = [
  { name: "LinkedIn", Icon: FaLinkedinIn, state: "Live now", tone: "text-sky-300" },
  { name: "X", Icon: FaXTwitter, state: "Roadmap", tone: "text-zinc-300" },
  { name: "Instagram", Icon: FaInstagram, state: "Roadmap", tone: "text-pink-300" },
  { name: "Facebook", Icon: FaFacebookF, state: "Roadmap", tone: "text-blue-300" },
  { name: "YouTube", Icon: FaYoutube, state: "Roadmap", tone: "text-red-300" },
  { name: "Twitch", Icon: FaTwitch, state: "Roadmap", tone: "text-purple-300" },
  { name: "Reddit", Icon: FaRedditAlien, state: "Roadmap", tone: "text-orange-300" },
];

export default function FeaturesPage() {
  const { session } = useAuth();
  const cta = session ? "/dashboard" : "/auth";

  return (
    <MarketingShell>
      <main className="pb-24">
        <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-card/70 via-card/40 to-primary/[0.08] p-8 text-center backdrop-blur-xl sm:p-12">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-background/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Platform depth, human clarity
            </p>
            <h1 className="mt-5 font-heading text-4xl font-black tracking-tight sm:text-6xl">
              Everything you need to sound like you and scale like a system
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-muted-foreground">
              Stitch-style feature architecture: AI creation core, channel expansion roadmap, reels pipeline,
              analytics loop, and Q3 outreach flow.
            </p>
            <Button className="mt-8 rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] px-8 font-semibold text-white" asChild>
              <Link href={cta}>Get started</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Zap, title: "AI captioning", text: "Context-aware drafts tuned for platform behavior and your tone." },
              { icon: MessageCircle, title: "Voice consistency", text: "Reusable style memory so output feels native to your brand." },
              { icon: Clapperboard, title: "Visual prompts", text: "Generate creative direction and assets from campaign intent." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-card/35 p-6 backdrop-blur-xl">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-4 font-heading text-xl font-semibold">{title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
          <div className="rounded-3xl border border-white/10 bg-card/35 p-8 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-primary">
              <Globe2 className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Channel rollout</span>
            </div>
            <h2 className="mt-3 font-heading text-3xl font-bold">One pipeline, many destinations</h2>
            <p className="mt-3 max-w-3xl text-muted-foreground">
              LinkedIn is live. The same scheduling discipline expands to X, Instagram, Facebook, YouTube, Twitch, and Reddit.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {channelRows.map(({ name, Icon, state, tone }) => (
                <div key={name} className="flex items-center justify-between rounded-xl border border-white/10 bg-background/45 px-4 py-3">
                  <span className={`inline-flex items-center gap-2 font-medium ${tone}`}>
                    <Icon className="h-4 w-4" />
                    {name}
                  </span>
                  <span className="text-[11px] uppercase text-muted-foreground">{state}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/30 to-background/20 p-8 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-primary">
                <Video className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">AI reels</span>
              </div>
              <h2 className="mt-3 font-heading text-3xl font-bold">One clip, all reels</h2>
              <p className="mt-3 text-muted-foreground">
                Upload once. Auto-cut for vertical formats. Add dynamic subtitles. Schedule by channel from the same queue.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Smart crop and face tracking</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Hook and opener variants</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Reel-level analytics by channel</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-card/35 p-8 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-primary">
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Predictive analytics</span>
              </div>
              <h2 className="mt-3 font-heading text-3xl font-bold">Signals that tell you what to repeat</h2>
              <p className="mt-3 text-muted-foreground">
                Measure trend velocity, consistency, and resonance. Replace vanity charts with practical next-post guidance.
              </p>
              <div className="mt-6 grid grid-cols-6 gap-2">
                {[28, 40, 52, 71, 86, 64].map((h, i) => (
                  <div key={i} className="h-24 rounded bg-gradient-to-t from-primary/45 to-primary/5" style={{ clipPath: `inset(${100 - h}% 0 0 0)` }} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
          <div className="rounded-3xl border border-cyan-500/25 bg-gradient-to-br from-cyan-500/10 to-card/30 p-8 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-cyan-300">
              <Users className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Q3 LinkedIn outreach</span>
            </div>
            <h2 className="mt-3 font-heading text-3xl font-bold">Turn connections into deliberate network growth</h2>
            <p className="mt-3 max-w-4xl text-muted-foreground">
              Planned outreach workflows target the right roles, regions, and intent signals. Build warm conversations,
              stronger network quality, and real lead progression.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full bg-background/50 px-3 py-1"><Linkedin className="h-4 w-4 text-cyan-300" /> ICP matching</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-background/50 px-3 py-1"><Calendar className="h-4 w-4 text-cyan-300" /> Follow-up sequences</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-background/50 px-3 py-1"><MessageCircle className="h-4 w-4 text-cyan-300" /> Human-first messaging</span>
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
