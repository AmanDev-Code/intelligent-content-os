"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/apiClient";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";

export function AdminUsersDirectory() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [listVersion, setListVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiClient
      .get("/platform-admin/users", {
        params: { page, limit: 20, q: search || undefined },
      })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, search, listVersion]);

  const setStatus = async (userId: string, status: string) => {
    try {
      await apiClient.patch(`/platform-admin/users/${userId}/status`, {
        status,
      });
      toast.success(`Updated to ${status}`);
      setListVersion((v) => v + 1);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Directory</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Search profiles and adjust account status.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 max-w-xl">
        <Input
          placeholder="Search username or name"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setSearch(q.trim());
              setPage(1);
            }
          }}
        />
        <Button
          type="button"
          onClick={() => {
            setSearch(q.trim());
            setPage(1);
          }}
        >
          Search
        </Button>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading users…</p>
          ) : items.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No users match.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((row: any) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Link
                        href={`/admin/users/${row.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {row.username || "—"}
                      </Link>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {row.full_name || row.id}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{row.plan}</TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {row.quota != null && typeof row.quota.remainingCredits === "number"
                        ? row.quota.remainingCredits
                        : row.credits_remaining}
                    </TableCell>
                    <TableCell className="text-sm capitalize">
                      {row.account_status || "active"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={row.account_status || "active"}
                        onValueChange={(v) => void setStatus(row.id, v)}
                      >
                        <SelectTrigger className="w-[140px] ml-auto h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="banned">Banned</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center gap-2">
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
          disabled={!data?.total || page * 20 >= data.total}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
