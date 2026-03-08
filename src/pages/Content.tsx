import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, Zap, Calendar, Hash, Image, LayoutGrid } from "lucide-react";
import { format } from "date-fns";
import { createPostSlug } from "@/lib/slug";
import type { ContentStatus } from "@/types/content";

interface ContentRow {
  id: string;
  title: string;
  content: string;
  status: ContentStatus;
  ai_score: number | null;
  visual_url: string | null;
  visual_type: string | null;
  hashtags: string[] | null;
  created_at: string;
  deleted_at: string | null;
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

export default function Content() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [content, setContent] = useState<ContentRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchContent = async () => {
      setLoading(true);
      let query = supabase
        .from("generated_content")
        .select("id, title, content, status, ai_score, visual_url, visual_type, hashtags, created_at, deleted_at")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as ContentStatus);
      }

      const { data } = await query;
      setContent((data as ContentRow[] | null) || []);
      setLoading(false);
    };

    fetchContent();
  }, [user, statusFilter]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Content</h1>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 h-9" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="generating">Generating</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="posted">Posted</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        <Link to="/ai-agent">
            <Button size="sm" className="gradient-primary text-primary-foreground">
              <Zap className="h-4 w-4 mr-1" />
              Generate
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass">
              <CardContent className="p-5">
                <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-3 w-full bg-muted rounded animate-pulse mt-3" />
                <div className="h-3 w-1/2 bg-muted rounded animate-pulse mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : content.length === 0 ? (
        <Card className="glass">
          <CardContent className="p-12 text-center">
            <Sparkles className="h-10 w-10 text-primary mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground mb-4">Your generated content will appear here.</p>
            <Link to="/ai-agent">
              <Button className="gradient-primary text-primary-foreground">
                <Zap className="h-4 w-4 mr-2" />
                Generate your first post
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {content.map((item, i) => {
            const slug = createPostSlug(item.title);
            return (
              <Card
                key={item.id}
                className="glass group hover:glow-primary transition-all duration-300 hover:-translate-y-0.5 cursor-pointer animate-fade-in-up hover:border-primary/30"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
                onClick={() => navigate(`/content/${slug}`)}
              >
                <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {item.visual_url ? (
                    <img
                      src={item.visual_url}
                      alt=""
                      className="h-16 w-16 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm truncate">{item.title}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.ai_score != null && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted/50">
                            <span className="text-[10px] font-medium text-muted-foreground uppercase">AI</span>
                            <span className={`text-xs font-bold ${scoreColor(item.ai_score)}`}>
                              {String(item.ai_score)}
                            </span>
                          </div>
                        )}
                        <Badge variant="secondary" className={statusColors[item.status] || ""}>
                          {item.status}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {item.content}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(item.created_at), "MMM d, yyyy")}
                      </span>
                      {item.visual_type && (
                        <span className="flex items-center gap-1">
                          {item.visual_type === "carousel" ? (
                            <LayoutGrid className="h-3 w-3" />
                          ) : (
                            <Image className="h-3 w-3" />
                          )}
                          {item.visual_type}
                        </span>
                      )}
                      {item.hashtags && item.hashtags.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {item.hashtags.length} tags
                        </span>
                      )}
                    </div>

                    {item.hashtags && item.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.hashtags.slice(0, 5).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                            #{tag}
                          </Badge>
                        ))}
                        {item.hashtags.length > 5 && (
                          <span className="text-[10px] text-muted-foreground">+{item.hashtags.length - 5}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
