"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ExternalLink,
  Plus,
  Loader2,
  Sparkles,
  Globe,
  Mail,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  HelpCircle,
  Info,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { parseAdminBlogPostsList } from "@/lib/blogAdminPosts";
import { useToast } from "@/hooks/use-toast";

type BacklinkProfile = {
  id: string;
  platform: string;
  profile_url: string | null;
  status: string;
  domain_authority: number | null;
  notes: string | null;
  created_at: string;
};

type BacklinkOpportunity = {
  id: string;
  source_domain: string;
  source_url: string | null;
  opportunity_type: string | null;
  target_post_id: string | null;
  status: string;
  domain_authority: number | null;
  contact_email: string | null;
  notes: string | null;
  outreach_sent_at: string | null;
  acquired_at: string | null;
  target_post?: { id: string; title: string; slug: string } | null;
};

type BacklinkStats = {
  total_opportunities: number;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
  acquired_count: number;
  profiles_count: number;
  verified_profiles: number;
};

type Post = { id: string; title: string; slug: string };

const OPPORTUNITY_TYPES = [
  { value: "guest_post", label: "Guest Post" },
  { value: "resource_page", label: "Resource Page" },
  { value: "broken_link", label: "Broken Link" },
  { value: "competitor_backlink", label: "Competitor Backlink" },
  { value: "directory", label: "Directory" },
  { value: "mention", label: "Mention" },
];

const PROFILE_STATUSES = [
  { value: "planned", label: "Planned" },
  { value: "created", label: "Created" },
  { value: "verified", label: "Verified" },
  { value: "inactive", label: "Inactive" },
];

const OPP_STATUSES = [
  { value: "identified", label: "Identified" },
  { value: "outreach_sent", label: "Outreach Sent" },
  { value: "in_progress", label: "In Progress" },
  { value: "acquired", label: "Acquired" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
];

export function BacklinksSection() {
  const { toast } = useToast();
  const [stats, setStats] = useState<BacklinkStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [profiles, setProfiles] = useState<BacklinkProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [opportunities, setOpportunities] = useState<BacklinkOpportunity[]>([]);
  const [oppsLoading, setOppsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);

  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm] = useState({ platform: "", profile_url: "", status: "planned", domain_authority: "", notes: "" });
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  const [showOppForm, setShowOppForm] = useState(false);
  const [oppForm, setOppForm] = useState({ source_domain: "", source_url: "", opportunity_type: "", target_post_id: "", status: "identified", domain_authority: "", contact_email: "", notes: "" });
  const [oppSubmitting, setOppSubmitting] = useState(false);

  const [suggesting, setSuggesting] = useState(false);
  const [suggestPostId, setSuggestPostId] = useState("");

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await apiClient.get("/admin/content-engine/backlinks/stats");
      setStats(data as BacklinkStats);
    } catch { setStats(null); }
    finally { setStatsLoading(false); }
  }, []);

  const loadProfiles = useCallback(async () => {
    setProfilesLoading(true);
    try {
      const data = await apiClient.get("/admin/content-engine/backlinks/profiles");
      setProfiles(Array.isArray(data) ? data as BacklinkProfile[] : []);
    } catch { setProfiles([]); }
    finally { setProfilesLoading(false); }
  }, []);

  const loadOpportunities = useCallback(async () => {
    setOppsLoading(true);
    try {
      const data = await apiClient.get("/admin/content-engine/backlinks/opportunities");
      setOpportunities(Array.isArray(data) ? data as BacklinkOpportunity[] : []);
    } catch { setOpportunities([]); }
    finally { setOppsLoading(false); }
  }, []);

  const loadPosts = useCallback(async () => {
    try {
      const data = await apiClient.get("/admin/blog/posts", { params: { status: "published" } });
      setPosts(parseAdminBlogPostsList<Post>(data));
    } catch { setPosts([]); }
  }, []);

  useEffect(() => { loadStats(); loadProfiles(); loadOpportunities(); loadPosts(); }, [loadStats, loadProfiles, loadOpportunities, loadPosts]);

  const handleCreateProfile = async () => {
    if (!profileForm.platform) { toast({ title: "Platform is required", variant: "destructive" }); return; }
    setProfileSubmitting(true);
    try {
      await apiClient.post("/admin/content-engine/backlinks/profiles", {
        platform: profileForm.platform,
        profile_url: profileForm.profile_url || undefined,
        status: profileForm.status,
        domain_authority: profileForm.domain_authority ? parseInt(profileForm.domain_authority) : undefined,
        notes: profileForm.notes || undefined,
      });
      toast({ title: "Profile created" });
      setShowProfileForm(false);
      setProfileForm({ platform: "", profile_url: "", status: "planned", domain_authority: "", notes: "" });
      loadProfiles(); loadStats();
    } catch { toast({ title: "Failed to create profile", variant: "destructive" }); }
    finally { setProfileSubmitting(false); }
  };

  const handleUpdateProfileStatus = async (id: string, status: string) => {
    try {
      await apiClient.patch(`/admin/content-engine/backlinks/profiles/${id}`, { status });
      setProfiles(prev => prev.map(p => p.id === id ? { ...p, status } : p));
      loadStats();
    } catch { toast({ title: "Failed to update", variant: "destructive" }); }
  };

  const handleCreateOpportunity = async () => {
    if (!oppForm.source_domain) { toast({ title: "Source domain is required", variant: "destructive" }); return; }
    setOppSubmitting(true);
    try {
      await apiClient.post("/admin/content-engine/backlinks/opportunities", {
        source_domain: oppForm.source_domain,
        source_url: oppForm.source_url || undefined,
        opportunity_type: oppForm.opportunity_type || undefined,
        target_post_id: oppForm.target_post_id || undefined,
        status: oppForm.status,
        domain_authority: oppForm.domain_authority ? parseInt(oppForm.domain_authority) : undefined,
        contact_email: oppForm.contact_email || undefined,
        notes: oppForm.notes || undefined,
      });
      toast({ title: "Opportunity created" });
      setShowOppForm(false);
      setOppForm({ source_domain: "", source_url: "", opportunity_type: "", target_post_id: "", status: "identified", domain_authority: "", contact_email: "", notes: "" });
      loadOpportunities(); loadStats();
    } catch { toast({ title: "Failed to create opportunity", variant: "destructive" }); }
    finally { setOppSubmitting(false); }
  };

  const handleUpdateOppStatus = async (id: string, status: string) => {
    try {
      await apiClient.patch(`/admin/content-engine/backlinks/opportunities/${id}`, { status });
      setOpportunities(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      loadStats();
    } catch { toast({ title: "Failed to update", variant: "destructive" }); }
  };

  const handleSuggest = async () => {
    if (!suggestPostId) { toast({ title: "Select a post first", variant: "destructive" }); return; }
    setSuggesting(true);
    try {
      const data = await apiClient.post(`/admin/content-engine/backlinks/suggest/${suggestPostId}`, {});
      const suggestions = (data as any)?.suggestions ?? [];
      toast({ title: "Suggestions generated", description: `Found ${suggestions.length} potential opportunities` });
    } catch { toast({ title: "Failed to generate suggestions", variant: "destructive" }); }
    finally { setSuggesting(false); }
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      verified: "bg-green-500/10 text-green-700 border-green-200",
      created: "bg-blue-500/10 text-blue-700 border-blue-200",
      acquired: "bg-green-500/10 text-green-700 border-green-200",
      outreach_sent: "bg-yellow-500/10 text-yellow-700 border-yellow-200",
      in_progress: "bg-blue-500/10 text-blue-700 border-blue-200",
      rejected: "bg-red-500/10 text-red-700 border-red-200",
      expired: "bg-muted text-muted-foreground",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const statusIcon = (status: string) => {
    if (status === "acquired" || status === "verified") return <CheckCircle2 className="h-3.5 w-3.5" />;
    if (status === "outreach_sent") return <Send className="h-3.5 w-3.5" />;
    if (status === "in_progress") return <Clock className="h-3.5 w-3.5" />;
    if (status === "rejected" || status === "expired") return <XCircle className="h-3.5 w-3.5" />;
    return null;
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Backlinks</h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  <strong>Opportunities:</strong> Potential backlinks from other sites (guest posts, resource pages, etc.)
                  <br />
                  <strong>Profiles:</strong> High-authority platforms where you have or plan to create profiles
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Manage backlink profiles and track link-building opportunities</p>
        </div>

        {/* Getting Started Guide */}
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  How to use Backlinks
                </p>
                <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                  <li><strong>Profiles:</strong> Create profiles on high-authority platforms (Medium, Dev.to, Product Hunt)</li>
                  <li><strong>Opportunities:</strong> Track potential backlinks (guest posts, mentions, broken links)</li>
                  <li><strong>AI Suggest:</strong> Let AI find relevant backlink opportunities for your content</li>
                  <li><strong>Outreach:</strong> Move opportunities through: Identified → Outreach Sent → Acquired</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  What Happens
                </p>
                <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1.5">
                  <li><strong>Opportunities:</strong> Potential sites that might link to you — track their status from Identified to Acquired</li>
                  <li><strong>AI Suggest:</strong> Analyzes your article and suggests relevant backlink targets based on content and industry</li>
                  <li><strong>Status tracking:</strong> Move through stages: Identified → Reached Out → In Progress → Acquired</li>
                  <li><strong>Verified backlinks:</strong> Mark as Acquired to track successful link-building campaigns and measure SEO impact</li>
                  <li><strong>Profiles:</strong> Track where you have author profiles (Medium, Dev.to) for content syndication opportunities</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-border/60 shadow-none"><CardContent className="p-4"><p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Opportunities</p><p className="text-2xl font-bold mt-1">{stats.total_opportunities}</p></CardContent></Card>
          <Card className="border border-border/60 shadow-none"><CardContent className="p-4"><p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Acquired</p><p className="text-2xl font-bold mt-1 text-green-600">{stats.acquired_count}</p></CardContent></Card>
          <Card className="border border-border/60 shadow-none"><CardContent className="p-4"><p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Profiles</p><p className="text-2xl font-bold mt-1">{stats.profiles_count}</p></CardContent></Card>
          <Card className="border border-border/60 shadow-none"><CardContent className="p-4"><p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Verified Profiles</p><p className="text-2xl font-bold mt-1 text-blue-600">{stats.verified_profiles}</p></CardContent></Card>
        </div>
      ) : null}

      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList><TabsTrigger value="opportunities">Opportunities</TabsTrigger><TabsTrigger value="profiles">Profiles</TabsTrigger></TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <Button onClick={() => setShowOppForm(!showOppForm)} className="gap-2"><Plus className="h-4 w-4" />Add Opportunity</Button>
            <div className="flex items-end gap-2">
              <div className="w-64">
                <Label className="text-xs mb-1 block">AI Suggest for Post</Label>
                <Select value={suggestPostId} onValueChange={setSuggestPostId}><SelectTrigger><SelectValue placeholder="Select post" /></SelectTrigger><SelectContent>{posts.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent></Select>
              </div>
              <Button onClick={handleSuggest} disabled={suggesting || !suggestPostId} variant="outline" className="gap-2">{suggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}Suggest</Button>
            </div>
          </div>

          {showOppForm && (
            <Card className="border border-border/60 shadow-none"><CardContent className="p-5 space-y-4">
              <h3 className="font-medium">New Opportunity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5"><Label>Source Domain *</Label><Input placeholder="example.com" value={oppForm.source_domain} onChange={e => setOppForm({ ...oppForm, source_domain: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Source URL</Label><Input placeholder="https://..." value={oppForm.source_url} onChange={e => setOppForm({ ...oppForm, source_url: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Type</Label><Select value={oppForm.opportunity_type} onValueChange={v => setOppForm({ ...oppForm, opportunity_type: v })}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent>{OPPORTUNITY_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-1.5"><Label>Target Post</Label><Select value={oppForm.target_post_id} onValueChange={v => setOppForm({ ...oppForm, target_post_id: v })}><SelectTrigger><SelectValue placeholder="Select post" /></SelectTrigger><SelectContent>{posts.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-1.5"><Label>Domain Authority</Label><Input type="number" min={0} max={100} placeholder="0-100" value={oppForm.domain_authority} onChange={e => setOppForm({ ...oppForm, domain_authority: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Contact Email</Label><Input type="email" placeholder="contact@..." value={oppForm.contact_email} onChange={e => setOppForm({ ...oppForm, contact_email: e.target.value })} /></div>
              </div>
              <div className="space-y-1.5"><Label>Notes</Label><Textarea placeholder="Additional notes..." value={oppForm.notes} onChange={e => setOppForm({ ...oppForm, notes: e.target.value })} /></div>
              <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowOppForm(false)}>Cancel</Button><Button onClick={handleCreateOpportunity} disabled={oppSubmitting}>{oppSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Create</Button></div>
            </CardContent></Card>
          )}

          {oppsLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}</div>
          ) : opportunities.length === 0 ? (
            <Card className="border border-border/60 shadow-none"><CardContent className="py-10 text-center"><Globe className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" /><p className="text-sm text-muted-foreground">No opportunities yet</p></CardContent></Card>
          ) : (
            <div className="space-y-3">
              {opportunities.map(opp => (
                <Card key={opp.id} className="border border-border/60 shadow-none"><CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{opp.source_domain}</span>
                        {opp.source_url && <a href={opp.source_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary"><ExternalLink className="h-3.5 w-3.5" /></a>}
                        {opp.opportunity_type && <Badge variant="outline" className="text-xs">{OPPORTUNITY_TYPES.find(t => t.value === opp.opportunity_type)?.label || opp.opportunity_type}</Badge>}
                      </div>
                      {opp.target_post && <p className="text-xs text-muted-foreground">Target: {opp.target_post.title}</p>}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={statusBadge(opp.status)}><span className="flex items-center gap-1">{statusIcon(opp.status)}{OPP_STATUSES.find(s => s.value === opp.status)?.label || opp.status}</span></Badge>
                        {opp.domain_authority && <Badge variant="outline">DA: {opp.domain_authority}</Badge>}
                        {opp.contact_email && <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{opp.contact_email}</span>}
                      </div>
                    </div>
                    <Select value={opp.status} onValueChange={v => handleUpdateOppStatus(opp.id, v)}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent>{OPP_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select>
                  </div>
                </CardContent></Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          <Button onClick={() => setShowProfileForm(!showProfileForm)} className="gap-2"><Plus className="h-4 w-4" />Add Profile</Button>

          {showProfileForm && (
            <Card className="border border-border/60 shadow-none"><CardContent className="p-5 space-y-4">
              <h3 className="font-medium">New Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5"><Label>Platform *</Label><Input placeholder="e.g., Product Hunt" value={profileForm.platform} onChange={e => setProfileForm({ ...profileForm, platform: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Profile URL</Label><Input placeholder="https://..." value={profileForm.profile_url} onChange={e => setProfileForm({ ...profileForm, profile_url: e.target.value })} /></div>
                <div className="space-y-1.5"><Label>Status</Label><Select value={profileForm.status} onValueChange={v => setProfileForm({ ...profileForm, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PROFILE_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-1.5"><Label>Domain Authority</Label><Input type="number" min={0} max={100} placeholder="0-100" value={profileForm.domain_authority} onChange={e => setProfileForm({ ...profileForm, domain_authority: e.target.value })} /></div>
              </div>
              <div className="space-y-1.5"><Label>Notes</Label><Textarea placeholder="Notes..." value={profileForm.notes} onChange={e => setProfileForm({ ...profileForm, notes: e.target.value })} /></div>
              <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShowProfileForm(false)}>Cancel</Button><Button onClick={handleCreateProfile} disabled={profileSubmitting}>{profileSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Create</Button></div>
            </CardContent></Card>
          )}

          {profilesLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
          ) : profiles.length === 0 ? (
            <Card className="border border-border/60 shadow-none"><CardContent className="py-10 text-center"><Globe className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" /><p className="text-sm text-muted-foreground">No profiles yet</p></CardContent></Card>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr><th className="text-left px-4 py-2 font-medium">Platform</th><th className="text-left px-4 py-2 font-medium">URL</th><th className="text-left px-4 py-2 font-medium">DA</th><th className="text-left px-4 py-2 font-medium">Status</th><th className="text-left px-4 py-2 font-medium">Actions</th></tr></thead>
                <tbody className="divide-y">
                  {profiles.map(p => (
                    <tr key={p.id} className="hover:bg-muted/30">
                      <td className="px-4 py-2.5 font-medium">{p.platform}</td>
                      <td className="px-4 py-2.5">{p.profile_url ? <a href={p.profile_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">{new URL(p.profile_url).hostname}<ExternalLink className="h-3 w-3" /></a> : "—"}</td>
                      <td className="px-4 py-2.5">{p.domain_authority ?? "—"}</td>
                      <td className="px-4 py-2.5"><Badge variant="outline" className={statusBadge(p.status)}>{statusIcon(p.status)}{PROFILE_STATUSES.find(s => s.value === p.status)?.label || p.status}</Badge></td>
                      <td className="px-4 py-2.5"><Select value={p.status} onValueChange={v => handleUpdateProfileStatus(p.id, v)}><SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger><SelectContent>{PROFILE_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
    </TooltipProvider>
  );
}
