"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Linkedin, Twitter, Facebook, Globe } from "lucide-react";

interface SocialPreviewProps {
  title: string;
  description: string;
  imageUrl?: string | null;
  url: string;
  viewMode: "desktop" | "mobile";
}

export function SocialPreview({
  title,
  description,
  imageUrl,
  url,
  viewMode,
}: SocialPreviewProps) {
  const truncatedTitle = title.length > 70 ? title.slice(0, 67) + "..." : title;
  const truncatedDescription =
    description.length > 200 ? description.slice(0, 197) + "..." : description;

  const domain = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return "trndinn.com";
    }
  })();

  return (
    <div
      className={cn(
        "mx-auto space-y-6",
        viewMode === "desktop" ? "max-w-full" : "max-w-[375px]"
      )}
    >
      {/* LinkedIn Preview */}
      <Card className="border border-border/60 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Linkedin className="h-4 w-4 text-[#0A66C2]" />
            LinkedIn Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-border/40 overflow-hidden">
            {imageUrl ? (
              <div className="aspect-[1.91/1] bg-muted relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[1.91/1] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Globe className="h-12 w-12 text-muted-foreground/40" />
              </div>
            )}
            <div className="p-3 space-y-1">
              <h3 className="font-semibold text-sm leading-snug line-clamp-2">
                {truncatedTitle}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {truncatedDescription}
              </p>
              <p className="text-xs text-muted-foreground/70">{domain}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Twitter/X Preview */}
      <Card className="border border-border/60 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Twitter className="h-4 w-4" />
            Twitter/X Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-border/40 overflow-hidden">
            {imageUrl ? (
              <div className="aspect-[2/1] bg-muted relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[2/1] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Globe className="h-12 w-12 text-muted-foreground/40" />
              </div>
            )}
            <div className="p-3 space-y-0.5">
              <h3 className="font-normal text-sm leading-snug line-clamp-1">
                {truncatedTitle}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {truncatedDescription}
              </p>
              <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {domain}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facebook Preview */}
      <Card className="border border-border/60 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Facebook className="h-4 w-4 text-[#1877F2]" />
            Facebook Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-[#f0f2f5] dark:bg-zinc-800 rounded-lg border border-border/40 overflow-hidden">
            {imageUrl ? (
              <div className="aspect-[1.91/1] bg-muted relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[1.91/1] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Globe className="h-12 w-12 text-muted-foreground/40" />
              </div>
            )}
            <div className="bg-white dark:bg-zinc-900 p-3 space-y-1">
              <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wide">
                {domain}
              </p>
              <h3 className="font-semibold text-sm leading-snug line-clamp-2">
                {truncatedTitle}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {truncatedDescription}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Open Graph Tags Summary */}
      <Card className="border border-border/60 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Open Graph Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-xs">
            <div className="bg-muted/50 rounded-md p-2">
              <span className="text-muted-foreground">og:title</span>
              <p className="text-foreground mt-0.5 break-words">{title}</p>
            </div>
            <div className="bg-muted/50 rounded-md p-2">
              <span className="text-muted-foreground">og:description</span>
              <p className="text-foreground mt-0.5 break-words">{description}</p>
            </div>
            <div className="bg-muted/50 rounded-md p-2">
              <span className="text-muted-foreground">og:url</span>
              <p className="text-primary mt-0.5 break-all">{url}</p>
            </div>
            <div className="bg-muted/50 rounded-md p-2">
              <span className="text-muted-foreground">og:image</span>
              <p className="text-foreground mt-0.5 break-all">
                {imageUrl || <span className="text-amber-600">Not set</span>}
              </p>
            </div>
            <div className="bg-muted/50 rounded-md p-2">
              <span className="text-muted-foreground">og:type</span>
              <p className="text-foreground mt-0.5">article</p>
            </div>
            <div className="bg-muted/50 rounded-md p-2">
              <span className="text-muted-foreground">twitter:card</span>
              <p className="text-foreground mt-0.5">summary_large_image</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
