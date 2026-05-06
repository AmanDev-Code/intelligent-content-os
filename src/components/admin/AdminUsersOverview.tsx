"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { apiClient } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DayPoint = { date: string; count: number };

type DashboardResponse = {
  summary: {
    totalUsers: number;
    feedbackSubmissions: number;
    signupsLast7Days: number;
  };
  signupsByDay: DayPoint[];
  feedbackByDay: DayPoint[];
  days: number;
  timeseriesAvailable?: boolean;
};

const chartTooltipProps = {
  cursor: { fill: "hsl(var(--muted) / 0.35)" },
  contentStyle: {
    fontSize: 12,
    backgroundColor: "hsl(var(--popover))",
    color: "hsl(var(--popover-foreground))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
  },
  labelStyle: {
    color: "hsl(var(--popover-foreground))",
    fontWeight: 600,
  },
  itemStyle: {
    color: "hsl(var(--popover-foreground))",
  },
} as const;

export function AdminUsersOverview() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadError(null);
    apiClient
      .get("/platform-admin/users/metrics/dashboard?days=30")
      .then((res) => {
        if (!cancelled) setData(res as DashboardResponse);
      })
      .catch((e) => {
        if (!cancelled) {
          setData(null);
          setLoadError(e instanceof Error ? e.message : "Failed to load");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const chartRows = useMemo(() => {
    const signups = data?.signupsByDay ?? [];
    const feedback = data?.feedbackByDay ?? [];
    const byDate = new Map<string, { date: string; signups: number; feedback: number }>();
    for (const p of signups) {
      byDate.set(p.date, {
        date: p.date,
        signups: p.count,
        feedback: byDate.get(p.date)?.feedback ?? 0,
      });
    }
    for (const p of feedback) {
      const cur = byDate.get(p.date);
      if (cur) {
        cur.feedback = p.count;
      } else {
        byDate.set(p.date, {
          date: p.date,
          signups: 0,
          feedback: p.count,
        });
      }
    }
    return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  const formatTick = (d: string) => {
    try {
      return format(parseISO(d), "MMM d");
    } catch {
      return d;
    }
  };

  const metrics = data?.summary;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Overview</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Live counts from the database; daily series use the last {data?.days ?? 30} days (UTC).
        </p>
        {data?.timeseriesAvailable === false ? (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Timeseries SQL is not deployed yet — run migration{" "}
            <code className="text-[11px]">admin_metrics_timeseries_agg</code> for bar charts.
          </p>
        ) : null}
        {loadError ? <p className="text-sm text-destructive mt-1">{loadError}</p> : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="min-h-[100px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {metrics?.totalUsers ?? (loadError ? "—" : "…")}
            </p>
          </CardContent>
        </Card>
        <Card className="min-h-[100px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Feedback submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {metrics?.feedbackSubmissions ?? (loadError ? "—" : "…")}
            </p>
          </CardContent>
        </Card>
        <Card className="min-h-[100px]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Signups (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {metrics?.signupsLast7Days ?? (loadError ? "—" : "…")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="min-h-[320px]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New signups per day
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[260px] w-full pl-0">
            {chartRows.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatTick}
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                  />
                  <YAxis allowDecimals={false} width={36} tick={{ fontSize: 11 }} />
                  <Tooltip
                    labelFormatter={(v) => (typeof v === "string" ? formatTick(v) : String(v))}
                    {...chartTooltipProps}
                  />
                  <Bar dataKey="signups" name="Signups" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                {loadError || "No data yet."}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="min-h-[320px]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Feedback per day
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[260px] w-full pl-0">
            {chartRows.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatTick}
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                  />
                  <YAxis allowDecimals={false} width={36} tick={{ fontSize: 11 }} />
                  <Tooltip
                    labelFormatter={(v) => (typeof v === "string" ? formatTick(v) : String(v))}
                    {...chartTooltipProps}
                  />
                  <Bar
                    dataKey="feedback"
                    name="Feedback"
                    fill="hsl(142 76% 36%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                {loadError || "No data yet."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="min-h-[280px]">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Signups vs feedback (combined)
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[220px] w-full pl-0">
          {chartRows.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatTick}
                  tick={{ fontSize: 11 }}
                />
                <YAxis allowDecimals={false} width={36} tick={{ fontSize: 11 }} />
                <Tooltip
                  labelFormatter={(v) => (typeof v === "string" ? formatTick(v) : String(v))}
                  {...chartTooltipProps}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="signups" name="Signups" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar
                  dataKey="feedback"
                  name="Feedback"
                  fill="hsl(142 76% 36%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              {loadError || "No data yet."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
