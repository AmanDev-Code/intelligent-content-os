"use client";

import type { IconType } from "react-icons";
import {
  FaBluesky,
  FaDiscord,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaMastodon,
  FaPinterest,
  FaRedditAlien,
  FaTelegram,
  FaThreads,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { ArrowUpRight, BarChart3, CalendarClock, Images, PencilLine, Plus } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";
import { cn } from "@/lib/utils";

type Channel = { name: string; status?: string };

type ChannelMeta = { Icon: IconType; tone: string };

const CHANNEL_META: Record<string, ChannelMeta> = {
  linkedin: { Icon: FaLinkedinIn, tone: "text-[#0A66C2]" },
  x: { Icon: FaXTwitter, tone: "text-foreground" },
  twitter: { Icon: FaXTwitter, tone: "text-foreground" },
  instagram: { Icon: FaInstagram, tone: "text-[#E4405F]" },
  facebook: { Icon: FaFacebookF, tone: "text-[#1877F2]" },
  threads: { Icon: FaThreads, tone: "text-foreground" },
  youtube: { Icon: FaYoutube, tone: "text-[#FF0000]" },
  tiktok: { Icon: FaTiktok, tone: "text-foreground" },
  pinterest: { Icon: FaPinterest, tone: "text-[#E60023]" },
  bluesky: { Icon: FaBluesky, tone: "text-[#0285FF]" },
  mastodon: { Icon: FaMastodon, tone: "text-[#6364FF]" },
  reddit: { Icon: FaRedditAlien, tone: "text-[#FF4500]" },
  telegram: { Icon: FaTelegram, tone: "text-[#26A5E4]" },
  discord: { Icon: FaDiscord, tone: "text-[#5865F2]" },
};

function metaFor(name: string): ChannelMeta {
  return CHANNEL_META[name.trim().toLowerCase()] ?? { Icon: FaLinkedinIn, tone: "text-primary" };
}

function isLive(status?: string) {
  return (status ?? "").trim().toLowerCase() === "live";
}

export function ChannelCloud({
  title,
  subtitle,
  channels,
}: {
  title?: string;
  subtitle?: string;
  channels: Channel[];
}) {
  const live = channels.filter((c) => isLive(c.status));
  const roadmap = channels.filter((c) => !isLive(c.status));

  return (
    <Section>
      <SectionHeading
        title={title ?? "Publish to the accounts you connect"}
        subtitle={
          subtitle ??
          "Connect the channels you own and publish with your consent. LinkedIn is live today; more roll out as each one launches."
        }
      />

      <div className="mt-8 grid min-w-0 gap-5 lg:grid-cols-[0.9fr_1.6fr] lg:gap-6 md:mt-10">
        {/* Featured: live now */}
        <Reveal>
          <div className="relative flex h-full min-w-0 w-full max-w-full flex-col overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-primary/12 via-card/80 to-card/60 p-5 backdrop-blur-md dark:from-primary/15 dark:via-white/[0.05] dark:to-white/[0.02] sm:p-7">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-600 dark:text-emerald-400">
                <span className="relative inline-flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                Live now
              </span>
              {live.map(({ name }) => {
                const { Icon, tone } = metaFor(name);
                return (
                  <div key={name} className="mt-7 flex min-w-0 items-center gap-3 sm:gap-4">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-background/80 dark:bg-white/[0.06] sm:h-16 sm:w-16">
                      <Icon className={cn("h-7 w-7 sm:h-8 sm:w-8", tone)} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">{name}</p>
                      <p className="text-sm text-muted-foreground">Connect and publish today</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Capability chips - what you can do on the live channel today */}
            <div className="relative mt-6 flex min-w-0 flex-wrap gap-2">
              {[
                { Icon: CalendarClock, label: "Schedule" },
                { Icon: Images, label: "Carousels" },
                { Icon: BarChart3, label: "Analytics" },
                { Icon: PencilLine, label: "Drafts" },
              ].map(({ Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground dark:bg-white/[0.05]"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" aria-hidden />
                  {label}
                </span>
              ))}
            </div>

            {/* Connect-account affordance mock */}
            <div className="relative mt-5 flex min-w-0 flex-wrap items-center gap-2 rounded-2xl bg-muted/50 p-3 dark:bg-white/[0.05] sm:gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0A66C2]/10 text-[#0A66C2] sm:h-11 sm:w-11">
                <FaLinkedinIn className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1 basis-[min(100%,10rem)] leading-tight sm:basis-auto">
                <p className="truncate text-sm font-semibold text-foreground">Your LinkedIn account</p>
                <p className="truncate text-xs text-muted-foreground">Secure OAuth · disconnect anytime</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] px-3 py-1.5 text-xs font-semibold text-white">
                <Plus className="h-3.5 w-3.5" aria-hidden />
                Connect
              </span>
            </div>

            <p className="relative mt-5 min-w-0 text-sm leading-relaxed text-muted-foreground">
              You grant access, you stay in control, and you can disconnect anytime.
            </p>
          </div>
        </Reveal>

        {/* Roadmap grid */}
        <Reveal delay={100}>
          <div className="relative h-full min-w-0 w-full max-w-full overflow-hidden rounded-[1.75rem] bg-card/80 p-4 backdrop-blur-md dark:bg-white/[0.04] sm:p-6 lg:p-7">
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">On the roadmap</p>
              <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary">
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                Rolling out
              </span>
            </div>
            <ul className="mt-5 grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 md:grid-cols-4 md:gap-3">
              {roadmap.map(({ name }) => {
                const { Icon, tone } = metaFor(name);
                return (
                  <li
                    key={name}
                    className="group flex min-w-0 flex-col items-center gap-2 rounded-xl bg-muted/50 p-2.5 text-center transition-transform duration-300 hover:-translate-y-0.5 dark:bg-white/[0.05] sm:p-3"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background/70 transition-transform duration-300 group-hover:scale-105 dark:bg-white/[0.06] sm:h-10 sm:w-10">
                      <Icon className={cn("h-4 w-4 opacity-80 transition-opacity group-hover:opacity-100 sm:h-5 sm:w-5", tone)} aria-hidden />
                    </span>
                    <span className="w-full min-w-0 break-words text-[11px] font-medium leading-tight text-foreground/80 sm:text-[12px]">{name}</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 min-w-0 text-xs leading-relaxed text-muted-foreground">
              You connect the accounts you own as each channel launches. We comply with each platform&apos;s policies and
              delete platform data when you disconnect.
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
