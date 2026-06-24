"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Loader2, ExternalLink, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PlatformIcon } from "./PlatformIcon";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DistributionPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: string;
  content: string;
  coverImageUrl?: string;
  inlineImages?: { position: number; url: string; alt: string }[];
  hashtags?: string[];
  platformTitle?: string;
}

function platformLabel(p: string) {
  return p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const PLATFORM_STYLES: Record<string, {
  bg: string;
  cardBg: string;
  text: string;
  textMuted: string;
  accent: string;
  border: string;
  fontFamily: string;
}> = {
  linkedin_article: {
    bg: "bg-[#f3f2ef]",
    cardBg: "bg-white",
    text: "text-[#000000e6]",
    textMuted: "text-[#00000099]",
    accent: "text-[#0a66c2]",
    border: "border-[#e0dfdc]",
    fontFamily: "font-sans",
  },
  linkedin_post: {
    bg: "bg-[#f3f2ef]",
    cardBg: "bg-white",
    text: "text-[#000000e6]",
    textMuted: "text-[#00000099]",
    accent: "text-[#0a66c2]",
    border: "border-[#e0dfdc]",
    fontFamily: "font-sans",
  },
  devto: {
    bg: "bg-[#f5f5f5]",
    cardBg: "bg-white",
    text: "text-[#171717]",
    textMuted: "text-[#525252]",
    accent: "text-[#3b49df]",
    border: "border-[#d4d4d4]",
    fontFamily: "font-sans",
  },
  hashnode: {
    bg: "bg-[#0f172a]",
    cardBg: "bg-[#1e293b]",
    text: "text-white",
    textMuted: "text-[#94a3b8]",
    accent: "text-[#2563eb]",
    border: "border-[#334155]",
    fontFamily: "font-sans",
  },
  medium: {
    bg: "bg-white",
    cardBg: "bg-white",
    text: "text-[#242424]",
    textMuted: "text-[#6b6b6b]",
    accent: "text-[#1a8917]",
    border: "border-[#e6e6e6]",
    fontFamily: "font-serif",
  },
  ghost: {
    bg: "bg-[#0f0f0f]",
    cardBg: "bg-[#1a1a1a]",
    text: "text-white",
    textMuted: "text-[#a0a0a0]",
    accent: "text-[#15171a]",
    border: "border-[#2a2a2a]",
    fontFamily: "font-serif",
  },
  substack: {
    bg: "bg-[#fffff8]",
    cardBg: "bg-white",
    text: "text-[#1a1a1a]",
    textMuted: "text-[#6b6b6b]",
    accent: "text-[#ff6719]",
    border: "border-[#e6e6e6]",
    fontFamily: "font-serif",
  },
  beehiiv: {
    bg: "bg-[#fafafa]",
    cardBg: "bg-white",
    text: "text-[#1a1a1a]",
    textMuted: "text-[#737373]",
    accent: "text-[#f97316]",
    border: "border-[#e5e5e5]",
    fontFamily: "font-sans",
  },
  newsletter: {
    bg: "bg-[#f9fafb]",
    cardBg: "bg-white",
    text: "text-[#111827]",
    textMuted: "text-[#6b7280]",
    accent: "text-[#2563eb]",
    border: "border-[#e5e7eb]",
    fontFamily: "font-sans",
  },
};

const DEFAULT_STYLE = {
  bg: "bg-muted/30",
  cardBg: "bg-card",
  text: "text-foreground",
  textMuted: "text-muted-foreground",
  accent: "text-primary",
  border: "border-border",
  fontFamily: "font-sans",
};

export function DistributionPreviewModal({
  open,
  onOpenChange,
  platform,
  content,
  coverImageUrl,
  inlineImages = [],
  hashtags = [],
  platformTitle,
}: DistributionPreviewModalProps) {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<"preview" | "raw">("preview");

  const style = PLATFORM_STYLES[platform] || DEFAULT_STYLE;
  const allImages = [
    ...(coverImageUrl ? [{ url: coverImageUrl, alt: "Cover image" }] : []),
    ...inlineImages.map((img) => ({ url: img.url, alt: img.alt })),
  ];

  const downloadSingleImage = async (url: string, filename: string): Promise<boolean> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch image");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      return true;
    } catch (error) {
      console.error(`Failed to download ${filename}:`, error);
      return false;
    }
  };

  const handleDownloadAllImages = async () => {
    if (allImages.length === 0) {
      toast({ title: "No images to download", variant: "destructive" });
      return;
    }

    setDownloading(true);
    setDownloadProgress(0);

    let successCount = 0;
    for (let i = 0; i < allImages.length; i++) {
      const img = allImages[i];
      const ext = img.url.split(".").pop()?.split("?")[0] || "png";
      const filename = `${platform}-image-${i + 1}.${ext}`;
      
      const success = await downloadSingleImage(img.url, filename);
      if (success) successCount++;
      
      setDownloadProgress(Math.round(((i + 1) / allImages.length) * 100));
      
      if (i < allImages.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setDownloading(false);
    setDownloadProgress(0);

    if (successCount === allImages.length) {
      toast({ title: `Downloaded ${successCount} image${successCount > 1 ? "s" : ""}` });
    } else {
      toast({
        title: `Downloaded ${successCount}/${allImages.length} images`,
        variant: successCount === 0 ? "destructive" : "default",
      });
    }
  };

  const extractTitle = (content: string): string => {
    if (platformTitle) return platformTitle;
    
    const yamlMatch = content.match(/^---[\s\S]*?title:\s*["']?([^"'\n]+)["']?[\s\S]*?---/);
    if (yamlMatch) return yamlMatch[1].trim();
    
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) return h1Match[1].trim();
    
    const firstLine = content.split("\n")[0]?.trim();
    if (firstLine && firstLine.length < 100) return firstLine;
    
    return "Untitled";
  };

  const stripFrontMatter = (content: string): string => {
    return content.replace(/^---[\s\S]*?---\n*/, "").trim();
  };

  const renderLinkedInPreview = () => {
    const title = extractTitle(content);
    const cleanContent = stripFrontMatter(content);
    const paragraphs = cleanContent.split(/\n\n+/).filter(Boolean);

    return (
      <div className={`${style.bg} p-4 rounded-lg min-h-[500px]`}>
        <div className={`${style.cardBg} rounded-lg shadow-sm ${style.border} border overflow-hidden max-w-[600px] mx-auto`}>
          {coverImageUrl && (
            <div className="aspect-[1.91/1] w-full overflow-hidden">
              <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                U
              </div>
              <div>
                <p className={`font-semibold ${style.text}`}>Your Name</p>
                <p className={`text-xs ${style.textMuted}`}>Your headline • 1h</p>
              </div>
            </div>
            <h2 className={`text-xl font-bold ${style.text} mb-3`}>{title}</h2>
            <div className={`${style.text} ${style.fontFamily} space-y-3`}>
              {paragraphs.slice(0, 5).map((p, i) => (
                <p key={i} className="text-sm leading-relaxed">
                  {p.replace(/^#+\s*/, "").replace(/\*\*/g, "").replace(/\*/g, "")}
                </p>
              ))}
              {paragraphs.length > 5 && (
                <p className={`text-sm ${style.accent} cursor-pointer`}>...see more</p>
              )}
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-4">
                {hashtags.slice(0, 5).map((tag, i) => (
                  <span key={i} className={`text-sm ${style.accent}`}>
                    {tag.startsWith("#") ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            )}
            <div className={`flex items-center justify-between mt-4 pt-3 border-t ${style.border}`}>
              <div className="flex items-center gap-4">
                <span className={`text-xs ${style.textMuted}`}>👍 Like</span>
                <span className={`text-xs ${style.textMuted}`}>💬 Comment</span>
                <span className={`text-xs ${style.textMuted}`}>🔄 Repost</span>
                <span className={`text-xs ${style.textMuted}`}>📤 Send</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDevToPreview = () => {
    const title = extractTitle(content);
    const cleanContent = stripFrontMatter(content);

    return (
      <div className={`${style.bg} p-4 rounded-lg min-h-[500px]`}>
        <div className={`${style.cardBg} rounded-lg shadow-sm ${style.border} border overflow-hidden max-w-[800px] mx-auto`}>
          {coverImageUrl && (
            <div className="aspect-[2.5/1] w-full overflow-hidden">
              <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                U
              </div>
              <div>
                <p className={`font-semibold ${style.text}`}>Your Name</p>
                <p className={`text-xs ${style.textMuted}`}>Posted on Jun 24</p>
              </div>
            </div>
            <h1 className={`text-3xl font-bold ${style.text} mb-4`}>{title}</h1>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {hashtags.slice(0, 4).map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    #{tag.replace(/^#/, "")}
                  </Badge>
                ))}
              </div>
            )}
            <div className={`${style.text} ${style.fontFamily} prose prose-sm max-w-none`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {cleanContent.slice(0, 2000)}
              </ReactMarkdown>
              {cleanContent.length > 2000 && (
                <p className={`${style.textMuted} italic`}>...content continues</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHashnodePreview = () => {
    const title = extractTitle(content);
    const cleanContent = stripFrontMatter(content);

    return (
      <div className={`${style.bg} p-4 rounded-lg min-h-[500px]`}>
        <div className={`${style.cardBg} rounded-xl shadow-lg ${style.border} border overflow-hidden max-w-[800px] mx-auto`}>
          {coverImageUrl && (
            <div className="aspect-[2/1] w-full overflow-hidden">
              <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-8">
            <h1 className={`text-4xl font-bold ${style.text} mb-6`}>{title}</h1>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                U
              </div>
              <div>
                <p className={`font-semibold ${style.text}`}>Your Name</p>
                <p className={`text-sm ${style.textMuted}`}>Jun 24, 2026 • 5 min read</p>
              </div>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {hashtags.slice(0, 5).map((tag, i) => (
                  <Badge key={i} className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {tag.replace(/^#/, "")}
                  </Badge>
                ))}
              </div>
            )}
            <div className={`${style.text} ${style.fontFamily} prose prose-invert prose-sm max-w-none`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {cleanContent.slice(0, 2000)}
              </ReactMarkdown>
              {cleanContent.length > 2000 && (
                <p className={`${style.textMuted} italic`}>...content continues</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMediumPreview = () => {
    const title = extractTitle(content);
    const cleanContent = stripFrontMatter(content);

    return (
      <div className={`${style.bg} p-4 rounded-lg min-h-[500px]`}>
        <div className={`${style.cardBg} max-w-[680px] mx-auto py-8`}>
          <h1 className={`text-[32px] font-bold ${style.text} ${style.fontFamily} mb-4 leading-tight`}>
            {title}
          </h1>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold">
              U
            </div>
            <div>
              <p className={`font-medium ${style.text}`}>Your Name</p>
              <p className={`text-sm ${style.textMuted}`}>5 min read • Jun 24, 2026</p>
            </div>
          </div>
          {coverImageUrl && (
            <div className="aspect-[16/9] w-full overflow-hidden rounded-sm mb-8">
              <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
            </div>
          )}
          <div className={`${style.text} ${style.fontFamily} prose prose-lg max-w-none`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {cleanContent.slice(0, 2000)}
            </ReactMarkdown>
            {cleanContent.length > 2000 && (
              <p className={`${style.textMuted} italic`}>...content continues</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderGenericMarkdownPreview = () => {
    const title = extractTitle(content);
    const cleanContent = stripFrontMatter(content);

    return (
      <div className={`${style.bg} p-4 rounded-lg min-h-[500px]`}>
        <div className={`${style.cardBg} rounded-lg shadow-sm ${style.border} border overflow-hidden max-w-[800px] mx-auto p-6`}>
          {coverImageUrl && (
            <div className="aspect-[2/1] w-full overflow-hidden rounded-lg mb-6">
              <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
            </div>
          )}
          <h1 className={`text-3xl font-bold ${style.text} mb-4`}>{title}</h1>
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {hashtags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag.startsWith("#") ? tag : `#${tag}`}
                </Badge>
              ))}
            </div>
          )}
          <div className={`${style.text} ${style.fontFamily} prose prose-sm max-w-none`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {cleanContent.slice(0, 3000)}
            </ReactMarkdown>
            {cleanContent.length > 3000 && (
              <p className={`${style.textMuted} italic`}>...content continues</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    switch (platform) {
      case "linkedin_article":
      case "linkedin_post":
        return renderLinkedInPreview();
      case "devto":
        return renderDevToPreview();
      case "hashnode":
        return renderHashnodePreview();
      case "medium":
        return renderMediumPreview();
      default:
        return renderGenericMarkdownPreview();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <PlatformIcon platform={platform} className="h-5 w-5" />
              {platformLabel(platform)} Preview
            </DialogTitle>
            <div className="flex items-center gap-2">
              {allImages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadAllImages}
                  disabled={downloading}
                  className="gap-2"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {downloadProgress}%
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Download Images ({allImages.length})
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "preview" | "raw")} className="flex-1 flex flex-col">
          <TabsList className="mx-6 mt-2 w-fit">
            <TabsTrigger value="preview" className="gap-2">
              <ExternalLink className="h-3.5 w-3.5" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="raw" className="gap-2">
              <ImageIcon className="h-3.5 w-3.5" />
              Raw Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-1 m-0">
            <ScrollArea className="h-[calc(90vh-180px)]">
              {renderPreview()}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="raw" className="flex-1 m-0">
            <ScrollArea className="h-[calc(90vh-180px)]">
              <div className="p-6">
                {allImages.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Images ({allImages.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {allImages.map((img, i) => (
                        <div key={i} className="relative group">
                          <div className="aspect-video rounded-lg overflow-hidden border bg-muted">
                            <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute bottom-2 right-2 h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => downloadSingleImage(img.url, `${platform}-image-${i + 1}.png`)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Content</h3>
                  <pre className="p-4 rounded-lg bg-muted/50 border text-xs font-mono whitespace-pre-wrap overflow-x-auto">
                    {content}
                  </pre>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
