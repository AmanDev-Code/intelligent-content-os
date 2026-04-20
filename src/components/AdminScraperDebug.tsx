import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Activity,
  PlayCircle,
  Trash2,
  KeyRound,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Platform = "instagram" | "twitter" | "linkedin";

interface HealthRow {
  platform: Platform;
  cookieConfigured: boolean;
  loggedIn: boolean;
  finalUrl: string;
  elapsedMs: number;
  reason?: string;
}

interface ScraperEvent {
  ts: string;
  platform: Platform;
  tag: string;
  status: "ok" | "error";
  count?: number;
  elapsedMs: number;
  error?: string;
}

interface EventsResponse {
  summary: {
    total: number;
    ok: number;
    errors: number;
    byPlatform: Record<string, { ok: number; errors: number }>;
    lastErrorAt?: string;
  };
  events: ScraperEvent[];
}

interface MaskedSecret {
  set: boolean;
  source: "override" | "env" | "none";
  preview: string;
}

interface CredentialsView {
  instagram: {
    sessionId: MaskedSecret;
    csrftoken: MaskedSecret;
    dsUserId: MaskedSecret;
    igDid: MaskedSecret;
    mid: MaskedSecret;
  };
  twitter: { authToken: MaskedSecret };
  linkedin: { liAt: MaskedSecret; apiVersion: MaskedSecret };
  updatedAt?: string;
}

const PLATFORM_LABEL: Record<Platform, string> = {
  instagram: "Instagram",
  twitter: "X (Twitter)",
  linkedin: "LinkedIn",
};

const AdminScraperDebug: React.FC = () => {
  const [health, setHealth] = useState<HealthRow[]>([]);
  const [healthLoading, setHealthLoading] = useState(false);
  const [events, setEvents] = useState<EventsResponse | null>(null);
  const [eventsLoading, setEventsLoading] = useState(false);

  const [testPlatform, setTestPlatform] = useState<Platform>("twitter");
  const [testTag, setTestTag] = useState("ai");
  const [testLimit, setTestLimit] = useState("10");
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  const [refreshLoading, setRefreshLoading] = useState(false);
  const [pruneLoading, setPruneLoading] = useState(false);
  const [debugLoading, setDebugLoading] = useState(false);
  const [trendingDebug, setTrendingDebug] = useState<any>(null);

  const [credView, setCredView] = useState<CredentialsView | null>(null);
  const [credLoading, setCredLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [igSession, setIgSession] = useState("");
  const [igCsrf, setIgCsrf] = useState("");
  const [igDsUser, setIgDsUser] = useState("");
  const [igDid, setIgDid] = useState("");
  const [igMid, setIgMid] = useState("");
  const [xToken, setXToken] = useState("");
  const [liCookie, setLiCookie] = useState("");
  const [liApiVersion, setLiApiVersion] = useState("");
  const [clearIgSession, setClearIgSession] = useState(false);
  const [clearIgCsrf, setClearIgCsrf] = useState(false);
  const [clearIgDs, setClearIgDs] = useState(false);
  const [clearIgDid, setClearIgDid] = useState(false);
  const [clearIgMid, setClearIgMid] = useState(false);
  const [clearX, setClearX] = useState(false);
  const [clearLi, setClearLi] = useState(false);
  const [clearLiApiVersion, setClearLiApiVersion] = useState(false);
  const [postSaveHealth, setPostSaveHealth] = useState<HealthRow[] | null>(null);

  const loadCredentials = async () => {
    setCredLoading(true);
    try {
      const res = await apiClient.get("/admin/scraper/credentials");
      setCredView((res?.data as CredentialsView) ?? null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load credentials preview");
    } finally {
      setCredLoading(false);
    }
  };

  const saveCredentials = async () => {
    setSaveLoading(true);
    setPostSaveHealth(null);
    try {
      const clearFields: string[] = [];
      if (clearIgSession && !igSession.trim()) clearFields.push("instagramSession");
      if (clearIgCsrf && !igCsrf.trim()) clearFields.push("instagramCsrfToken");
      if (clearIgDs && !igDsUser.trim()) clearFields.push("instagramDsUserId");
      if (clearIgDid && !igDid.trim()) clearFields.push("instagramIgDid");
      if (clearIgMid && !igMid.trim()) clearFields.push("instagramMid");
      if (clearX && !xToken.trim()) clearFields.push("xAuthToken");
      if (clearLi && !liCookie.trim()) clearFields.push("linkedinCookie");
      if (clearLiApiVersion && !liApiVersion.trim()) clearFields.push("linkedinApiVersion");

      const body: Record<string, unknown> = { clearFields, verify: true };
      if (igSession.trim()) body.instagramSession = igSession.trim();
      if (igCsrf.trim()) body.instagramCsrfToken = igCsrf.trim();
      if (igDsUser.trim()) body.instagramDsUserId = igDsUser.trim();
      if (igDid.trim()) body.instagramIgDid = igDid.trim();
      if (igMid.trim()) body.instagramMid = igMid.trim();
      if (xToken.trim()) body.xAuthToken = xToken.trim();
      if (liCookie.trim()) body.linkedinCookie = liCookie.trim();
      if (liApiVersion.trim()) body.linkedinApiVersion = liApiVersion.trim();

      const res = await apiClient.put("/admin/scraper/credentials", body);
      const d = res?.data;
      if (d?.credentials) setCredView(d.credentials as CredentialsView);
      if (d?.health) {
        setPostSaveHealth(d.health as HealthRow[]);
        setHealth(d.health as HealthRow[]);
      }
      setIgSession("");
      setIgCsrf("");
      setIgDsUser("");
      setIgDid("");
      setIgMid("");
      setXToken("");
      setLiCookie("");
      setLiApiVersion("");
      setClearIgSession(false);
      setClearIgCsrf(false);
      setClearIgDs(false);
      setClearIgDid(false);
      setClearIgMid(false);
      setClearX(false);
      setClearLi(false);
      setClearLiApiVersion(false);
      toast.success("Credentials saved. Session probes refreshed below.");
      loadEvents();
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    } finally {
      setSaveLoading(false);
    }
  };

  const verifyOnly = async () => {
    setHealthLoading(true);
    try {
      const res = await apiClient.post("/admin/scraper/credentials/verify", {});
      const d = res?.data;
      if (d?.credentials) setCredView(d.credentials as CredentialsView);
      if (d?.health) {
        setHealth(d.health as HealthRow[]);
        setPostSaveHealth(d.health as HealthRow[]);
      }
      toast.success("Session check complete");
    } catch (e: any) {
      toast.error(e?.message || "Verify failed");
    } finally {
      setHealthLoading(false);
    }
  };

  const loadHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await apiClient.get("/admin/scraper/session-health");
      setHealth((res?.data as HealthRow[]) || []);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load session health");
    } finally {
      setHealthLoading(false);
    }
  };

  const loadEvents = async () => {
    setEventsLoading(true);
    try {
      const res = await apiClient.get("/admin/scraper/events?limit=50");
      setEvents((res?.data as EventsResponse) ?? null);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load events");
    } finally {
      setEventsLoading(false);
    }
  };

  const runTest = async () => {
    if (!testTag.trim()) {
      toast.error("Enter a tag to test");
      return;
    }
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await apiClient.post("/admin/scraper/test-fetch", {
        platform: testPlatform,
        tag: testTag.trim().replace(/^#/, ""),
        limit: parseInt(testLimit, 10) || 10,
      });
      const ok = Boolean(res?.success);
      const data = res?.data || {};
      setTestResult({ ok, ...data });
      if (ok) {
        toast.success(
          `${PLATFORM_LABEL[testPlatform]}: ${data.count} posts in ${data.elapsedMs}ms`,
        );
      } else {
        toast.error(`${PLATFORM_LABEL[testPlatform]}: ${data.error || "failed"}`);
      }
      loadEvents();
    } catch (e: any) {
      toast.error(e?.message || "Test failed");
    } finally {
      setTestLoading(false);
    }
  };

  const triggerRefreshAll = async () => {
    setRefreshLoading(true);
    try {
      await apiClient.post("/admin/tags/refresh-all", {});
      toast.success("Global refresh queued. Results will appear in events shortly.");
      setTimeout(loadEvents, 4000);
    } catch (e: any) {
      toast.error(e?.message || "Refresh failed");
    } finally {
      setRefreshLoading(false);
    }
  };

  const purgeInhouse = async () => {
    try {
      const res: any = await apiClient.post("/admin/scraper/purge-inhouse", {});
      const n = res?.data?.deletedRows ?? 0;
      toast.success(`Purged ${n} stale in-house rows. Cache flushed.`);
    } catch (e: any) {
      toast.error(e?.message || "Purge failed");
    }
  };

  const pruneOldest = async () => {
    setPruneLoading(true);
    try {
      const res: any = await apiClient.post('/admin/trending/prune-oldest', {
        count: 200,
      });
      toast.success(`Removed ${res?.data?.deletedRows ?? 0} oldest rows.`);
    } catch (e: any) {
      toast.error(e?.message || 'Prune oldest failed');
    } finally {
      setPruneLoading(false);
    }
  };

  const loadTrendingDebug = async () => {
    setDebugLoading(true);
    try {
      const res = await apiClient.get('/content/trending/debug?limit=20');
      setTrendingDebug(res?.data || null);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load trend debug');
    } finally {
      setDebugLoading(false);
    }
  };

  const clearEvents = async () => {
    try {
      await apiClient.post("/admin/scraper/events/clear", {});
      toast.success("Event log cleared");
      loadEvents();
    } catch (e: any) {
      toast.error(e?.message || "Clear failed");
    }
  };

  useEffect(() => {
    loadCredentials();
    loadHealth();
    loadEvents();
    const id = setInterval(loadEvents, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-6">
      {/* Credentials (masked + paste new) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Scraper credentials</h3>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={loadCredentials} disabled={credLoading}>
              <RefreshCw className={cn("h-3.5 w-3.5", credLoading && "animate-spin")} />
            </Button>
            <Button size="sm" variant="outline" onClick={verifyOnly} disabled={healthLoading}>
              Verify only
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Previews are masked. New values are stored in Redis and override server environment variables
          until you clear the override. After save, uplink is re-checked automatically.
        </p>

        {credView && (
          <div className="rounded-md border p-3 mb-4 text-xs space-y-2 bg-muted/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Instagram sessionid</span>
                <div className="font-mono mt-0.5">{credView.instagram.sessionId.preview}</div>
                <Badge variant="outline" className="mt-1 text-[10px]">
                  {credView.instagram.sessionId.source}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">X auth_token</span>
                <div className="font-mono mt-0.5">{credView.twitter.authToken.preview}</div>
                <Badge variant="outline" className="mt-1 text-[10px]">
                  {credView.twitter.authToken.source}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">LinkedIn li_at</span>
                <div className="font-mono mt-0.5">{credView.linkedin.liAt.preview}</div>
                <Badge variant="outline" className="mt-1 text-[10px]">
                  {credView.linkedin.liAt.source}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">LinkedIn API version</span>
                <div className="font-mono mt-0.5">{credView.linkedin.apiVersion.preview}</div>
                <Badge variant="outline" className="mt-1 text-[10px]">
                  {credView.linkedin.apiVersion.source}
                </Badge>
              </div>
              {credView.updatedAt && (
                <div className="text-muted-foreground">
                  Overrides last updated: {new Date(credView.updatedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4 text-sm">
          <div className="space-y-2">
            <Label>Instagram sessionid (sessionid cookie)</Label>
            <Textarea
              rows={2}
              className="font-mono text-xs"
              placeholder="Paste new sessionid — leave empty to keep current"
              value={igSession}
              onChange={(e) => setIgSession(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="clr-ig"
                checked={clearIgSession}
                onCheckedChange={(v) => setClearIgSession(Boolean(v))}
              />
              <label htmlFor="clr-ig" className="text-xs text-muted-foreground cursor-pointer">
                Remove saved override (fall back to .env) when left empty above
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>X auth_token cookie</Label>
            <Textarea
              rows={2}
              className="font-mono text-xs"
              placeholder="Paste new auth_token"
              value={xToken}
              onChange={(e) => setXToken(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Checkbox id="clr-x" checked={clearX} onCheckedChange={(v) => setClearX(Boolean(v))} />
              <label htmlFor="clr-x" className="text-xs text-muted-foreground cursor-pointer">
                Remove saved override (use .env)
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>LinkedIn li_at cookie</Label>
            <Textarea
              rows={2}
              className="font-mono text-xs"
              placeholder="Paste new li_at"
              value={liCookie}
              onChange={(e) => setLiCookie(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Checkbox id="clr-li" checked={clearLi} onCheckedChange={(v) => setClearLi(Boolean(v))} />
              <label htmlFor="clr-li" className="text-xs text-muted-foreground cursor-pointer">
                Remove saved override (use .env)
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>LinkedIn API version (YYYYMM)</Label>
            <Input
              className="font-mono text-xs"
              placeholder="e.g. 202506"
              value={liApiVersion}
              onChange={(e) => setLiApiVersion(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="clr-li-version"
                checked={clearLiApiVersion}
                onCheckedChange={(v) => setClearLiApiVersion(Boolean(v))}
              />
              <label htmlFor="clr-li-version" className="text-xs text-muted-foreground cursor-pointer">
                Remove saved override (use .env LINKEDIN_API_VERSION)
              </label>
            </div>
          </div>

          <details className="rounded-md border p-3">
            <summary className="cursor-pointer text-xs font-medium">Advanced Instagram cookies</summary>
            <div className="mt-3 space-y-3">
              {[
                { label: "csrftoken", val: igCsrf, set: setIgCsrf, clear: clearIgCsrf, setClear: setClearIgCsrf, id: "ig-csrf" },
                { label: "ds_user_id", val: igDsUser, set: setIgDsUser, clear: clearIgDs, setClear: setClearIgDs, id: "ig-ds" },
                { label: "ig_did", val: igDid, set: setIgDid, clear: clearIgDid, setClear: setClearIgDid, id: "ig-did" },
                { label: "mid", val: igMid, set: setIgMid, clear: clearIgMid, setClear: setClearIgMid, id: "ig-mid" },
              ].map((row) => (
                <div key={row.id} className="space-y-1">
                  <Label className="text-xs">{row.label}</Label>
                  <Input className="font-mono text-xs" value={row.val} onChange={(e) => row.set(e.target.value)} />
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={row.id}
                      checked={row.clear}
                      onCheckedChange={(v) => row.setClear(Boolean(v))}
                    />
                    <span className="text-[11px] text-muted-foreground">Clear override</span>
                  </div>
                </div>
              ))}
            </div>
          </details>

          <Button onClick={saveCredentials} disabled={saveLoading} className="w-full sm:w-auto">
            {saveLoading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" /> Saving…
              </>
            ) : (
              "Save & verify uplink"
            )}
          </Button>

          {postSaveHealth && postSaveHealth.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Latest probe:{" "}
              {postSaveHealth.map((h) => `${h.platform}=${h.loggedIn ? "ok" : "fail"}`).join(", ")}
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* Session health */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Session Health</h3>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={loadHealth}
            disabled={healthLoading}
          >
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1", healthLoading && "animate-spin")} />
            Re-check
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(["instagram", "twitter", "linkedin"] as Platform[]).map((p) => {
            const row = health.find((h) => h.platform === p);
            return (
              <div
                key={p}
                className={cn(
                  "rounded-md border p-3 text-sm",
                  !row
                    ? "bg-muted/30"
                    : row.loggedIn
                      ? "bg-green-500/5 border-green-500/30"
                      : "bg-red-500/5 border-red-500/30",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{PLATFORM_LABEL[p]}</span>
                  {row?.loggedIn ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                  <div>
                    cookie: {row?.cookieConfigured ? "set" : <span className="text-red-500">missing</span>}
                  </div>
                  <div>logged in: {row?.loggedIn ? "yes" : "no"}</div>
                  {row?.elapsedMs != null && <div>probe: {row.elapsedMs}ms</div>}
                  {row?.reason && (
                    <div className="text-red-500 break-words">reason: {row.reason}</div>
                  )}
                  {row?.finalUrl && (
                    <div className="truncate" title={row.finalUrl}>
                      url: {row.finalUrl}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Test fetch */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <PlayCircle className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Test Fetch (simulator)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
          <div>
            <Label className="text-xs">Platform</Label>
            <Select value={testPlatform} onValueChange={(v) => setTestPlatform(v as Platform)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="twitter">X (Twitter)</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Tag</Label>
            <Input value={testTag} onChange={(e) => setTestTag(e.target.value)} placeholder="ai" />
          </div>
          <div>
            <Label className="text-xs">Limit</Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={testLimit}
              onChange={(e) => setTestLimit(e.target.value)}
            />
          </div>
          <Button onClick={runTest} disabled={testLoading}>
            {testLoading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" /> Running…
              </>
            ) : (
              "Run Test"
            )}
          </Button>
        </div>

        {testResult && (
          <div
            className={cn(
              "mt-3 rounded-md border p-3 text-xs",
              testResult.ok
                ? "bg-green-500/5 border-green-500/30"
                : "bg-red-500/5 border-red-500/30",
            )}
          >
            <div className="flex items-center gap-2 font-medium mb-1">
              {testResult.ok ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              {PLATFORM_LABEL[testResult.platform as Platform]} / #{testResult.tag} ·{" "}
              {testResult.elapsedMs}ms
              {testResult.ok && <Badge variant="secondary">{testResult.count} posts</Badge>}
            </div>
            {testResult.error && (
              <div className="text-red-500 break-words">{testResult.error}</div>
            )}
            {testResult.sample && testResult.sample.length > 0 && (
              <pre className="mt-2 max-h-64 overflow-auto rounded bg-muted/40 p-2 text-[11px] leading-snug">
                {JSON.stringify(testResult.sample, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Events */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">Recent Events</h3>
            {events?.summary && (
              <Badge variant="secondary" className="text-[10px]">
                {events.summary.ok} ok · {events.summary.errors} err
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={triggerRefreshAll} disabled={refreshLoading}>
              {refreshLoading ? (
                <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
              )}
              Refresh All Tags
            </Button>
            <Button size="sm" variant="outline" onClick={purgeInhouse}>
              Purge in-house
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={pruneOldest}
              disabled={pruneLoading}
            >
              {pruneLoading ? 'Removing…' : 'Remove oldest 200'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={loadTrendingDebug}
              disabled={debugLoading}
            >
              {debugLoading ? 'Loading…' : 'Debug Source'}
            </Button>
            <Button size="sm" variant="outline" onClick={loadEvents} disabled={eventsLoading}>
              <RefreshCw className={cn("h-3.5 w-3.5", eventsLoading && "animate-spin")} />
            </Button>
            <Button size="sm" variant="ghost" onClick={clearEvents}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="rounded-md border max-h-80 overflow-y-auto">
          {!events || events.events.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">No events yet.</div>
          ) : (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-background">
                <tr className="border-b text-muted-foreground">
                  <th className="text-left p-2">Time</th>
                  <th className="text-left p-2">Platform</th>
                  <th className="text-left p-2">Tag</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Count</th>
                  <th className="text-left p-2">Took</th>
                  <th className="text-left p-2">Error</th>
                </tr>
              </thead>
              <tbody>
                {events.events.map((e, i) => (
                  <tr key={i} className="border-b hover:bg-muted/20">
                    <td className="p-2 whitespace-nowrap">
                      {new Date(e.ts).toLocaleTimeString()}
                    </td>
                    <td className="p-2">{PLATFORM_LABEL[e.platform]}</td>
                    <td className="p-2">#{e.tag}</td>
                    <td className="p-2">
                      {e.status === "ok" ? (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                          ok
                        </Badge>
                      ) : (
                        <Badge variant="destructive">error</Badge>
                      )}
                    </td>
                    <td className="p-2">{e.count ?? "—"}</td>
                    <td className="p-2">{e.elapsedMs}ms</td>
                    <td className="p-2 text-red-500 max-w-[240px] truncate" title={e.error}>
                      {e.error || ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {trendingDebug && (
        <div className="rounded-md border p-3">
          <h4 className="text-xs font-semibold mb-2">Trending Debug Snapshot</h4>
          <pre className="max-h-64 overflow-auto rounded bg-muted/40 p-2 text-[11px] leading-snug">
            {JSON.stringify(trendingDebug, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AdminScraperDebug;
