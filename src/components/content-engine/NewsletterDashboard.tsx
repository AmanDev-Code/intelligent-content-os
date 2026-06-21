"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Users,
  Mail,
  MousePointerClick,
  Eye,
  TrendingUp,
  Send,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";

interface NewsletterAnalytics {
  total_subscribers: number;
  active_subscribers: number;
  disabled_subscribers: number;
  blocklisted_subscribers: number;
  total_campaigns: number;
  sent_campaigns: number;
  avg_open_rate: number;
  avg_click_rate: number;
  recent_campaigns: Array<{
    id: string;
    title: string;
    subject: string;
    status: string;
    total_sent: number;
    opens: number;
    clicks: number;
    sent_at: string | null;
    created_at: string;
  }>;
  subscriber_growth: Array<{ date: string; count: number }>;
}

export function NewsletterDashboard() {
  const [analytics, setAnalytics] = useState<NewsletterAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get("/admin/newsletter/analytics")
      .then((res) => setAnalytics(res as NewsletterAnalytics))
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

  const data = analytics ?? {
    total_subscribers: 0,
    active_subscribers: 0,
    disabled_subscribers: 0,
    blocklisted_subscribers: 0,
    total_campaigns: 0,
    sent_campaigns: 0,
    avg_open_rate: 0,
    avg_click_rate: 0,
    recent_campaigns: [],
    subscriber_growth: [],
  };

  const metrics = [
    {
      label: "Total Subscribers",
      value: data.total_subscribers,
      sub: `${data.active_subscribers} active · ${data.disabled_subscribers} unsubscribed`,
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Campaigns Sent",
      value: data.sent_campaigns,
      sub: `${data.total_campaigns} total campaigns`,
      icon: Send,
      color: "text-purple-600",
    },
    {
      label: "Avg Open Rate",
      value: `${data.avg_open_rate}%`,
      sub: "Across all sent campaigns",
      icon: Eye,
      color: "text-emerald-600",
    },
    {
      label: "Avg Click Rate",
      value: `${data.avg_click_rate}%`,
      sub: "Across all sent campaigns",
      icon: MousePointerClick,
      color: "text-orange-600",
    },
  ];

  const statusColor: Record<string, string> = {
    sent: "bg-emerald-100 text-emerald-700",
    running: "bg-blue-100 text-blue-700",
    scheduled: "bg-amber-100 text-amber-700",
    draft: "bg-gray-100 text-gray-600",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card
            key={m.label}
            className="border border-border/60 shadow-none hover:border-border transition-colors"
          >
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

      <Card className="border border-border/60 shadow-none">
        <CardContent className="p-0">
          <div className="px-5 py-4 border-b border-border/50">
            <h3 className="text-sm font-semibold">Recent Campaigns</h3>
          </div>
          {data.recent_campaigns.length === 0 ? (
            <div className="py-12 text-center">
              <Mail className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                No campaigns yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Create your first campaign to get started
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {data.recent_campaigns.map((campaign) => {
                const openRate =
                  campaign.total_sent > 0
                    ? Math.round((campaign.opens / campaign.total_sent) * 100)
                    : 0;
                const clickRate =
                  campaign.total_sent > 0
                    ? Math.round((campaign.clicks / campaign.total_sent) * 100)
                    : 0;

                return (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {campaign.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {campaign.subject}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 ml-4">
                      {campaign.status === "sent" && (
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {openRate}%
                          </span>
                          <span className="flex items-center gap-1">
                            <MousePointerClick className="h-3 w-3" />
                            {clickRate}%
                          </span>
                          <span>{campaign.total_sent} sent</span>
                        </div>
                      )}
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs capitalize",
                          statusColor[campaign.status] ?? ""
                        )}
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {data.subscriber_growth.length > 0 && (
        <Card className="border border-border/60 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-semibold">Subscriber Growth</h3>
            </div>
            <div className="h-32 flex items-end gap-1">
              {data.subscriber_growth.slice(-30).map((point, i) => {
                const max = Math.max(
                  ...data.subscriber_growth.map((p) => p.count)
                );
                const height = max > 0 ? (point.count / max) * 100 : 0;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t"
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${point.date}: ${point.count} subscribers`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>
                {data.subscriber_growth[0]?.date || "Start"}
              </span>
              <span>
                {data.subscriber_growth[data.subscriber_growth.length - 1]?.date ||
                  "Today"}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
