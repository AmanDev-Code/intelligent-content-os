"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type GrantRow = { user_id: string; granted_by: string | null; created_at: string };

type UserHit = {
  id: string;
  username?: string | null;
  full_name?: string | null;
};

export function PlatformStaffGrantsSettings() {
  const [grants, setGrants] = useState<GrantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [hits, setHits] = useState<UserHit[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/platform-admin/grants");
      setGrants(res.grants || []);
    } catch {
      toast.error("Could not load grants");
      setGrants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!debounced) {
      setHits([]);
      return;
    }
    let cancelled = false;
    setSearchLoading(true);
    apiClient
      .get("/platform-admin/users", {
        params: { page: 1, limit: 12, q: debounced },
      })
      .then((res) => {
        if (cancelled) return;
        setHits((res?.items as UserHit[]) || []);
      })
      .catch(() => {
        if (!cancelled) setHits([]);
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  const grant = async () => {
    const id = userId.trim();
    if (!id) {
      toast.error("Select a user or enter a UUID");
      return;
    }
    setBusy(true);
    try {
      await apiClient.post("/platform-admin/grants", { userId: id });
      toast.success("Access granted");
      setUserId("");
      setSearch("");
      setHits([]);
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Grant failed");
    } finally {
      setBusy(false);
    }
  };

  const revoke = async (uid: string) => {
    setBusy(true);
    try {
      await apiClient.delete(`/platform-admin/grants/${uid}`);
      toast.success("Revoked");
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Revoke failed");
    } finally {
      setBusy(false);
    }
  };

  const pickUser = (u: UserHit) => {
    setUserId(u.id);
    setSearch(
      u.username || u.full_name
        ? `${u.username || "user"}${u.full_name ? ` — ${u.full_name}` : ""}`
        : u.id,
    );
    setPickerOpen(false);
    setHits([]);
  };

  return (
    <Card className="xl:col-span-3">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 shrink-0 text-primary" />
          <h2 className="text-base font-semibold">Delegated platform staff</h2>
          <Badge variant="destructive" className="text-xs">
            Super-admin only
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Grant teammates access to Feedback, Users (overview & directory), and related platform-admin APIs (not legacy careers scraper tools).
        </p>

        <div className="flex flex-col gap-4 max-w-xl mb-6">
          <div className="space-y-2">
            <Label htmlFor="grant-search">Search users</Label>
            <div className="relative">
              <Input
                id="grant-search"
                placeholder="Type a username or name, then pick a row…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPickerOpen(true);
                }}
                onFocus={() => setPickerOpen(true)}
                autoComplete="off"
              />
              {pickerOpen && (searchLoading || debounced) && (
                <ul
                  className={cn(
                    "absolute z-50 top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md",
                    "py-1 text-sm",
                  )}
                  role="listbox"
                >
                  {searchLoading && (
                    <li className="px-3 py-2 text-muted-foreground">Searching…</li>
                  )}
                  {!searchLoading && debounced && hits.length === 0 && (
                    <li className="px-3 py-2 text-muted-foreground">No matches.</li>
                  )}
                  {!searchLoading &&
                    hits.map((u) => (
                      <li key={u.id}>
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                          onClick={() => pickUser(u)}
                        >
                          <div className="font-medium">{u.username || "—"}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {u.full_name || u.id}
                          </div>
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              List uses the same directory search as admin users (debounced).
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="grant-uid">User ID to grant</Label>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
              <Input
                id="grant-uid"
                placeholder="Filled when you pick a user, or paste a UUID"
                className="flex-1"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
              <Button
                type="button"
                onClick={() => void grant()}
                disabled={busy}
                className="w-full sm:w-auto shrink-0"
              >
                Grant
              </Button>
            </div>
          </div>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : grants.length === 0 ? (
          <p className="text-sm text-muted-foreground">No delegated admins yet.</p>
        ) : (
          <ul className="space-y-2 max-w-2xl">
            {grants.map((g) => (
              <li
                key={g.user_id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
              >
                <code className="font-mono text-xs break-all">{g.user_id}</code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  disabled={busy}
                  onClick={() => void revoke(g.user_id)}
                >
                  Revoke
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
