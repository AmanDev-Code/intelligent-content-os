import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, Users, BarChart3, Zap, TrendingUp, TrendingDown
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface StatsData {
  scheduledPosts: number;
  connectedChannels: number;
  monthlyPosts: number;
  aiCredits: number;
  trends: { scheduledPosts: number; connectedChannels: number; monthlyPosts: number; aiCredits: number; };
}

export function StatsCards() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData>({
    scheduledPosts: 0, connectedChannels: 0, monthlyPosts: 0, aiCredits: 50,
    trends: { scheduledPosts: 0, connectedChannels: 0, monthlyPosts: 0, aiCredits: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchStats(); }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data: scheduledPosts } = await supabase
        .from('generated_content').select('id').eq('user_id', user?.id)
        .gte('created_at', new Date().toISOString()).is('deleted_at', null);

      const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
      const { data: monthlyPosts } = await supabase
        .from('generated_content').select('id').eq('user_id', user?.id)
        .gte('created_at', startOfMonth.toISOString()).is('deleted_at', null);

      setStats({
        scheduledPosts: scheduledPosts?.length || 0, connectedChannels: 0,
        monthlyPosts: monthlyPosts?.length || 0, aiCredits: 50,
        trends: {
          scheduledPosts: 0, connectedChannels: 0,
          monthlyPosts: monthlyPosts?.length ? 15 : 0, aiCredits: -3
        }
      });
    } catch (error) { console.error('Error fetching stats:', error); }
    finally { setLoading(false); }
  };

  const statCards = [
    { title: "Scheduled Posts", value: stats.scheduledPosts, trend: stats.trends.scheduledPosts,
      subtitle: stats.scheduledPosts > 0 ? "Next: Today 2:30 PM" : "No posts scheduled",
      icon: Clock, color: "text-primary" },
    { title: "Connected Channels", value: stats.connectedChannels, trend: stats.trends.connectedChannels,
      subtitle: stats.connectedChannels > 0 ? `${stats.connectedChannels} Active` : "No connections",
      icon: Users, color: "text-primary" },
    { title: "This Month", value: stats.monthlyPosts, trend: stats.trends.monthlyPosts,
      subtitle: `${stats.monthlyPosts} posts published`, icon: BarChart3, color: "text-primary" },
    { title: "AI Credits", value: stats.aiCredits, trend: stats.trends.aiCredits,
      subtitle: `${Math.abs(stats.trends.aiCredits)} used today`, icon: Zap, color: "text-primary" }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}><CardContent className="p-4 md:p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-8 bg-muted rounded w-1/2 mb-2" />
              <div className="h-3 bg-muted rounded w-full" />
            </div>
          </CardContent></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const isPositiveTrend = stat.trend >= 0;
        const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;
        return (
          <Card key={index}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <div className="p-1.5 md:p-2 rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                {stat.trend !== 0 && (
                  <Badge variant="secondary" className="gap-1 text-[10px] md:text-xs hidden sm:flex">
                    <TrendIcon className="h-3 w-3" />
                    {isPositiveTrend ? '+' : ''}{stat.trend}{stat.title === 'AI Credits' ? '' : '%'}
                  </Badge>
                )}
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl sm:text-3xl font-bold">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{stat.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
