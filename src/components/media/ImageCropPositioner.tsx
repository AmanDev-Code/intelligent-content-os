"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  parseStoredPosition,
  formatPositionForStorage,
} from "@/lib/blogFeaturedImagePosition";

export type CropContext = {
  label: string;
  aspectRatio: string; // e.g. "16/9"
};

export type ImageCropPositionerProps = {
  imageUrl: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  /** Aspect ratio contexts to preview. Defaults to both hero (16:9) and cards (16:10). */
  contexts?: CropContext[];
};

const DEFAULT_CONTEXTS: CropContext[] = [
  { label: "Blog hero (16:9)", aspectRatio: "16/9" },
  { label: "Index cards (16:10)", aspectRatio: "16/10" },
];

function parseAspectRatio(ar: string): number {
  const [w, h] = ar.split("/").map(Number);
  return w / h;
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

/** Convert stored value to posX/posY percentages */
function storedToPosition(value: string): { x: number; y: number } {
  const parsed = parseStoredPosition(value);
  if (parsed.type === "custom" && parsed.x !== undefined && parsed.y !== undefined) {
    return { x: parsed.x, y: parsed.y };
  }
  // Map presets to percentages
  switch (parsed.preset) {
    case "left": return { x: 0, y: 50 };
    case "right": return { x: 100, y: 50 };
    case "top": return { x: 50, y: 0 };
    case "bottom": return { x: 50, y: 100 };
    case "center":
    default: return { x: 50, y: 50 };
  }
}

export function ImageCropPositioner({
  imageUrl,
  value,
  onChange,
  label = "Crop position",
  contexts = DEFAULT_CONTEXTS,
}: ImageCropPositionerProps) {
  const [open, setOpen] = useState(false);
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync from stored value when dialog opens
  useEffect(() => {
    if (open) {
      const pos = storedToPosition(value);
      setPosX(pos.x);
      setPosY(pos.y);
    }
  }, [open, value]);

  // Load natural dimensions
  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalW(img.naturalWidth);
    setNaturalH(img.naturalHeight);
  }, []);

  // Compute frame dimensions and position for the active aspect ratio
  const frameInfo = useMemo(() => {
    if (!naturalW || !naturalH || !containerRef.current) return null;
    const containerWidth = containerRef.current.clientWidth;
    const scale = containerWidth / naturalW;
    const displayW = containerWidth;
    const displayH = naturalH * scale;
    const targetAspect = parseAspectRatio(contexts[activeTab]?.aspectRatio || "16/9");
    const imageAspect = displayW / displayH;

    let frameW: number;
    let frameH: number;

    if (imageAspect > targetAspect) {
      // Image is wider — height fills, width crops
      frameH = displayH;
      frameW = frameH * targetAspect;
    } else {
      // Image is taller — width fills, height crops
      frameW = displayW;
      frameH = frameW / targetAspect;
    }

    const maxOffsetX = displayW - frameW;
    const maxOffsetY = displayH - frameH;
    const frameLeft = (posX / 100) * maxOffsetX;
    const frameTop = (posY / 100) * maxOffsetY;

    return { displayW, displayH, frameW, frameH, frameLeft, frameTop, maxOffsetX, maxOffsetY };
  }, [naturalW, naturalH, posX, posY, activeTab, contexts]);

  // Drag handling
  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStartRef.current = { x: clientX, y: clientY, posX, posY };
  }, [posX, posY]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!dragStartRef.current || !frameInfo) return;
    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;

    // Invert: dragging image right = showing left area = decrease posX
    const newX = frameInfo.maxOffsetX > 0
      ? clamp(dragStartRef.current.posX - (deltaX / frameInfo.maxOffsetX) * 100, 0, 100)
      : 50;
    const newY = frameInfo.maxOffsetY > 0
      ? clamp(dragStartRef.current.posY - (deltaY / frameInfo.maxOffsetY) * 100, 0, 100)
      : 50;

    setPosX(newX);
    setPosY(newY);
  }, [frameInfo]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  // Global mouse move/up to catch drag outside container
  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
    const onUp = () => handleDragEnd();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    handleDragStart(t.clientX, t.clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const t = e.touches[0];
    handleDragMove(t.clientX, t.clientY);
  };

  const onTouchEnd = () => handleDragEnd();

  // Apply and cancel
  const handleApply = () => {
    onChange(formatPositionForStorage(posX, posY));
    setOpen(false);
  };

  const handleReset = () => {
    setPosX(50);
    setPosY(50);
  };

  // Presets
  const presets = [
    { label: "Left", x: 0, y: 50 },
    { label: "Center", x: 50, y: 50 },
    { label: "Right", x: 100, y: 50 },
    { label: "Top", x: 50, y: 0 },
    { label: "Bottom", x: 50, y: 100 },
  ];

  // Determine if image matches active ratio perfectly (no crop needed)
  const noCropNeeded = useMemo(() => {
    if (!naturalW || !naturalH) return false;
    const targetAspect = parseAspectRatio(contexts[activeTab]?.aspectRatio || "16/9");
    const imageAspect = naturalW / naturalH;
    return Math.abs(imageAspect - targetAspect) < 0.02;
  }, [naturalW, naturalH, activeTab, contexts]);

  return (
    <div className="space-y-2">
      {/* Inline preview thumbnail */}
      <div className="flex items-center gap-3">
        <div
          className="relative h-12 w-20 overflow-hidden rounded-md border border-border/60 bg-muted"
          style={{ aspectRatio: contexts[0]?.aspectRatio || "16/9" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
            style={{ objectPosition: `${posX}% ${posY}%` }}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={() => setOpen(true)}
        >
          <Move className="h-3 w-3" />
          Adjust crop
        </Button>
        {value && value !== "center" && value !== "" && (
          <span className="text-[10px] text-muted-foreground">
            Position: {Math.round(storedToPosition(value).x)}%, {Math.round(storedToPosition(value).y)}%
          </span>
        )}
      </div>

      {/* Crop dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
            <DialogDescription>
              Drag the image to choose which area is visible when cropped. The bright area is what viewers will see.
            </DialogDescription>
          </DialogHeader>

          {/* Aspect ratio tabs */}
          {contexts.length > 1 && (
            <div className="flex gap-1 rounded-lg bg-muted p-1">
              {contexts.map((ctx, i) => (
                <button
                  key={i}
                  type="button"
                  className={cn(
                    "flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    activeTab === i
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => setActiveTab(i)}
                >
                  {ctx.label}
                </button>
              ))}
            </div>
          )}

          {/* Interactive crop area */}
          <div
            ref={containerRef}
            className={cn(
              "relative select-none overflow-hidden rounded-lg border border-border/60 bg-muted",
              isDragging ? "cursor-grabbing" : "cursor-grab",
            )}
            style={{ touchAction: "none" }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Full image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt=""
              className="w-full"
              onLoad={handleImageLoad}
              draggable={false}
            />

            {/* Overlay mask + frame */}
            {frameInfo && !noCropNeeded && (
              <div className="pointer-events-none absolute inset-0">
                {/* Top mask */}
                <div
                  className="absolute left-0 right-0 top-0 bg-black/50"
                  style={{ height: frameInfo.frameTop }}
                />
                {/* Bottom mask */}
                <div
                  className="absolute bottom-0 left-0 right-0 bg-black/50"
                  style={{ height: frameInfo.displayH - frameInfo.frameTop - frameInfo.frameH }}
                />
                {/* Left mask */}
                <div
                  className="absolute bg-black/50"
                  style={{
                    top: frameInfo.frameTop,
                    left: 0,
                    width: frameInfo.frameLeft,
                    height: frameInfo.frameH,
                  }}
                />
                {/* Right mask */}
                <div
                  className="absolute bg-black/50"
                  style={{
                    top: frameInfo.frameTop,
                    right: 0,
                    width: frameInfo.displayW - frameInfo.frameLeft - frameInfo.frameW,
                    height: frameInfo.frameH,
                  }}
                />
                {/* Frame border */}
                <div
                  className="absolute rounded-sm border-2 border-white/80 shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
                  style={{
                    top: frameInfo.frameTop,
                    left: frameInfo.frameLeft,
                    width: frameInfo.frameW,
                    height: frameInfo.frameH,
                  }}
                />
                {/* Center crosshair */}
                <div
                  className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
                  style={{
                    top: frameInfo.frameTop + frameInfo.frameH / 2,
                    left: frameInfo.frameLeft + frameInfo.frameW / 2,
                  }}
                />
              </div>
            )}

            {noCropNeeded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <span className="rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow">
                  Image matches this ratio — no crop needed
                </span>
              </div>
            )}
          </div>

          {/* Position readout + reset */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Position: {Math.round(posX)}%, {Math.round(posY)}%
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleReset}
            >
              Reset to center
            </Button>
          </div>

          {/* Live previews */}
          <div className={cn("grid gap-3", contexts.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
            {contexts.map((ctx, i) => (
              <div key={i} className="space-y-1">
                <p className="text-[11px] font-medium text-muted-foreground">{ctx.label}</p>
                <div
                  className="relative overflow-hidden rounded-md border border-border/60 bg-muted"
                  style={{ aspectRatio: ctx.aspectRatio }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ objectPosition: `${posX}% ${posY}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Preset buttons */}
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <Button
                key={p.label}
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "h-7 text-xs",
                  Math.round(posX) === p.x && Math.round(posY) === p.y && "border-primary text-primary",
                )}
                onClick={() => { setPosX(p.x); setPosY(p.y); }}
              >
                {p.label}
              </Button>
            ))}
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
