"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/apiClient";
import { siteName } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Archive,
  Search,
  Upload,
  Trash2,
  Tag,
  Layers,
  ChevronsUpDown,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// ─── Types ───────────────────────────────────────────────────────────────────

type KeywordStatus = "active" | "paused" | "archived" | "banned";
type KeywordIntent = "informational" | "commercial" | "transactional" | "navigational";
type AssignmentTargetType = "route" | "page_type" | "blog_post" | "template";

interface SeoKeyword {
  id: string;
  keyword: string;
  normalized_keyword: string;
  intent: KeywordIntent;
  cluster: string | null;
  priority: number;
  language: string;
  status: KeywordStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface SeoKeywordAssignment {
  id: string;
  keyword_id: string;
  target_type: AssignmentTargetType;
  target_ref: string;
  weight: number;
  is_primary: boolean;
  created_at: string;
  keyword?: Pick<SeoKeyword, "id" | "keyword" | "intent" | "cluster" | "status">;
}

interface ClusterStat {
  cluster: string;
  count: number;
  active: number;
  paused: number;
}

interface KeywordFormData {
  keyword: string;
  intent: KeywordIntent;
  cluster: string;
  priority: number;
  language: string;
  status: KeywordStatus;
  notes: string;
}

const EMPTY_FORM: KeywordFormData = {
  keyword: "",
  intent: "informational",
  cluster: "",
  priority: 50,
  language: "en",
  status: "active",
  notes: "",
};

const INTENTS: KeywordIntent[] = ["informational", "commercial", "transactional", "navigational"];
const STATUSES: KeywordStatus[] = ["active", "paused", "archived", "banned"];
const TARGET_TYPES: AssignmentTargetType[] = ["route", "page_type", "blog_post", "template"];

/** Row shape from `GET /admin/blog/posts` (list + search). */
type AdminBlogPostRow = {
  id: string;
  title: string;
  status?: string;
  path?: string;
  slug?: string;
};

function blogPostStatusLabel(status: string | undefined): string {
  const s = (status ?? "draft").trim().toLowerCase();
  if (!s) return "draft";
  return s;
}

function blogPostStatusBadge(status: string | undefined) {
  const label = blogPostStatusLabel(status);
  const variant =
    label === "published"
      ? "default"
      : label === "scheduled"
        ? "secondary"
        : label === "archived"
          ? "outline"
          : "secondary";
  return (
    <Badge variant={variant} className="capitalize">
      {label}
    </Badge>
  );
}

/** Align with backend `BlogService.normalizeRoutePath` so assignments match public `/blog/page-seo` and Next.js routes. */
function normalizeRouteTargetRef(ref: string): string {
  let r = ref.trim();
  if (!r) return r;
  if (!r.startsWith("/")) r = `/${r}`;
  r = r.replace(/\/+$/, "") || "/";
  return r;
}

function previewSanitizeCluster(raw: string): string {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned.length > 0 ? cleaned : "default cluster";
}

/**
 * Pretty-prints keyword text when bad imports left glued segments (e.g. `foo][bar`, `[a][b]`).
 * Used for SEO admin bulk-assign display only; does not mutate stored values.
 */
function formatKeywordLabel(raw: string): string {
  const fallback = raw.trim();
  if (!fallback) return raw;
  let s = fallback;
  if (s.includes("][")) {
    s = s
      .split("][")
      .map((seg) => seg.replace(/^\[+/, "").replace(/\]+$/, "").trim())
      .filter(Boolean)
      .join(" · ");
  }
  let prev = "";
  while (prev !== s) {
    prev = s;
    if (s.startsWith("[") && s.endsWith("]") && s.length >= 2) {
      s = s.slice(1, -1).trim();
    }
  }
  s = s.replace(/^\[+/u, "").replace(/\]+$/u, "").trim();
  return s.length > 0 ? s : fallback;
}

/** Mirrors backend cleanKeywordText for bulk-import preview. */
function previewCleanKeywordText(raw: string): string {
  let s = raw.trim().replace(/\s+/g, " ");
  let prev = "";
  while (prev !== s) {
    prev = s;
    while (s.startsWith("[") && s.endsWith("]") && s.length >= 2) {
      s = s.slice(1, -1).trim().replace(/\s+/g, " ");
    }
    if (s.startsWith('"') && s.endsWith('"') && s.length >= 2) {
      s = s.slice(1, -1).trim().replace(/\s+/g, " ");
    }
  }
  return s;
}

function statusBadge(status: KeywordStatus) {
  const map: Record<KeywordStatus, string> = {
    active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
    paused: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
    archived: "bg-zinc-500/15 text-zinc-500 border-zinc-500/30",
    banned: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
  };
  return (
    <Badge variant="outline" className={map[status]}>
      {status}
    </Badge>
  );
}

function intentBadge(intent: KeywordIntent) {
  const map: Record<KeywordIntent, string> = {
    informational: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
    commercial: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
    transactional: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30",
    navigational: "bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/30",
  };
  return (
    <Badge variant="outline" className={map[intent]}>
      {intent}
    </Badge>
  );
}

// ─── Keyword Form Dialog ──────────────────────────────────────────────────────

function KeywordDialog({
  open,
  onClose,
  editing,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  editing: SeoKeyword | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<KeywordFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        editing
          ? {
              keyword: editing.keyword,
              intent: editing.intent,
              cluster: editing.cluster ?? "",
              priority: editing.priority,
              language: editing.language,
              status: editing.status,
              notes: editing.notes ?? "",
            }
          : EMPTY_FORM,
      );
    }
  }, [open, editing]);

  const field = <K extends keyof KeywordFormData>(key: K, val: KeywordFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!form.keyword.trim()) {
      toast.error("Keyword is required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        keyword: form.keyword.trim(),
        intent: form.intent,
        cluster: form.cluster.trim() || undefined,
        priority: form.priority,
        language: form.language,
        status: form.status,
        notes: form.notes.trim() || undefined,
      };
      if (editing) {
        await api.seoKeywords.update(editing.id, payload);
        toast.success("Keyword updated");
      } else {
        await api.seoKeywords.create(payload);
        toast.success("Keyword created");
      }
      onSaved();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Keyword" : "Add Keyword"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Keyword *</Label>
            <Input
              value={form.keyword}
              onChange={(e) => field("keyword", e.target.value)}
              placeholder="e.g. linkedin growth tips"
              maxLength={80}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Intent</Label>
              <Select value={form.intent} onValueChange={(v) => field("intent", v as KeywordIntent)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTENTS.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => field("status", v as KeywordStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Cluster</Label>
              <Input
                value={form.cluster}
                onChange={(e) => field("cluster", e.target.value)}
                placeholder="e.g. linkedin-growth"
              />
            </div>

            <div className="space-y-1">
              <Label>Language</Label>
              <Input
                value={form.language}
                onChange={(e) => field("language", e.target.value)}
                placeholder="en"
                maxLength={10}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Priority: {form.priority}</Label>
            <Slider
              min={1}
              max={100}
              step={1}
              value={[form.priority]}
              onValueChange={([v]) => field("priority", v)}
            />
          </div>

          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => field("notes", e.target.value)}
              placeholder="Optional notes…"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : editing ? "Save Changes" : "Add Keyword"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Library Tab ─────────────────────────────────────────────────────────────

function LibraryTab({ clusterFilter }: { clusterFilter?: string }) {
  const [keywords, setKeywords] = useState<SeoKeyword[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const LIMIT = 50;

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCluster, setFilterCluster] = useState(clusterFilter ?? "");
  const [filterIntent, setFilterIntent] = useState<string>("all");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SeoKeyword | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importDefaultCluster, setImportDefaultCluster] = useState("");
  const [importDefaultIntent, setImportDefaultIntent] = useState<KeywordIntent>("informational");
  const [importDefaultPriority, setImportDefaultPriority] = useState(50);
  const [importDefaultLanguage, setImportDefaultLanguage] = useState("en");
  const [importDefaultStatus, setImportDefaultStatus] = useState<KeywordStatus>("active");
  const [importStripBracketPreview, setImportStripBracketPreview] = useState(true);
  const [importing, setImporting] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  useEffect(() => {
    if (clusterFilter !== undefined) setFilterCluster(clusterFilter);
  }, [clusterFilter]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await api.seoKeywords.list({
        q: search || undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        cluster: filterCluster || undefined,
        intent: filterIntent !== "all" ? filterIntent : undefined,
        page,
        limit: LIMIT,
      })) as { data: SeoKeyword[]; total: number };
      setKeywords(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load keywords");
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterCluster, filterIntent, page]);

  useEffect(() => {
    setPage(1);
  }, [search, filterStatus, filterCluster, filterIntent]);

  useEffect(() => {
    load();
  }, [load]);

  const archive = async (id: string) => {
    try {
      await api.seoKeywords.delete(id);
      toast.success("Keyword archived");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to archive");
    }
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const selectAll = () =>
    setSelected(
      selected.size === keywords.length ? new Set() : new Set(keywords.map((k) => k.id)),
    );

  const bulkStatus = async (status: string) => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    try {
      const res = (await api.seoKeywords.bulkStatus([...selected], status)) as {
        updated: number;
      };
      toast.success(`Updated ${res.updated} keyword(s) to "${status}"`);
      setSelected(new Set());
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bulk update failed");
    } finally {
      setBulkLoading(false);
    }
  };

  const bulkPermanentDelete = async () => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    try {
      const res = (await api.seoKeywords.bulkPermanentDelete([...selected])) as {
        deleted: number;
      };
      toast.success(`Permanently deleted ${res.deleted} keyword(s)`);
      setBulkDeleteOpen(false);
      setSelected(new Set());
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBulkLoading(false);
    }
  };

  const handleImport = async () => {
    const lines = importText
      .split(/[\n,]+/)
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) {
      toast.error("No keywords to import");
      return;
    }
    setImporting(true);
    try {
      const res = (await api.seoKeywords.bulkImport({
        keywords: lines,
        cluster: importDefaultCluster.trim() ? importDefaultCluster.trim() : null,
        intent: importDefaultIntent,
        priority: importDefaultPriority,
        language: importDefaultLanguage.trim() || "en",
        status: importDefaultStatus,
      })) as {
        created: number;
        skipped: number;
        errors: string[];
      };
      toast.success(`Imported ${res.created} keyword(s), skipped ${res.skipped} duplicates`);
      if (res.errors.length > 0) {
        toast.error(`${res.errors.length} error(s): ${res.errors[0]}`);
      }
      setImportText("");
      setImportOpen(false);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const importPreviewSegments = importText
    .split(/[\n,]+/)
    .map((l) => l.trim())
    .filter(Boolean);
  const previewSample = importStripBracketPreview
    ? importPreviewSegments.slice(0, 5).map((seg) => {
        const pipe = seg.indexOf("|");
        const kwPart = pipe >= 0 ? seg.slice(0, pipe).trim() : seg;
        const cleanedKw = previewCleanKeywordText(kwPart);
        return pipe >= 0
          ? `${cleanedKw} (${previewSanitizeCluster(seg.slice(pipe + 1))})`
          : cleanedKw;
      })
    : [];

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <>
      <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search keywords…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterIntent} onValueChange={setFilterIntent}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Intent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All intents</SelectItem>
            {INTENTS.map((i) => (
              <SelectItem key={i} value={i}>
                {i}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Cluster filter…"
          value={filterCluster}
          onChange={(e) => setFilterCluster(e.target.value)}
          className="w-[150px]"
        />

        <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
          <Upload className="h-4 w-4 mr-1.5" />
          Bulk Import
        </Button>

        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Keyword
        </Button>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex gap-1 ml-auto flex-wrap">
            {(["active", "paused", "archived"] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant="outline"
                onClick={() => bulkStatus(s)}
                disabled={bulkLoading}
              >
                Set {s}
              </Button>
            ))}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setBulkDeleteOpen(true)}
              disabled={bulkLoading}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete selected…
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={selected.size === keywords.length && keywords.length > 0}
                  onCheckedChange={selectAll}
                />
              </TableHead>
              <TableHead>Keyword</TableHead>
              <TableHead className="hidden sm:table-cell">Intent</TableHead>
              <TableHead className="hidden md:table-cell">Cluster</TableHead>
              <TableHead className="hidden lg:table-cell w-20">Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : keywords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No keywords found.
                </TableCell>
              </TableRow>
            ) : (
              keywords.map((kw) => (
                <TableRow key={kw.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(kw.id)}
                      onCheckedChange={() => toggleSelect(kw.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium max-w-[200px] truncate" title={kw.keyword}>
                    {kw.keyword}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{intentBadge(kw.intent)}</TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {kw.cluster ?? "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">{kw.priority}</TableCell>
                  <TableCell>{statusBadge(kw.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => {
                          setEditing(kw);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => archive(kw.id)}
                        title="Archive"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {total} total · page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Keyword dialog */}
      <KeywordDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
        onSaved={load}
      />

      {/* Bulk import dialog */}
      <Dialog open={importOpen} onOpenChange={(v) => !v && setImportOpen(false)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Import Keywords</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>One keyword per line or comma-separated.</p>
              <p>
                Optional per line:{" "}
                <span className="font-mono text-xs text-foreground/80">
                  keyword phrase | cluster-slug
                </span>{" "}
                (cluster overrides the default below). Only the{" "}
                <strong className="text-foreground font-medium">first</strong> pipe is treated as the
                delimiter—if your phrase needs a literal <span className="font-mono">|</span>, put
                that entry on its own line and set the cluster from the defaults only.
              </p>
              <div className="flex items-start gap-2 pt-1">
                <Checkbox
                  id="import-strip-prev"
                  checked={importStripBracketPreview}
                  onCheckedChange={(v) => setImportStripBracketPreview(Boolean(v))}
                />
                <label htmlFor="import-strip-prev" className="leading-snug cursor-pointer">
                  Strip brackets &amp; clean text (preview)
                </label>
              </div>
              <p className="text-xs">
                The server always cleans and stores canonical text; this toggles preview only.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1 col-span-2">
                <Label>Default cluster</Label>
                <Input
                  value={importDefaultCluster}
                  onChange={(e) => setImportDefaultCluster(e.target.value)}
                  placeholder="e.g. linkedin-growth (letters, digits, hyphens)"
                />
              </div>
              <div className="space-y-1">
                <Label>Default intent</Label>
                <Select
                  value={importDefaultIntent}
                  onValueChange={(v) => setImportDefaultIntent(v as KeywordIntent)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTENTS.map((i) => (
                      <SelectItem key={i} value={i}>
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Default status</Label>
                <Select
                  value={importDefaultStatus}
                  onValueChange={(v) => setImportDefaultStatus(v as KeywordStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 col-span-2">
                <Label>Default language</Label>
                <Input
                  value={importDefaultLanguage}
                  onChange={(e) => setImportDefaultLanguage(e.target.value)}
                  placeholder="en"
                  maxLength={10}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Default priority: {importDefaultPriority}</Label>
                <Slider
                  min={1}
                  max={100}
                  step={1}
                  value={[importDefaultPriority]}
                  onValueChange={([v]) => setImportDefaultPriority(v)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Keywords</Label>
              <Textarea
                placeholder={`[linkedin growth tips] | linkedin-growth\n"ai content scheduler"\nstripe checkout, invoicing`}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            {importStripBracketPreview && previewSample.length > 0 && (
              <div className="rounded-md border bg-muted/40 px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Preview (cleaned keywords, max 5)
                </p>
                <ul className="text-xs font-mono space-y-0.5 text-foreground/90">
                  {previewSample.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Adding keywords here does not drive rankings by itself—matching page SEO titles,
              headings, and on-page content is still required.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)} disabled={importing}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={importing}>
              {importing ? "Importing…" : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={(open) => !bulkLoading && setBulkDeleteOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selected.size} keyword(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes these keywords from the library. Related route assignments
              are deleted automatically (cannot be undone). Use{" "}
              <span className="font-medium text-foreground">Set archived</span> if you only want to
              hide them without deleting rows.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkLoading}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={bulkLoading}
              onClick={() => void bulkPermanentDelete()}
            >
              {bulkLoading ? "Deleting…" : "Delete permanently"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Assignments Tab ──────────────────────────────────────────────────────────

function AssignmentsTab() {
  const [targetType, setTargetType] = useState<AssignmentTargetType>("route");
  const [targetRef, setTargetRef] = useState("");
  const [assignments, setAssignments] = useState<SeoKeywordAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [addKwId, setAddKwId] = useState("");
  const [addKwSearch, setAddKwSearch] = useState("");
  const [addKwResults, setAddKwResults] = useState<SeoKeyword[]>([]);
  const [addWeight, setAddWeight] = useState(50);
  const [addPrimary, setAddPrimary] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkKwList, setBulkKwList] = useState<SeoKeyword[]>([]);
  const [bulkClusters, setBulkClusters] = useState<string[]>([]);
  const [bulkClusterFilter, setBulkClusterFilter] = useState<string>("");
  const [bulkListLoading, setBulkListLoading] = useState(false);
  const [bulkSearch, setBulkSearch] = useState("");
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [bulkWeight, setBulkWeight] = useState(50);
  const [bulkPrimaryId, setBulkPrimaryId] = useState("");
  const [bulkPrimaryPickerOpen, setBulkPrimaryPickerOpen] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);

  const [blogPostsRecent, setBlogPostsRecent] = useState<AdminBlogPostRow[]>([]);
  const [blogPostsLoading, setBlogPostsLoading] = useState(false);
  const [blogSearchQuery, setBlogSearchQuery] = useState("");
  const [blogSearchHits, setBlogSearchHits] = useState<AdminBlogPostRow[]>([]);
  const [blogSearchLoading, setBlogSearchLoading] = useState(false);
  const [blogResolved, setBlogResolved] = useState<AdminBlogPostRow | null>(null);
  const [blogResolveLoading, setBlogResolveLoading] = useState(false);

  const assignedKeywordIds = useMemo(
    () => new Set(assignments.map((a) => a.keyword_id)),
    [assignments],
  );

  const loadAssignments = useCallback(async () => {
    if (!targetRef.trim()) return;
    setLoading(true);
    setFetched(true);
    try {
      const ref =
        targetType === "route" ? normalizeRouteTargetRef(targetRef) : targetRef.trim();
      const data = (await api.seoKeywords.getAssignments(targetType, ref)) as SeoKeywordAssignment[];
      setAssignments(data ?? []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  }, [targetType, targetRef]);

  useEffect(() => {
    if (targetType !== "blog_post") {
      setBlogPostsRecent([]);
      setBlogSearchHits([]);
      setBlogSearchQuery("");
      setBlogResolved(null);
      return;
    }
    let cancelled = false;
    setBlogPostsLoading(true);
    void (async () => {
      try {
        const res = (await api.admin.blogListPosts()) as { posts?: AdminBlogPostRow[] };
        if (cancelled) return;
        setBlogPostsRecent((res.posts ?? []).slice(0, 80));
      } catch (e) {
        if (!cancelled) toast.error(e instanceof Error ? e.message : "Failed to load blog posts");
      } finally {
        if (!cancelled) setBlogPostsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [targetType]);

  useEffect(() => {
    if (targetType !== "blog_post") return;
    const q = blogSearchQuery.trim();
    if (!q) {
      setBlogSearchHits([]);
      setBlogSearchLoading(false);
      return;
    }
    let cancelled = false;
    const handle = setTimeout(() => {
      setBlogSearchLoading(true);
      void (async () => {
        try {
          const res = (await api.admin.blogListPosts({ q })) as { posts?: AdminBlogPostRow[] };
          if (cancelled) return;
          setBlogSearchHits(res.posts ?? []);
        } catch {
          if (!cancelled) setBlogSearchHits([]);
        } finally {
          if (!cancelled) setBlogSearchLoading(false);
        }
      })();
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [blogSearchQuery, targetType]);

  const applyBlogPostTarget = useCallback((row: AdminBlogPostRow) => {
    setTargetRef(row.id);
    setBlogResolved(row);
    setFetched(false);
    setAssignments([]);
  }, []);

  const resolveBlogPost = useCallback(async () => {
    const id = targetRef.trim();
    if (!id) {
      toast.error("Enter a blog post UUID");
      return;
    }
    setBlogResolveLoading(true);
    try {
      const row = (await api.admin.blogGetPost(id)) as Record<string, unknown>;
      const summary: AdminBlogPostRow = {
        id: String(row.id ?? id),
        title: String(row.title ?? ""),
        status: row.status != null ? String(row.status) : undefined,
        path: row.path != null ? String(row.path) : undefined,
        slug: row.slug != null ? String(row.slug) : undefined,
      };
      setBlogResolved(summary);
      toast.success("Post loaded");
    } catch (e) {
      setBlogResolved(null);
      toast.error(e instanceof Error ? e.message : "Post not found");
    } finally {
      setBlogResolveLoading(false);
    }
  }, [targetRef]);

  const removeAssignment = async (id: string) => {
    try {
      await api.seoKeywords.deleteAssignment(id);
      toast.success("Assignment removed");
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove");
    }
  };

  useEffect(() => {
    if (!bulkPrimaryId || bulkSelected.includes(bulkPrimaryId)) return;
    setBulkPrimaryId("");
  }, [bulkPrimaryId, bulkSelected]);

  useEffect(() => {
    if (!bulkOpen) return;
    let cancelled = false;
    setBulkListLoading(true);
    (async () => {
      try {
        const [listRes, clusterRows] = await Promise.all([
          api.seoKeywords.list({
            status: "active",
            limit: 200,
            page: 1,
            ...(bulkClusterFilter.trim() ? { cluster: bulkClusterFilter.trim() } : {}),
          }) as Promise<{ data: SeoKeyword[] }>,
          api.seoKeywords.clusters() as Promise<{ cluster: string }[]>,
        ]);
        if (cancelled) return;
        const names = [...new Set((clusterRows ?? []).map((r) => r.cluster).filter(Boolean))].sort();
        setBulkClusters(names as string[]);
        setBulkKwList(listRes?.data ?? []);
      } catch (e) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Failed to load keywords");
        }
      } finally {
        if (!cancelled) setBulkListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bulkOpen, bulkClusterFilter]);

  const bulkFiltered = useMemo(() => {
    const q = bulkSearch.trim().toLowerCase();
    if (!q) return bulkKwList;
    return bulkKwList.filter((kw) => {
      const display = formatKeywordLabel(kw.keyword).toLowerCase();
      return (
        kw.keyword.toLowerCase().includes(q) ||
        kw.normalized_keyword.toLowerCase().includes(q) ||
        display.includes(q) ||
        (kw.cluster ?? "").toLowerCase().includes(q)
      );
    });
  }, [bulkKwList, bulkSearch]);

  /** Labels for bulk primary picker; only `bulkSelected` ids, sorted for quick scanning. */
  const bulkPrimaryOptions = useMemo(() => {
    const rows = bulkSelected.map((id) => {
      const kw = bulkKwList.find((k) => k.id === id);
      const label = kw ? formatKeywordLabel(kw.keyword) : id;
      return { id, label };
    });
    rows.sort((a, b) => a.label.localeCompare(b.label));
    return rows;
  }, [bulkSelected, bulkKwList]);

  const searchKeywords = useCallback(async (q: string) => {
    if (!q.trim()) {
      setAddKwResults([]);
      return;
    }
    try {
      const res = (await api.seoKeywords.list({ q, limit: 20 })) as {
        data: SeoKeyword[];
      };
      setAddKwResults(res.data ?? []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchKeywords(addKwSearch), 300);
    return () => clearTimeout(t);
  }, [addKwSearch, searchKeywords]);

  const handleAdd = async () => {
    if (!addKwId) {
      toast.error("Select a keyword");
      return;
    }
    if (!targetRef.trim()) {
      toast.error("Set target ref first");
      return;
    }
    setAddLoading(true);
    try {
      const ref =
        targetType === "route" ? normalizeRouteTargetRef(targetRef) : targetRef.trim();
      const result = (await api.seoKeywords.upsertAssignment({
        keyword_id: addKwId,
        target_type: targetType,
        target_ref: ref,
        weight: addWeight,
        is_primary: addPrimary,
      })) as SeoKeywordAssignment;
      setAssignments((prev) => {
        const exists = prev.findIndex((a) => a.id === result.id);
        return exists >= 0
          ? prev.map((a) => (a.id === result.id ? result : a))
          : [...prev, result];
      });
      toast.success("Assignment saved");
      setAddOpen(false);
      setAddKwId("");
      setAddKwSearch("");
      setAddPrimary(false);
      setAddWeight(50);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setAddLoading(false);
    }
  };

  const handleBulkAssign = async () => {
    if (!targetRef.trim()) {
      toast.error("Set target ref first");
      return;
    }
    if (bulkSelected.length === 0) {
      toast.error("Select at least one keyword");
      return;
    }
    if (bulkPrimaryId && !bulkSelected.includes(bulkPrimaryId)) {
      toast.error("Primary must be one of the selected keywords");
      return;
    }
    setBulkSaving(true);
    try {
      const ref =
        targetType === "route" ? normalizeRouteTargetRef(targetRef) : targetRef.trim();
      await api.seoKeywords.bulkUpsertAssignments({
        target_type: targetType,
        target_ref: ref,
        keyword_ids: bulkSelected,
        weight: bulkWeight,
        ...(bulkPrimaryId ? { primary_keyword_id: bulkPrimaryId } : {}),
      });
      toast.success(`${bulkSelected.length} assignment(s) saved`);
      setBulkOpen(false);
      setBulkSearch("");
      setBulkSelected([]);
      setBulkPrimaryId("");
      setBulkWeight(50);
      setBulkClusterFilter("");
      await loadAssignments();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Bulk assign failed");
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Target</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <Label>Target Type</Label>
              <Select
                value={targetType}
                onValueChange={(v) => {
                  const next = v as AssignmentTargetType;
                  setTargetType(next);
                  setFetched(false);
                  setAssignments([]);
                  if (next !== "blog_post") {
                    setBlogResolved(null);
                    setBlogSearchQuery("");
                    setBlogSearchHits([]);
                  }
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 flex-1 min-w-[200px]">
              <Label>Target Ref</Label>
              <Input
                value={targetRef}
                onChange={(e) => {
                  const v = e.target.value;
                  setTargetRef(v);
                  setFetched(false);
                  setAssignments([]);
                  setBlogResolved((prev) => {
                    if (!prev || targetType !== "blog_post") return prev;
                    return prev.id === v.trim() ? prev : null;
                  });
                }}
                placeholder={
                  targetType === "route"
                    ? "/pricing"
                    : targetType === "blog_post"
                      ? "Blog post UUID"
                      : "UUID or identifier"
                }
              />
            </div>

            {targetType === "blog_post" ? (
              <Button
                type="button"
                variant="secondary"
                disabled={!targetRef.trim() || blogResolveLoading}
                onClick={() => void resolveBlogPost()}
              >
                {blogResolveLoading ? "Resolving…" : "Resolve"}
              </Button>
            ) : null}

            <Button onClick={loadAssignments} disabled={!targetRef.trim() || loading}>
              {loading ? "Loading…" : "Load Assignments"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {targetType === "blog_post" && (
        <>
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Blog post keyword assignments</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Use each post&apos;s UUID as <strong>Target Ref</strong> (same as <code className="text-foreground">id</code>{" "}
                in Blog Admin). Click <strong>Resolve</strong> after pasting an id, search below, or choose a recent post.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pick a blog post</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {blogResolved ? (
                <div className="rounded-md border bg-muted/30 px-3 py-3 text-sm space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Resolved target</div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs break-all text-foreground">{blogResolved.id}</span>
                    {blogPostStatusBadge(blogResolved.status)}
                  </div>
                  <div className="font-medium text-foreground">{blogResolved.title || "—"}</div>
                  {(blogResolved.path || blogResolved.slug) && (
                    <div className="text-muted-foreground font-mono text-xs">
                      Path: {blogResolved.path ?? blogResolved.slug}
                    </div>
                  )}
                </div>
              ) : null}

              <div className="space-y-1">
                <Label>Search by title, path, or id</Label>
                <Input
                  value={blogSearchQuery}
                  onChange={(e) => setBlogSearchQuery(e.target.value)}
                  placeholder="Type to filter posts…"
                />
                {blogSearchLoading ? (
                  <p className="text-xs text-muted-foreground">Searching…</p>
                ) : null}
                {blogSearchQuery.trim() ? (
                  blogSearchHits.length === 0 && !blogSearchLoading ? (
                    <p className="text-xs text-muted-foreground">No matches.</p>
                  ) : (
                    <div className="border rounded-md max-h-44 overflow-y-auto divide-y divide-border">
                      {blogSearchHits.map((row) => (
                        <button
                          key={row.id}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted/80 transition-colors"
                          onClick={() => applyBlogPostTarget(row)}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium line-clamp-1">{row.title || "—"}</span>
                            {blogPostStatusBadge(row.status)}
                          </div>
                          <div className="mt-0.5 font-mono text-[11px] text-muted-foreground break-all">
                            {row.id}
                          </div>
                          {(row.path || row.slug) && (
                            <div className="font-mono text-[11px] text-muted-foreground">{row.path ?? row.slug}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )
                ) : null}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-base font-semibold">Recent posts</Label>
                  {blogPostsLoading ? (
                    <span className="text-xs text-muted-foreground">Loading…</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">{blogPostsRecent.length} shown</span>
                  )}
                </div>
                {blogPostsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading posts…</p>
                ) : blogPostsRecent.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No posts in CMS.</p>
                ) : (
                  <div className="rounded-md border overflow-hidden max-h-[min(360px,50vh)] overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[140px]">UUID</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead className="w-[110px]">Status</TableHead>
                          <TableHead className="hidden md:table-cell">Path</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {blogPostsRecent.map((row) => (
                          <TableRow
                            key={row.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => applyBlogPostTarget(row)}
                          >
                            <TableCell className="font-mono text-[10px] align-top break-all max-w-[140px]">
                              {row.id}
                            </TableCell>
                            <TableCell className="font-medium align-top">{row.title || "—"}</TableCell>
                            <TableCell className="align-top">{blogPostStatusBadge(row.status)}</TableCell>
                            <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground align-top">
                              {row.path ?? row.slug ?? "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Click a row to set Target Ref to that post&apos;s id.</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {targetType === "route" && (
        <Card className="border-dashed">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">How route keywords become public SEO</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Use a path like <code className="text-foreground">/</code> or{" "}
              <code className="text-foreground">/pricing</code> (leading slash; home is{" "}
              <code className="text-foreground">/</code>). Mark one keyword as <strong>Primary</strong>
              —its text becomes the page&apos;s default title and a short meta description (
              <span className="italic">
                phrase — {siteName}
              </span>
              ) when you haven&apos;t set
              overrides in Blog Admin → SEO tab.
            </p>
            <p>
              For full control (title, description, canonical, robots, social image), edit that route
              under Blog Admin → SEO — those fields always win over keyword templates.
            </p>
          </CardContent>
        </Card>
      )}

      {fetched && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              {assignments.length} keyword{assignments.length !== 1 ? "s" : ""} assigned
            </h3>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setBulkOpen(true)}>
                <Layers className="h-4 w-4 mr-1.5" />
                Bulk assign…
              </Button>
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Add Assignment
              </Button>
            </div>
          </div>

          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assignments yet for this target.</p>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead className="hidden sm:table-cell">Intent</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Primary</TableHead>
                    <TableHead className="w-16 text-right">Remove</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">
                        {a.keyword?.keyword ?? a.keyword_id}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {a.keyword ? intentBadge(a.keyword.intent) : "—"}
                      </TableCell>
                      <TableCell>{a.weight}</TableCell>
                      <TableCell>
                        {a.is_primary ? (
                          <Badge className="bg-primary/10 text-primary border-primary/30">
                            Primary
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Secondary</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => removeAssignment(a.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* Add assignment dialog */}
      <Dialog open={addOpen} onOpenChange={(v) => !v && setAddOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Keyword Assignment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Search Keyword</Label>
              <Input
                value={addKwSearch}
                onChange={(e) => setAddKwSearch(e.target.value)}
                placeholder="Type to search…"
              />
              {addKwResults.length > 0 && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {addKwResults.map((kw) => (
                    <button
                      key={kw.id}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                        addKwId === kw.id ? "bg-primary/10 font-medium" : ""
                      }`}
                      onClick={() => {
                        setAddKwId(kw.id);
                        setAddKwSearch(kw.keyword);
                        setAddKwResults([]);
                      }}
                    >
                      {kw.keyword}
                      <span className="ml-2 text-xs text-muted-foreground">{kw.intent}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Weight: {addWeight}</Label>
              <Slider
                min={1}
                max={100}
                step={1}
                value={[addWeight]}
                onValueChange={([v]) => setAddWeight(v)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="is-primary"
                checked={addPrimary}
                onCheckedChange={(v) => setAddPrimary(Boolean(v))}
              />
              <Label htmlFor="is-primary">Primary keyword</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={addLoading}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={addLoading || !addKwId}>
              {addLoading ? "Saving…" : "Add Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={bulkOpen}
        onOpenChange={(open) => {
          setBulkOpen(open);
          if (!open) {
            setBulkSearch("");
            setBulkSelected([]);
            setBulkPrimaryId("");
            setBulkPrimaryPickerOpen(false);
            setBulkWeight(50);
            setBulkClusterFilter("");
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>Bulk assign keywords</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground shrink-0">
            Loads up to 200 active keywords at a time. Use cluster filter or search, then check the ones to assign to{" "}
            <span className="font-medium text-foreground">
              {targetType === "route" ? normalizeRouteTargetRef(targetRef) : targetRef.trim() || "…"}
            </span>
            .
          </p>
          <div className="flex flex-1 flex-col gap-5 min-h-0 overflow-y-auto py-1">
            <section className="space-y-4 rounded-lg border border-border/60 bg-muted/30 p-4 dark:bg-muted/20">
              <div className="space-y-2">
                <Label>Cluster (optional)</Label>
                <Select
                  value={bulkClusterFilter || "__all__"}
                  onValueChange={(v) => setBulkClusterFilter(v === "__all__" ? "" : v)}
                >
                  <SelectTrigger className="w-full focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <SelectValue placeholder="All clusters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All clusters</SelectItem>
                    {bulkClusters.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Filter list</Label>
                <Input
                  value={bulkSearch}
                  onChange={(e) => setBulkSearch(e.target.value)}
                  placeholder="Search keyword or cluster…"
                />
              </div>
            </section>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <Badge variant="secondary" className="w-fit shrink-0 font-normal tabular-nums">
                {bulkSelected.length} selected
              </Badge>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const set = new Set(bulkSelected);
                    bulkFiltered.forEach((k) => set.add(k.id));
                    setBulkSelected([...set]);
                  }}
                >
                  Add all filtered ({bulkFiltered.length})
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setBulkSelected([])}>
                  Clear selection
                </Button>
              </div>
            </div>
            <div className="min-h-[280px] max-h-[min(420px,50vh)] overflow-y-auto rounded-md border bg-background divide-y">
              {bulkListLoading ? (
                <p className="text-sm text-muted-foreground p-3">Loading keywords…</p>
              ) : bulkFiltered.length === 0 ? (
                <p className="text-sm text-muted-foreground p-3">No keywords match.</p>
              ) : (
                bulkFiltered.map((kw) => {
                  const checked = bulkSelected.includes(kw.id);
                  const assigned = assignedKeywordIds.has(kw.id);
                  return (
                    <label
                      key={kw.id}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 cursor-pointer"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => {
                          const on = Boolean(v);
                          setBulkSelected((prev) =>
                            on ? (prev.includes(kw.id) ? prev : [...prev, kw.id]) : prev.filter((id) => id !== kw.id),
                          );
                        }}
                      />
                      <span className="text-sm flex-1 truncate" title={kw.keyword}>
                        {formatKeywordLabel(kw.keyword)}
                      </span>
                      {assigned ? (
                        <Badge variant="secondary" className="text-xs shrink-0">
                          Assigned
                        </Badge>
                      ) : null}
                    </label>
                  );
                })
              )}
            </div>
            <section className="space-y-4 border-t border-border pt-5">
              <div className="space-y-3">
                <div className="flex items-baseline justify-between gap-2">
                  <Label htmlFor="bulk-weight">Weight</Label>
                  <span className="text-sm text-muted-foreground tabular-nums">{bulkWeight}</span>
                </div>
                <Slider
                  id="bulk-weight"
                  aria-valuetext={`${bulkWeight}`}
                  min={1}
                  max={100}
                  step={1}
                  value={[bulkWeight]}
                  onValueChange={([v]) => setBulkWeight(v)}
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Relative priority among assignments for this target: the assignments list is sorted with the primary
                  keyword first, then by higher weight. Anything that reads these rows can use the same ordering or treat
                  weight as metadata for future tuning.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bulk-primary-keyword-trigger">Primary keyword (optional)</Label>
                <Popover open={bulkPrimaryPickerOpen} onOpenChange={setBulkPrimaryPickerOpen} modal={false}>
                  <PopoverTrigger asChild>
                    <Button
                      id="bulk-primary-keyword-trigger"
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={bulkPrimaryPickerOpen}
                      aria-haspopup="listbox"
                      aria-label={
                        bulkPrimaryId
                          ? `Primary keyword: ${bulkPrimaryOptions.find((o) => o.id === bulkPrimaryId)?.label ?? bulkPrimaryId}`
                          : "Primary keyword: none (all secondary)"
                      }
                      disabled={bulkSelected.length === 0}
                      className="w-full justify-between font-normal focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:ring-offset-0"
                    >
                      <span className="truncate text-left">
                        {bulkSelected.length === 0
                          ? "Select keywords above first"
                          : bulkPrimaryId
                            ? (bulkPrimaryOptions.find((o) => o.id === bulkPrimaryId)?.label ?? bulkPrimaryId)
                            : "None (all secondary)"}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" aria-hidden />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0 overflow-visible"
                    align="start"
                    sideOffset={4}
                  >
                    <Command
                      shouldFilter
                      className="overflow-visible rounded-md border-0 bg-popover shadow-none"
                    >
                      <CommandInput
                        placeholder="Search selected keywords…"
                        className="h-10 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                      />
                      <CommandList>
                        <CommandEmpty>No keyword matches.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="__none__ none all secondary"
                            onSelect={() => {
                              setBulkPrimaryId("");
                              setBulkPrimaryPickerOpen(false);
                            }}
                          >
                            None (all secondary)
                          </CommandItem>
                          {bulkPrimaryOptions.map(({ id, label }) => (
                            <CommandItem
                              key={id}
                              value={`${label} ${id}`}
                              onSelect={() => {
                                setBulkPrimaryId(id);
                                setBulkPrimaryPickerOpen(false);
                              }}
                            >
                              {label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Choosing a primary clears any other primary for this target, then assigns the batch.
                </p>
              </div>
            </section>
          </div>
          <DialogFooter className="shrink-0 border-t border-border pt-4 mt-2">
            <Button variant="outline" onClick={() => setBulkOpen(false)} disabled={bulkSaving}>
              Cancel
            </Button>
            <Button onClick={() => void handleBulkAssign()} disabled={bulkSaving || bulkSelected.length === 0}>
              {bulkSaving ? "Saving…" : `Assign ${bulkSelected.length} keyword(s)`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Clusters Tab ─────────────────────────────────────────────────────────────

function ClustersTab({ onFilterCluster }: { onFilterCluster: (cluster: string) => void }) {
  const [clusters, setClusters] = useState<ClusterStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = (await api.seoKeywords.clusters()) as ClusterStat[];
        setClusters(data ?? []);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load clusters");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <p className="text-sm text-muted-foreground py-8 text-center">Loading clusters…</p>;
  }

  if (clusters.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No clusters yet. Add keywords with a cluster label.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {clusters.map((c) => (
        <Card
          key={c.cluster}
          className="cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => onFilterCluster(c.cluster)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold truncate">{c.cluster}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{c.count} total</span>
              <span className="text-emerald-600 dark:text-emerald-400">{c.active} active</span>
              {c.paused > 0 && (
                <span className="text-amber-600 dark:text-amber-400">{c.paused} paused</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export function AdminSeoKeywords() {
  const [tab, setTab] = useState("library");
  const [clusterFilter, setClusterFilter] = useState<string | undefined>(undefined);

  const handleClusterFilter = (cluster: string) => {
    setClusterFilter(cluster);
    setTab("library");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">SEO Keywords</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your keyword library, assignments, and clusters.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="clusters">Clusters</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="mt-6">
          <LibraryTab clusterFilter={clusterFilter} />
        </TabsContent>

        <TabsContent value="assignments" className="mt-6">
          <AssignmentsTab />
        </TabsContent>

        <TabsContent value="clusters" className="mt-6">
          <ClustersTab onFilterCluster={handleClusterFilter} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
