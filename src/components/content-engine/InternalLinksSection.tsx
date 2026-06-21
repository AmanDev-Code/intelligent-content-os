"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Link,
  Search,
  Loader2,
  Check,
  X,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Info,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { parseAdminBlogPostsList } from "@/lib/blogAdminPosts";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type PostOption = {
  id: string;
  title: string;
  slug: string;
  status: string;
};

type LinkSuggestion = {
  id: string;
  source_post_id: string;
  target_post_id: string;
  anchor_text: string;
  context_sentence: string | null;
  relevance_score: number;
  status: string;
  source_post?: { id: string; title: string; slug: string };
  target_post?: { id: string; title: string; slug: string };
};

type LinkStats = {
  total_suggestions: number;
  accepted: number;
  inserted: number;
  rejected: number;
  posts_needing_links: number;
  total_published_posts: number;
};

export function InternalLinksSection() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostOption[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<LinkSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [inserting, setInserting] = useState(false);
  const [stats, setStats] = useState<LinkStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await apiClient.get("/admin/content-engine/internal-links/stats");
      setStats(data as LinkStats);
    } catch {
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const data = await apiClient.get("/admin/blog/posts", {
        params: { status: "published", q: search || undefined },
      });
      setPosts(parseAdminBlogPostsList<PostOption>(data));
    } catch {
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }, [search]);

  const loadSuggestions = useCallback(async (postId: string) => {
    setSuggestionsLoading(true);
    try {
      const data = await apiClient.get(`/admin/content-engine/internal-links/${postId}`);
      setSuggestions(Array.isArray(data) ? (data as LinkSuggestion[]) : []);
    } catch {
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    loadPosts();
  }, [loadStats, loadPosts]);

  useEffect(() => {
    if (selectedPostId) {
      loadSuggestions(selectedPostId);
    } else {
      setSuggestions([]);
    }
  }, [selectedPostId, loadSuggestions]);

  const handleAnalyze = async () => {
    if (!selectedPostId) return;
    setAnalyzing(true);
    try {
      const data = await apiClient.post(
        `/admin/content-engine/internal-links/${selectedPostId}/analyze`,
        {},
      );
      const newSuggestions = Array.isArray(data) ? data : [];
      toast({
        title: "Analysis complete",
        description: `Found ${newSuggestions.length} link opportunities`,
      });
      loadSuggestions(selectedPostId);
      loadStats();
    } catch {
      toast({ title: "Analysis failed", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await apiClient.patch(`/admin/content-engine/internal-links/${id}/accept`);
      setSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "accepted" } : s)),
      );
      loadStats();
    } catch {
      toast({ title: "Failed to accept", variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await apiClient.patch(`/admin/content-engine/internal-links/${id}/reject`);
      setSuggestions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: "rejected" } : s)),
      );
      loadStats();
    } catch {
      toast({ title: "Failed to reject", variant: "destructive" });
    }
  };

  const handleInsertAll = async () => {
    if (!selectedPostId) return;
    setInserting(true);
    try {
      const result = await apiClient.post(
        `/admin/content-engine/internal-links/${selectedPostId}/insert`,
        {},
      );
      const count = (result as any)?.inserted_count ?? 0;
      toast({
        title: "Links inserted",
        description: `${count} link${count !== 1 ? "s" : ""} inserted into the post body`,
      });
      loadSuggestions(selectedPostId);
      loadStats();
    } catch {
      toast({ title: "Failed to insert links", variant: "destructive" });
    } finally {
      setInserting(false);
    }
  };

  const acceptedCount = suggestions.filter((s) => s.status === "accepted").length;

  const statusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-500/10 text-green-600 border-green-200";
      case "rejected":
        return "bg-red-500/10 text-red-600 border-red-200";
      case "inserted":
        return "bg-blue-500/10 text-blue-600 border-blue-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const relevanceBadge = (score: number) => {
    if (score >= 0.8) return "bg-green-500/10 text-green-700";
    if (score >= 0.5) return "bg-yellow-500/10 text-yellow-700";
    return "bg-muted text-muted-foreground";
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Internal Links</h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-sm">
                  AI finds relevant links between your articles to boost SEO and help readers discover related content.
                  Target: 10-20 internal links per article.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered internal linking to boost SEO and user navigation (target: 10-20 per article)
          </p>
        </div>

        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  How to use Internal Links
                </p>
                <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                  <li><strong>Select a post</strong> from the list below</li>
                  <li><strong>Click "Analyze Links"</strong> to find relevant linking opportunities</li>
                  <li><strong>Review suggestions</strong> — check relevance scores and context</li>
                  <li><strong>Accept/Reject</strong> each suggestion using ✓ or ✗ buttons</li>
                  <li><strong>Click "Insert"</strong> to add all accepted links to your post body</li>
                </ol>
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
                  <li><strong>When you click "Insert Links":</strong> We automatically add markdown links to your post&apos;s body field at the suggested anchor text locations</li>
                  <li><strong>Post is automatically saved</strong> with the new links embedded inline</li>
                  <li><strong>View updated content</strong> in the Articles section — the links are now part of your markdown body</li>
                  <li><strong>You can undo</strong> by editing the post body manually or re-analyzing to replace links</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Stats Bar */}
      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-border/60 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Total Suggestions
              </p>
              <p className="text-2xl font-bold mt-1">{stats.total_suggestions}</p>
            </CardContent>
          </Card>
          <Card className="border border-border/60 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Accepted
              </p>
              <p className="text-2xl font-bold mt-1 text-green-600">{stats.accepted}</p>
            </CardContent>
          </Card>
          <Card className="border border-border/60 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Inserted
              </p>
              <p className="text-2xl font-bold mt-1 text-blue-600">{stats.inserted}</p>
            </CardContent>
          </Card>
          <Card className="border border-border/60 shadow-none">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1">
                Posts Needing Links
                {stats.posts_needing_links > 0 && (
                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                )}
              </p>
              <p className="text-2xl font-bold mt-1">
                {stats.posts_needing_links}
                <span className="text-sm font-normal text-muted-foreground">
                  /{stats.total_published_posts}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Post Selector */}
      <Card className="border border-border/60 shadow-none">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
            <div className="flex-1 w-full">
              <label className="text-sm font-medium mb-1.5 block">Select a post to analyze</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search published articles..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={!selectedPostId || analyzing}
              className="gap-2 shrink-0"
            >
              {analyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Analyze Links
            </Button>
            {acceptedCount > 0 && (
              <Button
                onClick={handleInsertAll}
                disabled={inserting}
                variant="outline"
                className="gap-2 shrink-0"
              >
                {inserting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                Insert {acceptedCount} Link{acceptedCount !== 1 ? "s" : ""}
              </Button>
            )}
          </div>

          {/* Post List */}
          {postsLoading ? (
            <div className="mt-4 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-md" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No published posts found</p>
          ) : (
            <div className="mt-4 max-h-48 overflow-y-auto border rounded-lg divide-y">
              {posts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => setSelectedPostId(post.id)}
                  className={`w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 ${
                    selectedPostId === post.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                  }`}
                >
                  <span className="font-medium truncate block">{post.title}</span>
                  <span className="text-xs text-muted-foreground">/{post.slug}</span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggestions List */}
      {selectedPostId && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">
              Link Suggestions
              {suggestions.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({suggestions.length})
                </span>
              )}
            </h2>
          </div>

          {suggestionsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <Card className="border border-border/60 shadow-none">
              <CardContent className="py-10 text-center">
                <Link className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  No suggestions yet — click "Analyze Links" to generate
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="border border-border/60 shadow-none">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-sm font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded">
                            {suggestion.anchor_text}
                          </code>
                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium truncate">
                            {suggestion.target_post?.title ?? "Unknown post"}
                          </span>
                        </div>
                        {suggestion.context_sentence && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {suggestion.context_sentence}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={relevanceBadge(suggestion.relevance_score)}>
                            {Math.round(suggestion.relevance_score * 100)}% relevant
                          </Badge>
                          <Badge variant="outline" className={statusColor(suggestion.status)}>
                            {suggestion.status}
                          </Badge>
                        </div>
                      </div>
                      {suggestion.status === "suggested" && (
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700"
                            onClick={() => handleAccept(suggestion.id)}
                            title="Accept"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleReject(suggestion.id)}
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
    </TooltipProvider>
  );
}
