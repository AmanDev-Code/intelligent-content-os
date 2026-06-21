"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { BarChart3, Search, RefreshCw, Loader2, HelpCircle, Info, Sparkles } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { parseAdminBlogPostsList } from "@/lib/blogAdminPosts";
import { useToast } from "@/hooks/use-toast";
import { ScoreRadar } from "./ScoreRadar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type PostRow = {
  id: string;
  title: string;
  slug: string;
  seo_score: number | null;
  aeo_score: number | null;
  geo_score: number | null;
  eeat_score: number | null;
  readability_score: number | null;
  quality_score: number | null;
};

export function ScoringSection() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [calculating, setCalculating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get("/admin/blog/posts", { params: { q: search || undefined } });
      setPosts(parseAdminBlogPostsList<PostRow>(data));
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCalculate = async (postId: string) => {
    setCalculating(postId);
    try {
      await apiClient.post(`/admin/content-engine/scores/${postId}/calculate`, {});
      toast({ title: "Scores recalculated" });
      load();
    } catch {
      toast({ title: "Failed to calculate", variant: "destructive" });
    } finally {
      setCalculating(null);
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Quality Scoring</h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-sm">
                  <strong>Calculate</strong> analyzes your content across 5 dimensions:
                  <br />• <strong>SEO:</strong> Traditional search optimization
                  <br />• <strong>AEO:</strong> Answer Engine Optimization (ChatGPT, Perplexity)
                  <br />• <strong>GEO:</strong> Generative Engine Optimization (AI citations)
                  <br />• <strong>E-E-A-T:</strong> Experience, Expertise, Authority, Trust
                  <br />• <strong>Readability:</strong> Content clarity and structure
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            SEO, AEO, GEO, E-E-A-T, and Readability scores per article
          </p>
        </div>

        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Why these scores matter
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Higher scores mean better visibility in search engines and AI tools. 
                  Aim for 70+ across all dimensions for optimal performance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  What Happens
                </p>
                <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1.5">
                  <li><strong>Click Calculate:</strong> We analyze your article across 5 dimensions (SEO, AEO, GEO, E-E-A-T, Readability)</li>
                  <li><strong>Scores are saved</strong> to your post and displayed in the Articles list for easy comparison</li>
                  <li><strong>Use scores to prioritize:</strong> Identify weak articles that need optimization — focus on posts below 70</li>
                  <li><strong>Recalculate anytime:</strong> After editing, run Calculate again to see improvements and track progress</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="border border-border/60 shadow-none">
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No articles to score</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const hasScores = post.seo_score != null;
            return (
              <Card key={post.id} className="border border-border/60 shadow-none">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{post.title}</p>
                      <p className="text-xs text-muted-foreground">/{post.slug}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCalculate(post.id)}
                      disabled={calculating === post.id}
                      className="gap-1.5 shrink-0 ml-4"
                    >
                      {calculating === post.id ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3.5 w-3.5" />
                          {hasScores ? "Recalculate" : "Calculate"}
                        </>
                      )}
                    </Button>
                  </div>
                  {hasScores ? (
                    <ScoreRadar
                      scores={{
                        seo: post.seo_score ?? 0,
                        aeo: post.aeo_score ?? 0,
                        geo: post.geo_score ?? 0,
                        eeat: post.eeat_score ?? 0,
                        readability: post.readability_score ?? 0,
                      }}
                      overall={post.quality_score ?? 0}
                    />
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      No scores calculated yet — click Calculate to analyze
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
    </TooltipProvider>
  );
}
