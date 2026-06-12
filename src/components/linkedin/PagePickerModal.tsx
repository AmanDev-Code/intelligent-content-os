"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Building2, Check } from "lucide-react";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";

interface OrgPage {
  organizationUrn: string;
  organizationId: string;
  name: string;
  logoUrl?: string;
  vanityName?: string;
  connected: boolean;
}

interface PagePickerModalProps {
  open: boolean;
  onClose: () => void;
  onConnected: () => void;
}

export function PagePickerModal({ open, onClose, onConnected }: PagePickerModalProps) {
  const [pages, setPages] = useState<OrgPage[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.linkedin.orgPages();
      const fetched = Array.isArray(res?.pages) ? res.pages : [];
      setPages(fetched);
      setSelected(new Set());
    } catch {
      toast.error("Failed to load company pages. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchPages();
    }
  }, [open, fetchPages]);

  const togglePage = (orgId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(orgId)) {
        next.delete(orgId);
      } else {
        next.add(orgId);
      }
      return next;
    });
  };

  const handleConnect = async () => {
    const toConnect = pages.filter(
      (p) => selected.has(p.organizationId) && !p.connected,
    );
    if (toConnect.length === 0) {
      toast.info("No new pages selected to connect.");
      return;
    }

    setConnecting(true);
    try {
      const res = await api.linkedin.connectPages(
        toConnect.map((p) => ({
          organizationUrn: p.organizationUrn,
          organizationId: p.organizationId,
          name: p.name,
          logoUrl: p.logoUrl,
          vanityName: p.vanityName,
        })),
      );
      const results = Array.isArray(res?.results) ? res.results : [];
      const succeeded = results.filter(
        (r: { status: string }) => r.status === "connected",
      ).length;
      const failed = results.filter(
        (r: { status: string }) => r.status === "error",
      ).length;

      if (succeeded > 0) {
        toast.success(
          `${succeeded} company page${succeeded > 1 ? "s" : ""} connected!`,
        );
      }
      if (failed > 0) {
        toast.error(`${failed} page${failed > 1 ? "s" : ""} failed to connect.`);
      }
      onConnected();
      onClose();
    } catch {
      toast.error("Failed to connect pages. Please try again.");
    } finally {
      setConnecting(false);
    }
  };

  const unconnectedSelected = pages.filter(
    (p) => selected.has(p.organizationId) && !p.connected,
  ).length;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Connect Company Pages</DialogTitle>
          <DialogDescription>
            Select the LinkedIn Company Pages you want to post from.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-2 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading pages...
              </span>
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No company pages found.</p>
              <p className="text-xs mt-1">
                You need to be an admin of a LinkedIn Company Page.
              </p>
            </div>
          ) : (
            pages.map((page) => (
              <label
                key={page.organizationId}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  page.connected
                    ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/30"
                    : selected.has(page.organizationId)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                }`}
              >
                {page.connected ? (
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                ) : (
                  <Checkbox
                    checked={selected.has(page.organizationId)}
                    onCheckedChange={() => togglePage(page.organizationId)}
                  />
                )}

                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                  {page.logoUrl ? (
                    <img
                      src={page.logoUrl}
                      alt={page.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{page.name}</p>
                  {page.vanityName && (
                    <p className="text-xs text-muted-foreground truncate">
                      linkedin.com/company/{page.vanityName}
                    </p>
                  )}
                </div>

                {page.connected && (
                  <span className="text-xs text-green-600 font-medium shrink-0">
                    Connected
                  </span>
                )}
              </label>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={connecting}>
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            disabled={connecting || unconnectedSelected === 0}
          >
            {connecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              `Connect${unconnectedSelected > 0 ? ` (${unconnectedSelected})` : ""}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
