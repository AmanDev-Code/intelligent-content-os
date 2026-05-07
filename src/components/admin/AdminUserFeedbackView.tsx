"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp, Bug, Lightbulb, MessageCircle, HelpCircle, Star } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FeedbackType = "bug" | "feature" | "general" | "other";
type FeedbackStatus = "new" | "reviewed" | "resolved";

interface FeedbackItem {
  id: string;
  user_id: string;
  type: FeedbackType;
  message: string;
  rating: number | null;
  status: FeedbackStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  user_email?: string;
  user_name?: string;
}

interface FeedbackStats {
  total: number;
  byType: Record<FeedbackType, number>;
  byStatus: Record<FeedbackStatus, number>;
  avgRating: number | null;
}

const MSG_PREVIEW = 200;

const typeIcons: Record<FeedbackType, React.ReactNode> = {
  bug: <Bug className="h-4 w-4" />,
  feature: <Lightbulb className="h-4 w-4" />,
  general: <MessageCircle className="h-4 w-4" />,
  other: <HelpCircle className="h-4 w-4" />,
};

const typeLabels: Record<FeedbackType, string> = {
  bug: "Bug Report",
  feature: "Feature Request",
  general: "General",
  other: "Other",
};

const statusColors: Record<FeedbackStatus, string> = {
  new: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  reviewed: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  resolved: "bg-green-500/10 text-green-600 border-green-500/20",
};

export function AdminUserFeedbackView() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [data, setData] = useState<{
    items: FeedbackItem[];
    total: number;
    stats: FeedbackStats;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [newStatus, setNewStatus] = useState<FeedbackStatus>("new");
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params: Record<string, string | number> = { page, limit: 15 };
    if (typeFilter !== "all") params.type = typeFilter;
    if (statusFilter !== "all") params.status = statusFilter;

    apiClient
      .get("/platform-admin/user-feedback", { params })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) toast.error("Failed to load feedback");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, typeFilter, statusFilter]);

  const openStatusModal = (item: FeedbackItem) => {
    setSelectedFeedback(item);
    setNewStatus(item.status);
    setAdminNotes(item.admin_notes || "");
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedFeedback) return;

    setUpdating(true);
    try {
      await apiClient.put(`/platform-admin/user-feedback/${selectedFeedback.id}/status`, {
        status: newStatus,
        adminNotes: adminNotes.trim() || undefined,
      });
      toast.success("Status updated");
      setStatusModalOpen(false);

      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.id === selectedFeedback.id
              ? { ...item, status: newStatus, admin_notes: adminNotes.trim() || null }
              : item
          ),
        };
      });
    } catch (e) {
      toast.error("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const items = data?.items ?? [];
  const stats = data?.stats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">User Feedback</h1>
        <p className="text-muted-foreground text-sm mt-1">
          General feedback submissions from users (bug reports, feature requests, etc.)
        </p>
      </div>

      {stats && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="min-h-[88px]">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Total Submissions
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 px-4 pt-0">
              <p className="text-2xl font-semibold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="min-h-[88px]">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                New / Unreviewed
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 px-4 pt-0">
              <p className="text-2xl font-semibold text-blue-600">{stats.byStatus.new}</p>
            </CardContent>
          </Card>
          <Card className="min-h-[88px]">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Bug Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 px-4 pt-0">
              <p className="text-2xl font-semibold text-red-600">{stats.byType.bug}</p>
            </CardContent>
          </Card>
          <Card className="min-h-[88px]">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Avg Rating
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3 px-4 pt-0">
              <p className="text-2xl font-semibold">
                {stats.avgRating != null ? stats.avgRating.toFixed(1) : "—"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="bug">Bug Reports</SelectItem>
            <SelectItem value="feature">Feature Requests</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-8">Loading feedback...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8">No feedback found.</p>
      ) : (
        <ul className="grid gap-4">
          {items.map((row) => {
            const open = expanded[row.id];
            const msg = row.message;
            const truncated =
              msg && msg.length > MSG_PREVIEW ? `${msg.slice(0, MSG_PREVIEW)}...` : msg;

            return (
              <li key={row.id}>
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{typeIcons[row.type]}</span>
                        <span className="font-medium">{typeLabels[row.type]}</span>
                        <Badge
                          variant="outline"
                          className={cn("text-xs", statusColors[row.status])}
                        >
                          {row.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {row.rating && (
                          <span className="flex items-center gap-1 text-amber-500 text-sm">
                            <Star className="h-4 w-4 fill-current" />
                            {row.rating}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {row.created_at?.slice(0, 10)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      From: {row.user_name || row.user_email || row.user_id.slice(0, 8)}
                    </p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
                      {open ? msg : truncated}
                    </p>
                    {msg.length > MSG_PREVIEW && (
                      <button
                        type="button"
                        className="text-xs text-primary mt-2 inline-flex items-center gap-0.5"
                        onClick={() =>
                          setExpanded((e) => ({
                            ...e,
                            [row.id]: !e[row.id],
                          }))
                        }
                      >
                        {open ? (
                          <>
                            <ChevronUp className="h-3 w-3" /> Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3" /> Expand
                          </>
                        )}
                      </button>
                    )}

                    {row.admin_notes && (
                      <div className="mt-3 p-2 bg-muted/50 rounded text-xs">
                        <span className="font-medium">Admin notes:</span> {row.admin_notes}
                      </div>
                    )}

                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openStatusModal(row)}
                      >
                        Update Status
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex justify-between items-center gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </Button>
        <span className="text-xs text-muted-foreground">
          Page {page}
          {data?.total != null ? ` · ${data.total} total` : ""}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={!data?.total || page * 15 >= data.total}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>

      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Feedback Status</DialogTitle>
            <DialogDescription>
              Change the status and add optional admin notes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as FeedbackStatus)}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Admin Notes (optional)</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes about this feedback..."
                className="mt-2 min-h-[80px]"
                maxLength={1000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={updating}>
              {updating ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
