"use client";

import type { ReactNode } from "react";
import { useLayoutEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** ~344×882 and similar tall narrow phones — extra spacing + stretched SVG alignment */
const NARROW_PHONE_TIMELINE_MQ =
  "(min-width: 320px) and (max-width: 372px) and (min-height: 820px) and (max-height: 940px)";
/** iPad / tablet portrait ~768×1024 (and similar) — generous band so the query actually matches */
const TABLET_768X1024_MQ =
  "(min-width: 768px) and (max-width: 1024px) and (min-height: 900px) and (max-height: 1200px)";

function useNarrowPhoneTimelineLayout() {
  const [match, setMatch] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia(NARROW_PHONE_TIMELINE_MQ);
    const sync = () => setMatch(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return match;
}

function useTabletTimelineLayout() {
  const [match, setMatch] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia(TABLET_768X1024_MQ);
    const sync = () => setMatch(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return match;
}

export type EvolutionMilestone = {
  quarter: string;
  status: string;
  isLive: boolean;
  title: string;
  body: string;
  icons: ReactNode;
};

function statusColorClass(status: string) {
  const s = status.toLowerCase();
  if (s.includes("live")) return "et-status-live";
  if (s.includes("progress")) return "et-status-progress";
  if (s.includes("plan")) return "et-status-planned";
  return "text-muted-foreground";
}

type EvolutionTimelineProps = {
  milestones: EvolutionMilestone[];
  heading?: ReactNode;
};

const VIEW_W = 1000;

function estimateDesktopRowHeight(m: EvolutionMilestone) {
  const titleLines = Math.ceil((m.title?.length ?? 0) / 30);
  const bodyLines = Math.ceil((m.body?.length ?? 0) / 52);
  const statusLines = Math.ceil(`${m.quarter} ${m.status}`.length / 34);
  const iconRows = m.icons ? 1 : 0;

  const estimated =
    104 +
    statusLines * 14 +
    titleLines * 30 +
    bodyLines * 24 +
    iconRows * 28;

  return Math.max(176, Math.min(268, estimated));
}

function buildSnakeWaypoints(points: { x: number; y: number }[]) {
  if (points.length <= 1) return points;
  const waypoints: { x: number; y: number }[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const p = points[i - 1];
    const q = points[i];
    const midY = (p.y + q.y) / 2;
    waypoints.push({ x: p.x, y: midY }, { x: q.x, y: midY }, q);
  }
  return waypoints;
}

function roundedOrthogonalPath(points: { x: number; y: number }[], radius: number) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    if (!next) {
      d += ` L ${curr.x} ${curr.y}`;
      continue;
    }

    const inDX = Math.sign(curr.x - prev.x);
    const inDY = Math.sign(curr.y - prev.y);
    const outDX = Math.sign(next.x - curr.x);
    const outDY = Math.sign(next.y - curr.y);
    const turn = inDX !== outDX || inDY !== outDY;
    if (!turn) {
      d += ` L ${curr.x} ${curr.y}`;
      continue;
    }

    const inLen = Math.abs(curr.x - prev.x) + Math.abs(curr.y - prev.y);
    const outLen = Math.abs(next.x - curr.x) + Math.abs(next.y - curr.y);
    const r = Math.min(radius, inLen / 2, outLen / 2);

    const startX = curr.x - inDX * r;
    const startY = curr.y - inDY * r;
    const endX = curr.x + outDX * r;
    const endY = curr.y + outDY * r;

    d += ` L ${startX} ${startY} Q ${curr.x} ${curr.y} ${endX} ${endY}`;
  }

  return d;
}

function EvolutionTimelineMobile({
  milestones,
  heading,
  n,
}: {
  milestones: EvolutionMilestone[];
  heading?: ReactNode;
  n: number;
}) {
  const narrowPhone = useNarrowPhoneTimelineLayout();

  const MW = 400;
  const mobLeftX = 56;
  const mobRightX = MW - 56;
  const mobRowH = 180;
  const mobPadTop = 64;
  const mobPadBottom = 64;
  const mobR = 32;
  const mobGapBeforeQ2 = 44;
  const mobGapBeforeQ4 = 44;

  let yCursor = mobPadTop;
  const mobNodePts = milestones.map((_, i) => {
    const pt = {
      x: i % 2 === 0 ? mobLeftX : mobRightX,
      y: yCursor,
    };
    if (i < n - 1) {
      const extra = narrowPhone
        ? i === 0
          ? mobGapBeforeQ2
          : i === 2
            ? mobGapBeforeQ4
            : 0
        : 0;
      yCursor += mobRowH + extra;
    }
    return pt;
  });
  const mobH = yCursor + mobPadBottom;

  const mobWaypoints = buildSnakeWaypoints(mobNodePts);
  const mobPath = roundedOrthogonalPath(mobWaypoints, mobR);

  const mobLeftPct = (mobLeftX / MW) * 100;
  const mobRightPct = (mobRightX / MW) * 100;
  const mobNodeGap = 30;

  return (
    <div className={cn("relative md:hidden", heading ? "pt-0" : "pt-4")}>
      <div
        className="et-mob-stage relative mx-auto mt-3 w-full sm:mt-0"
        style={{ maxWidth: `${MW}px`, height: `${mobH}px` }}
      >
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${MW} ${mobH}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <path d={mobPath} fill="none" stroke="hsl(var(--primary)/.15)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <path d={mobPath} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <div className="absolute inset-0 z-[4] pointer-events-none">
          {milestones.map((m, i) => {
            const pt = mobNodePts[i];
            const left = `${(pt.x / MW) * 100}%`;
            const top = `${(pt.y / mobH) * 100}%`;
            return (
              <span
                key={`mob-node-${i}`}
                className={cn(
                  "absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground",
                  m.isLive && "et-node-live",
                )}
                style={{ left, top }}
              >
                Q{i + 1}
              </span>
            );
          })}
        </div>

        <div className="absolute inset-0 z-[3]">
          {milestones.map((m, i) => {
            const pt = mobNodePts[i];
            const isLeftNode = i % 2 === 0;
            const topPct = `${(pt.y / mobH) * 100}%`;
            const contentNudgeY = narrowPhone
              ? i === 0 || i === 2
                ? 10
                : i === 1 || i === 3
                  ? -10
                  : 0
              : 0;

            return (
              <div
                key={`mob-copy-${i}`}
                className="absolute"
                style={{
                  top: topPct,
                  transform: `translateY(calc(-50% + ${contentNudgeY}px))`,
                  ...(isLeftNode
                    ? { left: `calc(${mobLeftPct}% + ${mobNodeGap}px)`, right: "8px" }
                    : { right: `calc(${100 - mobRightPct}% + ${mobNodeGap}px)`, left: "8px" }),
                }}
              >
                <div className={cn("px-1", isLeftNode ? "text-left" : "text-right")}>
                  <div
                    className={cn(
                      "text-[clamp(0.52rem,1.55vw,0.62rem)] font-extrabold uppercase tracking-[0.12em]",
                      statusColorClass(m.status),
                      !isLeftNode && "text-right",
                    )}
                  >
                    {m.quarter} · {m.status}
                  </div>
                  <h4
                    className={cn(
                      "mt-0.5 font-heading text-[clamp(0.84rem,2.35vw,1.02rem)] font-bold leading-snug text-foreground",
                      !isLeftNode && "text-right",
                    )}
                  >
                    {m.title}
                  </h4>
                  <p
                    className={cn(
                      "mt-0.5 text-[clamp(0.68rem,1.95vw,0.82rem)] leading-snug text-muted-foreground",
                      !isLeftNode && "text-right",
                    )}
                  >
                    {m.body}
                  </p>
                  {m.icons ? (
                    <div
                      className={cn(
                        "et-icon-row mt-1.5 flex flex-wrap gap-1",
                        isLeftNode ? "justify-start" : "justify-end",
                      )}
                    >
                      {m.icons}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function milestoneCopy(m: EvolutionMilestone, opts: { align?: "left" | "right"; iconsJustify?: "start" | "end" }) {
  const { align = "left", iconsJustify = "start" } = opts;
  return (
    <div
      className={cn(
        "min-w-0",
        align === "right" && "text-right",
        align === "left" && "text-left",
      )}
    >
      <div
        className={cn(
          "text-[clamp(0.58rem,0.75vw,0.68rem)] font-extrabold uppercase tracking-[0.14em]",
          statusColorClass(m.status),
          align === "right" && "text-right",
        )}
      >
        {m.quarter} · {m.status}
      </div>
      <h4 className={cn("mt-1.5 font-heading text-[clamp(1rem,1.55vw,1.2rem)] font-bold leading-snug text-foreground")}>
        {m.title}
      </h4>
      <p className={cn("mt-2 text-[clamp(0.8rem,1.05vw,0.95rem)] leading-relaxed text-muted-foreground")}>{m.body}</p>
      {m.icons ? (
        <div
          className={cn(
            "et-icon-row mt-3 flex flex-wrap gap-1.5",
            iconsJustify === "end" && "justify-end",
            iconsJustify === "start" && "justify-start",
          )}
        >
          {m.icons}
        </div>
      ) : null}
    </div>
  );
}

export function EvolutionTimeline({ milestones, heading }: EvolutionTimelineProps) {
  const n = milestones.length;
  const tablet768x1024 = useTabletTimelineLayout();

  // ── Desktop geometry: extra row height on tablet so copy clears the horizontal connectors (padding alone was invisible while centered)
  const tabletRowExtraPx = tablet768x1024 ? ([56, 80, 80, 56] as const) : null;
  const rowHeights = milestones.map((m, i) => {
    const base = estimateDesktopRowHeight(m);
    return base + (tabletRowExtraPx?.[i] ?? 0);
  });
  const stageHeight = Math.max(
    rowHeights.reduce((sum, h) => sum + h, 0),
    170,
  );
  const leftX = 88;
  const rightX = 912;
  let yCursor = 0;
  const nodePoints = milestones.map((_, i) => {
    const y = yCursor + rowHeights[i] / 2;
    yCursor += rowHeights[i];
    return {
      x: i % 2 === 0 ? leftX : rightX,
      y,
    };
  });
  const waypoints = buildSnakeWaypoints(nodePoints);
  const pathD = roundedOrthogonalPath(waypoints, 28);

  const leftCenterPct = (leftX / VIEW_W) * 100;
  const rightCenterPct = (rightX / VIEW_W) * 100;
  const nodeRadiusPx = 20;
  const pathGapPx = 12;
  const nodeEdgeGap = nodeRadiusPx + pathGapPx;

  return (
    <div data-evolution-timeline="" className="et">
      <style>{`
        [data-evolution-timeline] .et-stage-desktop {
          position: relative;
          width: 100%;
          aspect-ratio: ${VIEW_W} / ${stageHeight};
          max-width: 100%;
        }
        [data-evolution-timeline] .et-path-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        [data-evolution-timeline] .et-path-svg {
          width: 100%;
          height: 100%;
          display: block;
        }
        [data-evolution-timeline] .et-path {
          fill: none;
          stroke: hsl(var(--primary));
          stroke-width: 2.8;
          stroke-linecap: round;
          stroke-linejoin: round;
          vector-effect: non-scaling-stroke;
        }
        [data-evolution-timeline] .et-path-glow {
          fill: none;
          stroke: hsl(var(--primary));
          stroke-width: 6;
          stroke-linecap: round;
          stroke-linejoin: round;
          opacity: 0.12;
          vector-effect: non-scaling-stroke;
        }
        [data-evolution-timeline] .et-desktop-nodes {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 4;
        }
        [data-evolution-timeline] .et-desktop-rows {
          position: absolute;
          inset: 0;
          z-index: 3;
          display: flex;
          flex-direction: column;
        }
        [data-evolution-timeline] .et-desktop-row {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: flex-start;
        }
        [data-evolution-timeline] .et-status-live {
          color: #f00;
        }
        [data-evolution-timeline] .et-status-progress {
          color: hsl(217 91% 60%);
        }
        :is(.dark) [data-evolution-timeline] .et-status-progress {
          color: hsl(217 91% 65%);
        }
        [data-evolution-timeline] .et-status-planned {
          color: hsl(45 93% 47%);
        }
        :is(.dark) [data-evolution-timeline] .et-status-planned {
          color: hsl(45 93% 58%);
        }
        @keyframes etLivePulse {
          0%, 100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0.45); }
          50% { box-shadow: 0 0 0 6px hsl(var(--primary) / 0.12); }
        }
        [data-evolution-timeline] .et-node-live {
          animation: etLivePulse 2s ease-in-out infinite;
        }
        [data-evolution-timeline] .et-icon-row > * {
          transform: scale(0.9);
          transform-origin: center;
        }
        [data-evolution-timeline] .et-icon-row svg {
          width: 0.9rem;
          height: 0.9rem;
        }
        @media (min-width: 640px) {
          [data-evolution-timeline] .et-icon-row > * {
            transform: scale(1);
          }
          [data-evolution-timeline] .et-icon-row svg {
            width: 1rem;
            height: 1rem;
          }
        }
      `}</style>

      <div
        className="relative overflow-hidden rounded-[28px] bg-transparent text-card-foreground"
        role="region"
        aria-label="Product roadmap timeline"
      >
        {heading ? (
          <div className="mb-6 max-w-3xl space-y-3 px-5 pt-7 sm:mb-8 sm:px-8 sm:pt-10 [&_h2]:text-foreground [&_h3]:text-foreground [&_h4]:text-foreground [&_p]:text-muted-foreground">
            {heading}
          </div>
        ) : null}

        {/* ── MOBILE: winding-road snake timeline ── */}
        <EvolutionTimelineMobile milestones={milestones} heading={heading} n={n} />

        {/* ── DESKTOP: snake timeline (unchanged) ── */}
        <div
          className={cn(
            "et-stage-desktop mx-auto hidden max-w-full px-3 pb-8 sm:px-5 md:block md:px-6 md:pb-10",
            heading ? "mt-0" : "mt-2",
          )}
        >
          <div className="et-path-layer" aria-hidden>
            <svg className="et-path-svg" viewBox={`0 0 ${VIEW_W} ${stageHeight}`} preserveAspectRatio="xMidYMid meet">
              <path d={pathD} className="et-path-glow" />
              <path d={pathD} className="et-path" />
            </svg>
          </div>
          <div className="et-desktop-nodes" aria-hidden>
            {milestones.map((m, i) => {
              const p = nodePoints[i];
              const left = `${(p.x / VIEW_W) * 100}%`;
              const top = `${(p.y / stageHeight) * 100}%`;
              return (
                <span
                  key={`${m.quarter}-${m.title}-node-${i}`}
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-primary-foreground",
                    m.isLive && "et-node-live",
                  )}
                  style={{ left, top }}
                >
                  Q{i + 1}
                </span>
              );
            })}
          </div>

          <div className="et-desktop-rows px-3 sm:px-5">
            {milestones.map((m, i) => {
              const leftSide = i % 2 === 0;
              const leftCopyStart = `calc(${leftCenterPct}% + ${nodeEdgeGap}px)`;
              const rightCopyEnd = `calc(${100 - rightCenterPct}% + ${nodeEdgeGap}px)`;
              return (
                <div
                  key={`${m.quarter}-${m.title}-d-${i}`}
                  className="et-desktop-row"
                  style={{ height: `${rowHeights[i]}px` }}
                >
                  {leftSide ? (
                    <div
                      className="absolute w-[min(42%,560px)] max-w-full pr-3"
                      style={{
                        top: "50%",
                        left: leftCopyStart,
                        transform: "translateY(-50%)",
                      }}
                    >
                      <div className="flex max-w-full flex-col justify-center py-1">
                        {milestoneCopy(m, { align: "left", iconsJustify: "start" })}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="absolute w-[min(42%,560px)] max-w-full pl-3"
                      style={{
                        top: "50%",
                        right: rightCopyEnd,
                        transform: "translateY(-50%)",
                      }}
                    >
                      <div className="flex max-w-full flex-col justify-center py-1">
                        {milestoneCopy(m, { align: "right", iconsJustify: "end" })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
