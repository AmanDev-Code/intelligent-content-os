import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Sparkles } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Content = Tables<"generated_content">;

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  ready: "bg-primary/10 text-primary",
  posted: "bg-accent/10 text-accent",
};

export function ContentFeed() {
  const { user } = useAuth();
  const [content, setContent] = useState<Content[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchContent = async () => {
      let query = supabase
        .from("generated_content")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data } = await query;
      setContent(data || []);
      setLoading(false);
    };

    fetchContent();
  }, [user, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Recent Content</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="posted">Posted</SelectItem>
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
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No content yet. Generate your first post!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {content.map((item, i) => (
            <Card
              key={item.id}
              className="glass group hover:glow-primary transition-all duration-300 hover:-translate-y-0.5 cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
            >
              <CardContent className="p-4 flex items-center gap-4">
                {item.visual_url ? (
                  <img
                    src={item.visual_url}
                    alt=""
                    className="h-12 w-12 rounded-md object-cover shrink-0"
                  />
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
                  {item.ai_score && (
                    <span className="text-xs font-medium text-primary">{String(item.ai_score)}/10</span>
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
