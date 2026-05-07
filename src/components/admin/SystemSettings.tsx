"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Database,
  RefreshCw,
  Save,
  Trash2,
  Coins,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";

export function SystemSettings() {
  const [freeCreditLimit, setFreeCreditLimit] = useState<number | null>(null);
  const [freeCreditInput, setFreeCreditInput] = useState("");
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [savingCredits, setSavingCredits] = useState(false);
  const [flushingCache, setFlushingCache] = useState(false);
  const [cleaningStaleJobs, setCleaningStaleJobs] = useState(false);

  const loadFreeCreditLimit = useCallback(async () => {
    try {
      const response = (await apiClient.get("/admin/settings/free-credit-limit")) as {
        success: boolean;
        data: { freeCreditLimit: number };
      };
      if (response.success) {
        setFreeCreditLimit(response.data.freeCreditLimit);
        setFreeCreditInput(String(response.data.freeCreditLimit));
      }
    } catch {
      toast.error("Failed to load free credit limit");
    } finally {
      setLoadingCredits(false);
    }
  }, []);

  useEffect(() => {
    void loadFreeCreditLimit();
  }, [loadFreeCreditLimit]);

  async function handleSaveFreeCreditLimit() {
    const limit = parseInt(freeCreditInput, 10);
    if (isNaN(limit) || limit < 0) {
      toast.error("Please enter a valid non-negative number");
      return;
    }
    if (limit > 100000) {
      toast.error("Limit cannot exceed 100,000");
      return;
    }

    setSavingCredits(true);
    try {
      const response = (await apiClient.put("/admin/settings/free-credit-limit", {
        limit,
      })) as { success: boolean; data: { freeCreditLimit: number } };

      if (response.success) {
        setFreeCreditLimit(response.data.freeCreditLimit);
        toast.success("Free credit limit updated successfully");
      }
    } catch {
      toast.error("Failed to update free credit limit");
    } finally {
      setSavingCredits(false);
    }
  }

  async function handleFlushCache() {
    setFlushingCache(true);
    try {
      const response = (await apiClient.post("/admin/redis/flush")) as {
        success: boolean;
        message: string;
      };

      if (response.success) {
        toast.success("Redis cache flushed successfully");
      }
    } catch {
      toast.error("Failed to flush Redis cache");
    } finally {
      setFlushingCache(false);
    }
  }

  async function handleCleanupStaleJobs() {
    setCleaningStaleJobs(true);
    try {
      const response = (await apiClient.post("/admin/generation/cleanup-stale", {
        maxAgeMinutes: 5,
      })) as {
        success: boolean;
        message: string;
        cleanedCount?: number;
      };

      if (response.success) {
        toast.success(response.message || `Cleaned up ${response.cleanedCount || 0} stale jobs`);
      }
    } catch {
      toast.error("Failed to cleanup stale jobs");
    } finally {
      setCleaningStaleJobs(false);
    }
  }

  const hasUnsavedChanges =
    freeCreditLimit !== null && freeCreditInput !== String(freeCreditLimit);

  return (
    <div className="max-w-2xl space-y-5">
      {/* Free Credit Limit Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            Free User Credit Limit
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Set the global credit limit for free tier users. This overrides the default
            50 credits. Changes apply to all free users immediately.
          </p>

          {loadingCredits ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="free-credit-limit" className="text-sm">
                  Credit Limit
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="free-credit-limit"
                    type="number"
                    min={0}
                    max={100000}
                    value={freeCreditInput}
                    onChange={(e) => setFreeCreditInput(e.target.value)}
                    placeholder="50"
                    className="flex-1 max-w-[200px]"
                  />
                  <Button
                    size="sm"
                    onClick={handleSaveFreeCreditLimit}
                    disabled={savingCredits || !hasUnsavedChanges}
                  >
                    {savingCredits ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5 mr-1.5" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
                {hasUnsavedChanges && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Unsaved changes
                  </p>
                )}
              </div>

              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Current limit:</span>{" "}
                  {freeCreditLimit} credits
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Generation Jobs Management Card */}
      <Card className="border-amber-500/25">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Zap className="h-4 w-4" />
            Generation Jobs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Cleanup Stale Jobs</p>
              <p className="text-xs text-muted-foreground mt-1">
                Remove stuck generation jobs that are older than 5 minutes. Use this if
                users are hitting the &quot;max 5 active jobs&quot; limit due to failed jobs.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
                  disabled={cleaningStaleJobs}
                >
                  {cleaningStaleJobs ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Cleaning...
                    </>
                  ) : (
                    <>
                      <Zap className="h-3.5 w-3.5 mr-1.5" />
                      Cleanup Jobs
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cleanup Stale Generation Jobs?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will mark all generation jobs older than 5 minutes as failed and
                    refund credits to affected users. This helps clear stuck jobs that are
                    blocking new generations.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCleanupStaleJobs}
                    className="bg-amber-600 text-white hover:bg-amber-700"
                  >
                    Cleanup Jobs
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Cache Management Card */}
      <Card className="border-destructive/25">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Cache Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                Flush Redis Cache
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Clear all cached data including user quotas, trending data, and session
                caches. This may temporarily slow down the application.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={flushingCache}
                >
                  {flushingCache ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      Flushing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Flush Cache
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Flush Redis Cache?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will clear all cached data from Redis. This action cannot be
                    undone and may temporarily affect application performance while
                    caches are rebuilt.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleFlushCache}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Flush Cache
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
