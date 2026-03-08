import { useDashboardStats } from "@/hooks/useDashboardStats";
import { CalendarDays, Link2, TrendingUp, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function KPIStrip() {
  const stats = useDashboardStats();

  const cards = [
    {
      label: "Scheduled Posts",
      value: stats.scheduledPosts,
      icon: CalendarDays,
      sub: stats.scheduledPosts > 0 ? `${stats.scheduledPosts} pending` : "No posts scheduled",
    },
    {
      label: "Connected Channels",
      value: stats.connectedChannels,
      icon: Link2,
      sub: stats.connectedChannels > 0 ? `${stats.connectedChannels} active` : "None connected",
    },
    {
      label: "This Month",
      value: stats.thisMonthPosts,
      icon: TrendingUp,
      sub: `${stats.thisMonthPosts} posts generated`,
    },
    {
      label: "AI Credits",
      value: `${stats.creditsRemaining}`,
      icon: Sparkles,
      sub: `${stats.dailyCreditsUsed} used today • ${stats.creditsRemaining}/${stats.monthlyCredits} remaining`,
    },
  ];

  if (stats.loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-7 w-12 mb-1" />
            <Skeleton className="h-3 w-32" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">{card.value}</p>
          <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
        </Card>
      ))}
    </div>
  );
}
