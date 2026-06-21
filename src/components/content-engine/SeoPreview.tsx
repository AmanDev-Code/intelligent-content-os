"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Globe, CheckCircle2, AlertCircle, Code } from "lucide-react";

interface SeoPreviewProps {
  title: string;
  description: string;
  url: string;
  keywords?: string | null;
  faqs?: Array<{ question: string; answer: string }> | null;
  viewMode: "desktop" | "mobile";
}

export function SeoPreview({
  title,
  description,
  url,
  keywords,
  faqs,
  viewMode,
}: SeoPreviewProps) {
  const truncatedTitle = title.length > 60 ? title.slice(0, 57) + "..." : title;
  const truncatedDescription =
    description.length > 160 ? description.slice(0, 157) + "..." : description;

  const titleLength = title.length;
  const descLength = description.length;

  const titleStatus =
    titleLength >= 50 && titleLength <= 60
      ? "optimal"
      : titleLength < 50
        ? "short"
        : "long";
  const descStatus =
    descLength >= 150 && descLength <= 160
      ? "optimal"
      : descLength < 150
        ? "short"
        : "long";

  const keywordList = keywords
    ? keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : [];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description,
    url: url,
  };

  const faqSchema = faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }
    : null;

  return (
    <div
      className={cn(
        "mx-auto space-y-6",
        viewMode === "desktop" ? "max-w-full" : "max-w-[375px]"
      )}
    >
      {/* Google Search Preview */}
      <Card className="border border-border/60 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Google Search Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white dark:bg-zinc-900 rounded-lg p-4 border border-border/40">
            {/* Google-style result */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-primary">T</span>
                  </div>
                  <span>trndinn.com</span>
                </div>
                <span className="text-muted-foreground/60">›</span>
                <span className="text-muted-foreground/80 truncate">blog</span>
              </div>
              <h3 className="text-[#1a0dab] dark:text-blue-400 text-lg font-normal hover:underline cursor-pointer leading-snug">
                {truncatedTitle}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {truncatedDescription}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meta Analysis */}
      <Card className="border border-border/60 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Meta Tag Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title Analysis */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                SEO Title
              </span>
              <div className="flex items-center gap-1.5">
                {titleStatus === "optimal" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                )}
                <span
                  className={cn(
                    "text-xs",
                    titleStatus === "optimal"
                      ? "text-emerald-600"
                      : "text-amber-600"
                  )}
                >
                  {titleLength}/60 chars
                  {titleStatus === "short" && " (too short)"}
                  {titleStatus === "long" && " (too long)"}
                </span>
              </div>
            </div>
            <p className="text-sm bg-muted/50 rounded-md px-3 py-2 font-mono text-xs">
              {title}
            </p>
          </div>

          {/* Description Analysis */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Meta Description
              </span>
              <div className="flex items-center gap-1.5">
                {descStatus === "optimal" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                )}
                <span
                  className={cn(
                    "text-xs",
                    descStatus === "optimal"
                      ? "text-emerald-600"
                      : "text-amber-600"
                  )}
                >
                  {descLength}/160 chars
                  {descStatus === "short" && " (too short)"}
                  {descStatus === "long" && " (too long)"}
                </span>
              </div>
            </div>
            <p className="text-sm bg-muted/50 rounded-md px-3 py-2 font-mono text-xs">
              {description}
            </p>
          </div>

          {/* Canonical URL */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Canonical URL
            </span>
            <p className="text-sm bg-muted/50 rounded-md px-3 py-2 font-mono text-xs text-primary truncate">
              {url}
            </p>
          </div>

          {/* Keywords */}
          {keywordList.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Target Keywords
              </span>
              <div className="flex flex-wrap gap-1.5">
                {keywordList.map((kw) => (
                  <Badge key={kw} variant="outline" className="text-xs font-normal">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Structured Data Preview */}
      <Card className="border border-border/60 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Code className="h-4 w-4 text-muted-foreground" />
            Structured Data (JSON-LD)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Article Schema */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-xs font-medium">Article Schema</span>
            </div>
            <pre className="text-xs bg-muted/50 rounded-md p-3 overflow-x-auto font-mono">
              {JSON.stringify(articleSchema, null, 2)}
            </pre>
          </div>

          {/* FAQ Schema */}
          {faqSchema && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs font-medium">
                  FAQ Schema ({faqs?.length} questions)
                </span>
              </div>
              <pre className="text-xs bg-muted/50 rounded-md p-3 overflow-x-auto font-mono max-h-48 overflow-y-auto">
                {JSON.stringify(faqSchema, null, 2)}
              </pre>
            </div>
          )}

          {!faqSchema && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-3.5 w-3.5" />
              <span className="text-xs">No FAQ schema (add FAQs to enable)</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
