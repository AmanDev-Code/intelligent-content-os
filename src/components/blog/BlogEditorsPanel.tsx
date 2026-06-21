"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

export function BlogEditorsPanel() {
  const { toast } = useToast();
  const [editors, setEditors] = useState<{ user_id: string; created_at?: string }[]>([]);
  const [grantId, setGrantId] = useState("");

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

  useEffect(() => {
    void loadEditors();
  }, [loadEditors]);

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

  return (
    <Card className="border border-border/60 shadow-none">
      <CardContent className="space-y-4 p-4 sm:p-6">
        <div>
          <h2 className="font-semibold">Blog editors</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Grant content management access to signed-up users by Supabase user UUID.
          </p>
        </div>
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
            <li
              key={e.user_id}
              className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2"
            >
              <span className="font-mono text-xs">{e.user_id}</span>
              <Button variant="ghost" size="sm" onClick={() => void revokeEditor(e.user_id)}>
                Revoke
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
