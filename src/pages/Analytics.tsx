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
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track your content performance and audience growth
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Last 30 Days
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15,420</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5% from last month
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.2% from last month
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Posts Published</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +4 from last month
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement Rate</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.2%</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2.1% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Interactive charts coming soon</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Connect your social media accounts to see detailed analytics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Key Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <insight.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{insight.title}</p>
                      <p className="text-lg font-bold">{insight.value}</p>
                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {insight.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Performing Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPosts.map((post, index) => (
              <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                    <span className="text-sm font-bold text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{post.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{post.platform}</span>
                      <span>•</span>
                      <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{post.reach.toLocaleString()} reach</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4 text-blue-500" />
                      <span>{post.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="h-4 w-4 text-green-500" />
                      <span>{post.shares}</span>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {post.engagement} engagement
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceData.map((platform, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <div>
                    <h3 className="font-medium">{platform.platform}</h3>
                    <p className="text-sm text-muted-foreground">{platform.posts} posts published</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-lg font-bold">{platform.reach.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Reach</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{platform.engagement}</p>
                    <p className="text-xs text-muted-foreground">Engagement</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{platform.clicks}</p>
                    <p className="text-xs text-muted-foreground">Clicks</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {platform.growthUp ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      platform.growthUp ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {platform.growth}
                    </span>
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