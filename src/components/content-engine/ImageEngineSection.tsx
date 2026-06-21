"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  ImageIcon,
  Search,
  Loader2,
  Sparkles,
  Check,
  X,
  Download,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { parseAdminBlogPostsList } from "@/lib/blogAdminPosts";
import { useToast } from "@/hooks/use-toast";

type PostRow = { id: string; title: string; slug: string };

type ImageRecord = {
  id: string;
  post_id: string;
  image_type: string;
  prompt: string;
  image_url: string | null;
  alt_text: string | null;
  caption: string | null;
  placement_after_heading: string | null;
  sort_order: number;
  status: string;
};

const statusColors: Record<string, string> = {
  prompt_ready: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
  generating: "bg-blue-500/10 text-blue-700 border-blue-200",
  generated: "bg-purple-500/10 text-purple-700 border-purple-200",
  approved: "bg-green-500/10 text-green-700 border-green-200",
  rejected: "bg-red-500/10 text-red-700 border-red-200",
};

const typeLabels: Record<string, string> = {
  featured: "Featured",
  section: "Section",
  infographic: "Infographic",
  social_preview: "Social Preview",
  og_image: "OG Image",
};

export function ImageEngineSection() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [generatingImageId, setGeneratingImageId] = useState<string | null>(null);
  const [inserting, setInserting] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const data = await apiClient.get("/admin/blog/posts", { params: { q: search || undefined } });
      setPosts(parseAdminBlogPostsList<PostRow>(data));
    } catch {
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, [search]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const loadImagePlan = useCallback(async (postId: string) => {
    setLoadingPlan(true);
    try {
      const data = await apiClient.get(`/admin/content-engine/images/${postId}`);
      setImages(Array.isArray(data) ? data : []);
    } catch {
      setImages([]);
    } finally {
      setLoadingPlan(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPostId) loadImagePlan(selectedPostId);
    else setImages([]);
  }, [selectedPostId, loadImagePlan]);

  const handleGeneratePlan = async () => {
    if (!selectedPostId) return;
    setGeneratingPlan(true);
    try {
      await apiClient.post(`/admin/content-engine/images/${selectedPostId}/plan`, {});
      toast({ title: "Image plan generated" });
      loadImagePlan(selectedPostId);
    } catch {
      toast({ title: "Failed to generate image plan", variant: "destructive" });
    } finally {
      setGeneratingPlan(false);
    }
  };

  const handleGenerateImage = async (imageId: string) => {
    setGeneratingImageId(imageId);
    try {
      await apiClient.post(`/admin/content-engine/images/${imageId}/generate`, {});
      toast({ title: "Image generated" });
      if (selectedPostId) loadImagePlan(selectedPostId);
    } catch {
      toast({ title: "Failed to generate image", variant: "destructive" });
    } finally {
      setGeneratingImageId(null);
    }
  };

  const handleApprove = async (imageId: string) => {
    try {
      await apiClient.patch(`/admin/content-engine/images/${imageId}/approve`);
      toast({ title: "Image approved" });
      if (selectedPostId) loadImagePlan(selectedPostId);
    } catch {
      toast({ title: "Failed to approve", variant: "destructive" });
    }
  };

  const handleReject = async (imageId: string) => {
    try {
      await apiClient.patch(`/admin/content-engine/images/${imageId}/reject`);
      toast({ title: "Image rejected" });
      if (selectedPostId) loadImagePlan(selectedPostId);
    } catch {
      toast({ title: "Failed to reject", variant: "destructive" });
    }
  };

  const handleInsertAll = async () => {
    if (!selectedPostId) return;
    setInserting(true);
    try {
      const result = await apiClient.post(`/admin/content-engine/images/${selectedPostId}/insert`, {});
      toast({ title: `Inserted ${result.inserted} images into post` });
    } catch {
      toast({ title: "Failed to insert images", variant: "destructive" });
    } finally {
      setInserting(false);
    }
  };

  const stats = {
    planned: images.length,
    generated: images.filter((i) => ["generated", "approved"].includes(i.status)).length,
    approved: images.filter((i) => i.status === "approved").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Image Engine</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-generated images with smart placement for your articles
        </p>
      </div>

      <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                What Happens
              </p>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1.5">
                <li><strong>Generate Plan:</strong> AI analyzes your article and suggests where images should go (featured, section breaks, infographics)</li>
                <li><strong>Each suggestion includes:</strong> Image type, placement location (after which heading), and an AI prompt for generation</li>
                <li><strong>Generate Image:</strong> Creates the actual image using AI and uploads it to storage automatically</li>
                <li><strong>Approve/Reject:</strong> Control which images get added — rejected images won&apos;t be inserted</li>
                <li><strong>Insert Approved:</strong> Approved images are embedded in your post body markdown at the suggested locations</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Post selector */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loadingPosts ? (
        <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
      ) : (
        <div className="flex flex-wrap gap-2">
          {posts.slice(0, 20).map((post) => (
            <button
              key={post.id}
              onClick={() => setSelectedPostId(post.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors cursor-pointer ${
                selectedPostId === post.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {post.title.slice(0, 40)}{post.title.length > 40 ? "..." : ""}
            </button>
          ))}
        </div>
      )}

      {selectedPostId && (
        <>
          {/* Actions & stats */}
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              onClick={handleGeneratePlan}
              disabled={generatingPlan}
              className="gap-2"
            >
              {generatingPlan ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate Image Plan
            </Button>

            {stats.approved > 0 && (
              <Button
                variant="outline"
                onClick={handleInsertAll}
                disabled={inserting}
                className="gap-2"
              >
                {inserting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Insert All Approved
              </Button>
            )}

            <div className="flex items-center gap-4 ml-auto text-xs text-muted-foreground">
              <span>Planned: <strong className="text-foreground">{stats.planned}</strong></span>
              <span>Generated: <strong className="text-foreground">{stats.generated}</strong></span>
              <span>Approved: <strong className="text-foreground">{stats.approved}</strong></span>
            </div>
          </div>

          {/* Image cards */}
          {loadingPlan ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <Card className="border border-border/60 shadow-none">
              <CardContent className="py-12 text-center">
                <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  No image plan yet — click "Generate Image Plan" to start
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {images.map((img) => (
                <Card key={img.id} className="border border-border/60 shadow-none overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {typeLabels[img.image_type] || img.image_type}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] ${statusColors[img.status] || ""}`}>
                        {img.status.replace("_", " ")}
                      </Badge>
                      {img.placement_after_heading && (
                        <span className="text-[10px] text-muted-foreground ml-auto truncate max-w-[150px]">
                          After: {img.placement_after_heading}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                      {img.prompt}
                    </p>

                    {img.alt_text && (
                      <p className="text-[11px] text-muted-foreground/70 italic">
                        Alt: {img.alt_text}
                      </p>
                    )}

                    {img.image_url && (
                      <div className="rounded-md overflow-hidden border border-border/50">
                        <img
                          src={img.image_url}
                          alt={img.alt_text || "Generated image"}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      {img.status === "prompt_ready" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs"
                          onClick={() => handleGenerateImage(img.id)}
                          disabled={generatingImageId === img.id}
                        >
                          {generatingImageId === img.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Sparkles className="h-3 w-3" />
                          )}
                          Generate
                        </Button>
                      )}
                      {img.status === "generated" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-xs text-green-700"
                            onClick={() => handleApprove(img.id)}
                          >
                            <Check className="h-3 w-3" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-xs text-red-700"
                            onClick={() => handleReject(img.id)}
                          >
                            <X className="h-3 w-3" /> Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
