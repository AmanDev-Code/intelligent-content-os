"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  MessageSquareText,
  BookOpen,
  Briefcase,
  LayoutDashboard,
  Activity,
  Server,
  ShieldAlert,
} from "lucide-react";
import { useAdminAreaAccess } from "@/hooks/useAdminAreaAccess";
import { apiClient } from "@/lib/apiClient";

type DashboardSummary = {
  totalUsers: number;
  feedbackSubmissions: number;
  signupsLast7Days: number;
};

type HealthApiState = "ok" | "degraded" | "offline";

function normalizeDashboardSummary(raw: unknown): DashboardSummary | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  return {
    totalUsers: typeof s.totalUsers === "number" ? s.totalUsers : Number(s.totalUsers) || 0,
    feedbackSubmissions:
      typeof s.feedbackSubmissions === "number"
        ? s.feedbackSubmissions
        : Number(s.feedbackSubmissions) || 0,
    signupsLast7Days:
      typeof s.signupsLast7Days === "number"
        ? s.signupsLast7Days
        : Number(s.signupsLast7Days) || 0,
  };
}

export default function AdminOverviewPage() {
  const { sections, loading: accessLoading } = useAdminAreaAccess();
  const showStaffMetrics = sections.users;

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [feedbackTotal, setFeedbackTotal] = useState<number | null>(null);
  const [timeseriesOk, setTimeseriesOk] = useState<boolean | null>(null);
  const [health, setHealth] = useState<{
    api?: HealthApiState;
    database?: string;
  } | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [feedbackOnlyLoading, setFeedbackOnlyLoading] = useState(false);
  const [healthLoading, setHealthLoading] = useState(false);

  useEffect(() => {
    if (accessLoading) return;
    if (!showStaffMetrics && !sections.feedback) {
      return;
    }

    let cancelled = false;
    const ac = new AbortController();

    const run = async () => {
      setMetricsError(null);

      if (showStaffMetrics) {
        setDashboardLoading(true);
        try {
          const dash = (await apiClient.get("/platform-admin/users/metrics/dashboard?days=30", {
            signal: ac.signal,
          })) as {
            summary?: unknown;
            timeseriesAvailable?: boolean;
          };
          if (cancelled) return;
          const normalized = normalizeDashboardSummary(dash?.summary);
          if (normalized) {
            setSummary(normalized);
            setTimeseriesOk(Boolean(dash.timeseriesAvailable));
            setFeedbackTotal(normalized.feedbackSubmissions);
          } else {
            setMetricsError("Metrics response missing summary");
          }
        } catch (e) {
          if ((e as Error)?.name !== "AbortError" && !cancelled) {
            setMetricsError(
              e instanceof Error ? e.message : "Failed to load metrics",
            );
          }
        } finally {
          if (!cancelled) setDashboardLoading(false);
        }
      } else if (sections.feedback) {
        setFeedbackOnlyLoading(true);
        try {
          const fb = (await apiClient.get("/platform-admin/feedback", {
            params: { page: 1, limit: 1 },
            signal: ac.signal,
          })) as { total?: number };
          if (!cancelled) {
            setFeedbackTotal(typeof fb?.total === "number" ? fb.total : null);
          }
        } catch (e) {
          if ((e as Error)?.name !== "AbortError" && !cancelled) {
            setMetricsError(
              e instanceof Error ? e.message : "Failed to load feedback count",
            );
          }
        } finally {
          if (!cancelled) setFeedbackOnlyLoading(false);
        }
      }

      if (cancelled) return;

      setHealthLoading(true);
      let pingApi: HealthApiState | null = null;
      try {
        const ping = (await apiClient.get("/health/ping", {
          signal: ac.signal,
        })) as { status?: string };
        if (ping && typeof ping === "object") {
          pingApi = ping.status === "ok" ? "ok" : "degraded";
        } else {
          pingApi = "offline";
        }
      } catch {
        pingApi = "offline";
      }

      if (cancelled) {
        setHealthLoading(false);
        return;
      }

      if (showStaffMetrics) {
        try {
          const full = (await apiClient.get("/health", {
            signal: ac.signal,
          })) as {
            database?: string;
            api?: string;
          };
          if (!cancelled) {
            setHealth({
              api: full.api === "healthy" ? "ok" : "degraded",
              database: full.database,
            });
          }
        } catch {
          if (!cancelled) {
            setHealth({
              api: pingApi ?? "offline",
              database: undefined,
            });
          }
        }
      } else if (!cancelled && pingApi !== null) {
        setHealth({ api: pingApi });
      } else if (!cancelled) {
        setHealth({ api: "offline" });
      }

      if (!cancelled) setHealthLoading(false);
    };

    void run();
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [accessLoading, showStaffMetrics, sections.feedback]);

  const cards = useMemo(
    () =>
      [
        {
          href: "/admin/users",
          title: "Users",
          description: "Metrics and directory — status controls.",
          icon: Users,
          show: sections.users,
        },
        {
          href: "/admin/feedback",
          title: "Feedback",
          description: "Product survey ratings and messages.",
          icon: MessageSquareText,
          show: sections.feedback,
        },
        {
          href: "/admin/blog",
          title: "Blog & CMS",
          description: "Posts, editors, and SEO pages.",
          icon: BookOpen,
          show: sections.blog,
        },
        {
          href: "/admin/careers",
          title: "Careers",
          description: "Job listings and applications.",
          icon: Briefcase,
          show: sections.careers,
        },
        {
          href: "/admin/maintenance",
          title: "Maintenance",
          description: "Toggle maintenance mode or schedule a downtime window.",
          icon: ShieldAlert,
          show: sections.maintenance,
        },
      ] as const,
    [sections],
  );

  const visible = cards.filter((c) => c.show);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
          <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />
          Overview
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Admin</h1>
        <p className="text-muted-foreground text-sm max-w-xl">
          Jump to the areas you have access to. Use{" "}
          <span className="text-foreground font-medium">Back to app</span> in the sidebar to return
          to the main product.
        </p>
      </div>

      {showStaffMetrics ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-3.5 w-3.5" aria-hidden />
                Total users
              </CardTitle>
              <p className="text-2xl font-semibold tabular-nums">
                {accessLoading || dashboardLoading
                  ? "…"
                  : metricsError
                    ? "—"
                    : summary
                      ? summary.totalUsers
                      : "—"}
              </p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquareText className="h-3.5 w-3.5" aria-hidden />
                Feedback
              </CardTitle>
              <p className="text-2xl font-semibold tabular-nums">
                {accessLoading || dashboardLoading
                  ? "…"
                  : metricsError
                    ? "—"
                    : summary
                      ? summary.feedbackSubmissions
                      : "—"}
              </p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-3.5 w-3.5" aria-hidden />
                Signups (7d)
              </CardTitle>
              <p className="text-2xl font-semibold tabular-nums">
                {accessLoading || dashboardLoading
                  ? "…"
                  : metricsError
                    ? "—"
                    : summary
                      ? summary.signupsLast7Days
                      : "—"}
              </p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <Server className="h-3.5 w-3.5" aria-hidden />
                API / DB
              </CardTitle>
              <p className="text-sm font-medium">
                {accessLoading || healthLoading ? (
                  <span className="text-muted-foreground">API: checking…</span>
                ) : health?.api === "ok" ? (
                  <span className="text-emerald-600 dark:text-emerald-400">API ok</span>
                ) : health?.api === "offline" ? (
                  <span className="text-destructive">Unreachable</span>
                ) : health ? (
                  <span className="text-amber-600 dark:text-amber-400">Degraded</span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
                <span className="block text-xs text-muted-foreground mt-1 font-normal">
                  {accessLoading || healthLoading
                    ? "Database: checking…"
                    : health?.database
                      ? `Database: ${health.database}`
                      : "Database: —"}
                </span>
              </p>
              {timeseriesOk === false ? (
                <p className="text-xs text-muted-foreground mt-1">
                  Deploy SQL migration <code className="text-[11px]">admin_metrics_timeseries_agg</code>{" "}
                  for charts.
                </p>
              ) : null}
            </CardHeader>
          </Card>
        </div>
      ) : sections.feedback && !showStaffMetrics ? (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Feedback submissions
            </CardTitle>
            <p className="text-2xl font-semibold tabular-nums">
              {accessLoading || feedbackOnlyLoading
                ? "…"
                : metricsError
                  ? "—"
                  : (feedbackTotal ?? "—")}
            </p>
          </CardHeader>
        </Card>
      ) : null}

      {metricsError ? (
        <p className="text-sm text-destructive">{metricsError}</p>
      ) : null}

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No admin modules matched your permissions yet.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {visible.map((c) => (
            <li key={c.href}>
              <Link href={c.href} className="block h-full group">
                <Card className="h-full min-h-[140px] transition-colors hover:border-primary/40 hover:bg-muted/30">
                  <CardHeader className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                        <c.icon className="h-5 w-5" aria-hidden />
                      </span>
                      <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                        {c.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-sm leading-snug">
                      {c.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {sections.settings ? (
        <div>
          <Link
            href="/admin/settings"
            className="text-sm font-medium text-primary hover:underline underline-offset-4"
          >
            Admin settings (delegated staff grants) →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
