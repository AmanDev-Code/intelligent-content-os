"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  FileText,
  TrendingUp,
  Network,
  Share2,
  Sparkles,
  Plus,
  KeyRound,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import type { ContentEngineSection } from "@/views/ContentEnginePage";

interface DashboardStats {
  total_articles: number;
  published: number;
  draft: number;
  scheduled: number;
  avg_seo_score: number;
  clusters_count: number;
  distributed_count: number;
  recent_posts: {
    id: string;
    title: string;
    slug: string;
    status: string;
    updated_at: string;
    seo_score: number | null;
  }[];
}

interface DashboardSectionProps {
  onNavigate: (section: ContentEngineSection) => void;
  onOpenArticle: (postId: string) => void;
}

export function DashboardSection({ onNavigate, onOpenArticle }: DashboardSectionProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/admin/content-engine/dashboard")
      .then((res) => setStats(res as DashboardStats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const data = stats ?? {
    total_articles: 0,
    published: 0,
    draft: 0,
    scheduled: 0,
    avg_seo_score: 0,
    clusters_count: 0,
    distributed_count: 0,
    recent_posts: [],
  };

  const metrics = [
    {
      label: "Total Articles",
      value: data.total_articles,
      sub: `${data.published} published · ${data.draft} draft · ${data.scheduled} scheduled`,
      icon: FileText,
      color: "text-blue-600",
    },
    {
      label: "Avg SEO Score",
      value: `${data.avg_seo_score}/100`,
      sub: "Across all scored articles",
      icon: TrendingUp,
      color: "text-emerald-600",
    },
    {
      label: "Content Clusters",
      value: data.clusters_count,
      sub: "Pillar + supporting groups",
      icon: Network,
      color: "text-purple-600",
    },
    {
      label: "Distributed",
      value: data.distributed_count,
      sub: "Posts published on platforms",
      icon: Share2,
      color: "text-orange-600",
    },
  ];

  const statusColor: Record<string, string> = {
    published: "bg-emerald-100 text-emerald-700",
    draft: "bg-amber-100 text-amber-700",
    scheduled: "bg-blue-100 text-blue-700",
    archived: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Content Engine</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your SEO content operations
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.label} className="border border-border/60 shadow-none hover:border-border transition-colors">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {m.label}
                </span>
                <m.icon className={cn("h-4 w-4", m.color)} />
              </div>
              <p className="text-2xl font-semibold tracking-tight">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => onNavigate("generate")} className="gap-2">
          <Sparkles className="h-4 w-4" />
          Generate Article
        </Button>
        <Button variant="outline" onClick={() => onNavigate("clusters")} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Cluster
        </Button>
        <Button variant="outline" onClick={() => onNavigate("keywords")} className="gap-2">
          <KeyRound className="h-4 w-4" />
          Import Keywords
        </Button>
      </div>

      {/* Recent Articles */}
      <Card className="border border-border/60 shadow-none">
        <CardContent className="p-0">
          <div className="px-5 py-4 border-b border-border/50">
            <h3 className="text-sm font-semibold">Recent Articles</h3>
          </div>
          {data.recent_posts.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No articles yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Generate your first article to get started
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {data.recent_posts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => onOpenArticle(post.id)}
                  className="flex w-full items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors cursor-pointer text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Updated {new Date(post.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    {post.seo_score != null && (
                      <span className="text-xs font-medium text-muted-foreground">
                        SEO {post.seo_score}
                      </span>
                    )}
                    <Badge
                      variant="secondary"
                      className={cn("text-xs capitalize", statusColor[post.status] ?? "")}
                    >
                      {post.status}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

