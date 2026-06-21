"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Plus,
  Send,
  Clock,
  Edit,
  Eye,
  Loader2,
  Sparkles,
  FileText,
  X,
  Calendar,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { parseAdminBlogPostsList } from "@/lib/blogAdminPosts";

interface Campaign {
  id: string;
  title: string;
  subject: string;
  preview_text?: string;
  body_html?: string;
  body_text?: string;
  status: string;
  total_sent: number;
  opens: number;
  clicks: number;
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
}

export function CampaignCreator() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showFromPost, setShowFromPost] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [form, setForm] = useState({
    title: "",
    subject: "",
    preview_text: "",
    body_html: "",
  });

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/newsletter/campaigns");
      setCampaigns((res as any).campaigns || []);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const loadPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await apiClient.get("/admin/blog/posts", {
        params: { status: "published" },
      });
      setPosts(parseAdminBlogPostsList(res));
    } catch {
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleCreateFromPost = async (postId: string) => {
    setCreating(true);
    try {
      await apiClient.post(`/admin/newsletter/campaigns/from-post/${postId}`);
      setShowFromPost(false);
      loadCampaigns();
    } catch (err: any) {
      alert(err?.message || "Failed to create campaign");
    } finally {
      setCreating(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title || !form.subject) return;
    setCreating(true);
    try {
      await apiClient.post("/admin/newsletter/campaigns", form);
      setShowCreate(false);
      setForm({ title: "", subject: "", preview_text: "", body_html: "" });
      loadCampaigns();
    } catch (err: any) {
      alert(err?.message || "Failed to create campaign");
    } finally {
      setCreating(false);
    }
  };

  const handleSend = async (id: string) => {
    if (!confirm("Send this campaign now? This cannot be undone.")) return;
    try {
      await apiClient.post(`/admin/newsletter/campaigns/${id}/send`);
      loadCampaigns();
    } catch (err: any) {
      alert(err?.message || "Failed to send campaign");
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this campaign?")) return;
    try {
      await apiClient.post(`/admin/newsletter/campaigns/${id}/cancel`);
      loadCampaigns();
    } catch (err: any) {
      alert(err?.message || "Failed to cancel campaign");
    }
  };

  const statusColor: Record<string, string> = {
    sent: "bg-emerald-100 text-emerald-700",
    running: "bg-blue-100 text-blue-700",
    scheduled: "bg-amber-100 text-amber-700",
    draft: "bg-gray-100 text-gray-600",
    cancelled: "bg-red-100 text-red-700",
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setShowFromPost(true);
            loadPosts();
          }}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          From Blog Post
        </Button>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card className="border border-border/60 shadow-none">
          <CardContent className="py-12 text-center">
            <Send className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No campaigns yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Create your first campaign to start sending newsletters
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-border/60 shadow-none">
          <CardContent className="p-0">
            <div className="divide-y divide-border/50">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {campaign.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      Subject: {campaign.subject}
                    </p>
                    {campaign.sent_at && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Sent {new Date(campaign.sent_at).toLocaleDateString()} ·{" "}
                        {campaign.total_sent} recipients
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs capitalize",
                        statusColor[campaign.status] ?? ""
                      )}
                    >
                      {campaign.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setShowPreview(true);
                      }}
                      title="Preview"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    {campaign.status === "draft" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleSend(campaign.id)}
                          title="Send Now"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                    {(campaign.status === "running" ||
                      campaign.status === "scheduled") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleCancel(campaign.id)}
                        title="Cancel"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Campaign Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., June Newsletter"
                className="mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email Subject</label>
              <Input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g., This week in AI..."
                className="mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Preview Text</label>
              <Input
                value={form.preview_text}
                onChange={(e) =>
                  setForm({ ...form, preview_text: e.target.value })
                }
                placeholder="Short preview shown in inbox"
                className="mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email Body (HTML)</label>
              <Textarea
                value={form.body_html}
                onChange={(e) =>
                  setForm({ ...form, body_html: e.target.value })
                }
                placeholder="<p>Your email content...</p>"
                className="mt-1.5 min-h-[150px] font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !form.title || !form.subject}
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Create Campaign"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFromPost} onOpenChange={setShowFromPost}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Create from Blog Post
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            AI will convert your blog post into an engaging newsletter email.
          </p>
          <div className="py-4 max-h-[300px] overflow-y-auto">
            {loadingPosts ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No published posts found
              </p>
            ) : (
              <div className="space-y-2">
                {posts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => handleCreateFromPost(post.id)}
                    disabled={creating}
                    className="w-full text-left px-4 py-3 rounded-lg border border-border/60 hover:bg-muted/50 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <p className="text-sm font-medium truncate">{post.title}</p>
                    <p className="text-xs text-muted-foreground">
                      /{post.slug}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
          {creating && (
            <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating newsletter content...
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCampaign?.title}</DialogTitle>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-4">
              <div className="text-sm">
                <span className="font-medium">Subject:</span>{" "}
                {selectedCampaign.subject}
              </div>
              {selectedCampaign.preview_text && (
                <div className="text-sm">
                  <span className="font-medium">Preview:</span>{" "}
                  {selectedCampaign.preview_text}
                </div>
              )}
              <div className="border rounded-lg p-4 bg-white">
                <div
                  dangerouslySetInnerHTML={{
                    __html: selectedCampaign.body_html || "<p>No content</p>",
                  }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
