"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2, Megaphone } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Variant = "info" | "success" | "warning" | "error" | "promo";

interface Announcement {
  id: string;
  message: string;
  title: string | null;
  detail: string | null;
  variant: Variant;
  linkUrl: string | null;
  linkLabel: string | null;
  isActive: boolean;
  dismissible: boolean;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const VARIANTS: Variant[] = ["info", "success", "warning", "error", "promo"];

const VARIANT_BADGE: Record<Variant, string> = {
  info: "bg-blue-500/15 text-blue-600 dark:text-blue-300",
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  error: "bg-red-500/15 text-red-600 dark:text-red-300",
  promo: "bg-primary/15 text-primary",
};

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
}

function fromLocalInput(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function emptyDraft(): Partial<Announcement> {
  return {
    message: "",
    title: "",
    detail: "",
    variant: "info",
    linkUrl: "",
    linkLabel: "",
    isActive: true,
    dismissible: true,
    startsAt: null,
    endsAt: null,
    sortOrder: 0,
  };
}

function AnnouncementForm({
  value,
  onChange,
}: {
  value: Partial<Announcement>;
  onChange: (patch: Partial<Announcement>) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2 space-y-1.5">
        <Label>Message *</Label>
        <Input
          value={value.message ?? ""}
          onChange={(e) => onChange({ message: e.target.value })}
          placeholder="🎉 Launch week — 30% off all annual plans"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Title (detail modal heading)</Label>
        <Input value={value.title ?? ""} onChange={(e) => onChange({ title: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Severity</Label>
        <Select value={value.variant ?? "info"} onValueChange={(v) => onChange({ variant: v as Variant })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {VARIANTS.map((v) => (
              <SelectItem key={v} value={v} className="capitalize">{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="sm:col-span-2 space-y-1.5">
        <Label>Detail (shown in “Learn more” modal)</Label>
        <Textarea
          rows={3}
          value={value.detail ?? ""}
          onChange={(e) => onChange({ detail: e.target.value })}
          placeholder="Longer description shown when a user opens the announcement."
        />
      </div>
      <div className="space-y-1.5">
        <Label>Link URL</Label>
        <Input value={value.linkUrl ?? ""} onChange={(e) => onChange({ linkUrl: e.target.value })} placeholder="/pricing" />
      </div>
      <div className="space-y-1.5">
        <Label>Link label</Label>
        <Input value={value.linkLabel ?? ""} onChange={(e) => onChange({ linkLabel: e.target.value })} placeholder="View plans" />
      </div>
      <div className="space-y-1.5">
        <Label>Starts at</Label>
        <Input
          type="datetime-local"
          value={toLocalInput(value.startsAt ?? null)}
          onChange={(e) => onChange({ startsAt: fromLocalInput(e.target.value) })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Ends at</Label>
        <Input
          type="datetime-local"
          value={toLocalInput(value.endsAt ?? null)}
          onChange={(e) => onChange({ endsAt: fromLocalInput(e.target.value) })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Sort order</Label>
        <Input
          type="number"
          value={String(value.sortOrder ?? 0)}
          onChange={(e) => onChange({ sortOrder: Number(e.target.value) || 0 })}
        />
      </div>
      <div className="flex items-end gap-6">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Switch checked={value.isActive ?? true} onCheckedChange={(c) => onChange({ isActive: c })} />
          Active
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Switch checked={value.dismissible ?? true} onCheckedChange={(c) => onChange({ dismissible: c })} />
          Dismissible
        </label>
      </div>
    </div>
  );
}

export function AnnouncementsAdmin() {
  const [rows, setRows] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Partial<Announcement>>(emptyDraft());
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, Partial<Announcement>>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await apiClient.get("/admin/site-content/announcements")) as Announcement[];
      setRows(data ?? []);
      setEdits({});
    } catch (e) {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async () => {
    if (!draft.message?.trim()) {
      toast.error("Message is required");
      return;
    }
    setCreating(true);
    try {
      await apiClient.post("/admin/site-content/announcements", draft);
      toast.success("Announcement created");
      setDraft(emptyDraft());
      await load();
    } catch {
      toast.error("Create failed");
    } finally {
      setCreating(false);
    }
  };

  const save = async (id: string) => {
    const patch = edits[id];
    if (!patch) return;
    setSavingId(id);
    try {
      await apiClient.put(`/admin/site-content/announcements/${id}`, patch);
      toast.success("Saved");
      await load();
    } catch {
      toast.error("Save failed");
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await apiClient.delete(`/admin/site-content/announcements/${id}`);
      toast.success("Deleted");
      await load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const merged = (r: Announcement): Announcement => ({ ...r, ...edits[r.id] });
  const patch = (id: string, p: Partial<Announcement>) =>
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...p } }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> New announcement
          </CardTitle>
          <CardDescription>
            Shows in the marquee above the marketing header. Schedule with start/end and order with sort.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnnouncementForm value={draft} onChange={(p) => setDraft((d) => ({ ...d, ...p }))} />
          <Button onClick={create} disabled={creating} className="cursor-pointer">
            {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Create announcement
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Existing announcements {loading ? "" : `(${rows.length})`}
        </h3>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            <Loader2 className="mx-auto h-5 w-5 animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              <Megaphone className="mx-auto mb-2 h-6 w-6 opacity-50" />
              No announcements yet.
            </CardContent>
          </Card>
        ) : (
          rows.map((r) => {
            const m = merged(r);
            const dirty = !!edits[r.id];
            return (
              <Card key={r.id} className={dirty ? "border-primary/40" : undefined}>
                <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
                  <div className="flex items-center gap-2">
                    <Badge className={VARIANT_BADGE[m.variant]} variant="secondary">{m.variant}</Badge>
                    {!m.isActive && <Badge variant="outline">inactive</Badge>}
                    <span className="text-sm font-medium line-clamp-1">{m.message || "(empty)"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => save(r.id)} disabled={!dirty || savingId === r.id} className="cursor-pointer">
                      {savingId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(r.id)} className="cursor-pointer text-red-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <AnnouncementForm value={m} onChange={(p) => patch(r.id, p)} />
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
