"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Plus,
  AlertCircle,
  BarChart3,
  Target,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

type RankingOverview = {
  keywords_tracked: number;
  keywords_with_rankings: number;
  avg_position: number;
  improved: number;
  declined: number;
  unchanged: number;
};

type Mover = {
  keyword_id: string;
  keyword: string;
  position: number;
  previous_position: number;
  change: number;
  tracked_at: string;
};

type TopMovers = {
  gainers: Mover[];
  losers: Mover[];
};

type Keyword = {
  id: string;
  keyword: string;
  normalized_keyword: string;
  status: string;
};

type RankingEntry = {
  id: string;
  keyword_id: string;
  position: number;
  previous_position: number | null;
  search_engine: string;
  country: string;
  tracked_at: string;
};

export function RankTrackingSection() {
  const { toast } = useToast();
  const [overview, setOverview] = useState<RankingOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [movers, setMovers] = useState<TopMovers | null>(null);
  const [moversLoading, setMoversLoading] = useState(true);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [keywordsLoading, setKeywordsLoading] = useState(true);
  const [selectedKeywordId, setSelectedKeywordId] = useState<string | null>(null);
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [rankingsLoading, setRankingsLoading] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [formKeywordId, setFormKeywordId] = useState("");
  const [formPosition, setFormPosition] = useState("");
  const [formSearchEngine, setFormSearchEngine] = useState("google");
  const [formCountry, setFormCountry] = useState("US");
  const [submitting, setSubmitting] = useState(false);

  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const data = await apiClient.get("/admin/content-engine/rankings/overview");
      setOverview(data as RankingOverview);
    } catch {
      setOverview(null);
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  const loadMovers = useCallback(async () => {
    setMoversLoading(true);
    try {
      const data = await apiClient.get("/admin/content-engine/rankings/movers");
      setMovers(data as TopMovers);
    } catch {
      setMovers(null);
    } finally {
      setMoversLoading(false);
    }
  }, []);

  const loadKeywords = useCallback(async () => {
    setKeywordsLoading(true);
    try {
      const data = await apiClient.get("/admin/seo/keywords", { params: { limit: 200 } });
      const rows =
        data && typeof data === "object" && Array.isArray((data as { data?: unknown }).data)
          ? ((data as { data: Keyword[] }).data)
          : Array.isArray(data)
            ? (data as Keyword[])
            : [];
      setKeywords(rows);
    } catch {
      setKeywords([]);
    } finally {
      setKeywordsLoading(false);
    }
  }, []);

  const loadRankings = useCallback(async (keywordId: string) => {
    setRankingsLoading(true);
    try {
      const data = await apiClient.get(`/admin/content-engine/rankings/${keywordId}`);
      setRankings(Array.isArray(data) ? (data as RankingEntry[]) : []);
    } catch {
      setRankings([]);
    } finally {
      setRankingsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
    loadMovers();
    loadKeywords();
  }, [loadOverview, loadMovers, loadKeywords]);

  useEffect(() => {
    if (selectedKeywordId) {
      loadRankings(selectedKeywordId);
    } else {
      setRankings([]);
    }
  }, [selectedKeywordId, loadRankings]);

  const handleSubmitRanking = async () => {
    if (!formKeywordId || !formPosition) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post("/admin/content-engine/rankings/track", {
        keyword_id: formKeywordId,
        position: parseInt(formPosition, 10),
        search_engine: formSearchEngine,
        country: formCountry,
      });
      toast({ title: "Ranking recorded successfully" });
      setShowAddForm(false);
      setFormKeywordId("");
      setFormPosition("");
      loadOverview();
      loadMovers();
      if (selectedKeywordId === formKeywordId) {
        loadRankings(formKeywordId);
      }
    } catch {
      toast({ title: "Failed to record ranking", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const positionBadge = (position: number) => {
    if (position <= 3) return "bg-green-500/10 text-green-700 border-green-200";
    if (position <= 10) return "bg-blue-500/10 text-blue-700 border-blue-200";
    if (position <= 20) return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
    return "bg-muted text-muted-foreground";
  };

  const changeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Rank Tracking</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor keyword rankings across search engines
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Record Ranking
        </Button>
      </div>

      {/* API Integration Notice */}
      <Card className="border-yellow-200 bg-yellow-50/50 shadow-none">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Connect Google Search Console for automatic tracking
            </p>
            <p className="text-xs text-yellow-700 mt-0.5">
              Manual entry is available now. API integration (Google Search Console, SerpAPI, DataForSEO) coming soon.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                What Happens
              </p>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1.5">
                <li><strong>Add keywords:</strong> Select from your Keywords library to start tracking</li>
                <li><strong>Record rankings:</strong> Manually enter positions or import from Google Search Console</li>
                <li><strong>History tracking:</strong> Each ranking entry is saved with timestamp — view position changes over time</li>
                <li><strong>Movers report:</strong> See top gainers and losers automatically calculated from your history</li>
                <li><strong>Use data to prioritize:</strong> Focus optimization efforts on keywords that dropped or are close to page 1</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Ranking Form */}
      {showAddForm && (
        <Card className="border border-border/60 shadow-none">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-medium">Record New Ranking</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label>Keyword *</Label>
                {keywords.length === 0 ? (
                  <div className="text-xs text-muted-foreground p-2 border rounded-md bg-muted/30">
                    No keywords available. Add keywords first.
                  </div>
                ) : (
                  <Select value={formKeywordId} onValueChange={setFormKeywordId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select keyword" />
                    </SelectTrigger>
                    <SelectContent>
                      {keywords.map((kw) => (
                        <SelectItem key={kw.id} value={kw.id}>
                          {kw.keyword}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Position *</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="e.g., 5"
                  value={formPosition}
                  onChange={(e) => setFormPosition(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Search Engine</Label>
                <Select value={formSearchEngine} onValueChange={setFormSearchEngine}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="bing">Bing</SelectItem>
                    <SelectItem value="duckduckgo">DuckDuckGo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Select value={formCountry} onValueChange={setFormCountry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                    <SelectItem value="IN">India</SelectItem>
                    <SelectItem value="DE">Germany</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitRanking} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Save Ranking
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      {overviewLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : overview ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-border/60 shadow-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Keywords Tracked
                </p>
              </div>
              <p className="text-2xl font-bold mt-1">{overview.keywords_tracked}</p>
            </CardContent>
          </Card>
          <Card className="border border-border/60 shadow-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Avg Position
                </p>
              </div>
              <p className="text-2xl font-bold mt-1">{overview.avg_position || "—"}</p>
            </CardContent>
          </Card>
          <Card className="border border-border/60 shadow-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Improved
                </p>
              </div>
              <p className="text-2xl font-bold mt-1 text-green-600">{overview.improved}</p>
            </CardContent>
          </Card>
          <Card className="border border-border/60 shadow-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  Declined
                </p>
              </div>
              <p className="text-2xl font-bold mt-1 text-red-600">{overview.declined}</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Top Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border/60 shadow-none">
          <CardContent className="p-5">
            <h3 className="font-medium flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Top Gainers
            </h3>
            {moversLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-md" />
                ))}
              </div>
            ) : movers?.gainers && movers.gainers.length > 0 ? (
              <div className="space-y-2">
                {movers.gainers.slice(0, 5).map((m) => (
                  <div
                    key={m.keyword_id}
                    className="flex items-center justify-between p-2 rounded-md bg-green-50/50 border border-green-100"
                  >
                    <span className="text-sm font-medium truncate">{m.keyword}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={positionBadge(m.position)}>
                        #{m.position}
                      </Badge>
                      <span className="text-sm font-semibold text-green-600">
                        +{m.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No gainers yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-none">
          <CardContent className="p-5">
            <h3 className="font-medium flex items-center gap-2 mb-4">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Top Losers
            </h3>
            {moversLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-md" />
                ))}
              </div>
            ) : movers?.losers && movers.losers.length > 0 ? (
              <div className="space-y-2">
                {movers.losers.slice(0, 5).map((m) => (
                  <div
                    key={m.keyword_id}
                    className="flex items-center justify-between p-2 rounded-md bg-red-50/50 border border-red-100"
                  >
                    <span className="text-sm font-medium truncate">{m.keyword}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={positionBadge(m.position)}>
                        #{m.position}
                      </Badge>
                      <span className="text-sm font-semibold text-red-600">
                        {m.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No losers yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Keyword History */}
      <Card className="border border-border/60 shadow-none">
        <CardContent className="p-5">
          <h3 className="font-medium mb-4">Keyword Ranking History</h3>
          <div className="space-y-4">
            <div className="max-w-sm">
              <Label className="mb-1.5 block">Select Keyword</Label>
              {keywordsLoading ? (
                <Skeleton className="h-10 rounded-md" />
              ) : keywords.length === 0 ? (
                <div className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/30">
                  No keywords yet. Add keywords in the{" "}
                  <a href="/admin/content-engine?tab=keywords" className="text-primary hover:underline">
                    Keywords section
                  </a>{" "}
                  first.
                </div>
              ) : (
                <Select
                  value={selectedKeywordId || ""}
                  onValueChange={(v) => setSelectedKeywordId(v || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a keyword to view history" />
                  </SelectTrigger>
                  <SelectContent>
                    {keywords.map((kw) => (
                      <SelectItem key={kw.id} value={kw.id}>
                        {kw.keyword}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedKeywordId && (
              <div className="mt-4">
                {rankingsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 rounded-md" />
                    ))}
                  </div>
                ) : rankings.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No ranking history for this keyword
                  </p>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left px-4 py-2 font-medium">Date</th>
                          <th className="text-left px-4 py-2 font-medium">Position</th>
                          <th className="text-left px-4 py-2 font-medium">Change</th>
                          <th className="text-left px-4 py-2 font-medium">Engine</th>
                          <th className="text-left px-4 py-2 font-medium">Country</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {rankings.map((r) => {
                          const change =
                            r.previous_position !== null
                              ? r.previous_position - r.position
                              : 0;
                          return (
                            <tr key={r.id} className="hover:bg-muted/30">
                              <td className="px-4 py-2.5">
                                {new Date(r.tracked_at).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-2.5">
                                <Badge variant="outline" className={positionBadge(r.position)}>
                                  #{r.position}
                                </Badge>
                              </td>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-1">
                                  {changeIcon(change)}
                                  <span
                                    className={
                                      change > 0
                                        ? "text-green-600"
                                        : change < 0
                                          ? "text-red-600"
                                          : "text-muted-foreground"
                                    }
                                  >
                                    {change > 0 ? `+${change}` : change === 0 ? "—" : change}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-2.5 capitalize">{r.search_engine}</td>
                              <td className="px-4 py-2.5">{r.country}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
