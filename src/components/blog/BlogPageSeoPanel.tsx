"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/apiClient";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageSourceInput } from "@/components/media/ImageSourceInput";

const ROUTE_DEFAULTS: Record<string, { h1: string; title: string; description: string }> = {
  "/": {
    h1: "AI Content Creator for Social Media — one premium control layer.",
    title: "Trndinn — AI Social Media Platform",
    description: "Create, schedule, and publish AI-powered social media content from one dashboard.",
  },
  "/features": {
    h1: "AI Social Media Platform — One Pulse, Infinite Channels.",
    title: "Features — Trndinn AI Social Media Tool",
    description: "Explore Trndinn's AI content creation, scheduling, and analytics features.",
  },
  "/pricing": {
    h1: "Social Media Tool Pricing — Credit-Based Plans That Scale",
    title: "Pricing — Trndinn AI Social Media Plans",
    description: "Flexible credit-based pricing for AI social media content creation. Start free.",
  },
  "/blog": {
    h1: "Trndinn Blog: Social Media Growth Tips",
    title: "Blog — Trndinn | Social Media Growth Tips",
    description: "Expert tips on AI content creation, social media strategy, and growth tactics.",
  },
  "/contact": {
    h1: "Contact Trndinn",
    title: "Contact Us — Trndinn",
    description: "Get in touch with the Trndinn team for support, partnerships, or general inquiries.",
  },
  "/careers": {
    h1: "Careers at Trndinn",
    title: "Careers — Join Trndinn",
    description: "Join Trndinn and help build the future of AI-powered social media content.",
  },
};

export function BlogPageSeoPanel() {
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [seoPages, setSeoPages] = useState<Record<string, unknown>[]>([]);
  const [routePrimaryKeyword, setRoutePrimaryKeyword] = useState<string | null>(null);
  const [seoForm, setSeoForm] = useState({
    route_path: "/pricing",
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
    og_image_url: "",
    og_title: "",
    og_description: "",
    canonical_url: "",
    robots: "index,follow",
    h1_override: "",
    structured_data_json: "",
  });
  const [aiFillOpen, setAiFillOpen] = useState(false);
  const [aiFillPrompt, setAiFillPrompt] = useState("");
  const [aiFillLoading, setAiFillLoading] = useState(false);

  const loadSeoPages = useCallback(async () => {
    try {
      const res = await api.admin.seoPagesList();
      setSeoPages((res.pages || []) as Record<string, unknown>[]);
    } catch (e: unknown) {
      toast({
        title: "Could not load SEO pages",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    void loadSeoPages();
  }, [loadSeoPages]);

  async function saveSeo() {
    let parsedStructuredData: Record<string, unknown> | null = null;
    if (seoForm.structured_data_json.trim()) {
      try {
        parsedStructuredData = JSON.parse(seoForm.structured_data_json) as Record<string, unknown>;
      } catch {
        toast({ title: "Structured data JSON is invalid", variant: "destructive" });
        return;
      }
    }
    try {
      await api.admin.seoPagesUpsert({
        route_path: seoForm.route_path.trim(),
        seo_title: seoForm.seo_title.trim() || null,
        seo_description: seoForm.seo_description.trim() || null,
        seo_keywords: seoForm.seo_keywords.trim() || null,
        og_image_url: seoForm.og_image_url.trim() || null,
        og_title: seoForm.og_title.trim() || null,
        og_description: seoForm.og_description.trim() || null,
        canonical_url: seoForm.canonical_url.trim() || null,
        robots: seoForm.robots.trim() || "index,follow",
        h1_override: seoForm.h1_override.trim() || null,
        structured_data: parsedStructuredData,
      });
      toast({ title: "SEO saved" });
      await loadSeoPages();
    } catch (e: unknown) {
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    }
  }

  async function runAiFill() {
    setAiFillLoading(true);
    try {
      const result = (await api.admin.seoAiFill({
        route: seoForm.route_path.trim() || "/",
        prompt: aiFillPrompt.trim() || undefined,
        primaryKeyword: routePrimaryKeyword ?? undefined,
      })) as {
        meta_title?: string;
        meta_description?: string;
        h1_override?: string;
        og_title?: string;
        og_description?: string;
      };
      setSeoForm((s) => ({
        ...s,
        ...(result.meta_title ? { seo_title: result.meta_title } : {}),
        ...(result.meta_description ? { seo_description: result.meta_description } : {}),
        ...(result.h1_override ? { h1_override: result.h1_override } : {}),
        ...(result.og_title ? { og_title: result.og_title } : {}),
        ...(result.og_description ? { og_description: result.og_description } : {}),
      }));
      setAiFillOpen(false);
      toast({ title: "AI fields applied — review and save when ready" });
    } catch (e: unknown) {
      toast({
        title: "AI fill failed",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    } finally {
      setAiFillLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border border-border/60 shadow-none">
        <CardContent className="space-y-3 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold">Edit route SEO</h2>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                const route = seoForm.route_path.trim() || "/";
                setAiFillPrompt(
                  `Generate SEO fields for the page at route ${route}. Target keyword: ${routePrimaryKeyword ?? ""}`.trim(),
                );
                setAiFillOpen(true);
              }}
            >
              Fill with AI
            </Button>
          </div>
          <Dialog open={aiFillOpen} onOpenChange={setAiFillOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>AI SEO Fill</DialogTitle>
              </DialogHeader>
              <Textarea
                rows={5}
                value={aiFillPrompt}
                onChange={(e) => setAiFillPrompt(e.target.value)}
                placeholder="Describe what you want to generate…"
                className="font-mono text-xs"
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setAiFillOpen(false)} disabled={aiFillLoading}>
                  Cancel
                </Button>
                <Button onClick={() => void runAiFill()} disabled={aiFillLoading}>
                  {aiFillLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating…
                    </>
                  ) : (
                    "Generate"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="space-y-1">
            <Label>Route path</Label>
            <Input
              value={seoForm.route_path}
              onChange={(e) => setSeoForm((s) => ({ ...s, route_path: e.target.value }))}
              placeholder="/pricing"
            />
          </div>
          <div className="space-y-1">
            <Label>Meta title</Label>
            <Input
              value={seoForm.seo_title}
              onChange={(e) => setSeoForm((s) => ({ ...s, seo_title: e.target.value }))}
              placeholder={ROUTE_DEFAULTS[seoForm.route_path]?.title}
            />
          </div>
          <div className="space-y-1">
            <Label>Meta description</Label>
            <Textarea
              rows={3}
              value={seoForm.seo_description}
              onChange={(e) => setSeoForm((s) => ({ ...s, seo_description: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label>Keywords (comma-separated)</Label>
            <Input
              value={seoForm.seo_keywords}
              onChange={(e) => setSeoForm((s) => ({ ...s, seo_keywords: e.target.value }))}
            />
          </div>
          <ImageSourceInput
            mode="field"
            label="OG image URL"
            value={seoForm.og_image_url}
            dialogTitle="OG image"
            confirmLabel="Use image"
            uploadCmsPath={isAdmin ? "blog" : undefined}
            onChange={(url) => setSeoForm((s) => ({ ...s, og_image_url: url }))}
          />
          <div className="space-y-1">
            <Label>H1 Override</Label>
            <Input
              value={seoForm.h1_override}
              onChange={(e) => setSeoForm((s) => ({ ...s, h1_override: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label>Structured data JSON-LD</Label>
            <Textarea
              rows={4}
              value={seoForm.structured_data_json}
              onChange={(e) => setSeoForm((s) => ({ ...s, structured_data_json: e.target.value }))}
              className="font-mono text-xs"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void saveSeo()}>
              Save SEO
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                try {
                  const row = await api.admin.seoPagesOne(seoForm.route_path.trim());
                  const routePath = String(row.route_path || seoForm.route_path);
                  setSeoForm({
                    route_path: routePath,
                    seo_title: String(row.seo_title || ""),
                    seo_description: String(row.seo_description || ""),
                    seo_keywords: String(row.seo_keywords || ""),
                    og_image_url: String(row.og_image_url || ""),
                    og_title: String(row.og_title || ""),
                    og_description: String(row.og_description || ""),
                    canonical_url: String(row.canonical_url || ""),
                    robots: String(row.robots || "index,follow"),
                    h1_override: String(row.h1_override || ""),
                    structured_data_json: row.structured_data
                      ? JSON.stringify(row.structured_data, null, 2)
                      : "",
                  });
                  try {
                    const assigns = await api.seoKeywords.getAssignments("route", routePath);
                    const primary = (
                      assigns as {
                        assignments?: Array<{ is_primary: boolean; keyword?: { keyword: string } }>;
                      }
                    ).assignments?.find((a) => a.is_primary);
                    setRoutePrimaryKeyword(primary?.keyword?.keyword ?? null);
                  } catch {
                    setRoutePrimaryKeyword(null);
                  }
                } catch {
                  toast({ title: "No row for this route yet", variant: "destructive" });
                }
              }}
            >
              Load route
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="border border-border/60 shadow-none">
        <CardContent className="p-4 sm:p-6">
          <h2 className="mb-3 font-semibold">Configured routes</h2>
          <ScrollArea className="h-[360px] pr-2">
            <ul className="space-y-2 text-sm">
              {seoPages.map((p) => (
                <li key={String(p.route_path)}>
                  <button
                    type="button"
                    className="w-full rounded-md border border-border/50 px-3 py-2 text-left hover:bg-muted/40"
                    onClick={() =>
                      setSeoForm({
                        route_path: String(p.route_path || ""),
                        seo_title: String(p.seo_title || ""),
                        seo_description: String(p.seo_description || ""),
                        seo_keywords: String(p.seo_keywords || ""),
                        og_image_url: String(p.og_image_url || ""),
                        og_title: String(p.og_title || ""),
                        og_description: String(p.og_description || ""),
                        canonical_url: String(p.canonical_url || ""),
                        robots: String(p.robots || "index,follow"),
                        h1_override: String(p.h1_override || ""),
                        structured_data_json: p.structured_data
                          ? JSON.stringify(p.structured_data, null, 2)
                          : "",
                      })
                    }
                  >
                    <span className="font-mono text-xs">{String(p.route_path)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
