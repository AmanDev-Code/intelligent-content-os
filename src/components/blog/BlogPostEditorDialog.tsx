"use client";

import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { api, apiClient } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageSourceInput } from "@/components/media/ImageSourceInput";
import {
  BLOG_CATEGORY_SELECT_CUSTOM,
  BLOG_CATEGORY_SELECT_NONE,
  BLOG_CONTENT_CATEGORY_PRESETS,
  resolvedContentCategoryFromForm,
} from "@/lib/blogContentCategory";
import {
  authorDefaultsFromProfile,
  blogPostFormFromRecord,
  emptyBlogPostForm,
  type BlogPostFormState,
} from "@/lib/blogPostForm";
import {
  generateTitleFromKeyword,
  generateExcerptFromBody,
  enhanceBodyWithAI,
  generateFAQFromBody,
  generateSEOMetadata,
  generateSEOMetadataWithOG,
  calculateReadingTime,
} from "@/lib/blogAiHelpers";

export interface BlogPostEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null = create new post */
  editingId: string | null;
  onSaved?: (postId: string) => void;
}

export function BlogPostEditorDialog({
  open,
  onOpenChange,
  editingId,
  onSaved,
}: BlogPostEditorDialogProps) {
  const { isAdmin } = useAdmin();
  const { user } = useAuth();
  const { profile, refetch: refetchProfile } = useProfile();
  const { toast } = useToast();

  const [form, setForm] = useState<BlogPostFormState>(emptyBlogPostForm);
  const [saving, setSaving] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const [savingAuthorProfile, setSavingAuthorProfile] = useState(false);
  const [aiGenerating, setAiGenerating] = useState<Record<string, boolean>>({});
  const pendingAuthorHydrate = useRef(false);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const didLoadPostRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      didLoadPostRef.current = null;
      return;
    }

    if (editingId) {
      if (didLoadPostRef.current === editingId) return;
      didLoadPostRef.current = editingId;
      setLoadingPost(true);
      void api.admin
        .blogGetPost(editingId)
        .then((p) => setForm(blogPostFormFromRecord(p as Record<string, unknown>)))
        .catch((e: unknown) => {
          didLoadPostRef.current = null;
          toast({
            title: "Load failed",
            description: e instanceof Error ? e.message : "Error",
            variant: "destructive",
          });
          onOpenChange(false);
        })
        .finally(() => setLoadingPost(false));
      return;
    }

    pendingAuthorHydrate.current = true;
    void refetchProfile().then((latestRow) => {
      setForm({
        ...emptyBlogPostForm(),
        ...authorDefaultsFromProfile(latestRow ?? profile, user),
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingId]);

  useEffect(() => {
    if (!pendingAuthorHydrate.current || !open || editingId !== null || !profile) return;
    setForm((prev) => ({ ...prev, ...authorDefaultsFromProfile(profile, user) }));
    pendingAuthorHydrate.current = false;
  }, [profile, open, editingId, user]);

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

  async function handleGenerateTitle() {
    if (!form.title.trim()) {
      toast({ title: "Enter a keyword first", variant: "destructive" });
      return;
    }
    setAiGenerating((prev) => ({ ...prev, title: true }));
    const result = await generateTitleFromKeyword(form.title);
    setAiGenerating((prev) => ({ ...prev, title: false }));
    if (result.success) {
      setForm((f) => ({ ...f, title: result.content }));
      toast({ title: "Title generated" });
    } else {
      toast({ title: "Failed", description: result.error, variant: "destructive" });
    }
  }

  async function handleGenerateExcerpt() {
    if (!form.body.trim()) {
      toast({ title: "Write body content first", variant: "destructive" });
      return;
    }
    setAiGenerating((prev) => ({ ...prev, excerpt: true }));
    const result = await generateExcerptFromBody(form.body);
    setAiGenerating((prev) => ({ ...prev, excerpt: false }));
    if (result.success) {
      setForm((f) => ({ ...f, excerpt: result.content }));
      toast({ title: "Excerpt generated" });
    } else {
      toast({ title: "Failed", description: result.error, variant: "destructive" });
    }
  }

  async function handleEnhanceBody() {
    if (!form.body.trim()) {
      toast({ title: "Write body content first", variant: "destructive" });
      return;
    }
    setAiGenerating((prev) => ({ ...prev, body: true }));
    const result = await enhanceBodyWithAI(form.body);
    setAiGenerating((prev) => ({ ...prev, body: false }));
    if (result.success) {
      setForm((f) => ({ ...f, body: result.content }));
      toast({ title: "Content enhanced" });
    } else {
      toast({ title: "Failed", description: result.error, variant: "destructive" });
    }
  }

  async function handleGenerateFAQ() {
    if (!form.body.trim()) {
      toast({ title: "Write body content first", variant: "destructive" });
      return;
    }
    setAiGenerating((prev) => ({ ...prev, faq: true }));
    const result = await generateFAQFromBody(form.body);
    setAiGenerating((prev) => ({ ...prev, faq: false }));
    if (result.success && result.faq.length > 0) {
      setForm((f) => ({ ...f, faq_json: JSON.stringify(result.faq, null, 2) }));
      toast({ title: `Generated ${result.faq.length} FAQ items` });
    } else {
      toast({ title: "Failed", description: result.error, variant: "destructive" });
    }
  }

  async function handleGenerateSEO() {
    if (!form.title.trim() || !form.body.trim()) {
      toast({ title: "Need title and body first", variant: "destructive" });
      return;
    }
    setAiGenerating((prev) => ({ ...prev, seo: true }));

    if (editingId) {
      const result = await generateSEOMetadataWithOG(editingId);
      setAiGenerating((prev) => ({ ...prev, seo: false }));
      if (result.success) {
        setForm((f) => ({
          ...f,
          seo_title: result.title,
          seo_description: result.metaDescription,
          seo_keywords: result.keywords,
          ...(result.ogImageUrl ? { og_image_url: result.ogImageUrl } : {}),
        }));
        toast({
          title: "SEO metadata generated",
          description: result.ogImageUrl
            ? "Title, description, keywords, and OG image generated"
            : "Title, description, and keywords generated",
        });
      } else {
        toast({ title: "Failed", description: result.error, variant: "destructive" });
      }
    } else {
      const result = await generateSEOMetadata(form.title, form.body, form.tags.split(",")[0]);
      setAiGenerating((prev) => ({ ...prev, seo: false }));
      if (result.success) {
        setForm((f) => ({
          ...f,
          seo_title: result.seo_title,
          seo_description: result.seo_description,
          seo_keywords: result.keywords,
        }));
        toast({ title: "SEO metadata generated" });
      } else {
        toast({ title: "Failed", description: result.error, variant: "destructive" });
      }
    }
  }

  function handleAutoReadingTime() {
    const minutes = calculateReadingTime(form.body);
    setForm((f) => ({ ...f, reading_minutes: String(minutes) }));
    toast({ title: `Reading time: ${minutes} min` });
  }

  async function savePost() {
    if (!form.title.trim() || !form.slug.trim()) {
      toast({ title: "Title and slug are required", variant: "destructive" });
      return;
    }
    let parsedFaqJson: Array<{ question: string; answer: string }> | null = null;
    if (form.faq_json.trim()) {
      try {
        parsedFaqJson = JSON.parse(form.faq_json) as Array<{ question: string; answer: string }>;
      } catch {
        toast({ title: "FAQ JSON is invalid — fix the JSON or clear the field", variant: "destructive" });
        return;
      }
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
        faq_json: parsedFaqJson,
      };

      let savedId = editingId;
      if (editingId) {
        const { slug: _s, parent_id: _p, ...rest } = payload;
        await api.admin.blogUpdatePost(editingId, rest);
        toast({ title: "Post updated" });
      } else {
        const created = (await api.admin.blogCreatePost(payload)) as { id?: string };
        savedId = created.id ?? null;
        toast({ title: "Post created" });
      }
      onOpenChange(false);
      if (savedId) onSaved?.(savedId);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingId ? "Edit article" : "New article"}</DialogTitle>
        </DialogHeader>
        {loadingPost ? (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <BlogPostEditorForm
            form={form}
            setForm={setForm}
            editingId={editingId}
            isAdmin={isAdmin}
            user={user}
            profile={profile}
            bodyTextareaRef={bodyTextareaRef}
            savingAuthorProfile={savingAuthorProfile}
            aiGenerating={aiGenerating}
            onSaveAuthorProfile={() => void saveAuthorProfileDefaults()}
            onInsertImage={insertImageMarkdownAtCursor}
            onGenerateTitle={() => void handleGenerateTitle()}
            onGenerateExcerpt={() => void handleGenerateExcerpt()}
            onEnhanceBody={() => void handleEnhanceBody()}
            onGenerateFAQ={() => void handleGenerateFAQ()}
            onGenerateSEO={() => void handleGenerateSEO()}
            onAutoReadingTime={handleAutoReadingTime}
          />
        )}
        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void savePost()} disabled={saving || loadingPost}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type BlogPostEditorFormProps = {
  form: BlogPostFormState;
  setForm: React.Dispatch<React.SetStateAction<BlogPostFormState>>;
  editingId: string | null;
  isAdmin: boolean;
  user: User | null;
  profile: Parameters<typeof authorDefaultsFromProfile>[0];
  bodyTextareaRef: React.RefObject<HTMLTextAreaElement>;
  savingAuthorProfile: boolean;
  aiGenerating: Record<string, boolean>;
  onSaveAuthorProfile: () => void;
  onInsertImage: (url: string) => void;
  onGenerateTitle: () => void;
  onGenerateExcerpt: () => void;
  onEnhanceBody: () => void;
  onGenerateFAQ: () => void;
  onGenerateSEO: () => void;
  onAutoReadingTime: () => void;
};

function BlogPostEditorForm({
  form,
  setForm,
  editingId,
  isAdmin,
  user,
  profile,
  bodyTextareaRef,
  savingAuthorProfile,
  aiGenerating,
  onSaveAuthorProfile,
  onInsertImage,
  onGenerateTitle,
  onGenerateExcerpt,
  onEnhanceBody,
  onGenerateFAQ,
  onGenerateSEO,
  onAutoReadingTime,
}: BlogPostEditorFormProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1 sm:col-span-2">
        <div className="flex items-center justify-between gap-2">
          <Label>Title</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={onGenerateTitle}
            disabled={aiGenerating.title || !form.title.trim()}
          >
            {aiGenerating.title ? <Loader2 className="h-3 w-3 animate-spin" /> : "✨ Generate from keyword"}
          </Button>
        </div>
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
        {editingId ? (
          <p className="text-[10px] text-muted-foreground">Slug and parent are fixed after create.</p>
        ) : null}
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
        <div className="flex items-center justify-between gap-2">
          <Label>Excerpt</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={onGenerateExcerpt}
            disabled={aiGenerating.excerpt || !form.body.trim()}
          >
            {aiGenerating.excerpt ? <Loader2 className="h-3 w-3 animate-spin" /> : "✨ Generate from body"}
          </Button>
        </div>
        <Textarea rows={2} value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <div className="flex items-center justify-between">
          <Label>Body (Markdown)</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1.5"
              onClick={onEnhanceBody}
              disabled={aiGenerating.body || !form.body.trim()}
            >
              {aiGenerating.body ? <Loader2 className="h-3 w-3 animate-spin" /> : "✨ Enhance with AI"}
            </Button>
            <ImageSourceInput
              mode="trigger"
              value=""
              label="Insert image"
              dialogTitle="Insert image"
              confirmLabel="Insert"
              uploadCmsPath={isAdmin ? "blog" : undefined}
              onChange={onInsertImage}
            />
          </div>
        </div>
        <Textarea
          ref={bodyTextareaRef}
          rows={12}
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          className="font-mono text-xs"
        />
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
          <Select
            value={
              ["left", "center", "right", "top", "bottom"].includes(form.featured_image_object_position)
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
        <div className="flex items-center justify-between gap-2">
          <Label>Reading minutes</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 text-xs px-2"
            onClick={onAutoReadingTime}
            disabled={!form.body.trim()}
          >
            Auto-calculate
          </Button>
        </div>
        <Input
          value={form.reading_minutes}
          onChange={(e) => setForm((f) => ({ ...f, reading_minutes: e.target.value }))}
        />
      </div>
      <div className="space-y-1 sm:col-span-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">Author defaults from your profile.</p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setForm((f) => ({ ...f, ...authorDefaultsFromProfile(profile, user) }))}
            >
              Use my saved profile
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              disabled={savingAuthorProfile}
              onClick={onSaveAuthorProfile}
            >
              {savingAuthorProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save as my author profile"}
            </Button>
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <Label>Author display name</Label>
        <Input
          value={form.author_display_name}
          onChange={(e) => setForm((f) => ({ ...f, author_display_name: e.target.value }))}
        />
      </div>
      <div className="space-y-1">
        <Label>Author role</Label>
        <Input
          value={form.author_role}
          onChange={(e) => setForm((f) => ({ ...f, author_role: e.target.value }))}
          placeholder="e.g. Founder & CEO"
        />
      </div>
      <div className="space-y-1">
        <Label>Author avatar URL</Label>
        <Input
          value={form.author_avatar_url}
          onChange={(e) => setForm((f) => ({ ...f, author_avatar_url: e.target.value }))}
          placeholder="https://…"
        />
      </div>
      <div className="space-y-1">
        <Label>Author LinkedIn URL</Label>
        <Input
          value={form.author_linkedin_url}
          onChange={(e) => setForm((f) => ({ ...f, author_linkedin_url: e.target.value }))}
          placeholder="https://linkedin.com/in/…"
        />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <Label>Author bio</Label>
        <Textarea
          rows={2}
          value={form.author_bio}
          onChange={(e) => setForm((f) => ({ ...f, author_bio: e.target.value }))}
        />
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
        <Input
          type="datetime-local"
          value={form.published_at}
          onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))}
        />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <div className="flex items-center justify-between gap-2">
          <Label>SEO — title override</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5 border-indigo-300 text-indigo-700 hover:bg-indigo-50"
            onClick={onGenerateSEO}
            disabled={aiGenerating.seo || !form.title.trim() || !form.body.trim()}
          >
            {aiGenerating.seo ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              "✨ Auto-Generate SEO"
            )}
          </Button>
        </div>
        {aiGenerating.seo && (
          <p className="text-xs text-muted-foreground">
            Generating SEO title, description, keywords{editingId ? ", and OG image" : ""}…
          </p>
        )}
        <Input
          value={form.seo_title}
          onChange={(e) => setForm((f) => ({ ...f, seo_title: e.target.value }))}
          placeholder="defaults to post title"
        />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <Label>SEO description</Label>
        <Textarea
          rows={2}
          value={form.seo_description}
          onChange={(e) => setForm((f) => ({ ...f, seo_description: e.target.value }))}
        />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <Label>SEO keywords</Label>
        <Input
          value={form.seo_keywords}
          onChange={(e) => setForm((f) => ({ ...f, seo_keywords: e.target.value }))}
          placeholder="comma-separated"
        />
      </div>
      <div className="space-y-1">
        <Label>Canonical URL</Label>
        <Input
          value={form.canonical_url}
          onChange={(e) => setForm((f) => ({ ...f, canonical_url: e.target.value }))}
        />
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
        <Textarea
          rows={3}
          value={form.custom_css}
          onChange={(e) => setForm((f) => ({ ...f, custom_css: e.target.value }))}
          className="font-mono text-xs"
        />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-primary font-semibold">FAQ (JSON array)</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={onGenerateFAQ}
            disabled={aiGenerating.faq || !form.body.trim()}
          >
            {aiGenerating.faq ? <Loader2 className="h-3 w-3 animate-spin" /> : "✨ Generate FAQ"}
          </Button>
        </div>
        <Textarea
          rows={5}
          value={form.faq_json}
          onChange={(e) => setForm((f) => ({ ...f, faq_json: e.target.value }))}
          className="font-mono text-xs"
          placeholder={`[\n  {"question": "What is Trndinn?", "answer": "..."}\n]`}
        />
      </div>
    </div>
  );
}
