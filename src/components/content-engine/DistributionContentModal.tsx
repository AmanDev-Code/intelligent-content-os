"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Copy, Check, Pencil, Save, FileText, RefreshCw, Link2, BarChart3, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/apiClient";
import { PlatformIcon } from "./PlatformIcon";

interface DistributionContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  platform: string;
  content: string;
  coverImageUrl?: string;
  hashtags?: string[];
  characterCount?: number;
  seoScore?: number;
  engagementScore?: number;
  onContentSaved?: () => void;
  onRegenerate?: () => void;
}

const CHAR_LIMITS: Record<string, number | null> = {
  linkedin_post: 1300,
  twitter_thread: 280,
  hackernews: 500,
  facebook: 5000,
  instagram: 2200,
};

const PLATFORM_GUIDELINES: Record<string, string> = {
  linkedin_article: "1500-2000 words, professional tone, include hashtags at the end.",
  linkedin_post: "Max 1300 characters. Hook on first line, conversational, 3-5 hashtags.",
  medium: "Full article format, Medium-specific markdown. Use ## for headers.",
  hashnode: "Developer-focused, include front matter. Technical depth appreciated.",
  devto: "Include YAML front matter (title, published, tags, canonical_url).",
  substack: "Newsletter format, personal voice. Address the reader directly.",
  newsletter: "Email-friendly: short paragraphs, clear CTAs, minimal formatting.",
  twitter_thread: "5-10 tweets, each under 280 chars. Hook first. Separated by ---.",
  reddit: "Value-first, not self-promotional. Ask an engaging question at the end.",
  hackernews: "Ultra-concise. Title + key insight only. No marketing language.",
  facebook: "Casual and community-oriented. End with engagement question.",
  instagram: "Slide-by-slide format. Hook slide first, CTA slide last.",
  indiehackers: "Building-in-public angle. Include metrics and learnings.",
};

function platformLabel(p: string) {
  return p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DistributionContentModal({
  open,
  onOpenChange,
  postId,
  platform,
  content,
  coverImageUrl,
  hashtags,
  characterCount,
  seoScore,
  engagementScore,
  onContentSaved,
  onRegenerate,
}: DistributionContentModalProps) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedImageUrl, setCopiedImageUrl] = useState(false);

  const charLimit = CHAR_LIMITS[platform] ?? null;
  const guideline = PLATFORM_GUIDELINES[platform] ?? "";

  const handleCopyImageUrl = async () => {
    if (!coverImageUrl) return;
    try {
      await navigator.clipboard.writeText(coverImageUrl);
      setCopiedImageUrl(true);
      toast({ title: "Image URL copied!" });
      setTimeout(() => setCopiedImageUrl(false), 2000);
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const handleCopy = async (text?: string) => {
    try {
      await navigator.clipboard.writeText(text ?? editedContent);
      setCopied(true);
      toast({ title: `Content copied! Paste it on ${platformLabel(platform)}` });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.patch(`/admin/content-engine/distributions/${postId}/${platform}`, {
        adapted_content: editedContent,
      });
      toast({ title: "Content saved" });
      setEditing(false);
      onContentSaved?.();
    } catch (e: any) {
      toast({ title: e.message || "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const isTwitterThread = platform === "twitter_thread";
  const tweets = isTwitterThread ? editedContent.split(/\n\n---\n\n/) : [];

  const charCount = isTwitterThread ? undefined : editedContent.length;
  const isOverLimit = charLimit && charCount ? charCount > charLimit : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlatformIcon platform={platform} className="h-5 w-5" />
            {platformLabel(platform)} Content
          </DialogTitle>
          {guideline && (
            <p className="text-xs text-muted-foreground mt-1 bg-muted/50 p-2 rounded">
              {guideline}
            </p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-2">
          {/* Cover Image Section */}
          {coverImageUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Cover Image</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] px-2"
                  onClick={handleCopyImageUrl}
                >
                  {copiedImageUrl ? <Check className="h-3 w-3 mr-1" /> : <Link2 className="h-3 w-3 mr-1" />}
                  {copiedImageUrl ? "Copied!" : "Copy URL"}
                </Button>
              </div>
              <div className="relative aspect-[1.91/1] w-full rounded-lg overflow-hidden border border-border/50">
                <img
                  src={coverImageUrl}
                  alt={`${platformLabel(platform)} cover`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Scores Section */}
          {(seoScore || engagementScore || characterCount) && (
            <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border/50">
              {seoScore && (
                <div className="flex items-center gap-1.5">
                  <Target className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">SEO Score</p>
                    <p className="text-sm font-semibold">{seoScore}/100</p>
                  </div>
                </div>
              )}
              {engagementScore && (
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-emerald-500" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Engagement</p>
                    <p className="text-sm font-semibold">{engagementScore}/100</p>
                  </div>
                </div>
              )}
              {characterCount && (
                <div className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Characters</p>
                    <p className="text-sm font-semibold">{characterCount.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hashtags */}
          {hashtags && hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {hashtags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag.startsWith('#') ? tag : `#${tag}`}
                </Badge>
              ))}
            </div>
          )}

          {editing ? (
            <div className="space-y-2">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
              {charLimit && (
                <p className={`text-xs ${isOverLimit ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                  {charCount}/{charLimit} characters {isOverLimit ? "(exceeds limit!)" : ""}
                </p>
              )}
            </div>
          ) : isTwitterThread ? (
            <div className="space-y-3">
              {tweets.map((tweet, i) => (
                <div key={i} className="relative p-3 rounded-lg border border-border/50 bg-muted/30">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm whitespace-pre-wrap flex-1">{tweet}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 shrink-0"
                      onClick={() => handleCopy(tweet)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary" className="text-[10px]">Tweet {i + 1}</Badge>
                    <span className={`text-[10px] ${tweet.length > 280 ? "text-red-500" : "text-muted-foreground"}`}>
                      {tweet.length}/280
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-4 rounded-lg border border-border/50 bg-muted/30 whitespace-pre-wrap text-sm font-mono">
                {editedContent}
              </div>
              {charLimit && (
                <p className={`text-xs ${isOverLimit ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                  {charCount}/{charLimit} characters {isOverLimit ? "(exceeds limit!)" : ""}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-row gap-2 justify-between sm:justify-between">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (editing) {
                  setEditing(false);
                  setEditedContent(content);
                } else {
                  setEditing(true);
                }
              }}
            >
              <Pencil className="h-3.5 w-3.5 mr-1" />
              {editing ? "Cancel Edit" : "Edit"}
            </Button>
            {editing && (
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Save className="h-3.5 w-3.5 mr-1" />
                {saving ? "Saving..." : "Save Edits"}
              </Button>
            )}
            {onRegenerate && !editing && (
              <Button variant="outline" size="sm" onClick={onRegenerate}>
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Regenerate
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleCopy()}>
              {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              {copied ? "Copied!" : "Copy All"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(`\`\`\`\n${editedContent}\n\`\`\``)}
            >
              <FileText className="h-3.5 w-3.5 mr-1" /> Copy as Markdown
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
