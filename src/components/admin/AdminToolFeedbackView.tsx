"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, MessageSquarePlus, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/apiClient";
import { cn } from "@/lib/utils";

interface FeedbackItem {
  id: string;
  tool_slug: string;
  identifier: string;
  identifier_type: "user" | "anonymous";
  rating: number;
  message: string | null;
  created_at: string;
}

interface FeedbackStats {
  average: number;
  count: number;
  distribution: Record<number, number>;
}

interface ToolFeedbackResponse {
  items: FeedbackItem[];
  total: number;
  stats: FeedbackStats;
}

const TOOL_LABELS: Record<string, string> = {
  "instagram-reel-downloader": "Reel Downloader",
  "auto-caption-generator": "Auto Caption",
  "bio-generator": "Bio Generator",
};

function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const iconSize = size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            iconSize,
            rating >= n ? "text-amber-500 fill-amber-500" : "text-muted-foreground/20",
          )}
        />
      ))}
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

/**
 * Admin view for tool feedback — tabbed per-tool with stats and response list.
 * Auto-discovers tools from the feedback data.
 */
export function AdminToolFeedbackView() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [data, setData] = useState<ToolFeedbackResponse | null>(null);
  const [tools, setTools] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchFeedback = useCallback(async (toolSlug?: string, pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pageNum), limit: "20" });
      if (toolSlug && toolSlug !== "all") params.set("toolSlug", toolSlug);
      const res = await apiClient.get(`/admin/tool-feedback?${params.toString()}`);
      setData(res as ToolFeedbackResponse);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTools = useCallback(async () => {
    try {
      const res = await apiClient.get("/admin/tool-feedback/tools");
      setTools(res?.tools || []);
    } catch {
      setTools([]);
    }
  }, []);

  useEffect(() => {
    fetchTools();
    fetchFeedback("all", 1);
  }, [fetchTools, fetchFeedback]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
    fetchFeedback(tab, 1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchFeedback(activeTab, newPage);
  };

  const stats = data?.stats;
  const totalPages = data ? Math.ceil(data.total / 20) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-foreground">
            Tool Feedback
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Star ratings and messages from tool users
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <MessageSquarePlus className="h-3.5 w-3.5" />
          {data?.total || 0} responses
        </Badge>
      </div>

      {/* Tool Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="all" className="gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            All Tools
          </TabsTrigger>
          {tools.map((slug) => (
            <TabsTrigger key={slug} value={slug}>
              {TOOL_LABELS[slug] || slug}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-4">
          {/* Stats Summary */}
          {stats && stats.count > 0 && (
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Average */}
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-heading font-bold text-foreground">
                    {stats.average.toFixed(1)}
                  </div>
                  <div>
                    <StarDisplay rating={Math.round(stats.average)} size="md" />
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {stats.count} rating{stats.count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Distribution */}
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((n) => {
                    const count = stats.distribution[n] || 0;
                    const pct = stats.count > 0 ? (count / stats.count) * 100 : 0;
                    return (
                      <div key={n} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4 text-right">
                          {n}★
                        </span>
                        <Progress value={pct} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground w-8">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {/* Feedback List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          ) : data?.items.length === 0 ? (
            <Card className="p-8 text-center">
              <MessageSquarePlus className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No feedback yet{activeTab !== "all" ? ` for ${TOOL_LABELS[activeTab] || activeTab}` : ""}.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {data?.items.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <StarDisplay rating={item.rating} />
                        {activeTab === "all" && (
                          <Badge variant="secondary" className="text-xs">
                            {TOOL_LABELS[item.tool_slug] || item.tool_slug}
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="text-xs"
                        >
                          {item.identifier_type === "user" ? "User" : "Anonymous"}
                        </Badge>
                      </div>
                      {item.message && (
                        <p className="text-sm text-foreground mt-1 line-clamp-3">
                          &ldquo;{item.message}&rdquo;
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                      {formatTimeAgo(item.created_at)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
