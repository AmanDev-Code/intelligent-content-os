"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Search,
  Users,
  UserMinus,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  status: string;
  source: string;
  tags: string[];
  subscribed_at: string;
  created_at: string;
}

export function SubscriberManager() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const limit = 25;

  const loadSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/admin/newsletter/subscribers", {
        params: {
          page,
          limit,
          status: statusFilter || undefined,
          search: search || undefined,
        },
      });
      setSubscribers((res as any).subscribers || []);
      setTotal((res as any).total || 0);
    } catch {
      setSubscribers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    loadSubscribers();
  }, [loadSubscribers]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const handleUnsubscribe = async (email: string) => {
    if (!confirm(`Unsubscribe ${email}?`)) return;
    try {
      await apiClient.post(`/admin/newsletter/subscribers/${encodeURIComponent(email)}/unsubscribe`);
      loadSubscribers();
    } catch (err: any) {
      alert(err?.message || "Failed to unsubscribe");
    }
  };

  const handleExport = () => {
    const csv = [
      ["Email", "Name", "Status", "Source", "Subscribed At"].join(","),
      ...subscribers.map((s) =>
        [
          s.email,
          s.name || "",
          s.status,
          s.source,
          new Date(s.subscribed_at).toISOString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(total / limit);

  const statusColor: Record<string, string> = {
    enabled: "bg-emerald-100 text-emerald-700",
    disabled: "bg-gray-100 text-gray-600",
    blocklisted: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="">All Status</option>
            <option value="enabled">Active</option>
            <option value="disabled">Unsubscribed</option>
            <option value="blocklisted">Blocklisted</option>
          </select>
        </div>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : subscribers.length === 0 ? (
        <Card className="border border-border/60 shadow-none">
          <CardContent className="py-12 text-center">
            <Users className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No subscribers found
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {search || statusFilter
                ? "Try adjusting your filters"
                : "Subscribers will appear here when people sign up"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="border border-border/60 shadow-none">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-5 py-3">
                        Email
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-5 py-3">
                        Name
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-5 py-3">
                        Status
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-5 py-3">
                        Source
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-5 py-3">
                        Subscribed
                      </th>
                      <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wide px-5 py-3">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {subscribers.map((sub) => (
                      <tr
                        key={sub.id}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <span className="text-sm font-medium">{sub.email}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm text-muted-foreground">
                            {sub.name || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs capitalize",
                              statusColor[sub.status] ?? ""
                            )}
                          >
                            {sub.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm text-muted-foreground">
                            {sub.source}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm text-muted-foreground">
                            {new Date(sub.subscribed_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {sub.status === "enabled" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnsubscribe(sub.email)}
                              className="h-8 text-destructive hover:text-destructive"
                            >
                              <UserMinus className="h-3.5 w-3.5 mr-1" />
                              Unsubscribe
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1}-
              {Math.min(page * limit, total)} of {total} subscribers
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
