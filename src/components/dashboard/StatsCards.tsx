import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Clock, Users, BarChart3, Zap, TrendingUp, TrendingDown
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuota } from "@/contexts/QuotaContext";
import { useLinkedIn } from "@/contexts/LinkedInContext";
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
  const { quota: userQuota } = useQuota();
  const { isConnected: linkedinConnected, metrics: linkedinMetrics } = useLinkedIn();
  const [stats, setStats] = useState<StatsData>({
    scheduledPosts: 0, connectedChannels: 0, monthlyPosts: 0, aiCredits: 0,
    trends: { scheduledPosts: 0, connectedChannels: 0, monthlyPosts: 0, aiCredits: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchStats(); }, [user, linkedinConnected]);

  const fetchStats = async () => {
    const uid = user?.id;
    if (!uid) return;

    try {
      setLoading(true);
      
      // Fetch scheduled posts (from scheduled_posts table, not generated_content)
      const { data: scheduledPosts } = await supabase
        // Table exists in DB; regenerate Supabase types to remove `as any`
        .from('scheduled_posts' as any)
        .select('id')
        .eq('user_id', uid)
        .in('status', ['scheduled', 'processing']);

      // Fetch published posts this month
      const startOfMonth = new Date(); 
      startOfMonth.setDate(1); 
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { data: monthlyPosts } = await supabase
        .from('generated_content')
        .select('id')
        .eq('user_id', uid)
        .eq('publish_status', 'published')
        .gte('published_at', startOfMonth.toISOString())
        .is('deleted_at', null);

      // Get previous month data for trends
      const startOfPrevMonth = new Date(startOfMonth);
      startOfPrevMonth.setMonth(startOfPrevMonth.getMonth() - 1);
      const endOfPrevMonth = new Date(startOfMonth);
      endOfPrevMonth.setDate(0);
      
      const { data: prevMonthPosts } = await supabase
        .from('generated_content')
        .select('id')
        .eq('user_id', user?.id)
        .eq('publish_status', 'published')
        .gte('published_at', startOfPrevMonth.toISOString())
        .lte('published_at', endOfPrevMonth.toISOString())
        .is('deleted_at', null);

      const currentMonthCount = monthlyPosts?.length || 0;
      const prevMonthCount = prevMonthPosts?.length || 0;
      const monthlyTrend = prevMonthCount > 0 
        ? Math.round(((currentMonthCount - prevMonthCount) / prevMonthCount) * 100)
        : currentMonthCount > 0 ? 100 : 0;

      setStats({
        scheduledPosts: scheduledPosts?.length || 0, 
        connectedChannels: linkedinConnected ? 1 : 0,
        monthlyPosts: currentMonthCount, 
        aiCredits: userQuota?.remainingCredits ?? 0,
        trends: {
          scheduledPosts: 0, // No trend calculation for scheduled posts yet
          connectedChannels: linkedinConnected ? 1 : 0, // Show +1% if connected
          monthlyPosts: monthlyTrend, 
          aiCredits: 0 // No trend calculation for credits
        }
      });
    } catch (error) { 
      console.error('Error fetching stats:', error); 
    } finally { 
      setLoading(false); 
    }
  };

  // Re-run fetchStats when quota changes (e.g. after generation) so AI Credits card updates
  useEffect(() => {
    if (user && userQuota != null) {
      setStats(prev => ({
        ...prev,
        aiCredits: userQuota.remainingCredits,
      }));
    }
  }, [user, userQuota?.remainingCredits]);

  const statCards = [
    { title: "Scheduled Posts", value: stats.scheduledPosts, trend: stats.trends.scheduledPosts,
      subtitle: stats.scheduledPosts > 0 ? "Next: Today 2:30 PM" : "No posts scheduled",
      icon: Clock },
    { title: "Connected Channels", value: stats.connectedChannels, trend: stats.trends.connectedChannels,
      subtitle: stats.connectedChannels > 0 ? `${stats.connectedChannels} active` : "No connections",
      icon: Users },
    { title: "This Month", value: stats.monthlyPosts, trend: stats.trends.monthlyPosts,
      subtitle: `${stats.monthlyPosts} posts published`, icon: BarChart3 },
    { title: "AI Credits", value: userQuota?.remainingCredits ?? stats.aiCredits, trend: stats.trends.aiCredits,
      subtitle: userQuota ? `${userQuota.usedCredits}/${userQuota.totalCredits} used (${userQuota.planType})` : "Loading...", icon: Zap }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}><CardContent className="p-4 sm:p-5">
            <div className="animate-pulse space-y-3">
              <div className="h-9 w-9 bg-muted rounded-lg" />
              <div className="h-3 bg-muted rounded w-3/4" />
              <div className="h-7 bg-muted rounded w-1/3" />
              <div className="h-2.5 bg-muted rounded w-full" />
            </div>
          </CardContent></Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const isPositive = stat.trend >= 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;
        const hasTrend = stat.trend !== 0;
        return (
          <Card key={index} className="group hover:border-primary/30 transition-colors">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                {hasTrend && (
                  <span className={`inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-medium px-1.5 py-0.5 rounded-md ${
                    isPositive 
                      ? 'text-green-700 bg-green-500/10 dark:text-green-400' 
                      : 'text-destructive bg-destructive/10'
                  }`}>
                    <TrendIcon className="h-3 w-3" />
                    {isPositive ? '+' : ''}{stat.trend}{stat.title === 'AI Credits' ? '' : '%'}
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">{stat.title}</p>
              <p className="text-2xl sm:text-3xl font-bold tracking-tight mt-0.5">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 truncate">{stat.subtitle}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
