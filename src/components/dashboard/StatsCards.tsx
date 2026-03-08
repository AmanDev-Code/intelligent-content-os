import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Users, 
  BarChart3, 
  Zap,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface StatsData {
  scheduledPosts: number;
  connectedChannels: number;
  monthlyPosts: number;
  aiCredits: number;
  trends: {
    scheduledPosts: number;
    connectedChannels: number;
    monthlyPosts: number;
    aiCredits: number;
  };
}

export function StatsCards() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatsData>({
    scheduledPosts: 0,
    connectedChannels: 0,
    monthlyPosts: 0,
    aiCredits: 50, // Default credits
    trends: {
      scheduledPosts: 0,
      connectedChannels: 0,
      monthlyPosts: 0,
      aiCredits: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch scheduled posts
      const { data: scheduledPosts } = await supabase
        .from('generated_content')
        .select('id')
        .eq('user_id', user?.id)
        .gte('created_at', new Date().toISOString())
        .is('deleted_at', null);

      // Fetch monthly posts
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { data: monthlyPosts } = await supabase
        .from('generated_content')
        .select('id')
        .eq('user_id', user?.id)
        .gte('created_at', startOfMonth.toISOString())
        .is('deleted_at', null);

      // For now, we'll assume no connected channels since we don't have OAuth setup
      // In a real app, you'd fetch this from a user_connections table
      
      setStats({
        scheduledPosts: scheduledPosts?.length || 0,
        connectedChannels: 0, // No real connections yet
        monthlyPosts: monthlyPosts?.length || 0,
        aiCredits: 50, // Mock data - would come from user profile
        trends: {
          scheduledPosts: 0,
          connectedChannels: 0,
          monthlyPosts: monthlyPosts?.length > 0 ? 15 : 0,
          aiCredits: -3 // 3 used today
        }
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Scheduled Posts",
      value: stats.scheduledPosts,
      trend: stats.trends.scheduledPosts,
      subtitle: stats.scheduledPosts > 0 ? "Next: Today 2:30 PM" : "No posts scheduled",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Connected Channels",
      value: stats.connectedChannels,
      trend: stats.trends.connectedChannels,
      subtitle: stats.connectedChannels > 0 ? `${stats.connectedChannels} Active` : "No connections",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    },
    {
      title: "This Month",
      value: stats.monthlyPosts,
      trend: stats.trends.monthlyPosts,
      subtitle: `${stats.monthlyPosts} posts published`,
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    },
    {
      title: "AI Credits",
      value: stats.aiCredits,
      trend: stats.trends.aiCredits,
      subtitle: `${Math.abs(stats.trends.aiCredits)} used today • Resets in 18 days`,
      icon: Zap,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const isPositiveTrend = stat.trend >= 0;
        const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;
        
        return (
          <Card key={index} className={`border-0 ${stat.bgColor}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                {stat.trend !== 0 && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    <TrendIcon className="h-3 w-3" />
                    {isPositiveTrend ? '+' : ''}{stat.trend}{stat.title === 'AI Credits' ? '' : '%'}
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}