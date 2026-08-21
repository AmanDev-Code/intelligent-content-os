"use client";

/**
 * AdminBioGeneratorView — Owner-only analytics for the free Bio Generator.
 *
 * Data source: GET /admin/bio-generator/analytics (auth + admin guarded on the
 * backend). Never shows aggregate counts to end users — only admins see this.
 *
 * Layout:
 *   1. Row of KPI cards (total votes, up, down, positive %)
 *   2. Six breakdown tables (platform / angle / tone / bioType / emojis / focus)
 *   3. Recent votes table with bio snapshot for spot-checking
 *
 * Uses the same KPI-card + Table pattern as `admin/transcription/page.tsx`.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Loader2,
  RefreshCw,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClient } from "@/lib/apiClient";
import { cn } from "@/lib/utils";

// ── Response shape mirrors BioFeedbackAnalytics from the backend service.

interface BreakdownRow {
  key: string;
  up: number;
  down: number;
  total: number;
  ratio: number;
}

interface RecentRow {
  id: string;
  vote: "up" | "down";
  platform: string;
  angle: string;
  tone: string;
  focusAreas: string[];
  emojis: boolean;
  bioType: string;
  bioText: string | null;
  createdAt: string;
}

interface AnalyticsResponse {
  success: boolean;
  overall: { total: number; up: number; down: number; ratio: number };
  byPlatform: BreakdownRow[];
  byAngle: BreakdownRow[];
  byTone: BreakdownRow[];
  byBioType: BreakdownRow[];
  byEmojis: BreakdownRow[];
  byFocusArea: BreakdownRow[];
  recent: RecentRow[];
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Format a positive-vote ratio as a percentage with a fixed decimal, or "—" when no votes. */
function pct(ratio: number, total: number): string {
  if (total === 0) return "—";
  return `${Math.round(ratio * 100)}%`;
}

/** Color a positive % green when healthy, amber when middling, destructive when bad. */
function ratioClass(ratio: number, total: number): string {
  if (total === 0) return "text-muted-foreground";
  if (ratio >= 0.7) return "text-emerald-600 dark:text-emerald-400";
  if (ratio >= 0.5) return "text-amber-600 dark:text-amber-400";
  return "text-destructive";
}

/** Prettify enum-ish keys ("linkedin" → "LinkedIn"). */
function labelize(key: string): string {
  const map: Record<string, string> = {
    linkedin: "LinkedIn",
    instagram: "Instagram",
    twitter: "Twitter",
    tiktok: "TikTok",
    github: "GitHub",
    youtube: "YouTube",
    general: "General",
    on: "Emojis on",
    off: "Emojis off",
    personal: "Personal",
    brand: "Brand",
  };
  return map[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ── Breakdown Table ─────────────────────────────────────────────────────────

function BreakdownTable({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: BreakdownRow[];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-muted-foreground">
            No votes yet in this bucket.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead className="text-right">Up</TableHead>
                <TableHead className="text-right">Down</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Positive %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.key}>
                  <TableCell className="font-medium">{labelize(row.key)}</TableCell>
                  <TableCell className="text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                    {row.up}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-destructive">
                    {row.down}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{row.total}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right tabular-nums font-medium",
                      ratioClass(row.ratio, row.total),
                    )}
                  >
                    {pct(row.ratio, row.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main View ───────────────────────────────────────────────────────────────

export function AdminBioGeneratorView() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      // apiClient.get returns the JSON body directly (see frontend/src/lib/apiClient.ts).
      const res = (await apiClient.get(
        "/admin/bio-generator/analytics",
      )) as AnalyticsResponse;
      setData(res);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load analytics";
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = () => {
    setRefreshing(true);
    void load();
  };

  const overall = data?.overall;
  const kpis = useMemo(
    () => [
      {
        label: "Total votes",
        value: overall?.total ?? 0,
        icon: BarChart3,
        color: "text-foreground",
      },
      {
        label: "Thumbs up",
        value: overall?.up ?? 0,
        icon: ThumbsUp,
        color: "text-emerald-600 dark:text-emerald-400",
      },
      {
        label: "Thumbs down",
        value: overall?.down ?? 0,
        icon: ThumbsDown,
        color: "text-destructive",
      },
      {
        label: "Positive %",
        value: overall ? pct(overall.ratio, overall.total) : "—",
        icon: Activity,
        color: overall ? ratioClass(overall.ratio, overall.total) : "text-muted-foreground",
      },
    ],
    [overall],
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-16 justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading analytics…
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Couldn&apos;t load analytics</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={refresh} variant="outline" size="sm" className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header + Refresh ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Bio Generator — analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Anonymous thumbs-up / thumbs-down on generated bios, broken down by
            every dimension of the generation. Counts are never surfaced to end users.
          </p>
        </div>
        <Button
          onClick={refresh}
          variant="outline"
          size="sm"
          className="gap-1.5"
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          Refresh
        </Button>
      </div>

      {/* ── KPI Row ─────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label}>
              <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {k.label}
                </CardTitle>
                <Icon className={cn("h-4 w-4", k.color)} />
              </CardHeader>
              <CardContent>
                <p className={cn("text-2xl font-semibold tabular-nums", k.color)}>
                  {k.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Breakdown Grid ──────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <BreakdownTable
          title="By Platform"
          description="Which platform's bios win the most thumbs up?"
          rows={data?.byPlatform ?? []}
        />
        <BreakdownTable
          title="By Angle"
          description="Credibility / outcome / positioning / direction — which framing lands?"
          rows={data?.byAngle ?? []}
        />
        <BreakdownTable
          title="By Tone"
          description="Which tones users vote up vs down."
          rows={data?.byTone ?? []}
        />
        <BreakdownTable
          title="By Focus Area"
          description="Focus signals selected on the winning vs losing bios."
          rows={data?.byFocusArea ?? []}
        />
        <BreakdownTable
          title="By Bio Type"
          description="Personal vs brand voice performance."
          rows={data?.byBioType ?? []}
        />
        <BreakdownTable
          title="By Emojis"
          description="Do users prefer bios with emojis on or off?"
          rows={data?.byEmojis ?? []}
        />
      </div>

      {/* ── Recent votes ────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent votes</CardTitle>
          <CardDescription>
            Last 50 thumbs, with the bio snapshot so you can eyeball what people
            are actually voting on.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {(data?.recent ?? []).length === 0 ? (
            <p className="px-6 pb-6 text-sm text-muted-foreground">No votes yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Vote</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Angle</TableHead>
                  <TableHead>Tone</TableHead>
                  <TableHead>Focus</TableHead>
                  <TableHead>Emojis</TableHead>
                  <TableHead>Bio</TableHead>
                  <TableHead className="text-right whitespace-nowrap">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.recent ?? []).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      {row.vote === "up" ? (
                        <ThumbsUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <ThumbsDown className="h-4 w-4 text-destructive" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{labelize(row.platform)}</TableCell>
                    <TableCell className="capitalize">{row.angle}</TableCell>
                    <TableCell className="capitalize">{row.tone}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {row.focusAreas.length === 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          row.focusAreas.map((fa) => (
                            <Badge key={fa} variant="outline" className="text-[10px]">
                              {fa}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {row.emojis ? (
                        <Badge variant="secondary" className="text-[10px]">on</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">off</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[420px]">
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {row.bioText ?? "—"}
                      </p>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(row.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminBioGeneratorView;
