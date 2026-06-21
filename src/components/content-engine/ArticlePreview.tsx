"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarkdownBody } from "@/components/blog/MarkdownBody";
import { BlogFaqSection } from "@/components/blog/BlogFaqSection";
import { SeoPreview } from "./SeoPreview";
import { SocialPreview } from "./SocialPreview";
import {
  Monitor,
  Smartphone,
  Calendar,
  Clock,
  User,
  Tag,
  ExternalLink,
  Edit,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ArticlePreviewData {
  title: string;
  slug: string;
  subtitle?: string | null;
  excerpt?: string | null;
  body: string;
  tags?: string[] | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  reading_minutes?: number | null;
  featured_image_url?: string | null;
  og_image_url?: string | null;
  author_display_name?: string | null;
  author_avatar_url?: string | null;
  published_at?: string | null;
  faq_json?: Array<{ question: string; answer: string }> | null;
  canonical_url?: string | null;
}

interface ArticlePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article: ArticlePreviewData;
  onEdit?: () => void;
  onPublish?: () => void;
  publishLabel?: string;
  showActions?: boolean;
}

export function ArticlePreview({
  open,
  onOpenChange,
  article,
  onEdit,
  onPublish,
  publishLabel = "Publish to Trndinn Blog",
  showActions = true,
}: ArticlePreviewProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [activeTab, setActiveTab] = useState("article");

  const displayDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  const authorName = article.author_display_name || "Aman Ahuja";
  const readingTime = article.reading_minutes || Math.ceil((article.body?.split(/\s+/).length || 0) / 200);
  const canonicalUrl = article.canonical_url || `https://trndinn.com/blog/${article.slug}`;
  const ogImage = article.og_image_url || article.featured_image_url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[90vh] overflow-hidden flex flex-col",
          viewMode === "desktop" ? "max-w-5xl" : "max-w-md"
        )}
      >
        <DialogHeader className="shrink-0 border-b border-border/50 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Article Preview</DialogTitle>
            <div className="flex items-center gap-2 mr-8">
              <div className="flex items-center rounded-lg border border-border/60 p-0.5">
                <Button
                  variant={viewMode === "desktop" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2.5 gap-1.5"
                  onClick={() => setViewMode("desktop")}
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span className="text-xs">Desktop</span>
                </Button>
                <Button
                  variant={viewMode === "mobile" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 px-2.5 gap-1.5"
                  onClick={() => setViewMode("mobile")}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span className="text-xs">Mobile</span>
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="shrink-0 w-fit mx-auto mt-4">
            <TabsTrigger value="article" className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              Article
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-1.5">
              <span className="text-xs">🔍</span>
              SEO
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-1.5">
              <span className="text-xs">📱</span>
              Social
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4 min-h-0">
            <TabsContent value="article" className="m-0 h-full">
              <div
                className={cn(
                  "mx-auto bg-background rounded-lg border border-border/60 overflow-hidden",
                  viewMode === "desktop" ? "max-w-full" : "max-w-[375px]"
                )}
              >
                <div className="p-6 space-y-6">
                  {/* Featured Image */}
                  {article.featured_image_url && (
                    <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-border/40 bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={article.featured_image_url}
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Title & Subtitle */}
                  <div className="space-y-3">
                    <h1
                      className={cn(
                        "font-serif font-semibold leading-tight tracking-tight",
                        viewMode === "desktop" ? "text-3xl" : "text-2xl"
                      )}
                    >
                      {article.title}
                    </h1>
                    {article.subtitle && (
                      <p className="text-muted-foreground text-base leading-relaxed">
                        {article.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      <span>{authorName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{displayDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{readingTime} min read</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                      {article.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs font-normal"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Excerpt */}
                  {article.excerpt && (
                    <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                      {article.excerpt}
                    </blockquote>
                  )}

                  {/* Body */}
                  <div className="pt-4 border-t border-border/40">
                    <MarkdownBody markdown={article.body} />
                  </div>

                  {/* FAQ Section */}
                  {article.faq_json && article.faq_json.length > 0 && (
                    <BlogFaqSection faqs={article.faq_json} />
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="seo" className="m-0 h-full">
              <SeoPreview
                title={article.seo_title || article.title}
                description={article.seo_description || article.excerpt || ""}
                url={canonicalUrl}
                keywords={article.seo_keywords}
                faqs={article.faq_json}
                viewMode={viewMode}
              />
            </TabsContent>

            <TabsContent value="social" className="m-0 h-full">
              <SocialPreview
                title={article.seo_title || article.title}
                description={article.seo_description || article.excerpt || ""}
                imageUrl={ogImage}
                url={canonicalUrl}
                viewMode={viewMode}
              />
            </TabsContent>
          </div>
        </Tabs>

        {showActions && (
          <div className="shrink-0 flex items-center justify-end gap-3 pt-4 border-t border-border/50 mt-4">
            {onEdit && (
              <Button variant="outline" onClick={onEdit} className="gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
            {onPublish && (
              <Button onClick={onPublish} className="gap-2">
                <Send className="h-4 w-4" />
                {publishLabel}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
