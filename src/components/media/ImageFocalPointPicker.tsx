"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { Move, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  BLOG_FEATURED_IMAGE_POSITION_PRESETS,
  type BlogFeaturedImagePositionPreset,
} from "@/lib/blogFeaturedImagePosition";

export type ImageFocalPointPickerProps = {
  imageUrl: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  aspectRatio?: string;
};

const PRESET_LABELS: Record<BlogFeaturedImagePositionPreset, string> = {
  "": "Auto (center)",
  left: "Left",
  center: "Center",
  right: "Right",
  top: "Top",
  bottom: "Bottom",
};

export function ImageFocalPointPicker({
  imageUrl,
  value,
  onChange,
  label = "Focal point",
  aspectRatio = "16/9",
}: ImageFocalPointPickerProps) {
  const [open, setOpen] = useState(false);
  const [localX, setLocalX] = useState(50);
  const [localY, setLocalY] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const parsed = parseStoredPosition(value);
    if (parsed.type === "custom" && parsed.x !== undefined && parsed.y !== undefined) {
      setLocalX(parsed.x);
      setLocalY(parsed.y);
    } else {
      const presetPositions: Record<string, { x: number; y: number }> = {
        "": { x: 50, y: 50 },
        left: { x: 0, y: 50 },
        center: { x: 50, y: 50 },
        right: { x: 100, y: 50 },
        top: { x: 50, y: 0 },
        bottom: { x: 50, y: 100 },
      };
      const pos = presetPositions[parsed.preset || ""] || { x: 50, y: 50 };
      setLocalX(pos.x);
      setLocalY(pos.y);
    }
  }, [open, value]);

  const updatePosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((clientY - rect.top) / rect.height) * 100));
    setLocalX(x);
    setLocalY(y);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    updatePosition(e.clientX, e.clientY);
  }, [updatePosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    updatePosition(e.clientX, e.clientY);
  }, [isDragging, updatePosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    const touch = e.touches[0];
    updatePosition(touch.clientX, touch.clientY);
  }, [updatePosition]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    updatePosition(touch.clientX, touch.clientY);
  }, [isDragging, updatePosition]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handlePresetClick = (preset: BlogFeaturedImagePositionPreset) => {
    const presetPositions: Record<string, { x: number; y: number }> = {
      "": { x: 50, y: 50 },
      left: { x: 0, y: 50 },
      center: { x: 50, y: 50 },
      right: { x: 100, y: 50 },
      top: { x: 50, y: 0 },
      bottom: { x: 50, y: 100 },
    };
    const pos = presetPositions[preset] || { x: 50, y: 50 };
    setLocalX(pos.x);
    setLocalY(pos.y);
  };

  const handleReset = () => {
    setLocalX(50);
    setLocalY(50);
  };

  const handleConfirm = () => {
    onChange(formatPositionForStorage(localX, localY));
    setOpen(false);
  };

  const parsed = parseStoredPosition(value);
  const displayValue = parsed.type === "custom" 
    ? `${Math.round(parsed.x || 50)}%, ${Math.round(parsed.y || 50)}%`
    : PRESET_LABELS[parsed.preset || ""];

  if (!imageUrl) {
    return (
      <div className="space-y-1">
        <Label className="text-muted-foreground">{label}</Label>
        <p className="text-xs text-muted-foreground">Add an image first to set focal point.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-muted-foreground">{label}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => setOpen(true)}
        >
          <Move className="h-3.5 w-3.5" />
          Adjust position
        </Button>
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-2">
        <div 
          className="relative h-12 w-20 shrink-0 overflow-hidden rounded-md border border-border/60"
          style={{ aspectRatio }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
            style={{ 
              objectPosition: parsed.type === "custom" 
                ? `${parsed.x}% ${parsed.y}%` 
                : parsed.preset === "left" ? "left center"
                : parsed.preset === "right" ? "right center"
                : parsed.preset === "top" ? "center top"
                : parsed.preset === "bottom" ? "center bottom"
                : "center"
            }}
          />
          {parsed.type === "custom" && (
            <div 
              className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow-md"
              style={{ left: `${parsed.x}%`, top: `${parsed.y}%` }}
            />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Position: <span className="font-medium text-foreground">{displayValue}</span>
        </p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Set focal point</DialogTitle>
            <DialogDescription>
              Click or drag on the image to set where the focus should be when the image is cropped.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div
              ref={containerRef}
              className={cn(
                "relative cursor-crosshair overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/30",
                isDragging && "border-primary"
              )}
              style={{ aspectRatio: "16/9" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt=""
                className="h-full w-full object-cover pointer-events-none select-none"
                style={{ objectPosition: `${localX}% ${localY}%` }}
                draggable={false}
              />
              <div 
                className="absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ left: `${localX}%`, top: `${localY}%` }}
              >
                <div className="absolute inset-0 rounded-full border-2 border-white shadow-lg" />
                <div className="absolute inset-1 rounded-full bg-primary/80" />
                <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-white/60" />
                <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-white/60" />
              </div>
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-1/3 top-0 h-full w-px bg-white/20" />
                <div className="absolute left-2/3 top-0 h-full w-px bg-white/20" />
                <div className="absolute left-0 top-1/3 h-px w-full bg-white/20" />
                <div className="absolute left-0 top-2/3 h-px w-full bg-white/20" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Position: <span className="font-mono font-medium text-foreground">{Math.round(localX)}%, {Math.round(localY)}%</span>
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={handleReset}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset to center
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Quick presets</Label>
              <div className="flex flex-wrap gap-1.5">
                {BLOG_FEATURED_IMAGE_POSITION_PRESETS.filter(p => p !== "").map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => handlePresetClick(preset)}
                  >
                    {PRESET_LABELS[preset]}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="text-xs font-medium text-foreground mb-2">Preview at 16:9 crop</p>
              <div 
                className="relative overflow-hidden rounded-md border border-border/60"
                style={{ aspectRatio: "16/9", maxHeight: "120px" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ objectPosition: `${localX}% ${localY}%` }}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirm}>
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
