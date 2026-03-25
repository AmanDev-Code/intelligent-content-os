import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Heart, 
  MessageCircle, 
  Share2,
  Calendar,
  Target,
  Clock,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Download
} from "lucide-react";
import { useLinkedIn } from "@/contexts/LinkedInContext";
import { apiClient } from "@/lib/apiClient";

interface AnalyticsData {
  totalReach: number;
  totalEngagement: number;
  postsPublished: number;
  avgEngagementRate: string;
  performanceData: Array<{
    platform: string;
    posts: number;
    reach: number;
    engagement: number;
    clicks: number;
    growth: string;
    growthUp: boolean;
  }>;
  topPosts: Array<{
    id: string;
    content: string;
    platform: string;
    publishedAt: string;
    likes: number;
    comments: number;
    shares: number;
    impressions: number;
    engagementRate: number;
  }>;
}

const defaultInsights = [
  {
    title: "Best Posting Time",
    value: "Unavailable",
    description: "Real LinkedIn timing data not available yet",
    icon: Clock,
    trend: "Live data only"
  },
  {
    title: "Top Content Type",
    value: "Unavailable",
    description: "Waiting for post performance data",
    icon: Target,
    trend: "Live data only"
  },
  {
    title: "Engagement Rate",
    value: "0%",
    description: "Based on fetched LinkedIn analytics",
    icon: Activity,
    trend: "Live data only"
  },
  {
    title: "Growth Rate",
    value: "Unavailable",
    description: "Follower growth data not returned yet",
    icon: TrendingUp,
    trend: "Live data only"
  }
];

export default function Analytics() {
  const { isConnected: linkedinConnected, metrics: linkedinMetrics, needsReauth } = useLinkedIn();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!linkedinConnected) {
        setAnalyticsData(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [metricsResponse, analyticsResponse] = await Promise.all([
          apiClient.get('/linkedin/metrics'),
          apiClient.get('/linkedin/analytics?limit=10')
        ]);

        // Handle case where we have some data but not all
        const posts = analyticsResponse || [];
        const totalEngagement = posts.reduce((sum: number, post: any) => 
          sum + post.likes + post.comments + post.shares, 0);
        
        const totalImpressions = posts.reduce((sum: number, post: any) => 
          sum + post.impressions, 0);

        const avgEngagementRate = posts.length > 0 
          ? (posts.reduce((sum: number, post: any) => sum + post.engagementRate, 0) / posts.length).toFixed(1)
          : '0.0';

        setAnalyticsData({
          totalReach: totalImpressions,
          totalEngagement: totalEngagement,
          postsPublished: posts.length,
          avgEngagementRate: `${avgEngagementRate}%`,
          performanceData: [{
            platform: 'LinkedIn',
            posts: posts.length,
            reach: totalImpressions,
            engagement: totalEngagement,
            clicks: posts.reduce((sum: number, post: any) => sum + post.clicks, 0),
            growth: 'Live data',
            growthUp: totalImpressions > 0 || totalEngagement > 0
          }],
          topPosts: posts.slice(0, 3).map((post: any) => ({
            id: post.id,
            content: post.content.substring(0, 50) + '...',
            platform: 'LinkedIn',
            publishedAt: post.publishedAt,
            likes: post.likes,
            comments: post.comments,
            shares: post.shares,
            impressions: post.impressions,
            engagementRate: post.engagementRate
          }))
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setAnalyticsData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [linkedinConnected]);
  return (
    <div className="flex-1 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Track your content performance and audience growth</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Export</span></Button>
          <Button variant="outline" size="sm"><Calendar className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Last 30 Days</span></Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-3 sm:p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-8 bg-muted rounded mb-1"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : !linkedinConnected ? (
          // Not connected state
          <div className="col-span-full">
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Connect LinkedIn to View Analytics</h3>
                <p className="text-muted-foreground">Connect your LinkedIn account in Settings to see detailed analytics and insights.</p>
              </CardContent>
            </Card>
          </div>
        ) : needsReauth ? (
          // Re-auth needed state
          <div className="col-span-full">
            <Card>
              <CardContent className="p-6 text-center">
                <Activity className="h-12 w-12 text-orange-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Re-authorization Required</h3>
                <p className="text-muted-foreground mb-4">
                  LinkedIn needs updated permissions to access your analytics data. Please reconnect your account in Settings.
                </p>
                <Button onClick={() => window.location.href = '/settings'}>
                  Go to Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : !analyticsData ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-6 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">No Analytics Available Yet</h3>
                <p className="text-muted-foreground">
                  Your LinkedIn account is connected, but no analytics data has been returned yet.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Real data
          [
            { title: "Total Reach", value: analyticsData?.totalReach?.toLocaleString() || "0", trend: "Live LinkedIn data", icon: Users },
            { title: "Engagement", value: analyticsData?.totalEngagement?.toLocaleString() || "0", trend: "Live LinkedIn data", icon: Heart },
            { title: "Posts Published", value: analyticsData?.postsPublished?.toString() || "0", trend: "Live LinkedIn data", icon: BarChart3 },
            { title: "Avg. Engagement Rate", value: analyticsData?.avgEngagementRate || "0%", trend: "Live LinkedIn data", icon: PieChart },
          ].map((card) => (
            <Card key={card.title}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{card.title}</p>
                  <card.icon className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
                </div>
                <div className="text-xl sm:text-2xl font-bold">{card.value}</div>
                <div className="flex items-center text-[10px] sm:text-xs text-muted-foreground mt-1">
                  <Activity className="h-3 w-3 mr-1 shrink-0" />
                  <span className="truncate">{card.trend}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Performance Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="h-48 sm:h-80 flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center px-4">
                  <BarChart3 className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Interactive charts coming soon</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Connect your accounts to see detailed analytics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <Card>
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Award className="h-4 w-4 sm:h-5 sm:w-5" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {!linkedinConnected ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Connect LinkedIn to see insights</p>
              </div>
            ) : (
              <div className="space-y-3">
                {defaultInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg shrink-0">
                      <insight.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs sm:text-sm">{insight.title}</p>
                      <p className="text-base sm:text-lg font-bold">{insight.value}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">{insight.description}</p>
                      <Badge variant="secondary" className="mt-1 text-[10px] sm:text-xs">
                        {insight.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Posts */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {!linkedinConnected ? (
            <div className="text-center py-8">
              <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Connect LinkedIn to see top posts</p>
            </div>
          ) : analyticsData?.topPosts?.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No posts found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analyticsData?.topPosts?.map((post, index) => (
                <div key={post.id} className="p-3 border rounded-lg">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 rounded-lg shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm sm:text-base truncate">{post.content}</h3>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5 text-xs text-muted-foreground">
                        <span>{post.platform}</span>
                        <span>•</span>
                        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{post.impressions.toLocaleString()} reach</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-2 ml-10 sm:ml-11">
                    <div className="flex items-center gap-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5 text-red-500" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5 text-blue-500" />
                        <span>{post.comments}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="h-3.5 w-3.5 text-green-500" />
                        <span>{post.shares}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] sm:text-xs">
                      {post.engagementRate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              )) || []}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Performance */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Platform Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {!linkedinConnected ? (
            <div className="text-center py-8">
              <PieChart className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Connect LinkedIn to see platform performance</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analyticsData?.performanceData?.map((platform, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full shrink-0" />
                    <div>
                      <h3 className="font-medium text-sm">{platform.platform}</h3>
                      <p className="text-xs text-muted-foreground">{platform.posts} posts published</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div>
                      <p className="text-base sm:text-lg font-bold">{platform.reach.toLocaleString()}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Reach</p>
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-bold">{platform.engagement.toLocaleString()}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Engagement</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div>
                        <p className="text-base sm:text-lg font-bold">{platform.clicks}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Clicks</p>
                      </div>
                      <div className="flex items-center gap-1 ml-auto">
                        {platform.growthUp ? (
                          <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                        )}
                        <span className={`text-xs font-medium ${platform.growthUp ? 'text-green-600' : 'text-red-600'}`}>
                          {platform.growth}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )) || []}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
