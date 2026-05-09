"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { api, apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useBlogAccess } from "@/hooks/useBlogAccess";
import { useAdmin } from "@/hooks/useAdmin";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ImageSourceInput } from "@/components/media/ImageSourceInput";
import {
  BLOG_CATEGORY_SELECT_CUSTOM,
  BLOG_CATEGORY_SELECT_NONE,
  BLOG_CONTENT_CATEGORY_PRESETS,
  presetSelectValueFromStored,
  resolvedContentCategoryFromForm,
} from "@/lib/blogContentCategory";

type PostRow = {
  id: string;
  path: string;
  title: string;
  post_kind?: string;
  content_category?: string | null;
  status?: string;
  updated_at?: string;
};

type FormState = {
  title: string;
  slug: string;
  parent_id: string;
  post_kind: string;
  /** Value from BLOG_CONTENT_CATEGORY_PRESETS, BLOG_CATEGORY_SELECT_NONE, or BLOG_CATEGORY_SELECT_CUSTOM */
  category_preset: string;
  category_custom: string;
  status: string;
  excerpt: string;
  body: string;
  tags: string;
  subtitle: string;
  featured_image_url: string;
  /** Preset for listing/hero focal point (empty = product default cropping). */
  featured_image_object_position: string;
  reading_minutes: string;
  author_display_name: string;
  author_bio: string;
  author_avatar_url: string;
  author_role: string;
  author_linkedin_url: string;
  scheduled_publish_at: string;
  published_at: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  canonical_url: string;
  og_image_url: string;
  twitter_card: string;
  robots: string;
  hero_style: string;
  locale: string;
  custom_css: string;
};

const emptyForm = (): FormState => ({
  title: "",
  slug: "",
  parent_id: "",
  post_kind: "article",
  category_preset: BLOG_CATEGORY_SELECT_NONE,
  category_custom: "",
  status: "draft",
  excerpt: "",
  body: "",
  tags: "",
  subtitle: "",
  featured_image_url: "",
  featured_image_object_position: "",
  reading_minutes: "",
  author_display_name: "",
  author_bio: "",
  author_avatar_url: "",
  author_role: "",
  author_linkedin_url: "",
  scheduled_publish_at: "",
  published_at: "",
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  canonical_url: "",
  og_image_url: "",
  twitter_card: "summary_large_image",
  robots: "index,follow",
  hero_style: "default",
  locale: "en",
  custom_css: "",
});

function trimAuth(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** Name from OAuth/user_metadata when profiles.full_name is empty. */
function displayNameFromAuthUser(user: User | null): string {
  if (!user) return "";
  const m = user.user_metadata || {};
  return (
    trimAuth(m.full_name) ||
    trimAuth(m.name) ||
    [trimAuth(m.given_name), trimAuth(m.family_name)].filter(Boolean).join(" ").trim() ||
    trimAuth(m.preferred_username) ||
    trimAuth((m as { user_name?: string }).user_name) ||
    trimAuth(user.email?.split("@")[0])
  );
}

/** Avatar URL from OAuth (e.g. Google picture) when profiles.avatar_url is empty. */
function avatarUrlFromAuthUser(user: User | null): string {
  if (!user) return "";
  const m = user.user_metadata || {};
  return trimAuth(m.avatar_url) || trimAuth(m.picture) || trimAuth((m as { image?: string }).image);
}

/** Vanity → public URL when user signed up with LinkedIn OpenID (field names vary). */
function linkedInUrlFromAuthIdentities(user: User | null): string {
  const id = user?.identities?.find((i) => /linkedin/i.test(String(i.provider)));
  if (!id?.identity_data || typeof id.identity_data !== "object") return "";
  const d = id.identity_data as Record<string, unknown>;
  const vn =
    trimAuth(d.vanity_name) ||
    trimAuth(d.vanityName) ||
    trimAuth(d.public_identifier) ||
    trimAuth(d.profile);
  if (!vn) return "";
  if (/^https?:\/\//i.test(vn)) return vn;
  const clean = vn.replace(/^\/+|\/+$/g, "");
  return clean ? `https://www.linkedin.com/in/${clean}` : "";
}

/** Profile row + Auth user_metadata (OAuth name/photo) merged for blog defaults. */
function authorDefaultsFromProfile(
  profile: {
    full_name?: string | null;
    avatar_url?: string | null;
    author_bio?: string | null;
    author_role?: string | null;
    author_avatar_url?: string | null;
    author_linkedin_url?: string | null;
  } | null,
  user: User | null,
): Pick<
  FormState,
  "author_display_name" | "author_bio" | "author_avatar_url" | "author_role" | "author_linkedin_url"
> {
  const avatar =
    profile?.author_avatar_url?.trim() ||
    profile?.avatar_url?.trim() ||
    avatarUrlFromAuthUser(user) ||
    "";
  const linkedin =
    profile?.author_linkedin_url?.trim() || linkedInUrlFromAuthIdentities(user) || "";

  return {
    author_display_name: profile?.full_name?.trim() || displayNameFromAuthUser(user) || "",
    author_bio: profile?.author_bio?.trim() || "",
    author_role: profile?.author_role?.trim() || "",
    author_avatar_url: avatar,
    author_linkedin_url: linkedin,
  };
}

function fromPost(p: Record<string, unknown>): FormState {
  const tags = Array.isArray(p.tags) ? (p.tags as string[]).join(", ") : "";
  const storedCat = typeof p.content_category === "string" ? p.content_category : null;
  const { preset, custom } = presetSelectValueFromStored(storedCat);
  return {
    title: String(p.title || ""),
    slug: String(p.slug || ""),
    parent_id: p.parent_id ? String(p.parent_id) : "",
    post_kind: String(p.post_kind || "article"),
    category_preset: preset,
    category_custom: custom,
    status: String(p.status || "draft"),
    excerpt: String(p.excerpt || ""),
    body: String(p.body || ""),
    tags,
    subtitle: String(p.subtitle || ""),
    featured_image_url: String(p.featured_image_url || ""),
    featured_image_object_position: String(p.featured_image_object_position || "").toLowerCase(),
    reading_minutes: p.reading_minutes != null ? String(p.reading_minutes) : "",
    author_display_name: String(p.author_display_name || ""),
    author_bio: String(p.author_bio || ""),
    author_avatar_url: String(p.author_avatar_url || ""),
    author_role: String(p.author_role || ""),
    author_linkedin_url: String(p.author_linkedin_url || ""),
    scheduled_publish_at: p.scheduled_publish_at
      ? new Date(String(p.scheduled_publish_at)).toISOString().slice(0, 16)
      : "",
    published_at: p.published_at ? new Date(String(p.published_at)).toISOString().slice(0, 16) : "",
    seo_title: String(p.seo_title || ""),
    seo_description: String(p.seo_description || ""),
    seo_keywords: String(p.seo_keywords || ""),
    canonical_url: String(p.canonical_url || ""),
    og_image_url: String(p.og_image_url || ""),
    twitter_card: String(p.twitter_card || "summary_large_image"),
    robots: String(p.robots || "index,follow"),
    hero_style: String(p.hero_style || "default"),
    locale: String(p.locale || "en"),
    custom_css: String(p.custom_css || ""),
  };
}

export default function BlogAdminPage() {
  const access = useBlogAccess();
  const { isAdmin } = useAdmin();
  const { user } = useAuth();
  const { profile, refetch: refetchProfile } = useProfile();
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingAuthorProfile, setSavingAuthorProfile] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [filterStatus, setFilterStatus] = useState<string>("");

  const [editors, setEditors] = useState<{ user_id: string; created_at?: string }[]>([]);
  const [grantId, setGrantId] = useState("");

  const pendingAuthorHydrate = useRef(false);

  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [seoPages, setSeoPages] = useState<Record<string, unknown>[]>([]);
  const [seoForm, setSeoForm] = useState({
    route_path: "/pricing",
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
    og_image_url: "",
    canonical_url: "",
    robots: "index,follow",
  });

  const loadPosts = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await api.admin.blogListPosts({ status: filterStatus || undefined });
      setPosts((res.posts || []) as PostRow[]);
    } catch (e: unknown) {
      toast({
        title: "Could not load posts",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    } finally {
      setLoadingList(false);
    }
  }, [filterStatus, toast]);

  useEffect(() => {
    if (!access.canManageBlog) return;
    void loadPosts();
  }, [access.canManageBlog, loadPosts]);

  const loadEditors = useCallback(async () => {
    try {
      const res = await api.admin.blogListEditors();
      setEditors((res.editors || []) as { user_id: string; created_at?: string }[]);
    } catch (e: unknown) {
      toast({
        title: "Could not load editors",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    }
  }, [toast]);

  const loadSeoPages = useCallback(async () => {
    try {
      const res = await api.admin.seoPagesList();
      setSeoPages((res.pages || []) as Record<string, unknown>[]);
    } catch (e: unknown) {
      toast({
        title: "Could not load SEO pages",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    }
  }, [toast]);

  async function openCreate() {
    setEditingId(null);
    const latestRow = await refetchProfile();
    setForm({ ...emptyForm(), ...authorDefaultsFromProfile(latestRow ?? profile, user) });
    pendingAuthorHydrate.current = false;
    setDialogOpen(true);
  }

  useEffect(() => {
    if (!pendingAuthorHydrate.current || !dialogOpen || editingId !== null || !profile) return;
    setForm((prev) => ({ ...prev, ...authorDefaultsFromProfile(profile, user) }));
    pendingAuthorHydrate.current = false;
  }, [profile, dialogOpen, editingId, user?.id]);

  async function openEdit(id: string) {
    try {
      const p = await api.admin.blogGetPost(id);
      setEditingId(id);
      setForm(fromPost(p as Record<string, unknown>));
      setDialogOpen(true);
    } catch (e: unknown) {
      toast({
        title: "Load failed",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    }
  }

  async function saveAuthorProfileDefaults() {
    setSavingAuthorProfile(true);
    try {
      const res = await apiClient.patch("/profile", {
        author_bio: form.author_bio.trim() || null,
        author_role: form.author_role.trim() || null,
        author_avatar_url: form.author_avatar_url.trim() || null,
        author_linkedin_url: form.author_linkedin_url.trim() || null,
      });
      if (!(res as { success?: boolean }).success) {
        throw new Error((res as { error?: string }).error || "Update failed");
      }
      toast({ title: "Saved your author defaults for future posts" });
      void refetchProfile();
    } catch (e: unknown) {
      toast({
        title: "Could not save author profile",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    } finally {
      setSavingAuthorProfile(false);
    }
  }

  async function savePost() {
    if (!form.title.trim() || !form.slug.trim()) {
      toast({ title: "Title and slug are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const tags = form.tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        parent_id: form.parent_id.trim() || null,
        post_kind: form.post_kind,
        content_category: resolvedContentCategoryFromForm(form.category_preset, form.category_custom),
        status: form.status,
        excerpt: form.excerpt.trim() || null,
        body: form.body,
        tags,
        subtitle: form.subtitle.trim() || null,
        featured_image_url: form.featured_image_url.trim() || null,
        featured_image_object_position: form.featured_image_object_position.trim() || null,
        reading_minutes: form.reading_minutes ? Number(form.reading_minutes) : null,
        author_display_name: form.author_display_name.trim() || null,
        author_bio: form.author_bio.trim() || null,
        author_avatar_url: form.author_avatar_url.trim() || null,
        author_role: form.author_role.trim() || null,
        author_linkedin_url: form.author_linkedin_url.trim() || null,
        scheduled_publish_at: form.scheduled_publish_at
          ? new Date(form.scheduled_publish_at).toISOString()
          : null,
        published_at: form.published_at ? new Date(form.published_at).toISOString() : null,
        seo_title: form.seo_title.trim() || null,
        seo_description: form.seo_description.trim() || null,
        seo_keywords: form.seo_keywords.trim() || null,
        canonical_url: form.canonical_url.trim() || null,
        og_image_url: form.og_image_url.trim() || null,
        twitter_card: form.twitter_card,
        robots: form.robots,
        hero_style: form.hero_style,
        locale: form.locale.trim() || "en",
        custom_css: form.custom_css.trim() || null,
      };
      if (editingId) {
        const { slug: _s, parent_id: _p, ...rest } = payload;
        await api.admin.blogUpdatePost(editingId, rest);
        toast({ title: "Post updated" });
      } else {
        await api.admin.blogCreatePost(payload);
        toast({ title: "Post created" });
      }
      setDialogOpen(false);
      await loadPosts();
    } catch (e: unknown) {
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function removePost(id: string) {
    if (!confirm("Delete this post and all nested child posts?")) return;
    try {
      await api.admin.blogDeletePost(id);
      toast({ title: "Deleted" });
      await loadPosts();
    } catch (e: unknown) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    }
  }

  function insertImageMarkdownAtCursor(url: string) {
    const trimmed = url.trim();
    if (!trimmed) return;
    const textarea = bodyTextareaRef.current;
    const snippet = `![image](${trimmed})`;
    if (textarea) {
      const start = textarea.selectionStart ?? form.body.length;
      const end = textarea.selectionEnd ?? form.body.length;
      const before = form.body.slice(0, start);
      const after = form.body.slice(end);
      const newBody = `${before}${snippet}${after}`;
      setForm((f) => ({ ...f, body: newBody }));
      setTimeout(() => {
        textarea.focus();
        const pos = start + snippet.length;
        textarea.setSelectionRange(pos, pos);
      }, 0);
    } else {
      setForm((f) => ({ ...f, body: f.body + "\n" + snippet }));
    }
  }

  async function grantEditor() {
    if (!grantId.trim()) return;
    try {
      await api.admin.blogGrantEditor(grantId.trim());
      setGrantId("");
      toast({ title: "Editor granted" });
      await loadEditors();
    } catch (e: unknown) {
      toast({
        title: "Grant failed",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    }
  }

  async function revokeEditor(userId: string) {
    if (!confirm("Revoke blog access for this user?")) return;
    try {
      await api.admin.blogRevokeEditor(userId);
      toast({ title: "Revoked" });
      await loadEditors();
    } catch (e: unknown) {
      toast({
        title: "Revoke failed",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    }
  }

  async function saveSeo() {
    try {
      await api.admin.seoPagesUpsert({
        route_path: seoForm.route_path.trim(),
        seo_title: seoForm.seo_title.trim() || null,
        seo_description: seoForm.seo_description.trim() || null,
        seo_keywords: seoForm.seo_keywords.trim() || null,
        og_image_url: seoForm.og_image_url.trim() || null,
        canonical_url: seoForm.canonical_url.trim() || null,
        robots: seoForm.robots.trim() || "index,follow",
      });
      toast({ title: "SEO saved" });
      await loadSeoPages();
    } catch (e: unknown) {
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    }
  }

  if (access.loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!access.canManageBlog) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-heading text-2xl font-bold">Blog CMS</h1>
        <p className="mt-2 text-muted-foreground">You do not have blog management access. Ask a platform admin to grant you editor rights.</p>
        <Button asChild className="mt-6 rounded-full">
          <Link href="/blog">View public blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">Blog & CMS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hierarchical posts, release notes, and SEO. Editors can manage posts; only the platform admin can assign editors
            or edit static page SEO.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="rounded-full" asChild>
            <Link href="/blog" target="_blank" rel="noopener noreferrer">
              <BookOpen className="mr-2 h-4 w-4" />
              Public blog
            </Link>
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="posts"
        className="mt-8"
        onValueChange={(v) => {
          if (v === "editors") void loadEditors();
          if (v === "seo") void loadSeoPages();
        }}
      >
        <TabsList className="flex flex-wrap gap-1">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          {access.isPlatformAdmin ? <TabsTrigger value="editors">Editors</TabsTrigger> : null}
          {access.isPlatformAdmin ? <TabsTrigger value="seo">Page SEO</TabsTrigger> : null}
        </TabsList>

        <TabsContent value="posts" className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" className="rounded-full" onClick={() => void openCreate()}>
              <Plus className="mr-2 h-4 w-4" />
              New post
            </Button>
            <Select
              value={filterStatus || "all"}
              onValueChange={(v) => setFilterStatus(v === "all" ? "" : v)}
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
            <Button variant="outline" size="sm" onClick={() => void loadPosts()} disabled={loadingList}>
              Refresh
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {loadingList ? (
                <div className="flex justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <ScrollArea className="h-[min(60vh,520px)]">
                  <ul className="divide-y divide-border/60">
                    {posts.map((p) => (
                      <li key={p.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{p.title}</p>
                          <p className="truncate text-xs text-muted-foreground">/{p.path}</p>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {p.post_kind ? <Badge variant="outline">{p.post_kind}</Badge> : null}
                            {p.content_category ? (
                              <Badge variant="outline" className="border-primary/35 text-primary">
                                {p.content_category}
                              </Badge>
                            ) : null}
                            {p.status ? <Badge variant="secondary">{p.status}</Badge> : null}
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button size="icon" variant="outline" aria-label="Edit" onClick={() => void openEdit(p.id)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="destructive" aria-label="Delete" onClick={() => void removePost(p.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {access.isPlatformAdmin ? (
          <TabsContent value="editors" className="mt-4 space-y-4" onFocus={() => void loadEditors()}>
            <Card>
              <CardContent className="space-y-4 p-4 sm:p-6">
                <p className="text-sm text-muted-foreground">
                  Grant blog CMS access to any signed-up user by their Supabase user UUID (from Auth or profiles tooling).
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="flex-1 space-y-1">
                    <Label>User ID</Label>
                    <Input value={grantId} onChange={(e) => setGrantId(e.target.value)} placeholder="uuid" />
                  </div>
                  <Button type="button" onClick={() => void grantEditor()}>
                    Grant editor
                  </Button>
                </div>
                <ul className="space-y-2 text-sm">
                  {editors.map((e) => (
                    <li key={e.user_id} className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2">
                      <span className="font-mono text-xs">{e.user_id}</span>
                      <Button variant="ghost" size="sm" onClick={() => void revokeEditor(e.user_id)}>
                        Revoke
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        ) : null}

        {access.isPlatformAdmin ? (
          <TabsContent value="seo" className="mt-4 space-y-4">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardContent className="space-y-3 p-4 sm:p-6">
                  <h2 className="font-semibold">Edit route SEO</h2>
                  <div className="space-y-1">
                    <Label>Route path</Label>
                    <Input value={seoForm.route_path} onChange={(e) => setSeoForm((s) => ({ ...s, route_path: e.target.value }))} placeholder="/pricing" />
                  </div>
                  <div className="space-y-1">
                    <Label>Meta title</Label>
                    <Input value={seoForm.seo_title} onChange={(e) => setSeoForm((s) => ({ ...s, seo_title: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Meta description</Label>
                    <Textarea rows={3} value={seoForm.seo_description} onChange={(e) => setSeoForm((s) => ({ ...s, seo_description: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Keywords (comma-separated)</Label>
                    <Input value={seoForm.seo_keywords} onChange={(e) => setSeoForm((s) => ({ ...s, seo_keywords: e.target.value }))} />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <ImageSourceInput
                      mode="field"
                      label="OG image URL"
                      value={seoForm.og_image_url}
                      dialogTitle="OG image"
                      confirmLabel="Use image"
                      uploadCmsPath={isAdmin ? "blog" : undefined}
                      onChange={(url) => setSeoForm((s) => ({ ...s, og_image_url: url }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Canonical URL</Label>
                    <Input value={seoForm.canonical_url} onChange={(e) => setSeoForm((s) => ({ ...s, canonical_url: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Robots</Label>
                    <Input value={seoForm.robots} onChange={(e) => setSeoForm((s) => ({ ...s, robots: e.target.value }))} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" onClick={() => void saveSeo()}>
                      Save SEO
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        if (!seoForm.route_path.trim()) return;
                        if (!confirm("Remove SEO overrides for this route?")) return;
                        try {
                          await api.admin.seoPagesDelete(seoForm.route_path.trim());
                          toast({ title: "Removed" });
                          await loadSeoPages();
                        } catch (e: unknown) {
                          toast({
                            title: "Delete failed",
                            description: e instanceof Error ? e.message : "Error",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      Delete row
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={async () => {
                        try {
                          const row = await api.admin.seoPagesOne(seoForm.route_path.trim());
                          setSeoForm({
                            route_path: String(row.route_path || seoForm.route_path),
                            seo_title: String(row.seo_title || ""),
                            seo_description: String(row.seo_description || ""),
                            seo_keywords: String(row.seo_keywords || ""),
                            og_image_url: String(row.og_image_url || ""),
                            canonical_url: String(row.canonical_url || ""),
                            robots: String(row.robots || "index,follow"),
                          });
                        } catch {
                          toast({ title: "No row for this route yet", variant: "destructive" });
                        }
                      }}
                    >
                      Load route
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h2 className="mb-3 font-semibold">Configured routes</h2>
                  <ScrollArea className="h-[360px] pr-2">
                    <ul className="space-y-2 text-sm">
                      {seoPages.map((p) => (
                        <li key={String(p.route_path)}>
                          <button
                            type="button"
                            className="w-full rounded-md border border-border/50 px-3 py-2 text-left hover:bg-muted/40"
                            onClick={() =>
                              setSeoForm({
                                route_path: String(p.route_path || ""),
                                seo_title: String(p.seo_title || ""),
                                seo_description: String(p.seo_description || ""),
                                seo_keywords: String(p.seo_keywords || ""),
                                og_image_url: String(p.og_image_url || ""),
                                canonical_url: String(p.canonical_url || ""),
                                robots: String(p.robots || "index,follow"),
                              })
                            }
                          >
                            <span className="font-mono text-xs">{String(p.route_path)}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ) : null}
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit post" : "New post"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>URL slug (last segment)</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                disabled={!!editingId}
                className={editingId ? "opacity-70" : ""}
              />
              {editingId ? <p className="text-[10px] text-muted-foreground">Slug and parent are fixed after create.</p> : null}
            </div>
            <div className="space-y-1">
              <Label>Parent post ID (optional)</Label>
              <Input
                value={form.parent_id}
                onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}
                disabled={!!editingId}
                placeholder="uuid of parent for nested URL"
              />
            </div>
            <div className="space-y-1">
              <Label>Kind</Label>
              <Select value={form.post_kind} onValueChange={(v) => setForm((f) => ({ ...f, post_kind: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="changelog">Changelog</SelectItem>
                  <SelectItem value="release">Release</SelectItem>
                  <SelectItem value="guide">Guide</SelectItem>
                  <SelectItem value="news">News</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Category (marketing)</Label>
              <Select
                value={form.category_preset}
                onValueChange={(v) => setForm((f) => ({ ...f, category_preset: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={BLOG_CATEGORY_SELECT_NONE}>Uncategorized</SelectItem>
                  {BLOG_CONTENT_CATEGORY_PRESETS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                  <SelectItem value={BLOG_CATEGORY_SELECT_CUSTOM}>Custom…</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground">
                Public blog card pill (separate from Kind). Choose Custom to enter any label.
              </p>
              {form.category_preset === BLOG_CATEGORY_SELECT_CUSTOM ? (
                <Input
                  className="mt-2"
                  placeholder="e.g. Influencer marketing"
                  value={form.category_custom}
                  onChange={(e) => setForm((f) => ({ ...f, category_custom: e.target.value }))}
                />
              ) : null}
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Subtitle</Label>
              <Input value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Excerpt</Label>
              <Textarea rows={2} value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Body (Markdown)</Label>
                <ImageSourceInput
                  mode="trigger"
                  value=""
                  label="Insert image"
                  dialogTitle="Insert image"
                  confirmLabel="Insert"
                  dialogDescription="Upload, paste a URL, or paste from clipboard. The image is stored on the platform CDN; markdown is inserted at the cursor."
                  uploadCmsPath={isAdmin ? "blog" : undefined}
                  onChange={insertImageMarkdownAtCursor}
                />
              </div>
              <Textarea
                ref={bodyTextareaRef}
                rows={12}
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground">
                Tip: use <code className="rounded bg-muted px-1">![alt](url &quot;Caption&quot;)</code> for images with a caption, or the Insert image button above.
              </p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Tags (comma-separated)</Label>
              <Input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <ImageSourceInput
                mode="field"
                label="Featured image"
                value={form.featured_image_url}
                dialogTitle="Featured image"
                confirmLabel="Use image"
                uploadCmsPath={isAdmin ? "blog" : undefined}
                onChange={(url) => setForm((f) => ({ ...f, featured_image_url: url }))}
              />
              <div className="mt-3 space-y-1">
                <Label className="text-muted-foreground">Featured image focal point</Label>
                <p className="text-[10px] text-muted-foreground">
                  Controls how the image is cropped on blog cards and the post hero. Default (auto) uses a right-weighted crop on listings and centered on the hero.
                </p>
                <Select
                  value={
                    ["left", "center", "right", "top", "bottom"].includes(
                      form.featured_image_object_position,
                    )
                      ? form.featured_image_object_position
                      : "__auto__"
                  }
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      featured_image_object_position: v === "__auto__" ? "" : v,
                    }))
                  }
                >
                  <SelectTrigger className="h-9 max-w-xs">
                    <SelectValue placeholder="Default (auto)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__auto__">Default (auto)</SelectItem>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Reading minutes</Label>
              <Input value={form.reading_minutes} onChange={(e) => setForm((f) => ({ ...f, reading_minutes: e.target.value }))} />
            </div>
            <div className="space-y-1 sm:col-span-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Defaults use your Settings name/photo (<code className="text-[10px]">profiles.avatar_url</code>) and OAuth name/photo if present. Blog-specific LinkedIn URL must be set here or saved below — connecting LinkedIn in Settings is for publishing, not this byline. Saving the post only updates this article — use{" "}
                  <strong className="font-medium text-foreground">Save as my author profile</strong> to reuse next time.
                </p>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        ...authorDefaultsFromProfile(profile, user),
                      }))
                    }
                  >
                    Use my saved profile
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    disabled={savingAuthorProfile}
                    onClick={() => void saveAuthorProfileDefaults()}
                  >
                    {savingAuthorProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save as my author profile"}
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Author display name</Label>
              <Input value={form.author_display_name} onChange={(e) => setForm((f) => ({ ...f, author_display_name: e.target.value }))} />
              <p className="text-[10px] text-muted-foreground">
                From Settings (<code className="text-[10px]">full_name</code>) or your sign-in provider (Google etc.). Change globally in Settings.
              </p>
            </div>
            <div className="space-y-1">
              <Label>Author role</Label>
              <Input value={form.author_role} onChange={(e) => setForm((f) => ({ ...f, author_role: e.target.value }))} placeholder="e.g. Founder & CEO" />
            </div>
            <div className="space-y-1">
              <Label>Author avatar URL</Label>
              <Input value={form.author_avatar_url} onChange={(e) => setForm((f) => ({ ...f, author_avatar_url: e.target.value }))} placeholder="https://…" />
              <p className="text-[10px] text-muted-foreground">
                Uses Settings upload / <code className="text-[10px]">avatar_url</code>, optional <code className="text-[10px]">author_avatar_url</code>, then OAuth photo.
              </p>
            </div>
            <div className="space-y-1">
              <Label>Author LinkedIn URL</Label>
              <Input value={form.author_linkedin_url} onChange={(e) => setForm((f) => ({ ...f, author_linkedin_url: e.target.value }))} placeholder="https://linkedin.com/in/…" />
              <p className="text-[10px] text-muted-foreground">
                Filled from saved blog defaults or LinkedIn sign-in vanity when Supabase exposes it — otherwise paste your profile URL once and save as default.
              </p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Author bio</Label>
              <Textarea rows={2} value={form.author_bio} onChange={(e) => setForm((f) => ({ ...f, author_bio: e.target.value }))} placeholder="Short bio shown at the bottom of the post…" />
            </div>
            <div className="space-y-1">
              <Label>Scheduled publish (local)</Label>
              <Input
                type="datetime-local"
                value={form.scheduled_publish_at}
                onChange={(e) => setForm((f) => ({ ...f, scheduled_publish_at: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Published at (local)</Label>
              <Input type="datetime-local" value={form.published_at} onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-primary">SEO — title override</Label>
              <Input value={form.seo_title} onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))} placeholder="defaults to post title" />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>SEO description</Label>
              <Textarea rows={2} value={form.seo_description} onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>SEO keywords</Label>
              <Input value={form.seo_keywords} onChange={(e) => setForm((f) => ({ ...f, seo_keywords: e.target.value }))} placeholder="comma-separated" />
            </div>
            <div className="space-y-1">
              <Label>Canonical URL</Label>
              <Input value={form.canonical_url} onChange={(e) => setForm((f) => ({ ...f, canonical_url: e.target.value }))} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <ImageSourceInput
                mode="field"
                label="OG image URL"
                value={form.og_image_url}
                dialogTitle="OG image"
                confirmLabel="Use image"
                uploadCmsPath={isAdmin ? "blog" : undefined}
                onChange={(url) => setForm((f) => ({ ...f, og_image_url: url }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Twitter card</Label>
              <Select value={form.twitter_card} onValueChange={(v) => setForm((f) => ({ ...f, twitter_card: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">summary</SelectItem>
                  <SelectItem value="summary_large_image">summary_large_image</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Robots</Label>
              <Input value={form.robots} onChange={(e) => setForm((f) => ({ ...f, robots: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Hero style</Label>
              <Input value={form.hero_style} onChange={(e) => setForm((f) => ({ ...f, hero_style: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Locale</Label>
              <Input value={form.locale} onChange={(e) => setForm((f) => ({ ...f, locale: e.target.value }))} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Custom CSS (advanced)</Label>
              <Textarea rows={3} value={form.custom_css} onChange={(e) => setForm((f) => ({ ...f, custom_css: e.target.value }))} className="font-mono text-xs" />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => void savePost()} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
