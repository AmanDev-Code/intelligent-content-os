"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Info, Megaphone, ShieldAlert, Sparkles, TriangleAlert, X } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DISMISS_PREFIX = "trndinn_announcement_dismissed_";

export type AnnouncementVariant = "info" | "success" | "warning" | "error" | "promo";

export interface SiteAnnouncement {
  id: string;
  message: string;
  title: string | null;
  detail: string | null;
  variant: AnnouncementVariant;
  linkUrl: string | null;
  linkLabel: string | null;
  dismissible: boolean;
}

const VARIANT_STYLES: Record<
  AnnouncementVariant,
  { bar: string; icon: typeof Info; iconColor: string }
> = {
  info: {
    bar: "bg-sky-600 text-white dark:bg-sky-500",
    icon: Info,
    iconColor: "text-white",
  },
  success: {
    bar: "bg-emerald-600 text-white dark:bg-emerald-500",
    icon: Sparkles,
    iconColor: "text-white",
  },
  warning: {
    bar: "bg-amber-500 text-amber-950 dark:bg-amber-400 dark:text-amber-950",
    icon: TriangleAlert,
    iconColor: "text-amber-950",
  },
  error: {
    bar: "bg-red-600 text-white dark:bg-red-500",
    icon: ShieldAlert,
    iconColor: "text-white",
  },
  promo: {
    bar: "bg-gradient-to-r from-[#ff8a1f] via-[#ff6a3d] to-[#ff3d5f] text-white",
    icon: Megaphone,
    iconColor: "text-white",
  },
};

export function AnnouncementMarquee() {
  const [announcements, setAnnouncements] = useState<SiteAnnouncement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [detail, setDetail] = useState<SiteAnnouncement | null>(null);
  const [listOpen, setListOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = (await apiClient.get("/public/announcements")) as {
          announcements?: SiteAnnouncement[];
        };
        if (!cancelled && Array.isArray(res?.announcements)) {
          setAnnouncements(res.announcements);
        }
      } catch {
        /* marquee is non-critical; fail silently */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const set = new Set<string>();
    for (const a of announcements) {
      try {
        if (window.localStorage.getItem(`${DISMISS_PREFIX}${a.id}`) === "true") {
          set.add(a.id);
        }
      } catch {
        /* ignore */
      }
    }
    setDismissedIds(set);
  }, [announcements]);

  const visible = useMemo(
    () => announcements.filter((a) => !dismissedIds.has(a.id)),
    [announcements, dismissedIds],
  );

  const dismiss = useCallback((id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
    try {
      window.localStorage.setItem(`${DISMISS_PREFIX}${id}`, "true");
    } catch {
      /* ignore */
    }
  }, []);

  if (visible.length === 0) return null;

  const current = visible[0];
  const styles = VARIANT_STYLES[current.variant] ?? VARIANT_STYLES.info;
  const Icon = styles.icon;
  const extraCount = visible.length - 1;
  const hasDetail = Boolean(current.detail || current.title);

  return (
    <>
      <div className={cn("relative z-[60] w-full", styles.bar)} role="region" aria-label="Site announcement">
        <div className="mx-auto flex h-auto min-h-[40px] max-w-6xl items-center gap-3 px-4 py-1.5 sm:px-6">
          <Icon className={cn("h-4 w-4 shrink-0", styles.iconColor)} aria-hidden />

          <button
            type="button"
            onClick={() => (hasDetail ? setDetail(current) : undefined)}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-medium",
              hasDetail ? "cursor-pointer" : "cursor-default",
            )}
          >
            {current.title ? <span className="shrink-0 font-semibold">{current.title}</span> : null}
            <span className="truncate">{current.message}</span>
            {hasDetail ? <span className="hidden shrink-0 underline/30 opacity-80 sm:inline">Read more</span> : null}
          </button>

          {current.linkUrl ? (
            <Link
              href={current.linkUrl}
              className="hidden shrink-0 items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold transition-colors hover:bg-white/30 sm:inline-flex"
            >
              {current.linkLabel ?? "Learn more"}
              <ArrowUpRight className="h-3 w-3" aria-hidden />
            </Link>
          ) : null}

          {extraCount > 0 ? (
            <button
              type="button"
              onClick={() => setListOpen(true)}
              className="shrink-0 cursor-pointer rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-white/30"
            >
              +{extraCount} more
            </button>
          ) : null}

          {current.dismissible ? (
            <button
              type="button"
              onClick={() => dismiss(current.id)}
              aria-label="Dismiss announcement"
              className="shrink-0 cursor-pointer rounded-full p-1 transition-colors hover:bg-white/20"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      {/* Detail modal */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">{detail?.title ?? detail?.message}</DialogTitle>
            {detail?.title ? <DialogDescription>{detail?.message}</DialogDescription> : null}
          </DialogHeader>
          {detail?.detail ? (
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {detail.detail}
            </p>
          ) : null}
          {detail?.linkUrl ? (
            <Link
              href={detail.linkUrl}
              className="inline-flex w-fit items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              {detail.linkLabel ?? "Learn more"}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* All announcements modal */}
      <Dialog open={listOpen} onOpenChange={setListOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Announcements</DialogTitle>
          </DialogHeader>
          <ul className="space-y-3">
            {visible.map((a) => {
              const s = VARIANT_STYLES[a.variant] ?? VARIANT_STYLES.info;
              const AIcon = s.icon;
              return (
                <li
                  key={a.id}
                  className="flex items-start gap-3 rounded-xl bg-muted/50 p-3 dark:bg-white/[0.04]"
                >
                  <span className={cn("mt-0.5 rounded-md p-1.5", s.bar)}>
                    <AIcon className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    {a.title ? <p className="text-sm font-semibold text-foreground">{a.title}</p> : null}
                    <p className="text-sm text-muted-foreground">{a.message}</p>
                    {a.detail ? (
                      <p className="mt-1 whitespace-pre-line text-xs text-muted-foreground/80">{a.detail}</p>
                    ) : null}
                    {a.linkUrl ? (
                      <Link
                        href={a.linkUrl}
                        className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        {a.linkLabel ?? "Learn more"}
                        <ArrowUpRight className="h-3 w-3" aria-hidden />
                      </Link>
                    ) : null}
                  </div>
                  {a.dismissible ? (
                    <button
                      type="button"
                      onClick={() => dismiss(a.id)}
                      aria-label="Dismiss"
                      className="shrink-0 cursor-pointer rounded-full p-1 text-muted-foreground hover:bg-muted"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}
