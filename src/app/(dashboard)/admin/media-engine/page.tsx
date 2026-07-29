"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cookie,
  RefreshCw,
  Server,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Trash2,
  XCircle,
} from "lucide-react";
import { EventLogViewer } from "@/components/admin/EventLogViewer";
import { useToast } from "@/components/ui/use-toast";
import { useAdminSectionGate } from "@/hooks/useAdminAreaAccess";
import {
  useMediaEngineHealth,
  type CircuitBreaker,
  type MediaEngineAlert,
  type PoolStatus,
  type SessionInfo,
} from "@/hooks/useMediaEngineHealth";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function relativeTime(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function statusColor(status: PoolStatus) {
  switch (status) {
    case "healthy":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
    case "degraded":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
    case "critical":
      return "bg-destructive/15 text-destructive border-destructive/30";
  }
}

function sessionHealthBadge(health: SessionInfo["health"]) {
  switch (health) {
    case "healthy":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
          Healthy
        </Badge>
      );
    case "cooldown":
      return (
        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">
          Cooldown
        </Badge>
      );
    case "dead":
      return <Badge variant="destructive">Dead</Badge>;
    case "checkpoint":
      return (
        <Badge className="bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-500/30">
          Checkpoint
        </Badge>
      );
  }
}

function circuitIcon(state: CircuitBreaker["state"]) {
  switch (state) {
    case "closed":
      return <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
    case "open":
      return <ShieldOff className="h-5 w-5 text-destructive" />;
    case "half-open":
      return <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
  }
}

function circuitBadge(state: CircuitBreaker["state"]) {
  switch (state) {
    case "closed":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
          Closed
        </Badge>
      );
    case "open":
      return <Badge variant="destructive">Open</Badge>;
    case "half-open":
      return (
        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">
          Half-Open
        </Badge>
      );
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MediaEnginePage() {
  const { loading: gateLoading, allowed } = useAdminSectionGate("media");
  const { data, loading, error, refetch, removeSession, resetCircuit, sendTestAlert } =
    useMediaEngineHealth(allowed ? 15000 : 0);
  const { toast } = useToast();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [resettingEngine, setResettingEngine] = useState<string | null>(null);

  // Gate loading
  if (gateLoading || !allowed) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  // Initial loading state
  if (loading && !data) {
    return (
      <div className="flex-1 space-y-4 p-4 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading Media Engine health...
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="flex-1 space-y-4 p-4 sm:p-6">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-base text-destructive flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Failed to load Media Engine health
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="sm" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  const sessions = Array.isArray(data?.sessions) ? data.sessions : [];
  const circuits = data?.circuits && typeof data.circuits === 'object' ? data.circuits : {};
  const alerts = Array.isArray(data?.alerts) ? data.alerts : [];
  const pool = data?.pool ?? { total: 0, healthy: 0, cooldown: 0, dead: 0, checkpoint: 0 };

  const handleRemoveSession = async (accountId: string) => {
    setRemovingId(accountId);
    try {
      await removeSession(accountId);
      toast({
        title: "Session removed",
        description: `Session for ${accountId} has been removed from the pool.`,
      });
    } catch (err) {
      toast({
        title: "Failed to remove session",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setRemovingId(null);
    }
  };

  const handleResetCircuit = async (engine: string) => {
    setResettingEngine(engine);
    try {
      await resetCircuit(engine);
      toast({
        title: "Circuit breaker reset",
        description: `Circuit for ${engine} has been reset.`,
      });
    } catch (err) {
      toast({
        title: "Failed to reset circuit",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setResettingEngine(null);
    }
  };

  return (
    <div className="flex-1 space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Media Engine
          </h1>
          <p className="text-sm text-muted-foreground">
            Session pool health &amp; extraction engine monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await sendTestAlert();
                toast({ title: "Test alert sent", description: "Check your email for the alert." });
              } catch (err) {
                toast({ title: "Failed to send test alert", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
              }
            }}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Test Alert
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-3">
            {data.status === "healthy" && (
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            )}
            {data.status === "degraded" && (
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            )}
            {data.status === "critical" && (
              <XCircle className="h-6 w-6 text-destructive" />
            )}
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold">System Status</span>
              <Badge
                className={statusColor(data.status)}
                aria-label={`System status: ${data.status}`}
              >
                {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Total Sessions"
          value={pool.total}
          icon={<Server className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          label="Healthy"
          value={pool.healthy}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
        />
        <KpiCard
          label="In Cooldown"
          value={pool.cooldown}
          icon={<AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
        />
        <KpiCard
          label="Dead / Checkpoint"
          value={pool.dead + pool.checkpoint}
          icon={<XCircle className="h-4 w-4 text-destructive" />}
        />
      </div>

      {/* Session Pool Table */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base">Session Pool</CardTitle>
          <CardDescription>
            Active extraction sessions and their health
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Server className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No sessions in pool</p>
              <p className="text-xs mt-1">Add accounts via the Chrome extension</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account ID</TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead className="text-right">Requests</TableHead>
                    <TableHead className="text-right">Failures</TableHead>
                    <TableHead className="text-right">
                      <span className="flex items-center justify-end gap-1">
                        <Cookie className="h-3.5 w-3.5" />
                        Cookies
                      </span>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session.accountId}>
                      <TableCell className="font-mono text-xs">
                        {session.accountId}
                      </TableCell>
                      <TableCell>{sessionHealthBadge(session.health)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {relativeTime(session.lastUsed)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {session.totalRequests.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {session.consecutiveFailures > 0 ? (
                          <span className="text-destructive font-medium">
                            {session.consecutiveFailures}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {session.cookieCount}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSession(session.accountId)}
                          disabled={removingId === session.accountId}
                          aria-label={`Remove session ${session.accountId}`}
                        >
                          {removingId === session.accountId ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Circuit Breakers */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Circuit Breakers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.keys(circuits).length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Activity className="h-6 w-6 mb-2 opacity-50" />
              <p className="text-sm">No circuit breakers registered</p>
            </div>
          ) : (
            Object.entries(circuits).map(([engine, circuit]) => (
              <Card key={engine}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {circuitIcon(circuit.state)}
                      <div>
                        <p className="text-sm font-medium">{engine}</p>
                        <div className="mt-1">{circuitBadge(circuit.state)}</div>
                      </div>
                    </div>
                    {circuit.state !== "closed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetCircuit(engine)}
                        disabled={resettingEngine === engine}
                        aria-label={`Reset circuit breaker for ${engine}`}
                      >
                        {resettingEngine === engine ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          "Reset"
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                    <p>Failures: {circuit.failures}</p>
                    {circuit.lastFailure && (
                      <p>Last failure: {relativeTime(circuit.lastFailure)}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Recent Alerts
          </CardTitle>
          <CardDescription>
            Warning and critical events from the extraction engines
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-6 w-6 mb-2 opacity-50" />
              <p className="text-sm">No recent alerts</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <AlertRow key={alert.correlationId} alert={alert} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Log Viewer */}
      <EventLogViewer />
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </span>
          {icon}
        </div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

function AlertRow({ alert }: { alert: MediaEngineAlert }) {
  const action = alert.details?.action as string | undefined;
  const message = alert.details?.message as string | undefined;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
      <div className="mt-0.5">
        {alert.severity === "critical" ? (
          <XCircle className="h-4 w-4 text-destructive" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={alert.severity === "critical" ? "destructive" : "secondary"}
            className={
              alert.severity === "warning"
                ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                : undefined
            }
          >
            {alert.severity}
          </Badge>
          <span className="text-sm font-medium">{alert.event}</span>
          {alert.accountId && (
            <span className="text-xs text-muted-foreground font-mono">
              {alert.accountId}
            </span>
          )}
        </div>
        {action && (
          <p className="text-xs text-muted-foreground mt-1">{action}</p>
        )}
        {message && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {message}
          </p>
        )}
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {relativeTime(alert.timestamp)}
      </span>
    </div>
  );
}
