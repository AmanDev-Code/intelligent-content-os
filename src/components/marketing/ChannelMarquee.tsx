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
        "relative overflow-hidden py-3",
        "[mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]",
        className,
      )}
    >
      <div
        className="flex w-max animate-marquee gap-2.5 sm:gap-3 motion-reduce:animate-none"
        style={durationSec ? { animationDuration: `${durationSec}s` } : undefined}
      >
        {loop.map(({ name, Icon, status, tone }, i) => (
          <div
            key={`${name}-${i}`}
            className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-border/70 bg-card/80 px-3.5 py-1.5 backdrop-blur-sm dark:border-white/10 dark:bg-card/45 sm:px-4 sm:py-2"
          >
            <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", tone)}>
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {name}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
