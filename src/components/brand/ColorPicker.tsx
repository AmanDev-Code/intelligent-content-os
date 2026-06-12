"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Pipette } from "lucide-react";
import { cn } from "@/lib/utils";

export const HEX_RE = /^#[0-9a-fA-F]{6}$/;

const DEFAULT_PRESETS = [
  "#F97316", // brand orange
  "#6366F1",
  "#4F46E5",
  "#0EA5E9",
  "#10B981",
  "#22C55E",
  "#EAB308",
  "#EF4444",
  "#EC4899",
  "#8B5CF6",
  "#111827",
  "#F8FAFC",
];

type Hsv = { h: number; s: number; v: number };

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHsv(r: number, g: number, b: number): Hsv {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  return { h, s: s * 100, v: max * 100 };
}

function hsvToHex({ h, s, v }: Hsv): string {
  s /= 100;
  v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (h < 60) [r, g] = [c, x];
  else if (h < 120) [r, g] = [x, c];
  else if (h < 180) [g, b] = [c, x];
  else if (h < 240) [g, b] = [x, c];
  else if (h < 300) [r, b] = [x, c];
  else [r, b] = [c, x];
  const to = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

function hexToHsv(hex: string): Hsv {
  const { r, g, b } = hexToRgb(HEX_RE.test(hex) ? hex : "#000000");
  return rgbToHsv(r, g, b);
}

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  presets?: string[];
}

/**
 * Advanced color picker: draggable saturation/value canvas, hue slider, native
 * eyedropper (where supported), brand swatches, and a hex field. Zero deps —
 * built on the existing Popover primitive.
 */
export function ColorPicker({
  label,
  value,
  onChange,
  presets = DEFAULT_PRESETS,
}: ColorPickerProps) {
  const valid = HEX_RE.test(value);
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value));
  const [hexDraft, setHexDraft] = useState(valid ? value : "");
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const hasEyeDropper =
    typeof window !== "undefined" && "EyeDropper" in window;

  useEffect(() => {
    if (HEX_RE.test(value)) {
      setHsv(hexToHsv(value));
      setHexDraft(value.toUpperCase());
    }
  }, [value]);

  const emit = useCallback(
    (next: Hsv) => {
      const hex = hsvToHex(next);
      setHexDraft(hex);
      onChange(hex);
    },
    [onChange],
  );

  const startDrag = (
    ref: React.RefObject<HTMLDivElement>,
    compute: (xPct: number, yPct: number) => Hsv,
  ) => {
    const move = (clientX: number, clientY: number) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const xPct = clamp((clientX - rect.left) / rect.width, 0, 1);
      const yPct = clamp((clientY - rect.top) / rect.height, 0, 1);
      const next = compute(xPct, yPct);
      setHsv(next);
      emit(next);
    };
    return (e: React.PointerEvent) => {
      e.preventDefault();
      move(e.clientX, e.clientY);
      const onMove = (ev: PointerEvent) => move(ev.clientX, ev.clientY);
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    };
  };

  const onSvDown = startDrag(svRef, (x, y) => ({
    ...hsv,
    s: x * 100,
    v: (1 - y) * 100,
  }));
  const onHueDown = startDrag(hueRef, (x) => ({ ...hsv, h: x * 360 }));

  const applyHex = (raw: string) => {
    let v = raw.trim();
    if (v && !v.startsWith("#")) v = `#${v}`;
    setHexDraft(v.toUpperCase());
    if (HEX_RE.test(v)) {
      setHsv(hexToHsv(v));
      onChange(v.toUpperCase());
    }
  };

  const eyedrop = async () => {
    try {
      const EyeDropperCtor = (
        window as unknown as {
          EyeDropper: new () => { open: () => Promise<{ sRGBHex: string }> };
        }
      ).EyeDropper;
      const res = await new EyeDropperCtor().open();
      applyHex(res.sRGBHex);
    } catch {
      /* user cancelled */
    }
  };

  const hueHex = hsvToHex({ h: hsv.h, s: 100, v: 100 });

  return (
    <div className="space-y-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`Pick ${label}`}
              className="h-9 w-9 shrink-0 rounded-md border border-border shadow-sm transition-transform hover:scale-105"
              style={{
                background: valid
                  ? value
                  : "repeating-conic-gradient(hsl(var(--muted-foreground)/0.25) 0% 25%, transparent 0% 50%) 50% / 10px 10px",
              }}
            />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 space-y-3">
            {/* Saturation / Value canvas */}
            <div
              ref={svRef}
              onPointerDown={onSvDown}
              className="relative h-36 w-full cursor-crosshair touch-none rounded-md"
              style={{
                backgroundColor: hueHex,
                backgroundImage:
                  "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
              }}
            >
              <span
                className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
                style={{
                  left: `${hsv.s}%`,
                  top: `${100 - hsv.v}%`,
                  backgroundColor: hsvToHex(hsv),
                }}
              />
            </div>

            {/* Hue slider */}
            <div
              ref={hueRef}
              onPointerDown={onHueDown}
              className="relative h-3 w-full cursor-pointer touch-none rounded-full"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
              }}
            >
              <span
                className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
                style={{
                  left: `${(hsv.h / 360) * 100}%`,
                  backgroundColor: hueHex,
                }}
              />
            </div>

            {/* Hex + eyedropper */}
            <div className="flex items-center gap-2">
              {hasEyeDropper && (
                <button
                  type="button"
                  onClick={eyedrop}
                  aria-label="Pick color from screen"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-primary"
                >
                  <Pipette className="h-4 w-4" />
                </button>
              )}
              <Input
                value={hexDraft}
                onChange={(e) => applyHex(e.target.value)}
                placeholder="#1A2B3C"
                className="h-8 font-mono text-xs uppercase"
                maxLength={7}
              />
            </div>

            {/* Brand swatches */}
            <div className="grid grid-cols-6 gap-1.5">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-label={p}
                  onClick={() => applyHex(p)}
                  className={cn(
                    "h-6 w-full rounded border border-border transition-transform hover:scale-110",
                    value.toUpperCase() === p.toUpperCase() &&
                      "ring-2 ring-primary ring-offset-1 ring-offset-popover",
                  )}
                  style={{ backgroundColor: p }}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Input
          value={value}
          placeholder="#1A2B3C"
          onChange={(e) => applyHex(e.target.value)}
          className={cn(
            "h-9 font-mono text-xs uppercase",
            value.trim() && !valid && "border-destructive",
          )}
          maxLength={7}
        />
      </div>
    </div>
  );
}
