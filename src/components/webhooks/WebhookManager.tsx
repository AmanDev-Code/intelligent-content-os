"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  Plus,
  Trash2,
  TestTube,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Webhook,
} from "lucide-react";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";

interface WebhookData {
  id: string;
  url: string;
  events: string[];
  enabled: boolean;
  description: string | null;
  created_at: string;
}

interface DeliveryData {
  id: number;
  event_type: string;
  attempt: number;
  status: string;
  response_status_code: number | null;
  created_at: string;
}

const ALL_EVENTS = [
  { id: "post.published", label: "Post Published" },
  { id: "post.failed", label: "Post Failed" },
  { id: "post.scheduled", label: "Post Scheduled" },
  { id: "post.cancelled", label: "Post Cancelled" },
];

export function WebhookManager() {
  const [webhooks, setWebhooks] = useState<WebhookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newEvents, setNewEvents] = useState<Set<string>>(
    new Set(ALL_EVENTS.map((e) => e.id)),
  );
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<DeliveryData[]>([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  const fetchWebhooks = useCallback(async () => {
    try {
      const res = await api.webhooks.list();
      setWebhooks(Array.isArray(res?.webhooks) ? res.webhooks : []);
    } catch {
      toast.error("Failed to load webhooks");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const handleCreate = async () => {
    if (!newUrl.trim()) {
      toast.error("URL is required");
      return;
    }
    setCreating(true);
    try {
      await api.webhooks.create({
        url: newUrl.trim(),
        events: [...newEvents],
        description: newDescription.trim() || undefined,
      });
      toast.success("Webhook created");
      setCreateOpen(false);
      setNewUrl("");
      setNewDescription("");
      setNewEvents(new Set(ALL_EVENTS.map((e) => e.id)));
      await fetchWebhooks();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create webhook");
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (webhook: WebhookData) => {
    try {
      await api.webhooks.update(webhook.id, { enabled: !webhook.enabled });
      setWebhooks((prev) =>
        prev.map((w) =>
          w.id === webhook.id ? { ...w, enabled: !w.enabled } : w,
        ),
      );
    } catch {
      toast.error("Failed to update webhook");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.webhooks.delete(id);
      toast.success("Webhook deleted");
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
    } catch {
      toast.error("Failed to delete webhook");
    }
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      const res = await api.webhooks.test(id);
      if (res?.success) {
        toast.success(`Test delivery succeeded (HTTP ${res.status})`);
      } else {
        toast.error(
          `Test delivery failed${res?.status ? ` (HTTP ${res.status})` : ""}: ${res?.body?.slice(0, 200) || "No response"}`,
        );
      }
    } catch {
      toast.error("Test delivery failed");
    } finally {
      setTestingId(null);
    }
  };

  const handleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    setDeliveriesLoading(true);
    try {
      const res = await api.webhooks.deliveries(id, 20);
      setDeliveries(Array.isArray(res?.deliveries) ? res.deliveries : []);
    } catch {
      toast.error("Failed to load deliveries");
    } finally {
      setDeliveriesLoading(false);
    }
  };

  const toggleEvent = (eventId: string) => {
    setNewEvents((prev) => {
      const next = new Set(prev);
      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "succeeded":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "failed":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "dead_letter":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
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
          <h3 className="text-base font-semibold">Outbound Webhooks</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Receive HTTP notifications when posts are published, scheduled, or fail.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Webhook
        </Button>
      </div>

      {webhooks.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Webhook className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No webhooks configured yet.</p>
            <p className="text-xs mt-1">
              Add a webhook to receive real-time notifications.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono truncate">
                        {webhook.url}
                      </p>
                      <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                    </div>
                    {webhook.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {webhook.description}
                      </p>
                    )}
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {webhook.events.map((evt) => (
                        <Badge
                          key={evt}
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {evt}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={webhook.enabled}
                      onCheckedChange={() => handleToggle(webhook)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleTest(webhook.id)}
                      disabled={testingId === webhook.id}
                    >
                      {testingId === webhook.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(webhook.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleExpand(webhook.id)}
                    >
                      {expandedId === webhook.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {expandedId === webhook.id && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium mb-2">
                      Recent Deliveries
                    </p>
                    {deliveriesLoading ? (
                      <div className="flex items-center gap-2 py-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-xs text-muted-foreground">
                          Loading...
                        </span>
                      </div>
                    ) : deliveries.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">
                        No deliveries yet.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {deliveries.map((d) => (
                          <div
                            key={d.id}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded bg-muted/30"
                          >
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1.5 py-0 ${statusColor(d.status)}`}
                              >
                                {d.status}
                              </Badge>
                              <span className="text-muted-foreground">
                                {d.event_type}
                              </span>
                              <span className="text-muted-foreground">
                                #{d.attempt}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {d.response_status_code && (
                                <span className="text-muted-foreground">
                                  HTTP {d.response_status_code}
                                </span>
                              )}
                              <span className="text-muted-foreground">
                                {new Date(d.created_at).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Webhook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Endpoint URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://example.com/webhook"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhook-desc">Description (optional)</Label>
              <Input
                id="webhook-desc"
                placeholder="e.g. Slack notification"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Events</Label>
              <div className="space-y-2">
                {ALL_EVENTS.map((evt) => (
                  <label
                    key={evt.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={newEvents.has(evt.id)}
                      onCheckedChange={() => toggleEvent(evt.id)}
                    />
                    <span className="text-sm">{evt.label}</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {evt.id}
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
              disabled={creating || !newUrl.trim() || newEvents.size === 0}
            >
              {creating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Create Webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
