"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Settings2, Loader2, CheckCircle2, XCircle, Eye, EyeOff, Trash2, Wifi, Linkedin, ChevronDown } from "lucide-react";
import { apiClient, api } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { PlatformIcon } from "./PlatformIcon";
import { useLinkedInOAuthCallback } from "@/hooks/useLinkedInOAuthCallback";

const LINKEDIN_PLATFORMS = ["linkedin_post", "linkedin_article"] as const;
type LinkedInPlatform = (typeof LINKEDIN_PLATFORMS)[number];

type LinkedInOAuthStatus = {
  connected: boolean;
  profileName: string | null;
  authorUrn: string | null;
  expiresAt: string | null;
  tokenExpired?: boolean;
  enabledPlatforms: string[];
  distributionEnabled: boolean;
};

const ALL_PLATFORMS = [
  // Tier 1: Auto-publish platforms
  "devto",
  "hashnode",
  "ghost",
  "beehiiv",
  "linkedin_article",
  "linkedin_post",
  "telegraph",
  "blogger",
  "medium",
  // Legacy platforms
  "substack",
  "newsletter",
  "indiehackers",
  "reddit",
  "hackernews",
  "twitter_thread",
  "facebook",
  "instagram",
] as const;

type Platform = (typeof ALL_PLATFORMS)[number];

type PlatformAccount = {
  id: string;
  platform: Platform;
  account_name: string;
  credentials: Record<string, any>;
  is_connected: boolean;
  last_tested_at: string | null;
  last_test_result: string | null;
  notes: string | null;
};

const CREDENTIAL_FIELDS: Record<Platform, { key: string; label: string; type: "text" | "password" | "select"; options?: string[]; helpText?: string }[]> = {
  // ===== TIER 1: AUTO-PUBLISH PLATFORMS =====
  devto: [
    { key: "api_key", label: "API Key", type: "password", helpText: "Get from dev.to/settings/extensions" },
    { key: "username", label: "Username", type: "text" },
  ],
  hashnode: [
    { key: "token", label: "Personal Access Token", type: "password", helpText: "Get from hashnode.com/settings/developer" },
    { key: "publication_id", label: "Publication ID", type: "text", helpText: "Found in your publication settings" },
    { key: "username", label: "Username", type: "text" },
  ],
  ghost: [
    { key: "api_url", label: "Ghost Site URL", type: "text", helpText: "e.g., https://yourblog.ghost.io" },
    { key: "admin_api_key", label: "Admin API Key", type: "password", helpText: "Format: id:secret (from Ghost Admin > Integrations)" },
  ],
  beehiiv: [
    { key: "api_key", label: "API Key", type: "password", helpText: "Get from beehiiv.com/settings/api" },
    { key: "publication_id", label: "Publication ID", type: "text", helpText: "Found in your publication settings" },
  ],
  linkedin_article: [
    { key: "access_token", label: "Access Token", type: "password" },
    { key: "author_urn", label: "Author URN", type: "text", helpText: "Format: urn:li:person:XXXXXX" },
    { key: "org_id", label: "Organization ID (optional)", type: "text" },
  ],
  linkedin_post: [
    { key: "access_token", label: "Access Token", type: "password" },
    { key: "author_urn", label: "Author URN", type: "text", helpText: "Format: urn:li:person:XXXXXX" },
    { key: "org_id", label: "Organization ID (optional)", type: "text" },
  ],
  telegraph: [
    { key: "access_token", label: "Access Token", type: "password", helpText: "Auto-created if left empty" },
    { key: "author_name", label: "Author Name", type: "text" },
    { key: "author_url", label: "Author URL (optional)", type: "text" },
  ],
  blogger: [
    { key: "oauth_token", label: "OAuth Token", type: "password", helpText: "Google OAuth access token" },
    { key: "blog_id", label: "Blog ID", type: "text", helpText: "Found in Blogger settings" },
  ],
  medium: [
    { key: "token", label: "Integration Token", type: "password", helpText: "Note: Medium API is deprecated" },
    { key: "author_id", label: "Author ID", type: "text" },
  ],
  // ===== LEGACY PLATFORMS =====
  substack: [
    { key: "email", label: "Email", type: "text" },
    { key: "publication_url", label: "Publication URL", type: "text" },
  ],
  newsletter: [
    { key: "provider", label: "Provider", type: "select", options: ["resend", "convertkit", "mailchimp"] },
    { key: "api_key", label: "API Key", type: "password" },
    { key: "list_id", label: "List/Audience ID", type: "text" },
  ],
  indiehackers: [
    { key: "email", label: "Email", type: "text" },
    { key: "password", label: "Password", type: "password" },
  ],
  reddit: [
    { key: "client_id", label: "Client ID", type: "text" },
    { key: "client_secret", label: "Client Secret", type: "password" },
    { key: "username", label: "Username", type: "text" },
    { key: "password", label: "Password", type: "password" },
    { key: "subreddit", label: "Subreddit", type: "text" },
  ],
  hackernews: [
    { key: "username", label: "Username", type: "text" },
    { key: "password", label: "Password", type: "password" },
  ],
  twitter_thread: [
    { key: "api_key", label: "API Key", type: "password" },
    { key: "api_secret", label: "API Secret", type: "password" },
    { key: "access_token", label: "Access Token", type: "password" },
    { key: "access_secret", label: "Access Secret", type: "password" },
  ],
  facebook: [
    { key: "page_id", label: "Page ID", type: "text" },
    { key: "access_token", label: "Page Access Token", type: "password" },
  ],
  instagram: [
    { key: "business_account_id", label: "Business Account ID", type: "text" },
    { key: "access_token", label: "Access Token", type: "password" },
  ],
};

function isLinkedInPlatform(platform: string): platform is LinkedInPlatform {
  return LINKEDIN_PLATFORMS.includes(platform as LinkedInPlatform);
}

function isTrndinnOAuthAccount(account?: PlatformAccount | null) {
  return account?.credentials?.source === "trndinn_oauth";
}

function platformLabel(p: string) {
  return p.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function PlatformAccountsSection() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<PlatformAccount[]>([]);
  const [linkedinStatus, setLinkedinStatus] = useState<LinkedInOAuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editPlatform, setEditPlatform] = useState<Platform | null>(null);
  const [formData, setFormData] = useState<{ account_name: string; credentials: Record<string, any>; notes: string }>({
    account_name: "",
    credentials: {},
    notes: "",
  });
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [showManualLinkedIn, setShowManualLinkedIn] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [connectingLinkedIn, setConnectingLinkedIn] = useState(false);
  const [enablingLinkedIn, setEnablingLinkedIn] = useState(false);

  const loadLinkedInStatus = useCallback(async () => {
    try {
      const data = await apiClient.get("/admin/content-engine/platform-accounts/linkedin-status");
      setLinkedinStatus(data);
    } catch {
      setLinkedinStatus(null);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [accountsData] = await Promise.all([
        apiClient.get("/admin/content-engine/platform-accounts"),
        loadLinkedInStatus(),
      ]);
      setAccounts(Array.isArray(accountsData) ? accountsData : []);
    } catch {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [loadLinkedInStatus]);

  useLinkedInOAuthCallback({
    onConnected: () => {
      load();
    },
  });

  useEffect(() => {
    load();
  }, [load]);

  const openConfigure = (platform: Platform) => {
    const existing = accounts.find((a) => a.platform === platform);
    setEditPlatform(platform);
    setFormData({
      account_name: existing?.account_name ?? (linkedinStatus?.profileName ?? ""),
      credentials: existing && !isTrndinnOAuthAccount(existing) ? { ...existing.credentials } : {},
      notes: existing?.notes ?? "",
    });
    setShowSecrets({});
    setShowManualLinkedIn(!isLinkedInPlatform(platform) || (!linkedinStatus?.connected && !!existing && !isTrndinnOAuthAccount(existing)));
    setDialogOpen(true);
  };

  const handleConnectLinkedIn = async () => {
    setConnectingLinkedIn(true);
    try {
      const { url } = await api.linkedin.startOAuth("/admin/content-engine");
      window.location.href = url;
    } catch (e: any) {
      toast({ title: e.message || "Failed to start LinkedIn OAuth", variant: "destructive" });
      setConnectingLinkedIn(false);
    }
  };

  const handleEnableLinkedInDistribution = async () => {
    setEnablingLinkedIn(true);
    try {
      await apiClient.post("/admin/content-engine/platform-accounts/linkedin/enable", {});
      toast({ title: "LinkedIn enabled for Content Engine distribution" });
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast({ title: e.message || "Failed to enable LinkedIn", variant: "destructive" });
    } finally {
      setEnablingLinkedIn(false);
    }
  };

  const handleSave = async () => {
    if (!editPlatform) return;
    setSaving(true);
    try {
      const payload: Record<string, any> = {
        platform: editPlatform,
        account_name: formData.account_name,
        notes: formData.notes || undefined,
      };

      if (isLinkedInPlatform(editPlatform) && linkedinStatus?.connected && !showManualLinkedIn) {
        payload.credentials = { source: "trndinn_oauth" };
      } else {
        payload.credentials = formData.credentials;
      }

      await apiClient.post("/admin/content-engine/platform-accounts", payload);
      toast({ title: `${platformLabel(editPlatform)} account saved` });
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast({ title: e.message || "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (platform: string) => {
    setTesting(platform);
    try {
      const result = await apiClient.post(`/admin/content-engine/platform-accounts/${platform}/test`);
      toast({
        title: result.success ? "Connection successful" : "Connection failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
      load();
    } catch (e: any) {
      toast({ title: "Test failed", description: e.message, variant: "destructive" });
    } finally {
      setTesting(null);
    }
  };

  const handleDelete = async (platform: string) => {
    try {
      await apiClient.delete(`/admin/content-engine/platform-accounts/${platform}`);
      toast({ title: `${platformLabel(platform)} account removed` });
      load();
    } catch (e: any) {
      toast({ title: e.message || "Delete failed", variant: "destructive" });
    }
  };

  const accountMap = Object.fromEntries(accounts.map((a) => [a.platform, a]));

  const linkedInCardConnected = (platform: Platform) => {
    const account = accountMap[platform];
    if (account?.is_connected && isTrndinnOAuthAccount(account)) return true;
    if (linkedinStatus?.distributionEnabled && linkedinStatus.enabledPlatforms.includes(platform)) return true;
    return account?.is_connected ?? false;
  };

  const linkedInCardLabel = (platform: Platform) => {
    const account = accountMap[platform];
    if (isTrndinnOAuthAccount(account)) return account?.account_name || linkedinStatus?.profileName;
    if (linkedinStatus?.connected && linkedinStatus.distributionEnabled) return linkedinStatus.profileName;
    return account?.account_name;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Platform Accounts</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure credentials for automated multi-platform publishing
        </p>
      </div>

      <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Settings2 className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                What Happens
              </p>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1.5">
                <li><strong>Add API credentials:</strong> Enter access tokens and keys for platforms you want to auto-publish to</li>
                <li><strong>Test connection:</strong> Verify credentials are valid before using them for distribution</li>
                <li><strong>Used by Distribution:</strong> When you distribute content, we use these credentials to auto-post</li>
                <li><strong>Keep secure:</strong> Credentials are stored encrypted in the database</li>
                <li><strong>Platform support:</strong> Dev.to, Hashnode, Medium, LinkedIn, Ghost, Beehiiv, Telegraph, and more</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_PLATFORMS.map((platform) => {
            const account = accountMap[platform];
            const isTesting = testing === platform;
            const isLinkedIn = isLinkedInPlatform(platform);
            const connected = isLinkedIn ? linkedInCardConnected(platform) : account?.is_connected;
            const displayName = isLinkedIn ? linkedInCardLabel(platform) : account?.account_name;
            const usesOAuth = isLinkedIn && (isTrndinnOAuthAccount(account) || (linkedinStatus?.connected && connected));
            return (
              <Card key={platform} className="border border-border/60 shadow-none">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <PlatformIcon platform={platform} className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{platformLabel(platform)}</p>
                      {displayName && (
                        <p className="text-xs text-muted-foreground truncate">{displayName}</p>
                      )}
                      {usesOAuth && (
                        <p className="text-[10px] text-muted-foreground">Connected via Trndinn</p>
                      )}
                    </div>
                    {connected ? (
                      <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Connected
                      </Badge>
                    ) : isLinkedIn && linkedinStatus?.connected && !linkedinStatus.distributionEnabled ? (
                      <Badge className="bg-amber-100 text-amber-700 text-[10px]">Ready to enable</Badge>
                    ) : account ? (
                      <Badge className="bg-red-100 text-red-600 text-[10px]">
                        <XCircle className="h-3 w-3 mr-1" /> Not Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">Not Configured</Badge>
                    )}
                  </div>

                  {account?.last_tested_at && (
                    <p className="text-[11px] text-muted-foreground">
                      Last tested: {new Date(account.last_tested_at).toLocaleDateString()}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-xs"
                      onClick={() => openConfigure(platform)}
                    >
                      <Settings2 className="h-3 w-3 mr-1" /> Configure
                    </Button>
                    {account && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleTest(platform)}
                          disabled={isTesting}
                        >
                          {isTesting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wifi className="h-3 w-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive hover:text-destructive"
                          onClick={() => handleDelete(platform)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editPlatform && <PlatformIcon platform={editPlatform} className="h-5 w-5" />}
              Configure {editPlatform ? platformLabel(editPlatform) : ""}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {editPlatform && isLinkedInPlatform(editPlatform) && (
              <div className="rounded-lg border border-border/60 p-4 space-y-3 bg-muted/20">
                <div className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                  <p className="text-sm font-medium">Trndinn LinkedIn Connection</p>
                </div>
                {linkedinStatus?.connected ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>{linkedinStatus.profileName || "LinkedIn connected"}</span>
                    </div>
                    {linkedinStatus.authorUrn && (
                      <p className="text-xs text-muted-foreground font-mono truncate">
                        {linkedinStatus.authorUrn}
                      </p>
                    )}
                    {linkedinStatus.tokenExpired && (
                      <p className="text-xs text-destructive">
                        Token expired — reconnect LinkedIn in Settings or below.
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={handleEnableLinkedInDistribution}
                        disabled={enablingLinkedIn || linkedinStatus.tokenExpired}
                      >
                        {enablingLinkedIn ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Enable for distribution
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editPlatform && handleTest(editPlatform)}
                        disabled={testing === editPlatform}
                      >
                        {testing === editPlatform ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Wifi className="h-3 w-3 mr-1" />
                        )}
                        Test connection
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Uses the same LinkedIn account connected in Settings — no manual token required.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Connect your LinkedIn account in Trndinn first. Content Engine will reuse that connection for publishing.
                    </p>
                    <Button onClick={handleConnectLinkedIn} disabled={connectingLinkedIn}>
                      {connectingLinkedIn ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Linkedin className="h-4 w-4 mr-2" />
                      )}
                      Connect LinkedIn
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Account Name</Label>
              <Input
                placeholder="e.g. Trndinn LinkedIn"
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
              />
            </div>

            {editPlatform && isLinkedInPlatform(editPlatform) ? (
              <Collapsible open={showManualLinkedIn} onOpenChange={setShowManualLinkedIn}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between px-0 hover:bg-transparent">
                    <span className="text-xs text-muted-foreground">Advanced: manual credentials</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showManualLinkedIn ? "rotate-180" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-2">
                  {CREDENTIAL_FIELDS[editPlatform]?.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label>{field.label}</Label>
                      <div className="relative">
                        <Input
                          type={field.type === "password" && !showSecrets[field.key] ? "password" : "text"}
                          placeholder={field.label}
                          value={formData.credentials[field.key] ?? ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              credentials: { ...formData.credentials, [field.key]: e.target.value },
                            })
                          }
                        />
                        {field.type === "password" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                            onClick={() => setShowSecrets({ ...showSecrets, [field.key]: !showSecrets[field.key] })}
                          >
                            {showSecrets[field.key] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </Button>
                        )}
                      </div>
                      {field.helpText && (
                        <p className="text-xs text-muted-foreground">{field.helpText}</p>
                      )}
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ) : (
              editPlatform &&
              CREDENTIAL_FIELDS[editPlatform]?.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label>{field.label}</Label>
                  {field.type === "select" ? (
                    <Select
                      value={formData.credentials[field.key] ?? ""}
                      onValueChange={(val) =>
                        setFormData({
                          ...formData,
                          credentials: { ...formData.credentials, [field.key]: val },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Select ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="relative">
                      <Input
                        type={field.type === "password" && !showSecrets[field.key] ? "password" : "text"}
                        placeholder={field.label}
                        value={formData.credentials[field.key] ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            credentials: { ...formData.credentials, [field.key]: e.target.value },
                          })
                        }
                      />
                      {field.type === "password" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                          onClick={() => setShowSecrets({ ...showSecrets, [field.key]: !showSecrets[field.key] })}
                        >
                          {showSecrets[field.key] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}

            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="Any notes about this account..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="h-20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            {!(editPlatform && isLinkedInPlatform(editPlatform) && linkedinStatus?.connected && !showManualLinkedIn) && (
              <Button onClick={handleSave} disabled={saving || !formData.account_name}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Account
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
