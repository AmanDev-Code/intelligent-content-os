"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Network, Plus, Sparkles, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";
import { ClusterCard } from "./ClusterCard";

type ClusterRow = {
  id: string;
  name: string;
  pillar_keyword: string;
  description: string | null;
  status: string;
  created_at: string;
  content_cluster_articles: {
    id: string;
    keyword: string;
    status: string;
    is_pillar: boolean;
    post_id: string | null;
  }[];
};

export function ClustersSection() {
  const { toast } = useToast();
  const [clusters, setClusters] = useState<ClusterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", pillar_keyword: "", description: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.get("/admin/content-engine/clusters");
      setClusters(Array.isArray(data) ? (data as ClusterRow[]) : []);
    } catch {
      setClusters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.pillar_keyword.trim()) return;
    setCreating(true);
    try {
      await apiClient.post("/admin/content-engine/clusters", {
        name: form.name.trim(),
        pillar_keyword: form.pillar_keyword.trim(),
        description: form.description.trim() || undefined,
      });
      toast({ title: "Cluster created" });
      setShowCreate(false);
      setForm({ name: "", pillar_keyword: "", description: "" });
      load();
    } catch {
      toast({ title: "Failed to create cluster", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const handleGenerate = async (clusterId: string) => {
    try {
      await apiClient.post(`/admin/content-engine/clusters/${clusterId}/generate`, {});
      toast({ title: "Cluster suggestions generated" });
      load();
    } catch {
      toast({ title: "Failed to generate suggestions", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Content Clusters</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organize content into pillar + supporting article groups
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Cluster
        </Button>
      </div>

      <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Network className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                What Happens
              </p>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1.5">
                <li><strong>Clusters group related articles:</strong> One pillar article + multiple supporting posts around a topic</li>
                <li><strong>Helps topical authority:</strong> Search engines see you cover a topic comprehensively with interconnected content</li>
                <li><strong>Articles should link to each other:</strong> Use Internal Links to connect cluster members</li>
                <li><strong>Track completion:</strong> See which support articles are planned vs. published</li>
                <li><strong>Add missing articles:</strong> Identify content gaps and create new posts to complete the cluster</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : clusters.length === 0 ? (
        <Card className="border border-border/60 shadow-none">
          <CardContent className="py-12 text-center">
            <Network className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No clusters yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create a cluster to organize related articles around a pillar topic
            </p>
            <Button onClick={() => setShowCreate(true)} variant="outline" className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Create First Cluster
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {clusters.map((cluster) => (
            <ClusterCard key={cluster.id} cluster={cluster} onGenerate={handleGenerate} />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Content Cluster</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cluster-name">Cluster Name</Label>
              <Input
                id="cluster-name"
                placeholder="e.g., Content Marketing"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pillar-keyword">Pillar Keyword</Label>
              <Input
                id="pillar-keyword"
                placeholder="e.g., content marketing strategy"
                value={form.pillar_keyword}
                onChange={(e) => setForm((p) => ({ ...p, pillar_keyword: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cluster-desc">Description (optional)</Label>
              <Textarea
                id="cluster-desc"
                placeholder="Brief description of this content cluster..."
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating} className="gap-2">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
