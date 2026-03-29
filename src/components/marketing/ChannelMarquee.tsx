"use client";

import type { IconType } from "react-icons";
import { cn } from "@/lib/utils";

export type MarqueeChannel = { name: string; Icon: IconType; status: string; tone: string };

type ChannelMarqueeProps = {
  channels: MarqueeChannel[];
  className?: string;
  durationSec?: number;
};

export function ChannelMarquee({ channels, className, durationSec }: ChannelMarqueeProps) {
  const loop = [...channels, ...channels];

  return (
    <div
      className={cn(
        "relative overflow-hidden py-4",
        "[mask-image:linear-gradient(90deg,transparent,black_4%,black_96%,transparent)]",
        className,
      )}
    >
      <div
        className="flex w-max animate-marquee gap-4 sm:gap-5 motion-reduce:animate-none"
        style={durationSec ? { animationDuration: `${durationSec}s` } : undefined}
      >
        {loop.map(({ name, Icon, status, tone }, i) => (
          <div
            key={`${name}-${i}`}
            className="group inline-flex shrink-0 items-center gap-3 rounded-2xl border border-border/60 bg-card/70 px-5 py-3 backdrop-blur-sm transition-colors hover:border-primary/30 dark:border-white/8 dark:bg-card/40 sm:gap-4 sm:px-6 sm:py-3.5"
          >
            <span className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60 transition-transform group-hover:scale-110 dark:bg-white/[0.06] sm:h-11 sm:w-11",
            )}>
              <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", tone)} aria-hidden />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground sm:text-base">{name}</span>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider sm:text-[11px]",
                status === "Live" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
              )}>
                {status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
