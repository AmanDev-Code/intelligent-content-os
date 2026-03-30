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
        "relative overflow-hidden py-3 sm:py-4",
        "[mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background/90 via-background/40 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background/90 via-background/40 to-transparent"
        aria-hidden
      />
      <div
        className="flex w-max animate-marquee gap-3 sm:gap-4 motion-reduce:animate-none"
        style={durationSec ? { animationDuration: `${durationSec}s` } : undefined}
      >
        {loop.map(({ name, Icon, status, tone }, i) => (
          <div
            key={`${name}-${i}`}
            className={cn(
              "group relative inline-flex h-[90px] w-[120px] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-3 backdrop-blur-md transition-all duration-300",
              "border-border/60 bg-card/70 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/90",
              "dark:border-white/10 dark:bg-white/[0.045] dark:hover:bg-white/[0.08]",
              "sm:h-[96px] sm:w-[132px] sm:px-4 sm:py-3.5",
            )}
          >
            <span
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-xl bg-background/70",
                "transition-transform duration-300 group-hover:scale-105 dark:bg-black/20",
                "sm:h-11 sm:w-11",
              )}
            >
              <Icon className={cn("h-5.5 w-5.5 sm:h-6 sm:w-6", tone)} aria-hidden />
            </span>

            <div className="flex flex-col items-center leading-tight">
              <span
                className={cn(
                  "inline-flex items-center gap-1 whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.08em] sm:text-[10px]",
                  status === "Live" ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
                )}
              >
                {status === "Live" ? (
                  <span className="relative inline-flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                ) : (
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                )}
                {status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
