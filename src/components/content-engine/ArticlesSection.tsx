"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Eye, FileText, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, apiClient } from "@/lib/apiClient";
import { parseAdminBlogPostsList } from "@/lib/blogAdminPosts";
import { useBlogAccess } from "@/hooks/useBlogAccess";
import { useToast } from "@/hooks/use-toast";
import { BlogPostEditorDialog } from "@/components/blog/BlogPostEditorDialog";
import { BlogEditorsPanel } from "@/components/blog/BlogEditorsPanel";
import { BlogPageSeoPanel } from "@/components/blog/BlogPageSeoPanel";
import { ArticlePreview, type ArticlePreviewData } from "./ArticlePreview";

export type ArticlesView = "list" | "editors" | "page-seo";

type PostRow = {
  id: string;
  title: string;
  slug: string;
  path?: string;
  status: string;
  updated_at: string;
  seo_score: number | null;
  tags: string[] | null;
  post_kind?: string;
  content_category?: string | null;
};

type FullPost = PostRow & {
  subtitle?: string | null;
  excerpt?: string | null;
  body?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  reading_minutes?: number | null;
  featured_image_url?: string | null;
  og_image_url?: string | null;
  author_display_name?: string | null;
  author_avatar_url?: string | null;
  published_at?: string | null;
  faq_json?: Array<{ question: string; answer: string }> | null;
  canonical_url?: string | null;
};

export interface ArticlesSectionProps {
  /** "new" opens create dialog; uuid opens edit */
  editId?: string | null;
  onEditChange: (editId: string | null) => void;
  view?: ArticlesView;
  onViewChange?: (view: ArticlesView) => void;
}

export function ArticlesSection({
  editId,
  onEditChange,
  view = "list",
  onViewChange,
}: ArticlesSectionProps) {
  const access = useBlogAccess();
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<ArticlePreviewData | null>(null);
  const [loadingPreview, setLoadingPreview] = useState<string | null>(null);

  const editorOpen = editId != null;
  const editingPostId = editId === "new" ? null : editId ?? null;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get("/admin/blog/posts", {
        params: { q: search || undefined, status: filterStatus || undefined },
      });
      setPosts(parseAdminBlogPostsList<PostRow>(data));
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePreview = async (postId: string) => {
    setLoadingPreview(postId);
    try {
      const data = await apiClient.get(`/admin/blog/posts/${postId}`);
      const post = data as FullPost;
      setPreviewArticle({
        title: post.title,
        slug: post.slug,
        subtitle: post.subtitle,
        excerpt: post.excerpt,
        body: post.body || "",
        tags: post.tags,
        seo_title: post.seo_title,
        seo_description: post.seo_description,
        seo_keywords: post.seo_keywords,
        reading_minutes: post.reading_minutes,
        featured_image_url: post.featured_image_url,
        og_image_url: post.og_image_url,
        author_display_name: post.author_display_name,
        author_avatar_url: post.author_avatar_url,
        published_at: post.published_at,
        faq_json: post.faq_json,
        canonical_url: post.canonical_url,
      });
      setPreviewOpen(true);
    } catch {
      // user can retry
    } finally {
      setLoadingPreview(null);
    }
  };

  async function removePost(id: string) {
    if (!confirm("Delete this post and all nested child posts?")) return;
    try {
      await api.admin.blogDeletePost(id);
      toast({ title: "Deleted" });
      await load();
    } catch (e: unknown) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    }
  }

  const statusColor: Record<string, string> = {
    published: "bg-emerald-100 text-emerald-700",
    draft: "bg-amber-100 text-amber-700",
    scheduled: "bg-blue-100 text-blue-700",
    archived: "bg-gray-100 text-gray-600",
  };

  if (!access.loading && !access.canManageBlog) {
    return (
      <div className="py-16 text-center">
        <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium">Blog management access required</p>
        <p className="text-xs text-muted-foreground mt-1">
          Ask a platform admin to grant you editor rights.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Articles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, edit, and publish blog content — your full content CMS
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href="/blog" target="_blank" rel="noopener noreferrer">
              <BookOpen className="h-4 w-4" />
              Public blog
            </Link>
          </Button>
          {view === "list" ? (
            <Button className="gap-2" onClick={() => onEditChange("new")}>
              <Plus className="h-4 w-4" />
              Create article
            </Button>
          ) : null}
        </div>
      </div>

      {access.isPlatformAdmin ? (
        <Tabs
          value={view}
          onValueChange={(v) => onViewChange?.(v as ArticlesView)}
        >
          <TabsList>
            <TabsTrigger value="list">All articles</TabsTrigger>
            <TabsTrigger value="editors">Editors</TabsTrigger>
            <TabsTrigger value="page-seo">Page SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4">
            <ArticlesList
              posts={posts}
              loading={loading}
              search={search}
              filterStatus={filterStatus}
              statusColor={statusColor}
              loadingPreview={loadingPreview}
              onSearchChange={setSearch}
              onFilterStatusChange={setFilterStatus}
              onRefresh={() => void load()}
              onEdit={(id) => onEditChange(id)}
              onPreview={(id) => void handlePreview(id)}
              onDelete={(id) => void removePost(id)}
              onCreate={() => onEditChange("new")}
            />
          </TabsContent>

          <TabsContent value="editors" className="mt-4">
            <BlogEditorsPanel />
          </TabsContent>

          <TabsContent value="page-seo" className="mt-4">
            <BlogPageSeoPanel />
          </TabsContent>
        </Tabs>
      ) : (
        <ArticlesList
          posts={posts}
          loading={loading}
          search={search}
          filterStatus={filterStatus}
          statusColor={statusColor}
          loadingPreview={loadingPreview}
          onSearchChange={setSearch}
          onFilterStatusChange={setFilterStatus}
          onRefresh={() => void load()}
          onEdit={(id) => onEditChange(id)}
          onPreview={(id) => void handlePreview(id)}
          onDelete={(id) => void removePost(id)}
          onCreate={() => onEditChange("new")}
        />
      )}

      <BlogPostEditorDialog
        open={editorOpen}
        onOpenChange={(open) => {
          if (!open) onEditChange(null);
        }}
        editingId={editingPostId}
        onSaved={() => void load()}
      />

      {previewArticle ? (
        <ArticlePreview
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          article={previewArticle}
          onEdit={() => {
            setPreviewOpen(false);
            const post = posts.find((p) => p.slug === previewArticle.slug);
            if (post) onEditChange(post.id);
          }}
          showActions={true}
          publishLabel="View on Blog"
          onPublish={() => {
            window.open(`/blog/${previewArticle.slug}`, "_blank");
          }}
        />
      ) : null}
    </div>
  );
}

type ArticlesListProps = {
  posts: PostRow[];
  loading: boolean;
  search: string;
  filterStatus: string;
  statusColor: Record<string, string>;
  loadingPreview: string | null;
  onSearchChange: (v: string) => void;
  onFilterStatusChange: (v: string) => void;
  onRefresh: () => void;
  onEdit: (id: string) => void;
  onPreview: (id: string) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
};

function ArticlesList({
  posts,
  loading,
  search,
  filterStatus,
  statusColor,
  loadingPreview,
  onSearchChange,
  onFilterStatusChange,
  onRefresh,
  onEdit,
  onPreview,
  onDelete,
  onCreate,
}: ArticlesListProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filterStatus || "all"}
          onValueChange={(v) => onFilterStatusChange(v === "all" ? "" : v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="border border-border/60 shadow-none">
          <CardContent className="py-12 text-center">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No articles found</p>
            <Button className="mt-4 gap-2" onClick={onCreate}>
              <Plus className="h-4 w-4" />
              Create article
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-border/60 shadow-none">
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors"
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => onEdit(post.id)}
                  >
                    <p className="text-sm font-medium truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      /{post.path ?? post.slug} · Updated{" "}
                      {new Date(post.updated_at).toLocaleDateString()}
                    </p>
                  </button>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    {post.seo_score != null && (
                      <span className="text-xs font-medium text-muted-foreground">
                        SEO {post.seo_score}
                      </span>
                    )}
                    <Badge
                      variant="secondary"
                      className={`text-xs capitalize ${statusColor[post.status] ?? ""}`}
                    >
                      {post.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onPreview(post.id)}
                      disabled={loadingPreview === post.id}
                      title="Preview article"
                    >
                      <Eye className={`h-3.5 w-3.5 ${loadingPreview === post.id ? "animate-pulse" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(post.id)}
                      title="Edit article"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => onDelete(post.id)}
                      title="Delete article"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
