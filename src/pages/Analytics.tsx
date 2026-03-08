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

const performanceData = [
  {
    platform: 'LinkedIn',
    posts: 24,
    reach: 15420,
    engagement: 892,
    clicks: 156,
    growth: '+12.5%',
    growthUp: true
  }
];

const topPosts = [
  {
    id: 1,
    title: "AI Agents Are Changing Everything",
    platform: 'LinkedIn',
    publishedAt: '2026-03-05',
    likes: 234,
    comments: 45,
    shares: 23,
    reach: 5420,
    engagement: '8.2%'
  },
  {
    id: 2,
    title: "The Future of Remote Work",
    platform: 'LinkedIn',
    publishedAt: '2026-03-03',
    likes: 189,
    comments: 32,
    shares: 18,
    reach: 4230,
    engagement: '6.7%'
  },
  {
    id: 3,
    title: "Startup Funding in 2026",
    platform: 'LinkedIn',
    publishedAt: '2026-03-01',
    likes: 156,
    comments: 28,
    shares: 15,
    reach: 3890,
    engagement: '5.9%'
  }
];

const insights = [
  {
    title: "Best Posting Time",
    value: "10:00 AM",
    description: "Tuesday & Thursday",
    icon: Clock,
    trend: "+15% engagement"
  },
  {
    title: "Top Content Type",
    value: "AI/Tech Posts",
    description: "67% of top performers",
    icon: Target,
    trend: "+23% reach"
  },
  {
    title: "Engagement Rate",
    value: "7.2%",
    description: "Above industry avg",
    icon: Activity,
    trend: "+2.1% this month"
  },
  {
    title: "Growth Rate",
    value: "12.5%",
    description: "Follower growth",
    icon: TrendingUp,
    trend: "Consistent growth"
  }
];

export default function Analytics() {
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
        {[
          { title: "Total Reach", value: "15,420", trend: "+12.5% from last month", icon: Users },
          { title: "Engagement", value: "892", trend: "+8.2% from last month", icon: Heart },
          { title: "Posts Published", value: "24", trend: "+4 from last month", icon: BarChart3 },
          { title: "Avg. Engagement Rate", value: "7.2%", trend: "+2.1% from last month", icon: PieChart },
        ].map((card) => (
          <Card key={card.title}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{card.title}</p>
                <card.icon className="h-4 w-4 text-muted-foreground shrink-0 ml-1" />
              </div>
              <div className="text-xl sm:text-2xl font-bold">{card.value}</div>
              <div className="flex items-center text-[10px] sm:text-xs text-green-600 mt-1">
                <TrendingUp className="h-3 w-3 mr-1 shrink-0" />
                <span className="truncate">{card.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
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
            <div className="space-y-3">
              {insights.map((insight, index) => (
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
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Posts */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-3">
            {topPosts.map((post, index) => (
              <div key={post.id} className="p-3 border rounded-lg">
                <div className="flex items-start gap-3 mb-2">
                  <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-primary/10 rounded-lg shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-primary">#{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm sm:text-base truncate">{post.title}</h3>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-0.5 text-xs text-muted-foreground">
                      <span>{post.platform}</span>
                      <span>•</span>
                      <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{post.reach.toLocaleString()} reach</span>
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
                    {post.engagement}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Performance */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Platform Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-3">
            {performanceData.map((platform, index) => (
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
                    <p className="text-base sm:text-lg font-bold">{platform.engagement}</p>
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
