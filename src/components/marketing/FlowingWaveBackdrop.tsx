"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/** Single-period wave 0→400; top edge y matches at x=0 and x=400 for seamless tiling. */
const WAVE_MAIN =
  "M0,92 C133.33,92 133.33,54 200,54 C266.67,54 266.67,92 400,92 L400,140 L0,140 Z";

const WAVE_SECOND =
  "M0,104 C133.33,104 133.33,72 200,72 C266.67,72 266.67,104 400,104 L400,140 L0,140 Z";

type FlowingWaveBackdropProps = {
  className?: string;
};

/**
 * Two complete periods in one SVG (0–800 viewBox); translate -50% loops without a seam.
 * Light + dark surface treatments; teal waves tuned per theme.
 */
export function FlowingWaveBackdrop({ className }: FlowingWaveBackdropProps) {
  const gid = useId().replace(/:/g, "");

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]", className)}
      aria-hidden
    >
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br",
          "from-sky-100/85 via-cyan-50/70 to-background",
          "dark:from-[#042f2e]/95 dark:via-[#0f172a]/80 dark:to-background",
        )}
      />

      <div
        className={cn(
          "absolute -left-[20%] top-[5%] h-[55%] w-[90%] rounded-full blur-[80px]",
          "bg-teal-400/20 motion-safe:animate-mesh-drift motion-reduce:animate-none",
          "dark:bg-teal-400/[0.12]",
        )}
      />
      <div
        className={cn(
          "absolute -right-[25%] bottom-[10%] h-[50%] w-[85%] rounded-full blur-[70px]",
          "bg-cyan-300/15 motion-safe:animate-mesh-drift motion-safe:[animation-delay:-7s] motion-reduce:animate-none",
          "dark:bg-cyan-400/[0.1]",
        )}
      />

      <div className="absolute inset-x-0 bottom-0 h-[52%] overflow-hidden">
        <div className="h-full w-[200%] motion-safe:animate-wave-seamless motion-reduce:animate-none will-change-transform">
          <svg
            className={cn("h-full w-full text-teal-500/[0.22] dark:text-teal-400/[0.28]")}
            viewBox="0 0 800 140"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={`${gid}-g1`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.92" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <path fill={`url(#${gid}-g1)`} d={WAVE_MAIN} />
            <path fill={`url(#${gid}-g1)`} d={WAVE_MAIN} transform="translate(400 0)" />
          </svg>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] overflow-hidden">
          <div className="h-full w-[200%] opacity-75 motion-safe:animate-wave-seamless-rev motion-reduce:animate-none will-change-transform dark:opacity-70">
            <svg
              className="h-full w-full text-cyan-400/[0.18] dark:text-cyan-300/[0.2]"
              viewBox="0 0 800 140"
              preserveAspectRatio="none"
            >
              <path fill="currentColor" d={WAVE_SECOND} />
              <path fill="currentColor" d={WAVE_SECOND} transform="translate(400 0)" />
            </svg>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t",
          "from-background via-background/25 to-background/95",
          "dark:via-background/20 dark:to-background/90",
        )}
      />
    </div>
  );
}
