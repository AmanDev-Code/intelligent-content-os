"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Loader2, Copy, Check, Eye, Send, CheckCircle, Sparkles, ChevronDown, Rocket, FileEdit, MessageSquare, Settings, Image, Link2, RefreshCw, BarChart3, Zap } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { PlatformIcon } from "./PlatformIcon";
import { DistributionContentModal } from "./DistributionContentModal";

// Platform tier definitions
const PLATFORM_TIERS = {
  auto: [
    { id: "devto", label: "Dev.to", hasApi: true },
    { id: "hashnode", label: "Hashnode", hasApi: true },
    { id: "ghost", label: "Ghost", hasApi: true },
    { id: "beehiiv", label: "Beehiiv", hasApi: true },
    { id: "linkedin_article", label: "LinkedIn Article", hasApi: true },
    { id: "linkedin_post", label: "LinkedIn Post", hasApi: true },
    { id: "telegraph", label: "Telegraph", hasApi: true },
    { id: "blogger", label: "Blogger", hasApi: true },
    { id: "medium", label: "Medium", hasApi: false }, // Deprecated API
  ],
  submit: [
    { id: "hackernoon", label: "HackerNoon" },
    { id: "towards_ai", label: "Towards AI" },
    { id: "analytics_vidhya", label: "Analytics Vidhya" },
    { id: "freecodecamp", label: "freeCodeCamp" },
    { id: "smashing_magazine", label: "Smashing Magazine" },
    { id: "sitepoint", label: "SitePoint" },
    { id: "readwrite", label: "ReadWrite" },
    { id: "yourstory", label: "YourStory" },
    { id: "startuptalky", label: "StartupTalky" },
    { id: "inc42", label: "Inc42" },
    { id: "techstory", label: "TechStory" },
  ],
  discussion: [
    { id: "reddit", label: "Reddit" },
    { id: "indiehackers", label: "Indie Hackers" },
    { id: "producthunt_discussions", label: "Product Hunt" },
    { id: "growthhackers", label: "GrowthHackers" },
    { id: "hackernews", label: "Hacker News" },
    { id: "huggingface_community", label: "Hugging Face" },
  ],
  legacy: [
    { id: "twitter_thread", label: "Twitter/X Thread" },
    { id: "newsletter", label: "Newsletter" },
    { id: "substack", label: "Substack" },
    { id: "facebook", label: "Facebook" },
    { id: "instagram", label: "Instagram" },
  ],
} as const;

type Distribution = {
  id: string;
  platform: string;
  status: string;
  adapted_content: string | null;
  published_url: string | null;
  published_at: string | null;
  cover_image_url?: string | null;
  inline_images?: { position: number; url: string; alt: string }[];
  hashtags?: string[];
  character_count?: number;
  seo_score?: number;
  engagement_score?: number;
  platform_title?: string;
  is_manual?: boolean;
};

type PlatformAccountStatus = {
  platform: string;
  is_connected: boolean;
};

interface DistributionGridProps {
  postId: string;
}

function platformLabel(p: string) {
  return p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DistributionGrid({ postId }: DistributionGridProps) {
  const { toast } = useToast();
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [viewingPlatform, setViewingPlatform] = useState<string | null>(null);
  const [markPublishOpen, setMarkPublishOpen] = useState<string | null>(null);
  const [publishUrl, setPublishUrl] = useState("");
  const [markingPublished, setMarkingPublished] = useState(false);
  const [expandedTiers, setExpandedTiers] = useState<Record<string, boolean>>({
    auto: true,
    submit: true,
    discussion: true,
    legacy: false,
  });

  const [copiedImageUrl, setCopiedImageUrl] = useState<string | null>(null);
  const [generatingProgress, setGeneratingProgress] = useState<Record<string, number>>({});
  const [generatingLabel, setGeneratingLabel] = useState<Record<string, string>>({});

  // Long-form platforms that will use batched generation (takes longer)
  const LONG_FORM_PLATFORMS = new Set([
    "devto", "medium", "hashnode", "beehiiv", "ghost", "blogger",
    "telegraph", "hackernoon", "linkedin_article", "newsletter", "substack",
  ]);

  // Simulate progress steps for long-form platform generation
  const simulateProgress = (platform: string) => {
    const isLongForm = LONG_FORM_PLATFORMS.has(platform);
    const steps = isLongForm
      ? [
          { pct: 10, label: "Analysing article..." },
          { pct: 25, label: "Splitting into sections..." },
          { pct: 40, label: "Generating section 1..." },
          { pct: 60, label: "Generating section 2..." },
          { pct: 75, label: "Generating section 3..." },
          { pct: 88, label: "Merging content..." },
          { pct: 95, label: "Finalising..." },
        ]
      : [
          { pct: 20, label: "Adapting content..." },
          { pct: 60, label: "Generating..." },
          { pct: 90, label: "Finalising..." },
        ];

    let stepIndex = 0;
    // Interval per step: long-form ~8s per step, short-form ~3s per step
    const interval = isLongForm ? 8000 : 3000;

    const timer = setInterval(() => {
      if (stepIndex >= steps.length) {
        clearInterval(timer);
        return;
      }
      const step = steps[stepIndex];
      setGeneratingProgress((prev) => ({ ...prev, [platform]: step.pct }));
      setGeneratingLabel((prev) => ({ ...prev, [platform]: step.label }));
      stepIndex++;
    }, interval);

    return () => clearInterval(timer);
  };

  const handleCopyImageUrl = async (platform: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedImageUrl(platform);
      toast({ title: "Image URL copied!" });
      setTimeout(() => setCopiedImageUrl(null), 2000);
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [distData, accountsData] = await Promise.all([
        apiClient.get(`/admin/content-engine/distributions/${postId}`),
        apiClient.get("/admin/content-engine/platform-accounts"),
      ]);
      setDistributions(Array.isArray(distData) ? distData : []);
      const connected = new Set<string>(
        (Array.isArray(accountsData) ? accountsData : [])
          .filter((a: PlatformAccountStatus) => a.is_connected)
          .map((a: PlatformAccountStatus) => a.platform)
      );
      setConnectedPlatforms(connected);
    } catch {
      setDistributions([]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleGenerate = async (platform: string) => {
    setGenerating(platform);
    setGeneratingProgress((prev) => ({ ...prev, [platform]: 5 }));
    setGeneratingLabel((prev) => ({ ...prev, [platform]: "Starting..." }));
    const stopProgress = simulateProgress(platform);
    try {
      await apiClient.post(`/admin/content-engine/distributions/${postId}/${platform}/generate`);
      setGeneratingProgress((prev) => ({ ...prev, [platform]: 100 }));
      setGeneratingLabel((prev) => ({ ...prev, [platform]: "Done!" }));
      toast({ title: `Generated ${platformLabel(platform)} content` });
      load();
    } catch {
      toast({ title: "Generation failed", variant: "destructive" });
    } finally {
      stopProgress();
      setTimeout(() => {
        setGenerating(null);
        setGeneratingProgress((prev) => { const n = { ...prev }; delete n[platform]; return n; });
        setGeneratingLabel((prev) => { const n = { ...prev }; delete n[platform]; return n; });
      }, 600);
    }
  };

  const handleGenerateAll = async () => {
    setGenerating("all");
    try {
      await apiClient.post(`/admin/content-engine/distributions/${postId}/generate-all`);
      toast({ title: "Generated content for all platforms" });
      load();
    } catch (e: any) {
      toast({ title: e.message || "Generation failed", variant: "destructive" });
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateTier = async (tier: string) => {
    setGenerating(`tier-${tier}`);
    const platforms = PLATFORM_TIERS[tier as keyof typeof PLATFORM_TIERS];
    try {
      for (const platform of platforms) {
        await apiClient.post(`/admin/content-engine/distributions/${postId}/${platform.id}/generate`);
      }
      toast({ title: `Generated content for ${tier} platforms` });
      load();
    } catch (e: any) {
      toast({ title: e.message || "Generation failed", variant: "destructive" });
    } finally {
      setGenerating(null);
    }
  };

  const handleCopy = async (platform: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(platform);
      toast({ title: `Content copied! Paste it on ${platformLabel(platform)}` });
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const handlePublish = async (platform: string) => {
    setPublishing(platform);
    try {
      await apiClient.post(`/admin/content-engine/distributions/${postId}/${platform}/publish`);
      toast({ title: `Published to ${platformLabel(platform)}` });
      load();
    } catch (e: any) {
      toast({ title: e.message || "Publish failed", variant: "destructive" });
    } finally {
      setPublishing(null);
    }
  };

  const handleMarkPublished = async () => {
    if (!markPublishOpen || !publishUrl) return;
    setMarkingPublished(true);
    try {
      await apiClient.patch(`/admin/content-engine/distributions/${postId}/${markPublishOpen}`, {
        status: "published",
        published_url: publishUrl,
      });
      toast({ title: `Marked as published on ${platformLabel(markPublishOpen)}` });
      setMarkPublishOpen(null);
      setPublishUrl("");
      load();
    } catch (e: any) {
      toast({ title: e.message || "Failed", variant: "destructive" });
    } finally {
      setMarkingPublished(false);
    }
  };

  const statusColor: Record<string, string> = {
    pending: "bg-gray-100 text-gray-600",
    generating: "bg-blue-100 text-blue-700",
    ready: "bg-amber-100 text-amber-700",
    published: "bg-emerald-100 text-emerald-700",
    failed: "bg-red-100 text-red-700",
    skipped: "bg-gray-100 text-gray-500",
  };

  if (loading) {
    return <Skeleton className="h-32 rounded-lg" />;
  }

  const distMap = Object.fromEntries(distributions.map((d) => [d.platform, d]));
  const viewingDist = viewingPlatform ? distMap[viewingPlatform] : null;

  const toggleTier = (tier: string) => {
    setExpandedTiers((prev) => ({ ...prev, [tier]: !prev[tier] }));
  };

  const renderPlatformCard = (
    platform: { id: string; label: string; hasApi?: boolean },
    tier: "auto" | "submit" | "discussion" | "legacy"
  ) => {
    const dist = distMap[platform.id];
    const isGenerating = generating === platform.id;
    const isPublishing = publishing === platform.id;
    const isCopied = copied === platform.id;
    const isCopiedImage = copiedImageUrl === platform.id;
    const isConnected = connectedPlatforms.has(platform.id);
    const hasContent = dist?.adapted_content && (dist.status === "ready" || dist.status === "published");
    const isPublished = dist?.status === "published";
    const canAutoPublish = tier === "auto" && platform.hasApi !== false;
    const hasCoverImage = !!dist?.cover_image_url;

    return (
      <div
        key={platform.id}
        className="flex flex-col gap-2 p-3 rounded-lg border border-border/50 hover:border-border transition-colors bg-card"
      >
        {/* Cover Image Preview */}
        {hasCoverImage && (
          <div className="relative aspect-[1.91/1] w-full rounded-md overflow-hidden bg-muted mb-1">
            <img
              src={dist.cover_image_url!}
              alt={`${platform.label} cover`}
              className="w-full h-full object-cover"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-1 right-1 h-6 text-[10px] px-2 opacity-90"
              onClick={() => handleCopyImageUrl(platform.id, dist.cover_image_url!)}
            >
              {isCopiedImage ? <Check className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <PlatformIcon platform={platform.id} className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium flex-1 truncate">
            {platform.label}
          </span>
          {canAutoPublish && isConnected && (
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" title="Account connected" />
          )}
          {canAutoPublish && !isConnected && (
            <span title="Setup required">
              <Settings className="h-3 w-3 text-muted-foreground/50" />
            </span>
          )}
        </div>

        {isGenerating && (
          <div className="w-full space-y-1">
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                style={{ width: `${generatingProgress[platform.id] ?? 5}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              {generatingLabel[platform.id] ?? "Generating..."}
            </p>
          </div>
        )}

        {dist && !isGenerating && (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className={`text-[10px] ${statusColor[dist.status] ?? ""}`}
            >
              {dist.status}
            </Badge>
            {dist.character_count && (
              <span className="text-[10px] text-muted-foreground">
                {dist.character_count.toLocaleString()} chars
              </span>
            )}
            {dist.engagement_score && (
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5" title="Engagement Score">
                <BarChart3 className="h-3 w-3" />
                {dist.engagement_score}
              </span>
            )}
          </div>
        )}

        {/* Hashtags */}
        {dist?.hashtags && dist.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {dist.hashtags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[10px] text-primary/70">
                {tag.startsWith('#') ? tag : `#${tag}`}
              </span>
            ))}
            {dist.hashtags.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{dist.hashtags.length - 3}</span>
            )}
          </div>
        )}

        {isPublished && dist?.published_url && (
          <a
            href={dist.published_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-primary hover:underline truncate"
          >
            {dist.published_url}
          </a>
        )}

        <div className="flex flex-wrap gap-1.5 mt-auto">
          {!dist || dist.status === "failed" ? (
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[10px] px-2"
              onClick={() => handleGenerate(platform.id)}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 mr-0.5" />}
              Generate
            </Button>
          ) : null}

          {hasContent && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => handleCopy(platform.id, dist.adapted_content!)}
              >
                {isCopied ? <Check className="h-3 w-3 mr-0.5" /> : <Copy className="h-3 w-3 mr-0.5" />}
                {isCopied ? "Copied" : "Copy"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => setViewingPlatform(platform.id)}
              >
                <Eye className="h-3 w-3 mr-0.5" /> View
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => handleGenerate(platform.id)}
                disabled={isGenerating}
                title="Regenerate content"
              >
                {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => {
                  setMarkPublishOpen(platform.id);
                  setPublishUrl("");
                }}
              >
                <CheckCircle className="h-3 w-3 mr-0.5" /> Mark
              </Button>

              {canAutoPublish && isConnected && (
                <Button
                  size="sm"
                  className="h-6 text-[10px] px-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => handlePublish(platform.id)}
                  disabled={isPublishing}
                >
                  {isPublishing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3 mr-0.5" />}
                  Publish
                </Button>
              )}
            </>
          )}

          {dist?.status === "ready" && !hasContent && (
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[10px] px-2"
              onClick={() => handleGenerate(platform.id)}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : "Regenerate"}
            </Button>
          )}
        </div>
      </div>
    );
  };

  const renderTierSection = (
    tier: "auto" | "submit" | "discussion" | "legacy",
    title: string,
    description: string,
    icon: React.ReactNode,
    platforms: readonly { id: string; label: string; hasApi?: boolean }[]
  ) => {
    const isExpanded = expandedTiers[tier];
    const generatedCount = platforms.filter((p) => distMap[p.id]?.status === "ready" || distMap[p.id]?.status === "published").length;
    const publishedCount = platforms.filter((p) => distMap[p.id]?.status === "published").length;

    return (
      <Collapsible open={isExpanded} onOpenChange={() => toggleTier(tier)}>
        <div className="border border-border/60 rounded-lg overflow-hidden">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-background border border-border/50">
                  {icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    {title}
                    <Badge variant="secondary" className="text-[10px]">
                      {generatedCount}/{platforms.length} ready
                    </Badge>
                    {publishedCount > 0 && (
                      <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                        {publishedCount} published
                      </Badge>
                    )}
                  </h3>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateTier(tier);
                  }}
                  disabled={generating?.startsWith("tier-") || generating === "all"}
                >
                  {generating === `tier-${tier}` ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="h-3 w-3 mr-1" />
                  )}
                  Generate All
                </Button>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {platforms.map((platform) => renderPlatformCard(platform, tier))}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  };

  return (
    <>
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Publish Everywhere</h2>
          <Button
            variant="default"
            size="sm"
            className="text-xs"
            onClick={handleGenerateAll}
            disabled={generating === "all"}
          >
            {generating === "all" ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Sparkles className="h-3 w-3 mr-1" />
            )}
            Generate All Platforms
          </Button>
        </div>

        <div className="space-y-3">
          {renderTierSection(
            "auto",
            "Auto-Publish",
            "One-click publishing via API integration",
            <Rocket className="h-4 w-4 text-primary" />,
            PLATFORM_TIERS.auto
          )}

          {renderTierSection(
            "submit",
            "Submit for Review",
            "High-authority publications requiring editorial review",
            <FileEdit className="h-4 w-4 text-amber-600" />,
            PLATFORM_TIERS.submit
          )}

          {renderTierSection(
            "discussion",
            "Discussion Platforms",
            "Community-driven platforms for engagement",
            <MessageSquare className="h-4 w-4 text-blue-600" />,
            PLATFORM_TIERS.discussion
          )}

          {renderTierSection(
            "legacy",
            "Other Platforms",
            "Social media and newsletter platforms",
            <Settings className="h-4 w-4 text-muted-foreground" />,
            PLATFORM_TIERS.legacy
          )}
        </div>
      </div>

      {viewingDist && viewingPlatform && (
        <DistributionContentModal
          open={!!viewingPlatform}
          onOpenChange={(open) => { if (!open) setViewingPlatform(null); }}
          postId={postId}
          platform={viewingPlatform}
          content={viewingDist.adapted_content ?? ""}
          coverImageUrl={viewingDist.cover_image_url ?? undefined}
          hashtags={viewingDist.hashtags}
          characterCount={viewingDist.character_count}
          seoScore={viewingDist.seo_score}
          engagementScore={viewingDist.engagement_score}
          onContentSaved={load}
          onRegenerate={() => handleGenerate(viewingPlatform)}
        />
      )}

      <Dialog open={!!markPublishOpen} onOpenChange={(open) => { if (!open) setMarkPublishOpen(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark as Published</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Enter the URL where this content was published on {markPublishOpen ? platformLabel(markPublishOpen) : ""}:
            </p>
            <Input
              placeholder="https://..."
              value={publishUrl}
              onChange={(e) => setPublishUrl(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkPublishOpen(null)}>Cancel</Button>
            <Button onClick={handleMarkPublished} disabled={markingPublished || !publishUrl}>
              {markingPublished ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirm Published
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
