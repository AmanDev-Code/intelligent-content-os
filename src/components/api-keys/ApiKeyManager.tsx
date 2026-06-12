"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Loader2,
  Plus,
  Trash2,
  KeyRound,
  Copy,
  Check,
} from "lucide-react";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";

interface ApiKeyData {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  rateLimitPerHour: number;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
}

const ALL_SCOPES = [
  { id: "posts:read", label: "Read posts" },
  { id: "posts:write", label: "Create / cancel posts" },
  { id: "accounts:read", label: "Read connected accounts" },
  { id: "accounts:write", label: "Manage / disconnect accounts" },
  { id: "media:write", label: "Upload media" },
];

export function ApiKeyManager() {
  const [keys, setKeys] = useState<ApiKeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newScopes, setNewScopes] = useState<Set<string>>(
    new Set(ALL_SCOPES.map((s) => s.id)),
  );
  const [creating, setCreating] = useState(false);
  const [plaintextKey, setPlaintextKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await api.apiKeys.list();
      setKeys(Array.isArray(res?.keys) ? res.keys : []);
    } catch {
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error("Name is required");
      return;
    }
    setCreating(true);
    try {
      const res = await api.apiKeys.create({
        name: newName.trim(),
        scopes: [...newScopes],
      });
      setPlaintextKey(res?.plaintextKey ?? null);
      setCreateOpen(false);
      setNewName("");
      setNewScopes(new Set(ALL_SCOPES.map((s) => s.id)));
      await fetchKeys();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await api.apiKeys.revoke(id);
      toast.success("API key revoked");
      setKeys((prev) =>
        prev.map((k) =>
          k.id === id ? { ...k, revokedAt: new Date().toISOString() } : k,
        ),
      );
    } catch {
      toast.error("Failed to revoke API key");
    }
  };

  const toggleScope = (scopeId: string) => {
    setNewScopes((prev) => {
      const next = new Set(prev);
      if (next.has(scopeId)) next.delete(scopeId);
      else next.add(scopeId);
      return next;
    });
  };

  const copyKey = async () => {
    if (!plaintextKey) return;
    try {
      await navigator.clipboard.writeText(plaintextKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed — select and copy manually");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">API Keys</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Authenticate the Trndinn Public API v1 with{" "}
            <code className="font-mono">Authorization: Bearer trnd_…</code>
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> New Key
        </Button>
      </div>

      {keys.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <KeyRound className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No API keys yet.</p>
            <p className="text-xs mt-1">
              Create a key to integrate with the Trndinn API.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {keys.map((key) => {
            const revoked = Boolean(key.revokedAt);
            return (
              <Card key={key.id} className={revoked ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">
                          {key.name}
                        </p>
                        {revoked ? (
                          <Badge variant="destructive" className="text-[10px]">
                            Revoked
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            {key.rateLimitPerHour}/hr
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">
                        {key.keyPrefix}…
                      </p>
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {key.scopes.map((s) => (
                          <Badge
                            key={s}
                            variant="outline"
                            className="text-[10px] px-1.5 py-0"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5">
                        Created {new Date(key.createdAt).toLocaleDateString()}
                        {key.lastUsedAt
                          ? ` · Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`
                          : " · Never used"}
                      </p>
                    </div>

                    {!revoked && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 shrink-0"
                        onClick={() => handleRevoke(key.id)}
                        aria-label="Revoke key"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create API Key</DialogTitle>
            <DialogDescription>
              Choose a name and the capabilities this key may use.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="key-name">Name</Label>
              <Input
                id="key-name"
                placeholder="e.g. Zapier integration"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Scopes</Label>
              <div className="space-y-2">
                {ALL_SCOPES.map((scope) => (
                  <label
                    key={scope.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={newScopes.has(scope.id)}
                      onCheckedChange={() => toggleScope(scope.id)}
                    />
                    <span className="text-sm">{scope.label}</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {scope.id}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !newName.trim() || newScopes.size === 0}
            >
              {creating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Create Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* One-time plaintext reveal */}
      <Dialog
        open={Boolean(plaintextKey)}
        onOpenChange={(open) => {
          if (!open) setPlaintextKey(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Copy your API key now</DialogTitle>
            <DialogDescription>
              For your security this key is shown only once. Store it somewhere
              safe — you won&apos;t be able to see it again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 py-2">
            <code className="flex-1 text-xs font-mono break-all bg-muted rounded px-3 py-2">
              {plaintextKey}
            </code>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={copyKey}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setPlaintextKey(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
