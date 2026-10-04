"use client";

/**
 * ImageCompareSlider — Mantine-style before/after image comparison.
 *
 * Two images stacked with clip-path polygon, draggable vertical divider,
 * document-level pointer events for smooth drag, fullscreen mode,
 * keyboard accessible (arrows, shift+arrows, home/end).
 *
 * No external dependencies — pure React + Tailwind + pointer events.
 * Design tokens: --tool-border, --tool-surface, --tool-surface-dim.
 * Icons: Lucide only. prefers-reduced-motion safe.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ImageCompareSliderProps {
  /** Object URL or src for the "before" (original) image */
  beforeSrc: string;
  /** Object URL or src for the "after" (processed) image */
  afterSrc: string;
  /** Label for the before side */
  beforeLabel?: string;
  /** Label for the after side */
  afterLabel?: string;
  /** Initial slider position (0-100). Default 50. */
  initialPosition?: number;
  /** Show fullscreen toggle button */
  showFullscreenButton?: boolean;
  /** Additional className for the outer container */
  className?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ImageCompareSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "Original",
  afterLabel = "Compressed",
  initialPosition = 50,
  showFullscreenButton = true,
  className = "",
}: ImageCompareSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(initialPosition);
  const isDraggingRef = useRef(false);

  const [position, setPosition] = useState(initialPosition);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const bothLoaded = imagesLoaded >= 2;

  // Stable ref for position updates (avoids stale closures in document listeners)
  const updatePositionRef = useRef<(clientX: number) => void>(() => {});
  updatePositionRef.current = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = clamp((x / rect.width) * 100, 1, 99);
    positionRef.current = pct;
    setPosition(pct);
  };

  // ── Document-level drag handlers ──────────────────────────────────────

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    updatePositionRef.current(e.clientX);
  }, []);

  const onPointerUp = useCallback(() => {
    isDraggingRef.current = false;
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, [onPointerMove]);

  const onSliderPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isDraggingRef.current = true;
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
      updatePositionRef.current(e.clientX);
      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
    },
    [onPointerMove, onPointerUp]
  );

  // Also allow clicking anywhere on the container to reposition
  const onContainerPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only if clicking on the container itself, not the handle
      if ((e.target as HTMLElement).closest("[data-slider-handle]")) return;
      isDraggingRef.current = true;
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
      updatePositionRef.current(e.clientX);
      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
    },
    [onPointerMove, onPointerUp]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [onPointerMove, onPointerUp]);

  // ── Keyboard ──────────────────────────────────────────────────────────

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    let next = positionRef.current;
    const step = e.shiftKey ? 10 : 1;

    switch (e.key) {
      case "ArrowLeft":
        next = clamp(next - step, 1, 99);
        break;
      case "ArrowRight":
        next = clamp(next + step, 1, 99);
        break;
      case "Home":
        next = 1;
        break;
      case "End":
        next = 99;
        break;
      default:
        return;
    }
    e.preventDefault();
    positionRef.current = next;
    setPosition(next);
  }, []);

  // ── Fullscreen ────────────────────────────────────────────────────────

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((f) => !f);
  }, []);

  // Close fullscreen on Escape
  useEffect(() => {
    if (!isFullscreen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsFullscreen(false);
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isFullscreen]);

  // ── Image load tracking ───────────────────────────────────────────────

  const onImageLoad = useCallback(() => {
    setImagesLoaded((c) => c + 1);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────

  const containerClasses = cn(
    "relative select-none overflow-hidden rounded-xl",
    "border border-[hsl(var(--tool-border))]",
    isFullscreen
      ? "fixed inset-0 z-50 rounded-none border-none"
      : className
  );

  return (
    <>
      {/* Fullscreen backdrop */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsFullscreen(false)}
          aria-hidden
        />
      )}

      <div
        ref={containerRef}
        className={containerClasses}
        style={{
          touchAction: "none",
          background: "hsl(var(--tool-surface-dim))",
          aspectRatio: isFullscreen ? undefined : undefined,
        }}
        onPointerDown={onContainerPointerDown}
      >
        {/* ── Before image (left side) ── */}
        <img
          src={beforeSrc}
          alt={beforeLabel}
          className="absolute inset-0 h-full w-full object-contain"
          style={{ clipPath: `polygon(0 0, ${position}% 0, ${position}% 100%, 0 100%)` }}
          draggable={false}
          onLoad={onImageLoad}
        />

        {/* ── After image (right side) ── */}
        <img
          src={afterSrc}
          alt={afterLabel}
          className="absolute inset-0 h-full w-full object-contain"
          style={{ clipPath: `polygon(${position}% 0, 100% 0, 100% 100%, ${position}% 100%)` }}
          draggable={false}
          onLoad={onImageLoad}
        />

        {/* ── Divider line ── */}
        <div
          className="absolute top-0 bottom-0 z-10 w-[2px] pointer-events-none"
          style={{
            left: `${position}%`,
            transform: "translateX(-50%)",
            background: "white",
            boxShadow: "0 0 12px rgba(0,0,0,0.5), 0 0 4px rgba(255,255,255,0.3)",
          }}
        />

        {/* ── Drag handle ── */}
        <div
          data-slider-handle
          className="absolute top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border-2 border-white shadow-xl transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          style={{
            left: `${position}%`,
            transform: `translateX(-50%) translateY(-50%)`,
            background: "hsl(var(--tool-surface))",
            boxShadow: "0 0 16px rgba(0,0,0,0.4), 0 0 40px rgba(249,115,22,0.15)",
          }}
          role="slider"
          tabIndex={0}
          aria-label="Image comparison slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          onPointerDown={onSliderPointerDown}
          onKeyDown={onKeyDown}
        >
          <ChevronLeft className="h-3.5 w-3.5 text-white -mr-0.5" aria-hidden />
          <ChevronRight className="h-3.5 w-3.5 text-white -ml-0.5" aria-hidden />
        </div>

        {/* ── Labels ── */}
        {bothLoaded && (
          <>
            <div
              className="absolute top-3 left-3 z-10 rounded-lg px-2.5 py-1 text-[11px] font-bold text-white transition-opacity duration-200"
              style={{
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(8px)",
                opacity: position > 12 ? 1 : 0,
              }}
            >
              {beforeLabel}
            </div>
            <div
              className="absolute top-3 right-3 z-10 rounded-lg px-2.5 py-1 text-[11px] font-bold text-white transition-opacity duration-200"
              style={{
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(8px)",
                opacity: position < 88 ? 1 : 0,
              }}
            >
              {afterLabel}
            </div>
          </>
        )}

        {/* ── Fullscreen toggle ── */}
        {showFullscreenButton && bothLoaded && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
            className="absolute bottom-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
            aria-label={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" aria-hidden />
            ) : (
              <Maximize2 className="h-4 w-4" aria-hidden />
            )}
          </button>
        )}

        {/* ── Zoom controls (fullscreen only) ── */}
        {isFullscreen && (
          <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
              className="flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/10"
              style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
            >
              <Minimize2 className="h-3.5 w-3.5" aria-hidden />
              Exit fullscreen
            </button>
          </div>
        )}

        {/* ── Loading state ── */}
        {!bothLoaded && (
          <div className="absolute inset-0 z-30 flex items-center justify-center" style={{ background: "hsl(var(--tool-surface-dim))" }}>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          </div>
        )}
      </div>
    </>
  );
}
