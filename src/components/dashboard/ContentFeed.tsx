import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Sparkles } from "lucide-react";
import Image from "next/image";
import type { ContentStatus } from "@/types/content";

interface ContentRow {
  id: string;
  title: string;
  content: string;
  status: ContentStatus;
  ai_score: number | null;
  visual_url: string | null;
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

export function ContentFeed() {
  const { user } = useAuth();
  const [content, setContent] = useState<ContentRow[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchContent = async () => {
      let query = supabase
        .from("generated_content")
        .select("id, title, content, status, ai_score, visual_url, created_at, deleted_at")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(20);

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Recent Content</h2>
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
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass">
              <CardContent className="p-4">
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-muted rounded animate-pulse mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : content.length === 0 ? (
        <Card className="glass">
          <CardContent className="p-8 text-center">
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-3 animate-pulse" />
            <p className="text-muted-foreground text-sm">No content yet. Generate your first post!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {content.map((item, i) => (
            <Card
              key={item.id}
              className="glass group hover:glow-primary transition-all duration-300 hover:-translate-y-0.5 cursor-pointer animate-fade-in-up hover:border-primary/30"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
            >
              <CardContent className="p-4 flex items-center gap-4">
                {item.visual_url ? (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={item.visual_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {item.content.slice(0, 80)}...
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {item.ai_score != null && (
                    <span className={`text-xs font-medium ${scoreColor(item.ai_score)}`}>
                      {String(item.ai_score)}/10
                    </span>
                  )}
                  <Badge variant="secondary" className={statusColors[item.status] || ""}>
                    {item.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
