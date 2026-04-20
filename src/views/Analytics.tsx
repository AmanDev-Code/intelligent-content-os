import { useState, useEffect, useRef, useMemo } from "react";
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
import { api } from "@/lib/apiClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AnalyticsData {
  totalReach: number;
  totalEngagement: number;
  totalEngagementRate: string;
  postsPublished: number;
  avgEngagementRate: string;
  performanceData: Array<{
    platform: string;
    posts: number;
    reach: number;
    engagement: number;
    engagementRate: string;
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
    clicks: number;
    impressions: number;
    engagementRate: number;
  }>;
  sourceInfo?: {
    availableMetrics?: string[];
    source?: string;
  };
}

interface InsightItem {
  title: "Best Posting Time" | "Top Content Type" | "Engagement Rate" | "Growth Rate";
  value: string;
  description: string;
  trend: string;
}

interface InsightsResponse {
  hasData: boolean;
  accountType: "organization_admin" | "personal";
  canViewEngagementMetrics: boolean;
  engagementMetricsMessage: string;
  insights: InsightItem[];
}

interface AccountTypeResponse {
  accountType: "organization_admin" | "personal";
  linkedMemberId: string | null;
  organizationAdminCount: number;
  organizationNames: string[];
  canViewEngagementMetrics: boolean;
  reason: string;
}

interface PostingIdentity {
  id: string;
  actorType: "member" | "organization";
  label: string;
  organizationUrn?: string;
}

export default function Analytics() {
  const { isConnected: linkedinConnected, metrics: linkedinMetrics, needsReauth } = useLinkedIn();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [insightsData, setInsightsData] = useState<InsightsResponse | null>(null);
  const [accountTypeData, setAccountTypeData] = useState<AccountTypeResponse | null>(null);
  const [postingIdentities, setPostingIdentities] = useState<PostingIdentity[]>([]);
  const [selectedIdentityId, setSelectedIdentityId] = useState<string>("");
  const [chartMetric, setChartMetric] = useState<"reach" | "engagementRate" | "clicks">("reach");
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const selectedIdentity = postingIdentities.find((i) => i.id === selectedIdentityId) || null;
  const canViewEngagementMetrics = accountTypeData?.canViewEngagementMetrics ?? false;
  const analyticsFetchSeqRef = useRef(0);

  useEffect(() => {
    const loadIdentities = async () => {
      if (!linkedinConnected) {
        setPostingIdentities([]);
        setSelectedIdentityId("");
        return;
      }
      try {
        const res = await api.linkedin.postingIdentities();
        const ids = Array.isArray(res?.identities) ? res.identities : [];
        setPostingIdentities(ids);
        if (ids.length > 0) {
          setSelectedIdentityId((prev) =>
            prev && ids.some((i: PostingIdentity) => i.id === prev)
              ? prev
              : (res?.defaultIdentityId || ids[0].id),
          );
        }
      } catch {
        setPostingIdentities([]);
      }
    };
    void loadIdentities();
  }, [linkedinConnected]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      const fetchSeq = ++analyticsFetchSeqRef.current;
      if (!linkedinConnected || !selectedIdentity) {
        setAnalyticsData(null);
        setInsightsData(null);
        setAccountTypeData(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [analyticsResponse, insightsResponse, accountTypeResponse, orgResponse] = await Promise.all([
          api.linkedin.analytics(10, {
            actorType: selectedIdentity.actorType,
            organizationUrn: selectedIdentity.organizationUrn,
          }),
          api.linkedin.insights(30, {
            actorType: selectedIdentity.actorType,
            organizationUrn: selectedIdentity.organizationUrn,
          }),
          api.linkedin.accountType({
            actorType: selectedIdentity.actorType,
            organizationUrn: selectedIdentity.organizationUrn,
          }),
          selectedIdentity.actorType === "organization"
            ? api.linkedin.organization({ organizationUrn: selectedIdentity.organizationUrn })
            : Promise.resolve(null),
        ]);

        // Handle case where we have some data but not all
        const posts = Array.isArray(analyticsResponse) ? analyticsResponse : [];
        const totalEngagement = posts.reduce((sum: number, post: any) => 
          sum + post.likes + post.comments + post.shares, 0);
        
        const totalImpressions = posts.reduce((sum: number, post: any) => 
          sum + post.impressions, 0);

        const avgEngagementRate = posts.length > 0 
          ? (posts.reduce((sum: number, post: any) => sum + post.engagementRate, 0) / posts.length).toFixed(1)
          : '0.0';

        const orgFollowers = Number((orgResponse as any)?.followers || 0);
        const orgImpressions = Number((orgResponse as any)?.impressions || 0);
        const orgEngagement = Number((orgResponse as any)?.engagement || 0);
        const orgPosts = Number((orgResponse as any)?.posts || 0);
        const orgClicks = Number((orgResponse as any)?.clicks || 0);
        const useOrgMetrics = selectedIdentity.actorType === "organization";
        const postClicks = posts.reduce(
          (sum: number, post: any) => sum + Number(post?.clicks || 0),
          0,
        );
        const effectiveReach = useOrgMetrics
          ? orgImpressions > 0
            ? orgImpressions
            : totalImpressions > 0
              ? totalImpressions
              : orgFollowers
          : totalImpressions;
        const effectiveClicks = useOrgMetrics
          ? orgClicks > 0
            ? orgClicks
            : postClicks
          : postClicks;
        const effectiveEngagement = useOrgMetrics ? orgEngagement : totalEngagement;
        const totalEngagementRate = effectiveReach > 0
          ? `${((effectiveEngagement / effectiveReach) * 100).toFixed(1)}%`
          : "0.0%";

        if (fetchSeq !== analyticsFetchSeqRef.current) return;
        setAnalyticsData({
          totalReach: effectiveReach,
          totalEngagement: effectiveEngagement,
          totalEngagementRate,
          postsPublished: useOrgMetrics ? orgPosts : posts.length,
          avgEngagementRate: `${avgEngagementRate}%`,
          performanceData: [{
            platform: 'LinkedIn',
            posts: useOrgMetrics ? orgPosts : posts.length,
            reach: effectiveReach,
            engagement: effectiveEngagement,
            engagementRate: totalEngagementRate,
            clicks: effectiveClicks,
            growth: 'Live data',
            growthUp: useOrgMetrics
              ? effectiveReach > 0 || orgEngagement > 0
              : totalImpressions > 0 || totalEngagement > 0
          }],
          topPosts: posts.map((post: any) => ({
            id: post.id,
            content: post.content.substring(0, 50) + '...',
            platform: 'LinkedIn',
            publishedAt: post.publishedAt,
            likes: post.likes,
            comments: post.comments,
            shares: post.shares,
            clicks: Number(post.clicks || 0),
            impressions: post.impressions,
            engagementRate: post.engagementRate
          })),
          sourceInfo: {
            availableMetrics: (orgResponse as any)?.availableMetrics || [],
            source: (orgResponse as any)?.source || (useOrgMetrics ? 'organization' : 'personal'),
          },
        });
        setInsightsData(insightsResponse || null);
        setAccountTypeData(accountTypeResponse || null);
      } catch (error) {
        if (fetchSeq !== analyticsFetchSeqRef.current) return;
        console.error('Error fetching analytics data:', error);
        setAnalyticsData(null);
        setInsightsData(null);
        setAccountTypeData(null);
      } finally {
        if (fetchSeq !== analyticsFetchSeqRef.current) return;
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [linkedinConnected, selectedIdentityId]);

  const chartData = useMemo(() => {
    const byDay = new Map<
      string,
      {
        date: string;
        label: string;
        reach: number;
        engagementRateSum: number;
        clicks: number;
        postCount: number;
      }
    >();

    for (const post of analyticsData?.topPosts || []) {
      const dt = new Date(post.publishedAt);
      if (Number.isNaN(dt.getTime())) continue;
      const dayKey = dt.toISOString().slice(0, 10);
      const label = dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const existing = byDay.get(dayKey) || {
        date: dayKey,
        label,
        reach: 0,
        engagementRateSum: 0,
        clicks: 0,
        postCount: 0,
      };
      existing.reach += Number(post.impressions || 0);
      existing.engagementRateSum += Number(post.engagementRate || 0);
      existing.clicks += Number(post.clicks || 0);
      existing.postCount += 1;
      byDay.set(dayKey, existing);
    }

    return [...byDay.values()]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-8)
      .map((row) => ({
        date: row.date,
        label: row.label,
        reach: row.reach,
        engagementRate:
          row.postCount > 0 ? row.engagementRateSum / row.postCount : 0,
        clicks: row.clicks,
        postCount: row.postCount,
      }));
  }, [analyticsData?.topPosts]);

  const maxChartValue = useMemo(() => {
    const max = chartData.reduce((acc, row) => {
      const value = chartMetric === "reach"
        ? row.reach
        : chartMetric === "engagementRate"
          ? row.engagementRate
          : row.clicks;
      return Math.max(acc, value);
    }, 0);
    return max <= 0 ? 1 : max;
  }, [chartData, chartMetric]);

  const minChartValue = useMemo(() => {
    if (chartData.length === 0) return 0;
    const min = chartData.reduce((acc, row) => {
      const value = chartMetric === "reach"
        ? row.reach
        : chartMetric === "engagementRate"
          ? row.engagementRate
          : row.clicks;
      return Math.min(acc, value);
    }, Number.POSITIVE_INFINITY);
    return Number.isFinite(min) ? min : 0;
  }, [chartData, chartMetric]);

  const isFlatChart = maxChartValue === 0 || Math.abs(maxChartValue - minChartValue) < 0.0001;

  const activePoint = hoveredPointIndex != null ? chartData[hoveredPointIndex] : null;

  const metricLabel =
    chartMetric === "reach"
      ? "Reach"
      : chartMetric === "engagementRate"
        ? "Engagement %"
        : "Clicks";

  return (
    <div className="flex-1 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">Track your content performance and audience growth</p>
          {linkedinConnected && postingIdentities.length > 0 && (
            <div className="mt-2 w-full max-w-sm">
              <Select value={selectedIdentityId} onValueChange={setSelectedIdentityId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose account analytics" />
                </SelectTrigger>
                <SelectContent>
                  {postingIdentities.map((identity) => (
                    <SelectItem key={identity.id} value={identity.id}>
                      {identity.actorType === "organization" ? "Company: " : "Personal: "}
                      {identity.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Viewing analytics for {selectedIdentity?.actorType === "organization" ? "company page" : "personal profile"}.
              </p>
            </div>
          )}
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
            {
              title: "Total Reach",
              value: canViewEngagementMetrics
                ? analyticsData?.totalReach?.toLocaleString() || "0"
                : "N/A",
              trend: canViewEngagementMetrics
                ? "Live LinkedIn data"
                : "Available for LinkedIn Company Pages",
              icon: Users,
            },
            {
              title: "Engagement",
              value: canViewEngagementMetrics
                ? analyticsData?.totalEngagementRate || "0.0%"
                : "N/A",
              trend: canViewEngagementMetrics
                ? "Live LinkedIn data"
                : "Available for LinkedIn Company Pages",
              icon: Heart,
            },
            { title: "Posts Published", value: analyticsData?.postsPublished?.toString() || "0", trend: "Live LinkedIn data", icon: BarChart3 },
            {
              title: "Avg. Engagement Rate",
              value: canViewEngagementMetrics ? analyticsData?.avgEngagementRate || "0%" : "N/A",
              trend: canViewEngagementMetrics
                ? "Live LinkedIn data"
                : "Available for LinkedIn Company Pages",
              icon: PieChart,
            },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        {/* Performance Chart */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-base sm:text-lg">Performance Overview</CardTitle>
                <div className="flex items-center gap-1 rounded-md border bg-muted/40 p-1">
                  {[
                    { key: "reach", label: "Reach" },
                    { key: "engagementRate", label: "Engagement %" },
                    { key: "clicks", label: "Clicks" },
                  ].map((metric) => (
                    <button
                      key={metric.key}
                      type="button"
                      onClick={() => setChartMetric(metric.key as "reach" | "engagementRate" | "clicks")}
                      className={`rounded px-2.5 py-1 text-xs transition-colors ${
                        chartMetric === metric.key
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {metric.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 h-full">
              {!linkedinConnected || chartData.length === 0 ? (
                <div className="h-48 sm:h-80 flex items-center justify-center bg-muted/30 rounded-lg">
                  <div className="text-center px-4">
                    <BarChart3 className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Not enough post points to chart yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Publish more posts to unlock interactive trend lines
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border bg-muted/10 p-3 sm:p-4 h-[360px] lg:h-[420px]">
                  <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
                    <span className="text-muted-foreground">Metric:</span>
                    <span className="font-medium">{metricLabel}</span>
                    {activePoint && (
                      <span className="text-muted-foreground">
                        {activePoint.label}:{" "}
                        <span className="font-medium text-foreground">
                          {chartMetric === "engagementRate"
                            ? `${activePoint.engagementRate.toFixed(1)}%`
                            : chartMetric === "reach"
                              ? activePoint.reach.toLocaleString()
                              : activePoint.clicks.toLocaleString()}
                        </span>
                      </span>
                    )}
                  </div>

                  {isFlatChart ? (
                    <div className="h-[270px] sm:h-[320px] rounded-lg border border-dashed border-muted/40 flex items-center justify-center text-center px-4">
                      <div>
                        <p className="text-sm font-medium">No measurable trend yet</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          LinkedIn returned very low or equal values for this metric in the selected time window.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative h-[270px] sm:h-[320px] pl-10">
                      <div className="absolute left-0 top-0 bottom-8 w-10 flex flex-col justify-between text-[10px] text-muted-foreground">
                        {[maxChartValue, (maxChartValue + minChartValue) / 2, minChartValue].map((v, idx) => (
                          <span key={idx}>
                            {chartMetric === "engagementRate" ? `${v.toFixed(1)}%` : Math.round(v).toLocaleString()}
                          </span>
                        ))}
                      </div>

                      <div className="absolute inset-x-10 top-0 bottom-8 grid grid-rows-4">
                        {[0, 1, 2, 3].map((line) => (
                          <div key={line} className="border-b border-muted/30" />
                        ))}
                      </div>

                      <div className="absolute inset-x-10 top-0 bottom-8 flex items-end gap-2">
                        {chartData.map((point, index) => {
                          const rawValue =
                            chartMetric === "reach"
                              ? point.reach
                              : chartMetric === "engagementRate"
                                ? point.engagementRate
                                : point.clicks;
                          const ratio = (rawValue - minChartValue) / (maxChartValue - minChartValue || 1);
                          const height = Math.max(12, Math.round(ratio * 220));
                          return (
                            <button
                              key={`${point.date}-${index}`}
                              type="button"
                              className="group flex-1 h-full flex flex-col justify-end items-center outline-none"
                              onMouseEnter={() => setHoveredPointIndex(index)}
                              onMouseLeave={() => setHoveredPointIndex(null)}
                              onFocus={() => setHoveredPointIndex(index)}
                              onBlur={() => setHoveredPointIndex(null)}
                              aria-label={`${point.label} ${metricLabel}`}
                            >
                              <span className="mb-1 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                {chartMetric === "engagementRate"
                                  ? `${rawValue.toFixed(1)}%`
                                  : rawValue.toLocaleString()}
                              </span>
                              <div
                                className="w-full rounded-t-md bg-primary/80 group-hover:bg-primary transition-colors"
                                style={{ height: `${height}px` }}
                              />
                            </button>
                          );
                        })}
                      </div>

                      <div className="absolute inset-x-10 bottom-0 h-8 flex items-end gap-2">
                        {chartData.map((point) => (
                          <span
                            key={point.date}
                            className="flex-1 text-center text-[10px] sm:text-xs text-muted-foreground truncate"
                          >
                            {point.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <Card className="h-full lg:min-h-[520px]">
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Award className="h-4 w-4 sm:h-5 sm:w-5" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 h-full">
            {!linkedinConnected ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Connect LinkedIn to see insights</p>
              </div>
            ) : !insightsData?.hasData ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Not enough connected data yet</p>
              </div>
            ) : (
              <div className="space-y-3 h-full">
                {(insightsData?.insights || []).map((insight, index) => {
                  const iconMap = {
                    "Best Posting Time": Clock,
                    "Top Content Type": Target,
                    "Engagement Rate": Activity,
                    "Growth Rate": TrendingUp,
                  } as const;
                  const InsightIcon = iconMap[insight.title] || Activity;
                  return (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg shrink-0">
                      <InsightIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
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
                  );
                })}
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
              {analyticsData?.topPosts?.slice(0, 3).map((post, index) => (
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
              {!canViewEngagementMetrics && (
                <div className="rounded-md border border-orange-300/40 bg-orange-500/5 p-3">
                  <p className="text-xs font-medium text-orange-700 dark:text-orange-300">
                    Personal LinkedIn account detected
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {accountTypeData?.reason ||
                      insightsData?.engagementMetricsMessage ||
                      "LinkedIn engagement metrics (reach, clicks, impressions) are typically available for Company Page analytics or restricted partner scopes."}
                  </p>
                  {accountTypeData?.organizationNames?.length ? (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Org access: {accountTypeData.organizationNames.join(", ")}
                    </p>
                  ) : null}
                </div>
              )}
              {canViewEngagementMetrics && (
                <div className="rounded-md border border-blue-300/40 bg-blue-500/5 p-3">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    Company analytics source: {analyticsData?.sourceInfo?.source || "live"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 break-words">
                    Available metrics:{" "}
                    {(analyticsData?.sourceInfo?.availableMetrics || []).length > 0
                      ? analyticsData?.sourceInfo?.availableMetrics?.join(", ")
                      : "No metric fields returned by LinkedIn for this page yet"}
                  </p>
                </div>
              )}
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
                      <p className="text-base sm:text-lg font-bold">
                        {canViewEngagementMetrics ? platform.reach.toLocaleString() : "N/A"}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Reach</p>
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-bold">
                        {canViewEngagementMetrics ? platform.engagementRate : "N/A"}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Engagement</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div>
                        <p className="text-base sm:text-lg font-bold">
                          {canViewEngagementMetrics ? platform.clicks : "N/A"}
                        </p>
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
