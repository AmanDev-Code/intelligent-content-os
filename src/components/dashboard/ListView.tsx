import { format } from "date-fns";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { createPostSlug } from "@/lib/slug";
import type { ScheduledPost } from "@/hooks/useScheduledPosts";

interface ListViewProps {
  posts: ScheduledPost[];
  loading: boolean;
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  generating: "outline",
  ready: "default",
  posted: "default",
  failed: "destructive",
};

export function ListView({ posts, loading }: ListViewProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground">
        <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
        No content found for this period.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {posts.map((post) => (
        <div
          key={post.id}
          onClick={() => navigate(`/content/${createPostSlug(post.title)}`)}
          className="flex items-center gap-3 p-3 rounded-md border border-border hover:bg-muted/50 cursor-pointer transition-colors"
        >
          <div className="w-1 h-8 rounded-full bg-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{post.title}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(post.created_at), "MMM d, yyyy • h:mm a")}
            </p>
          </div>
          <Badge variant={statusVariant[post.status] ?? "secondary"} className="text-xs shrink-0">
            {post.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}
