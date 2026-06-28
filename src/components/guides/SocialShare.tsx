"use client";

import { Share2, Linkedin, Twitter, Link2, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteName, twitterHandle } from "@/lib/site";

interface SocialShareProps {
  title: string;
  url: string;
  className?: string;
}

export function SocialShare({ title, url, className }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareText = encodeURIComponent(`Check out this guide from ${siteName}: ${title}`);
  const shareUrl = encodeURIComponent(url);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silent fail
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
        <Share2 className="h-4 w-4" />
        Share
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          asChild
        >
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}&via=${twitterHandle.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Twitter"
          >
            <Twitter className="h-4 w-4" />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          asChild
        >
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on LinkedIn"
          >
            <Linkedin className="h-4 w-4" />
          </a>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={handleCopy}
          aria-label="Copy link"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
