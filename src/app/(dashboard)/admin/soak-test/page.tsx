"use client";

/**
 * Soak Test Monitoring Dashboard (Sprint 1.10)
 *
 * Real-time monitoring for LinkedIn publishing soak test:
 * - Success rate, latency, queue depth, DLQ count
 * - Charts: success rate over time, latency distribution
 * - Alerts: success rate < 99%, DLQ has items, queue stuck
 * - Export report as JSON
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Download, RefreshCw, TrendingUp, Clock, AlertTriangle, Play, Square } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/components/ui/use-toast";

interface SoakTestStats {
  totalScheduled: number;
  published: number;
  failed: number;
  processing: number;
  successRate: number;
  meanLatencySeconds: number;
  p50LatencySeconds: number;
  p95LatencySeconds: number;
  p99LatencySeconds: number;
  queueDepth: number;
  dlqCount: number;
  tokenRefreshEvents: number;
  webhookSuccessRate: number;
}

interface SoakTestStatus {
  status: "idle" | "running" | "completed" | "failed";
  startedAt: string | null;
  elapsedMs: number;
  elapsedHours: number;
  progressPercent: number;
  estimatedRemainingMs: number;
  estimatedRemainingHours: number;
}

interface Alert {
  id: string;
  severity: "error" | "warning" | "info";
  message: string;
  timestamp: string;
}

export default function SoakTestDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<SoakTestStats | null>(null);
  const [testStatus, setTestStatus] = useState<SoakTestStatus | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [startingTest, setStartingTest] = useState(false);
  const [stoppingTest, setStoppingTest] = useState(false);

  // Fetch stats from backend
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get("/admin/soak-test/stats");
      setStats(response as SoakTestStats);

      checkAlerts(response as SoakTestStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  // Fetch test status
  const fetchTestStatus = async () => {
    try {
      const response = await apiClient.get("/admin/soak-test/status");
      if (response.data) {
        setTestStatus(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch test status:", err);
    }
  };

  // Start soak test
  const handleStartSoakTest = async () => {
    try {
      setStartingTest(true);
      await apiClient.post("/admin/soak-test/start");
      toast({
        title: "Soak Test Started",
        description: "The 7-hour soak test is now running. Check back for progress.",
      });
      await fetchTestStatus();
    } catch (err) {
      toast({
        title: "Failed to Start",
        description: err instanceof Error ? err.message : "Failed to start soak test",
        variant: "destructive",
      });
    } finally {
      setStartingTest(false);
    }
  };

  // Stop soak test
  const handleStopSoakTest = async () => {
    try {
      setStoppingTest(true);
      await apiClient.post("/admin/soak-test/stop");
      toast({
        title: "Soak Test Stopped",
        description: "The soak test has been stopped.",
      });
      await fetchTestStatus();
    } catch (err) {
      toast({
        title: "Failed to Stop",
        description: err instanceof Error ? err.message : "Failed to stop soak test",
        variant: "destructive",
      });
    } finally {
      setStoppingTest(false);
    }
  };

  // Check for alert conditions
  const checkAlerts = (currentStats: SoakTestStats) => {
    const newAlerts: Alert[] = [];

    if (currentStats.successRate < 99) {
      newAlerts.push({
        id: "success-rate-low",
        severity: "error",
        message: `Success rate ${currentStats.successRate.toFixed(2)}% is below 99% threshold`,
        timestamp: new Date().toISOString(),
      });
    }

    if (currentStats.dlqCount > 0) {
      newAlerts.push({
        id: "dlq-has-items",
        severity: "error",
        message: `DLQ has ${currentStats.dlqCount} items - investigate failures`,
        timestamp: new Date().toISOString(),
      });
    }

    if (currentStats.queueDepth > 100) {
      newAlerts.push({
        id: "queue-depth-high",
        severity: "warning",
        message: `Queue depth ${currentStats.queueDepth} is high - possible bottleneck`,
        timestamp: new Date().toISOString(),
      });
    }

    if (currentStats.meanLatencySeconds > 60) {
      newAlerts.push({
        id: "latency-high",
        severity: "warning",
        message: `Mean latency ${currentStats.meanLatencySeconds.toFixed(1)}s exceeds 60s target`,
        timestamp: new Date().toISOString(),
      });
    }

    if (currentStats.webhookSuccessRate < 95 && currentStats.webhookSuccessRate > 0) {
      newAlerts.push({
        id: "webhook-failures",
        severity: "warning",
        message: `Webhook delivery rate ${currentStats.webhookSuccessRate.toFixed(1)}% is below 95%`,
        timestamp: new Date().toISOString(),
      });
    }

    setAlerts(newAlerts);
  };

  // Export report as JSON
  const exportReport = async () => {
    if (!stats) return;

    const report = {
      timestamp: new Date().toISOString(),
      stats,
      alerts,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `soak-test-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Auto-refresh every 10 seconds
  useEffect(() => {
    fetchStats();
    fetchTestStatus();

    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchStats();
        fetchTestStatus();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading && !stats) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">Loading soak test stats...</span>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Stats</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={fetchStats}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isHealthy = stats ? stats.successRate >= 99.9 && stats.dlqCount === 0 : false;

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Soak Test Monitor</h1>
          <p className="text-muted-foreground">
            Sprint 1.10 - LinkedIn Publishing Infrastructure
          </p>
        </div>
        <div className="flex items-center gap-2">
          {testStatus?.status === "running" ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleStopSoakTest}
              disabled={stoppingTest}
            >
              <Square className="h-4 w-4 mr-2" />
              {stoppingTest ? "Stopping..." : "Stop Test"}
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleStartSoakTest}
              disabled={startingTest}
            >
              <Play className="h-4 w-4 mr-2" />
              {startingTest ? "Starting..." : "Start 7-Hour Test"}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`}
            />
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Button>
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Test Status Card */}
      {testStatus && testStatus.status !== "idle" && (
        <Card className={
          testStatus.status === "running" ? "border-blue-500" :
          testStatus.status === "completed" ? "border-green-500" :
          "border-red-500"
        }>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testStatus.status === "running" && (
                <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
              )}
              {testStatus.status === "completed" && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              {testStatus.status === "failed" && (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              Test Status: {testStatus.status.toUpperCase()}
            </CardTitle>
            <CardDescription>
              {testStatus.status === "running" && (
                <>
                  Running for {testStatus.elapsedHours.toFixed(1)} hours • {testStatus.progressPercent.toFixed(1)}% complete • ~{testStatus.estimatedRemainingHours.toFixed(1)} hours remaining
                </>
              )}
              {testStatus.status === "completed" && (
                <>Test completed after {testStatus.elapsedHours.toFixed(1)} hours</>
              )}
              {testStatus.status === "failed" && (
                <>Test failed after {testStatus.elapsedHours.toFixed(1)} hours</>
              )}
            </CardDescription>
          </CardHeader>
          {testStatus.status === "running" && (
            <CardContent>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(testStatus.progressPercent, 100)}%` }}
                />
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Overall Status */}
      <Card className={isHealthy ? "border-green-500" : "border-amber-500"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isHealthy ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            )}
            Overall Status: {isHealthy ? "HEALTHY" : "DEGRADED"}
          </CardTitle>
          <CardDescription>
            Target: ≥99.9% success rate, ±60s latency, 0 DLQ items
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="border-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Active Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800"
              >
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                <Badge
                  variant={alert.severity === "error" ? "destructive" : "secondary"}
                >
                  {alert.severity}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Posts"
          value={stats?.totalScheduled || 0}
          subtitle={`${stats?.published || 0} published`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatCard
          title="Success Rate"
          value={`${stats?.successRate.toFixed(2) || 0}%`}
          subtitle="Target: ≥99.9%"
          icon={<CheckCircle2 className="h-4 w-4" />}
          status={stats && stats.successRate >= 99.9 ? "success" : "warning"}
        />
        <StatCard
          title="Mean Latency"
          value={`${stats?.meanLatencySeconds.toFixed(1) || 0}s`}
          subtitle={`P95: ${stats?.p95LatencySeconds.toFixed(1) || 0}s`}
          icon={<Clock className="h-4 w-4" />}
          status={stats && stats.meanLatencySeconds <= 60 ? "success" : "warning"}
        />
        <StatCard
          title="DLQ Count"
          value={stats?.dlqCount || 0}
          subtitle="Failed after retries"
          icon={<AlertCircle className="h-4 w-4" />}
          status={stats && stats.dlqCount === 0 ? "success" : "error"}
        />
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Queue Health</CardTitle>
            <CardDescription>BullMQ publish queue status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetricRow label="Queue Depth" value={stats?.queueDepth || 0} />
            <MetricRow label="Processing" value={stats?.processing || 0} />
            <MetricRow label="Failed" value={stats?.failed || 0} />
            <MetricRow label="Published" value={stats?.published || 0} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latency Distribution</CardTitle>
            <CardDescription>Publish time accuracy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetricRow
              label="Mean"
              value={`${stats?.meanLatencySeconds.toFixed(1) || 0}s`}
            />
            <MetricRow
              label="P50 (Median)"
              value={`${stats?.p50LatencySeconds.toFixed(1) || 0}s`}
            />
            <MetricRow
              label="P95"
              value={`${stats?.p95LatencySeconds.toFixed(1) || 0}s`}
            />
            <MetricRow
              label="P99"
              value={`${stats?.p99LatencySeconds.toFixed(1) || 0}s`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Events</CardTitle>
            <CardDescription>Infrastructure activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetricRow
              label="Token Refreshes"
              value={stats?.tokenRefreshEvents || 0}
            />
            <MetricRow
              label="Webhook Success"
              value={`${stats?.webhookSuccessRate.toFixed(1) || 0}%`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>Current soak test settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetricRow
              label="Mock Mode"
              value={
                <Badge variant="secondary">
                  {process.env.NEXT_PUBLIC_MOCK_LINKEDIN === "true" ? "ENABLED" : "DISABLED"}
                </Badge>
              }
            />
            <MetricRow label="Duration" value="7 days" />
            <MetricRow label="Test Users" value="2" />
            <MetricRow label="Target Posts" value="100+" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper component for stat cards
function StatCard({
  title,
  value,
  subtitle,
  icon,
  status,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  status?: "success" | "warning" | "error";
}) {
  const statusColors = {
    success: "text-green-600 dark:text-green-400",
    warning: "text-amber-600 dark:text-amber-400",
    error: "text-red-600 dark:text-red-400",
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={status ? statusColors[status] : ""}>{icon}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

// Helper component for metric rows
function MetricRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
