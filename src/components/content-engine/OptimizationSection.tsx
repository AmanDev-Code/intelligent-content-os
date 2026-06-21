"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Info,
  ArrowUpRight,
  RotateCw,
  Globe,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { parseAdminBlogPostsList } from "@/lib/blogAdminPosts";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type PostRow = {
  id: string;
  title: string;
  slug: string;
  aeo_score: number | null;
  geo_score: number | null;
};

type CriterionScore = {
  criterion: string;
  score: number;
  explanation: string;
};

type Suggestion = {
  type: string;
  description: string;
  priority: "high" | "medium" | "low";
};

type AnalysisResult = {
  overall_score: number;
  criteria_scores: CriterionScore[];
  suggestions: Suggestion[];
};

type VariantData = {
  mode: string;
  label: string;
  content: string;
  predicted_scores: { aeo: number; geo: number; seo: number };
  changes_summary: string[];
};

type VersionsResult = {
  currentScores: {
    aeo: number;
    geo: number;
    seo: number;
    criteria: {
      aeo: CriterionScore[];
      geo: CriterionScore[];
      seo: CriterionScore[];
    };
  };
  variantA: VariantData | null;
  variantB: VariantData | null;
};

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const getColor = (val: number) => {
    if (val >= 80) return "text-emerald-600";
    if (val >= 60) return "text-amber-600";
    return "text-red-600";
  };

  const getBgColor = (val: number) => {
    if (val >= 80) return "bg-emerald-500";
    if (val >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted/30"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${score * 2.51} 251`}
            strokeLinecap="round"
            className={getBgColor(score)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("text-xl font-bold", getColor(score))}>{score}</span>
        </div>
      </div>
      <span className="text-[11px] font-medium text-muted-foreground text-center">{label}</span>
    </div>
  );
}

function CriteriaChecklist({ criteria }: { criteria: CriterionScore[] }) {
  return (
    <div className="space-y-2">
      {criteria.map((c, i) => (
        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
          {c.score >= 7 ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
          ) : c.score >= 4 ? (
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{c.criterion}</span>
              <span className="text-xs font-semibold text-muted-foreground">{c.score}/10</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{c.explanation}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ScoreComparisonBadge({
  label,
  oldScore,
  newScore,
}: {
  label: string;
  oldScore: number;
  newScore: number;
}) {
  const improved = newScore > oldScore;
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs gap-1",
        improved
          ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
          : "border-border"
      )}
    >
      {label}: {oldScore} → {newScore}
      {improved && <ArrowUpRight className="h-3 w-3" />}
    </Badge>
  );
}

function VariantCard({
  variant,
  currentScores,
  onSelect,
  applying,
  selected,
}: {
  variant: VariantData;
  currentScores: { aeo: number; geo: number; seo: number };
  onSelect: () => void;
  applying: boolean;
  selected: boolean;
}) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <Card className={cn(
      "border shadow-none transition-all",
      selected ? "border-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900" : "border-border/60"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">{variant.label}</CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            {variant.mode === "conservative" ? "Minimal Changes" : "Full Rewrite"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <ScoreComparisonBadge label="AEO" oldScore={currentScores.aeo} newScore={variant.predicted_scores.aeo} />
          <ScoreComparisonBadge label="GEO" oldScore={currentScores.geo} newScore={variant.predicted_scores.geo} />
          <ScoreComparisonBadge label="SEO" oldScore={currentScores.seo} newScore={variant.predicted_scores.seo} />
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">Changes made:</p>
          <ul className="space-y-0.5 list-disc list-inside">
            {variant.changes_summary.slice(0, 5).map((change, i) => (
              <li key={i}>{change}</li>
            ))}
          </ul>
        </div>

        <div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs px-0 h-auto text-blue-600 hover:text-blue-700"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? "Hide Preview" : "Show Full Preview"}
          </Button>
          {showPreview && (
            <div className="mt-2 border border-border rounded-lg p-4 bg-muted/20 max-h-96 overflow-y-auto">
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-xs">
                {variant.content}
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={onSelect}
          disabled={applying}
          className="w-full gap-2"
          variant={selected ? "default" : "outline"}
        >
          {applying ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : selected ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          {applying ? "Applying..." : selected ? "Applied!" : "Use This Version"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function OptimizationSection() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  // Step 1: Analysis
  const [aeoAnalysis, setAeoAnalysis] = useState<AnalysisResult | null>(null);
  const [geoAnalysis, setGeoAnalysis] = useState<AnalysisResult | null>(null);
  const [seoAnalysis, setSeoAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Step 2: Versions
  const [versions, setVersions] = useState<VersionsResult | null>(null);
  const [generatingVersions, setGeneratingVersions] = useState(false);

  // Step 3/4: Apply
  const [applying, setApplying] = useState(false);
  const [appliedVariant, setAppliedVariant] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const data = await apiClient.get("/admin/blog/posts");
      setPosts(parseAdminBlogPostsList<PostRow>(data));
    } catch {
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const resetState = () => {
    setAeoAnalysis(null);
    setGeoAnalysis(null);
    setSeoAnalysis(null);
    setVersions(null);
    setAppliedVariant(null);
  };

  const handleSelectPost = (postId: string) => {
    setSelectedPostId(postId);
    resetState();
  };

  const analyzeAll = async () => {
    if (!selectedPostId) return;
    setAnalyzing(true);
    try {
      const [aeo, geo, seo] = await Promise.all([
        apiClient.get(`/admin/content-engine/optimize/${selectedPostId}/aeo`),
        apiClient.get(`/admin/content-engine/optimize/${selectedPostId}/geo`),
        apiClient.get(`/admin/content-engine/optimize/${selectedPostId}/seo`),
      ]);
      setAeoAnalysis(aeo as AnalysisResult);
      setGeoAnalysis(geo as AnalysisResult);
      setSeoAnalysis(seo as AnalysisResult);
      toast({ title: "Analysis complete", description: "Scores and criteria loaded for all dimensions" });
    } catch {
      toast({ title: "Analysis failed", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const generateVersions = async () => {
    if (!selectedPostId) return;
    setGeneratingVersions(true);

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
      toast({
        title: "Generation timed out",
        description: "The article may be too long. Please try again.",
        variant: "destructive",
      });
      setGeneratingVersions(false);
    }, 240000);

    try {
      const data = await apiClient.post(
        `/admin/content-engine/optimize/${selectedPostId}/generate-versions`,
        {},
        { signal: abortController.signal }
      );
      clearTimeout(timeoutId);
      setVersions(data as VersionsResult);
      const result = data as VersionsResult;
      const variantsReady = [result.variantA, result.variantB].filter(Boolean).length;
      toast({
        title: "Variants generated",
        description: variantsReady === 2
          ? "2 optimized versions are ready for review"
          : "1 optimized version is ready (the other variant failed)",
      });
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") return;
      toast({ title: "Failed to generate versions", variant: "destructive" });
    } finally {
      setGeneratingVersions(false);
    }
  };

  const applyVersion = async (variant: VariantData) => {
    if (!selectedPostId) return;
    setApplying(true);
    try {
      await apiClient.post(`/admin/content-engine/optimize/${selectedPostId}/apply-version`, {
        content: variant.content,
      });
      setAppliedVariant(variant.mode);
      toast({
        title: "Version applied!",
        description: "Your blog post has been updated with the optimized content.",
      });
      await loadPosts();
    } catch {
      toast({ title: "Failed to apply version", variant: "destructive" });
    } finally {
      setApplying(false);
    }
  };

  const handleReAnalyze = () => {
    setVersions(null);
    setAppliedVariant(null);
    analyzeAll();
  };

  const selectedPost = posts.find((p) => p.id === selectedPostId);
  const hasAnalysis = aeoAnalysis && geoAnalysis && seoAnalysis;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Content Optimization</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Optimize content for search engines, AI assistants, and generative AI citations
        </p>
      </div>

      {/* How it works */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">How It Works</p>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-blue-700 dark:text-blue-300">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-900 dark:text-blue-100">1.</span>
                  <span><strong>Analyze</strong> — Get SEO, AEO & GEO scores with per-criterion breakdowns</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-900 dark:text-blue-100">2.</span>
                  <span><strong>Generate</strong> — AI creates 2 full article variants (conservative + aggressive)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-900 dark:text-blue-100">3.</span>
                  <span><strong>Preview</strong> — Compare variants with predicted score improvements</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-blue-900 dark:text-blue-100">4.</span>
                  <span><strong>Apply</strong> — One-click replaces your post, then re-analyze to confirm</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Post selector */}
      <Card className="border border-border/60 shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              {loadingPosts ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedPostId || ""} onValueChange={handleSelectPost}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a post to optimize..." />
                  </SelectTrigger>
                  <SelectContent>
                    {posts.map((post) => {
                      const hasScores = post.aeo_score !== null || post.geo_score !== null;
                      const scoreText = hasScores
                        ? `AEO: ${post.aeo_score ?? "—"} | GEO: ${post.geo_score ?? "—"}`
                        : "(not analyzed)";
                      return (
                        <SelectItem key={post.id} value={post.id}>
                          {post.title} | {scoreText}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedPostId && (
        <div className="space-y-6">
          {/* Step 1: Analyze */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
                Analyze
              </h2>
              <Button onClick={hasAnalysis ? handleReAnalyze : analyzeAll} disabled={analyzing} className="gap-2">
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {hasAnalysis ? "Re-Analyze" : "Analyze All Scores"}
              </Button>
            </div>

            {analyzing && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Analyzing SEO, AEO & GEO scores...</span>
              </div>
            )}

            {hasAnalysis && (
              <>
                {/* Score gauges */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="border border-border/60 shadow-none">
                    <CardContent className="p-4 flex flex-col items-center">
                      <ScoreGauge score={seoAnalysis.overall_score} label="SEO" />
                    </CardContent>
                  </Card>
                  <Card className="border border-border/60 shadow-none">
                    <CardContent className="p-4 flex flex-col items-center">
                      <ScoreGauge score={aeoAnalysis.overall_score} label="AEO" />
                    </CardContent>
                  </Card>
                  <Card className="border border-border/60 shadow-none">
                    <CardContent className="p-4 flex flex-col items-center">
                      <ScoreGauge score={geoAnalysis.overall_score} label="GEO" />
                    </CardContent>
                  </Card>
                </div>

                {/* Criteria details */}
                <Tabs defaultValue="seo" className="space-y-3">
                  <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="seo" className="gap-1.5 text-xs">
                      <Globe className="h-3.5 w-3.5" />
                      SEO
                    </TabsTrigger>
                    <TabsTrigger value="aeo" className="gap-1.5 text-xs">
                      <Search className="h-3.5 w-3.5" />
                      AEO
                    </TabsTrigger>
                    <TabsTrigger value="geo" className="gap-1.5 text-xs">
                      <Sparkles className="h-3.5 w-3.5" />
                      GEO
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="seo">
                    <Card className="border border-border/60 shadow-none">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">SEO Criteria</CardTitle>
                      </CardHeader>
                      <CardContent className="max-h-72 overflow-y-auto">
                        <CriteriaChecklist criteria={seoAnalysis.criteria_scores} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="aeo">
                    <Card className="border border-border/60 shadow-none">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">AEO Criteria</CardTitle>
                      </CardHeader>
                      <CardContent className="max-h-72 overflow-y-auto">
                        <CriteriaChecklist criteria={aeoAnalysis.criteria_scores} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="geo">
                    <Card className="border border-border/60 shadow-none">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">GEO Criteria</CardTitle>
                      </CardHeader>
                      <CardContent className="max-h-72 overflow-y-auto">
                        <CriteriaChecklist criteria={geoAnalysis.criteria_scores} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>

          {/* Step 2: Generate Versions */}
          {hasAnalysis && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                  Generate Optimized Versions
                </h2>
                {!versions && (
                  <Button onClick={generateVersions} disabled={generatingVersions} className="gap-2">
                    {generatingVersions ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Generate Variants
                  </Button>
                )}
              </div>

              {generatingVersions && (
                <Card className="border border-border/60 shadow-none">
                  <CardContent className="py-12 text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-sm font-medium">Generating 2 optimized variants...</p>
                    <p className="text-xs text-muted-foreground">
                      This may take 1-2 minutes for long articles. The AI is rewriting your entire post.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Preview & Select */}
              {versions && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
                    Preview & Select
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {versions.variantA ? (
                      <VariantCard
                        variant={versions.variantA}
                        currentScores={versions.currentScores}
                        onSelect={() => applyVersion(versions.variantA!)}
                        applying={applying && appliedVariant !== versions.variantA.mode}
                        selected={appliedVariant === versions.variantA.mode}
                      />
                    ) : (
                      <Card className="border-dashed opacity-60">
                        <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
                          <p className="text-sm text-muted-foreground text-center">Conservative variant failed to generate. Try again later.</p>
                        </CardContent>
                      </Card>
                    )}
                    {versions.variantB ? (
                      <VariantCard
                        variant={versions.variantB}
                        currentScores={versions.currentScores}
                        onSelect={() => applyVersion(versions.variantB!)}
                        applying={applying && appliedVariant !== versions.variantB.mode}
                        selected={appliedVariant === versions.variantB.mode}
                      />
                    ) : (
                      <Card className="border-dashed opacity-60">
                        <CardContent className="p-6 flex items-center justify-center min-h-[200px]">
                          <p className="text-sm text-muted-foreground text-center">Comprehensive variant failed to generate. Try again later.</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4/5: After applying */}
              {appliedVariant && (
                <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <div>
                          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                            Version applied successfully!
                          </p>
                          <p className="text-xs text-emerald-700 dark:text-emerald-300">
                            Your blog post has been updated. Re-analyze to confirm the score improvements.
                          </p>
                        </div>
                      </div>
                      <Button onClick={handleReAnalyze} variant="outline" className="gap-2">
                        <RotateCw className="h-4 w-4" />
                        Re-Analyze
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      )}

      {!selectedPostId && (
        <Card className="border border-border/60 shadow-none">
          <CardContent className="py-12 text-center">
            <Zap className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Select a post to start optimizing</p>
            <p className="text-xs text-muted-foreground mt-1">
              Analyze and generate optimized versions for SEO, AEO (Answer Engines), and GEO (Generative AI)
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
