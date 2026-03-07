import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Calendar, 
  Hash, 
  TrendingUp, 
  ExternalLink,
  Copy,
  CheckCircle2,
  Image as ImageIcon,
  LayoutGrid
} from "lucide-react";
import { format } from "date-fns";
import { slugToTitle } from "@/lib/slug";
import { useToast } from "@/hooks/use-toast";
import type { ContentStatus } from "@/types/content";

interface PostData {
  id: string;
  title: string;
  content: string;
  status: ContentStatus;
  ai_score: number | null;
  ai_reasoning: string | null;
  category_id: string | null;
  visual_url: string | null;
  visual_type: string | null;
  carousel_urls: string[] | null;
  hashtags: string[] | null;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  generating: "bg-chart-4/10 text-chart-4",
  ready: "bg-primary/10 text-primary",
  posted: "bg-accent/10 text-accent",
  failed: "bg-destructive/10 text-destructive",
};

function scoreColor(score: number): string {
  if (score >= 8) return "text-chart-3";
  if (score >= 5) return "text-chart-4";
  return "text-destructive";
}

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      setLoading(true);
      
      // Fetch all posts for the current user and match by slug
      const { data: allPosts, error } = await supabase
        .from("generated_content")
        .select("*")
        .eq("user_id", user?.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Post fetch error:", error);
        toast({
          title: "Error loading posts",
          description: "Failed to fetch posts.",
          variant: "destructive",
        });
        navigate("/content");
        return;
      }

      // Find post by matching slug
      const matchedPost = allPosts?.find((post: any) => {
        const postSlug = post.title
          .toString()
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');
        return postSlug === slug;
      });

      if (!matchedPost) {
        toast({
          title: "Post not found",
          description: "This post may have been deleted or doesn't exist.",
          variant: "destructive",
        });
        navigate("/content");
        return;
      }

      setPost(matchedPost as PostData);
      setLoading(false);
    };

    fetchPost();
  }, [slug, navigate, toast]);

  const handleCopyContent = () => {
    if (!post) return;
    
    const textToCopy = `${post.title}\n\n${post.content}\n\n${post.hashtags?.map(tag => `#${tag}`).join(" ") || ""}`;
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast({
      title: "Copied to clipboard!",
      description: "Post content has been copied.",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fade-in">
        <Card className="glass">
          <CardContent className="p-12">
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-fade-in">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate("/content")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Content
      </Button>

      {/* Main Content Card */}
      <Card className="glass-strong">
        <CardHeader className="space-y-4 pb-6">
          {/* Status and Score */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={statusColors[post.status] || ""}>
                {post.status}
              </Badge>
            </div>
            {post.ai_score != null && (
              <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    AI Score
                  </span>
                </div>
                <span className={`text-2xl font-bold ${scoreColor(post.ai_score)}`}>
                  {post.ai_score}
                </span>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold tracking-tight leading-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {format(new Date(post.created_at), "MMMM d, yyyy 'at' h:mm a")}
            </span>
            {post.visual_type && (
              <span className="flex items-center gap-1.5">
                {post.visual_type === "carousel" ? (
                  <LayoutGrid className="h-4 w-4" />
                ) : (
                  <ImageIcon className="h-4 w-4" />
                )}
                {post.visual_type}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleCopyContent}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Content
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6 space-y-6">
          {/* Visual */}
          {post.visual_url && (
            <div className="rounded-lg overflow-hidden border border-border">
              <img
                src={post.visual_url}
                alt={post.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          </div>

          {/* Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Hash className="h-4 w-4" />
                Hashtags
              </div>
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-sm px-3 py-1 cursor-pointer hover:bg-primary/10 transition-colors"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* AI Reasoning */}
          {post.ai_reasoning && (
            <div className="space-y-3 p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-4 w-4 text-primary" />
                AI Analysis
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {post.ai_reasoning}
              </p>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Related Actions */}
      <div className="flex items-center justify-between gap-4">
        <Link to="/content">
          <Button variant="outline">
            View All Posts
          </Button>
        </Link>
        <Link to="/generate">
          <Button className="gradient-primary text-white">
            Generate Another Post
          </Button>
        </Link>
      </div>
    </div>
  );
}
