"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp } from "lucide-react";

const MSG_PREVIEW = 140;

export function AdminFeedbackView() {
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setPage(1);
  }, [ratingFilter]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params: Record<string, string | number> = { page, limit: 15 };
    if (ratingFilter !== "all") params.rating = parseInt(ratingFilter, 10);
    apiClient
      .get("/platform-admin/feedback", { params })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, ratingFilter]);

  const items = data?.items ?? [];
  const stats = data?.stats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Product feedback</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Ratings and messages from the first-post survey.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="min-h-[88px]">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Responses
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 px-4 pt-0">
            <p className="text-2xl font-semibold">{stats?.count ?? "—"}</p>
          </CardContent>
        </Card>
        <Card className="min-h-[88px]">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Avg rating
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 px-4 pt-0">
            <p className="text-2xl font-semibold">
              {stats?.avg_rating != null ? stats.avg_rating.toFixed(2) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="min-h-[88px]">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              NPS-style (approx)
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 px-4 pt-0">
            <p className="text-2xl font-semibold">
              {stats?.nps_approx != null ? `${stats.nps_approx}` : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center max-w-xs">
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter rating" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ratings</SelectItem>
            {[5, 4, 3, 2, 1].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} stars
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-8">Loading feedback…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8">No feedback yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((row: any) => {
            const open = expanded[row.id];
            const msg = row.message as string | null;
            const truncated =
              msg && msg.length > MSG_PREVIEW ? `${msg.slice(0, MSG_PREVIEW)}…` : msg;
            return (
              <li key={row.id}>
                <Card className="h-full min-h-[220px] flex flex-col shadow-sm">
                  <CardHeader className="pb-2 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-lg font-semibold tabular-nums">{row.rating}★</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {row.created_at?.slice(0, 10)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Rewarded:{" "}
                      <span className="text-foreground font-medium">
                        {row.rewarded ? "Yes" : "No"}
                      </span>
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col pt-0">
                    <div className="flex-1 min-h-0">
                      {msg ? (
                        <>
                          <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words line-clamp-4">
                            {open ? msg : truncated}
                          </p>
                          {msg.length > MSG_PREVIEW && (
                            <button
                              type="button"
                              className="text-xs text-primary mt-2 inline-flex items-center gap-0.5"
                              onClick={() =>
                                setExpanded((e) => ({
                                  ...e,
                                  [row.id]: !e[row.id],
                                }))
                              }
                            >
                              {open ? (
                                <>
                                  <ChevronUp className="h-3 w-3" /> Show less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3 w-3" /> Expand
                                </>
                              )}
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground text-sm">No message</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex justify-between items-center gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </Button>
        <span className="text-xs text-muted-foreground">
          Page {page}
          {data?.total != null ? ` · ${data.total} total` : ""}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={!data?.total || page * 15 >= data.total}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
