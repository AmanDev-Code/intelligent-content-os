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
  Loader2,
  RefreshCw,
  Server,
  ShieldCheck,
  ShieldOff,
  Zap,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAdminSectionGate } from "@/hooks/useAdminAreaAccess";
import {
  useTranscriptionHealth,
  type TranscriptionEngine,
  type TranscriptionStatus,
} from "@/hooks/useTranscriptionHealth";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusColor(status: TranscriptionStatus) {
  switch (status) {
    case "healthy":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
    case "degraded":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
    case "critical":
      return "bg-destructive/15 text-destructive border-destructive/30";
  }
}

function statusIcon(status: TranscriptionStatus) {
  switch (status) {
    case "healthy":
      return <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
    case "degraded":
      return <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
    case "critical":
      return <AlertTriangle className="h-5 w-5 text-destructive" />;
  }
}

function engineHealthBadge(engine: TranscriptionEngine) {
  if (!engine.configured) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Not configured
      </Badge>
    );
  }
  if (engine.circuitOpen) {
    return <Badge variant="destructive">Circuit open</Badge>;
  }
  if (!engine.healthy) {
    return (
      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30">
        Unhealthy
      </Badge>
    );
  }
  return (
    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
      Healthy
    </Badge>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TranscriptionHealthPage() {
  const { loading: gateLoading, allowed } = useAdminSectionGate("media");
  const { data, loading, error, refetch, resetCircuit, probeEngine } =
    useTranscriptionHealth(15000);
  const { toast } = useToast();
  const [probing, setProbing] = useState<string | null>(null);
  const [resetting, setResetting] = useState<string | null>(null);

  if (gateLoading || !allowed) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={refetch}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const handleResetCircuit = async (engine: string) => {
    setResetting(engine);
    try {
      await resetCircuit(engine);
      toast({ title: "Circuit reset", description: `${engine} circuit breaker has been reset.` });
    } catch (err) {
      toast({ title: "Reset failed", description: String(err), variant: "destructive" });
    } finally {
      setResetting(null);
    }
  };

  const handleProbe = async (engine: string) => {
    setProbing(engine);
    try {
      const result = await probeEngine(engine);
      if (result?.success) {
        toast({
          title: "Probe succeeded",
          description: `${engine} responded in ${result.latencyMs ?? "?"}ms`,
        });
      } else {
        toast({
          title: "Probe failed",
          description: result?.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({ title: "Probe error", description: String(err), variant: "destructive" });
    } finally {
      setProbing(null);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold tracking-tight">
            Transcription Engines
          </h1>
          <p className="text-sm text-muted-foreground">
            Health monitoring for AI transcription services (ElevenLabs, Deepgram, Google STT, AWS Transcribe, Faster-Whisper)
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Overall status card */}
      {data && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              {statusIcon(data.status)}
              <div>
                <CardTitle className="text-lg">System Status</CardTitle>
                <CardDescription>
                  Last updated: {new Date(data.timestamp).toLocaleTimeString()}
                </CardDescription>
              </div>
              <Badge className={`ml-auto ${statusColor(data.status)}`}>
                {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold">{data.totalEngines}</p>
                <p className="text-xs text-muted-foreground">Total engines</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold">{data.configuredCount}</p>
                <p className="text-xs text-muted-foreground">Configured</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {data.healthyCount}
                </p>
                <p className="text-xs text-muted-foreground">Healthy</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold text-destructive">
                  {data.configuredCount - data.healthyCount}
                </p>
                <p className="text-xs text-muted-foreground">Degraded</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Engine table */}
      {data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Engine Details
            </CardTitle>
            <CardDescription>
              Individual engine health, circuit breaker state, and ENV configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Engine</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead>Circuit</TableHead>
                  <TableHead>ENV</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.engines.map((engine) => (
                  <TableRow key={engine.name}>
                    <TableCell className="font-medium">{engine.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">#{engine.priority}</Badge>
                    </TableCell>
                    <TableCell>{engineHealthBadge(engine)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {engine.circuitOpen ? (
                          <ShieldOff className="h-4 w-4 text-destructive" />
                        ) : (
                          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        )}
                        <span className="text-sm">
                          {engine.circuitOpen ? "Open" : "Closed"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(engine.envConfigured).map(([key, ok]) => (
                          <Badge
                            key={key}
                            variant="outline"
                            className={
                              ok
                                ? "border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                                : "border-destructive/30 text-destructive"
                            }
                          >
                            {ok ? "✓" : "✗"} {key.replace(/^(ELEVENLABS_|DEEPGRAM_|GOOGLE_CLOUD_|AWS_TRANSCRIBE_|TRANSCRIPTION_)/, "")}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={probing === engine.name}
                          onClick={() => handleProbe(engine.name)}
                        >
                          {probing === engine.name ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <Zap className="mr-1 h-3 w-3" />
                          )}
                          Probe
                        </Button>
                        {engine.circuitOpen && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={resetting === engine.name}
                            onClick={() => handleResetCircuit(engine.name)}
                          >
                            {resetting === engine.name ? (
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            ) : (
                              <Activity className="mr-1 h-3 w-3" />
                            )}
                            Reset
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
