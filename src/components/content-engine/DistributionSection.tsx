"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Share2, Search } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { parseAdminBlogPostsList } from "@/lib/blogAdminPosts";
import { useToast } from "@/hooks/use-toast";
import { DistributionGrid } from "./DistributionGrid";

type PostWithDist = {
  id: string;
  title: string;
  slug: string;
  status: string;
};

export function DistributionSection() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostWithDist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get("/admin/blog/posts", { params: { status: "published", q: search || undefined } });
      setPosts(parseAdminBlogPostsList<PostWithDist>(data));
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Distribution</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage multi-platform content distribution for published articles
        </p>
      </div>

      <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Share2 className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                What Happens
              </p>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1.5">
                <li><strong>Select platforms:</strong> Choose where you want to publish this article (Dev.to, Hashnode, Medium, LinkedIn, etc.)</li>
                <li><strong>Generate:</strong> AI adapts your content for each platform&apos;s format and best practices</li>
                <li><strong>Distribute:</strong> Either auto-publishes (if credentials configured) or prepares copies for manual posting</li>
                <li><strong>Status tracking:</strong> See which platforms have received the content (Pending, Published, Failed)</li>
                <li><strong>One article, many platforms:</strong> Maximize reach without rewriting content manually</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search published articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="border border-border/60 shadow-none">
          <CardContent className="py-12 text-center">
            <Share2 className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No published articles</p>
            <p className="text-xs text-muted-foreground mt-1">
              Publish an article first, then distribute it across platforms
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="border border-border/60 shadow-none">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground">/{post.slug}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                  >
                    {selectedPost === post.id ? "Collapse" : "Manage"}
                  </Button>
                </div>
                {selectedPost === post.id && <DistributionGrid postId={post.id} />}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
