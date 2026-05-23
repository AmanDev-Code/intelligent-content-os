"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Package,
  Link,
  Webhook,
  Ticket,
  Play,
  Clock,
  Activity,
  ExternalLink,
  DollarSign,
  RefreshCcw,
} from "lucide-react";
import { api, clearClientGetCache } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type HealthStatus = "ok" | "degraded" | "error" | "unknown";

interface PolarProductHealth {
  id: string;
  name: string;
  status: HealthStatus;
  priceCount: number;
  lastChecked: string;
}

interface CheckoutLinkHealth {
  id: string;
  label: string;
  url: string;
  status: HealthStatus;
  lastChecked: string;
  responseTimeMs?: number;
}

interface WebhookStatus {
  endpoint: string;
  status: HealthStatus;
  lastDelivery: string | null;
  lastError: string | null;
  successRate: number;
  pendingCount: number;
}

interface DiscountCodeSyncStatus {
  total: number;
  synced: number;
  pending: number;
  error: number;
  lastSyncAt: string | null;
  status: HealthStatus;
}

interface ExchangeRateApiStatus {
  status: HealthStatus;
  lastFetchedAt: string | null;
  apiLastUpdated: string | null;
  currentRate: number | null;
  inrToUsd: number | null;
  apiKeyConfigured: boolean;
  apiUrl: string;
  latencyMs: number | null;
  rateCount: number | null;
  message: string;
}

interface HealthCheckResult {
  polarProducts: {
    products: PolarProductHealth[];
    status: HealthStatus;
    lastChecked: string;
  };
  checkoutLinks: {
    links: CheckoutLinkHealth[];
    status: HealthStatus;
    lastChecked: string;
  };
  webhooks: {
    endpoints: WebhookStatus[];
    status: HealthStatus;
    lastChecked: string;
  };
  discountCodes: DiscountCodeSyncStatus;
  exchangeRateApi: ExchangeRateApiStatus;
  overallStatus: HealthStatus;
}


function statusToIcon(status: HealthStatus) {
  switch (status) {
    case "ok":
      return <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
    case "degraded":
      return <AlertCircle className="h-5 w-5 text-amber-500" />;
    case "error":
      return <XCircle className="h-5 w-5 text-destructive" />;
    default:
      return <Activity className="h-5 w-5 text-muted-foreground" />;
  }
}

function statusToBadge(status: HealthStatus) {
  switch (status) {
    case "ok":
      return (
        <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600">
          OK
        </Badge>
      );
    case "degraded":
      return <Badge variant="outline" className="border-amber-500 text-amber-600">Degraded</Badge>;
    case "error":
      return <Badge variant="destructive">Error</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
}

function formatTimestamp(isoString: string | null): string {
  if (!isoString) return "Never";
  return new Date(isoString).toLocaleString();
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function PaymentHealthMonitor() {
  const [health, setHealth] = useState<HealthCheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [runningScript, setRunningScript] = useState(false);
  const [refreshingForex, setRefreshingForex] = useState(false);

  const checkHealth = useCallback(async () => {
    try {
      // Fetch real data from the backend
      const res = await api.admin.paymentGatewayHealth();
      setHealth(res as HealthCheckResult);
    } catch (error) {
      console.error("Failed to load health status:", error);
      toast.error("Failed to load health status");
      setHealth(null);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    await checkHealth();
    setLoading(false);
  }, [checkHealth]);

  const refresh = async () => {
    setRefreshing(true);
    await checkHealth();
    setRefreshing(false);
    toast.success("Health status refreshed");
  };

  const runCheckoutLinksScript = async () => {
    setRunningScript(true);
    try {
      // This endpoint should regenerate/checkout-links on the backend
      await api.admin.paymentGatewayRunCheckoutLinksScript();
      toast.success("Checkout links script executed successfully");
      await refresh();
    } catch {
      toast.error("Failed to run checkout links script");
    } finally {
      setRunningScript(false);
    }
  };

  const refreshExchangeRate = async () => {
    setRefreshingForex(true);
    try {
      const res = await api.admin.refreshExchangeRate();
      const data = (res as { data?: { usdToInr?: number; count?: number } })?.data;
      clearClientGetCache("/admin/payment-gateway/health");
      clearClientGetCache("/admin/currency/rate");
      await refresh();
      toast.success(
        data?.usdToInr
          ? `Exchange rate refreshed: 1 USD = ${data.usdToInr.toFixed(2)} INR`
          : "Exchange rate refreshed",
      );
    } catch {
      toast.error("Failed to refresh exchange rate");
    } finally {
      setRefreshingForex(false);
    }
  };

  useEffect(() => {
    void load();
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      void checkHealth();
    }, 60000);
    return () => clearInterval(interval);
  }, [load, checkHealth]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading health status…
      </div>
    );
  }

  if (!health) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Unable to load health status.</p>
          <Button onClick={load} variant="outline" className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-none space-y-6">
      {/* Overall Status Header */}
      <Card className={
        health.overallStatus === "ok"
          ? "border-emerald-200 dark:border-emerald-800"
          : health.overallStatus === "degraded"
          ? "border-amber-200 dark:border-amber-800"
          : "border-destructive"
      }>
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={
                "h-12 w-12 rounded-full flex items-center justify-center " +
                (health.overallStatus === "ok"
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                  : health.overallStatus === "degraded"
                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600"
                  : "bg-destructive/10 text-destructive")
              }>
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {health.overallStatus === "ok"
                    ? "All Systems Operational"
                    : health.overallStatus === "degraded"
                    ? "Some Systems Degraded"
                    : "System Errors Detected"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Last checked: {formatTimestamp(health.polarProducts.lastChecked)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
                {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={runCheckoutLinksScript}
                disabled={runningScript}
              >
                {runningScript ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Play className="h-4 w-4 mr-1" />
                )}
                Run checkout script
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Grid */}
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {/* Polar Products Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Polar Products
              </CardTitle>
              {statusToBadge(health.polarProducts.status)}
            </div>
            <CardDescription>{health.polarProducts.products.length} products configured</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {health.polarProducts.products.slice(0, 4).map((product) => (
                <div key={product.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{product.name}</span>
                  {statusToIcon(product.status)}
                </div>
              ))}
              {health.polarProducts.products.length > 4 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{health.polarProducts.products.length - 4} more
                </p>
              )}
            </div>
            <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
              <Clock className="h-3 w-3 inline mr-1" />
              Checked: {formatTimestamp(health.polarProducts.lastChecked)}
            </div>
          </CardContent>
        </Card>

        {/* Checkout Links Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Link className="h-4 w-4" />
                Checkout Links
              </CardTitle>
              {statusToBadge(health.checkoutLinks.status)}
            </div>
            <CardDescription>{health.checkoutLinks.links.length} active links</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {health.checkoutLinks.links.map((link) => (
                <div key={link.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{link.label}</span>
                  <div className="flex items-center gap-2">
                    {link.responseTimeMs && (
                      <span className="text-xs text-muted-foreground">
                        {formatDuration(link.responseTimeMs)}
                      </span>
                    )}
                    {statusToIcon(link.status)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
              <Clock className="h-3 w-3 inline mr-1" />
              Checked: {formatTimestamp(health.checkoutLinks.lastChecked)}
            </div>
          </CardContent>
        </Card>

        {/* Webhooks Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Webhook className="h-4 w-4" />
                Webhooks
              </CardTitle>
              {statusToBadge(health.webhooks.status)}
            </div>
            <CardDescription>{health.webhooks.endpoints.length} endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {health.webhooks.endpoints.map((webhook) => (
                <div key={webhook.endpoint} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-xs">{webhook.endpoint}</span>
                    {statusToIcon(webhook.status)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Success rate: {webhook.successRate.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
              <Clock className="h-3 w-3 inline mr-1" />
              Checked: {formatTimestamp(health.webhooks.lastChecked)}
            </div>
          </CardContent>
        </Card>

        {/* Discount Codes Sync Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Discount Codes
              </CardTitle>
              {statusToBadge(health.discountCodes.status)}
            </div>
            <CardDescription>
              {health.discountCodes.synced}/{health.discountCodes.total} synced
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Synced</span>
                <span className="font-medium text-emerald-600">{health.discountCodes.synced}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium text-amber-600">{health.discountCodes.pending}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Errors</span>
                <span className="font-medium text-destructive">{health.discountCodes.error}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
              <Clock className="h-3 w-3 inline mr-1" />
              Last sync: {formatTimestamp(health.discountCodes.lastSyncAt)}
            </div>
          </CardContent>
        </Card>

        {/* Exchange Rate API Card */}
        <Card className="min-w-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 shrink-0" />
                Forex API
              </CardTitle>
              {statusToBadge(health.exchangeRateApi?.status || 'unknown')}
            </div>
            <CardDescription>
              {health.exchangeRateApi?.apiKeyConfigured
                ? 'Currency exchange API key configured'
                : 'FOREX_API_KEY missing'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 rounded-md border bg-muted/30 p-3">
              <p className="font-mono text-sm font-semibold leading-snug">
                {health.exchangeRateApi?.currentRate
                  ? `1 USD = ${health.exchangeRateApi.currentRate.toFixed(2)} INR`
                  : '1 USD = N/A'}
              </p>
              <p className="font-mono text-xs text-muted-foreground leading-snug">
                {health.exchangeRateApi?.inrToUsd
                  ? `1 INR = ${health.exchangeRateApi.inrToUsd.toFixed(4)} USD`
                  : '1 INR = N/A'}
              </p>
            </div>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Latency</span>
                <span className="font-medium text-right">
                  {health.exchangeRateApi?.latencyMs != null
                    ? formatDuration(health.exchangeRateApi.latencyMs)
                    : 'N/A'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {health.exchangeRateApi?.message || 'No status available'}
              </p>
            </div>
            <div className="mt-3 pt-3 border-t text-xs text-muted-foreground space-y-1">
              <div className="flex items-center justify-between">
                <span>
                  <Clock className="h-3 w-3 inline mr-1" />
                  API: {formatTimestamp(health.exchangeRateApi?.apiLastUpdated ?? null)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={refreshExchangeRate}
                  disabled={refreshingForex}
                  title="Refresh rates from Forex API"
                >
                  {refreshingForex ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCcw className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <div>
                DB sync: {formatTimestamp(health.exchangeRateApi?.lastFetchedAt ?? null)}
                {health.exchangeRateApi?.rateCount != null && (
                  <span className="ml-2">({health.exchangeRateApi.rateCount} rates)</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Status Section */}
      <div className="grid w-full gap-4 lg:grid-cols-2">
        {/* Polar Products Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Polar Products Detail
            </CardTitle>
            <CardDescription>All configured Polar payment products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {health.polarProducts.products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {statusToIcon(product.status)}
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.priceCount} price{product.priceCount !== 1 ? "s" : ""} configured
                      </p>
                    </div>
                  </div>
                  <Badge variant={product.status === "ok" ? "outline" : "secondary"}>
                    {product.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Webhook Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Webhook Delivery Status
            </CardTitle>
            <CardDescription>Recent webhook delivery statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {health.webhooks.endpoints.map((webhook) => (
                <div
                  key={webhook.endpoint}
                  className="flex flex-col p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {statusToIcon(webhook.status)}
                      <span className="font-medium text-sm">{webhook.endpoint}</span>
                    </div>
                    <Badge variant="outline">{webhook.successRate.toFixed(1)}% success</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <span>Last delivery:</span>
                      <span>{formatTimestamp(webhook.lastDelivery)}</span>
                    </div>
                    {webhook.lastError && (
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        <span>Last error: {webhook.lastError}</span>
                      </div>
                    )}
                    {webhook.pendingCount > 0 && (
                      <div className="flex items-center gap-2 text-amber-600">
                        <Clock className="h-3 w-3" />
                        <span>{webhook.pendingCount} pending deliveries</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common troubleshooting and maintenance tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={refresh} disabled={refreshing}>
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Refresh all statuses
            </Button>
            <Button
              variant="outline"
              onClick={runCheckoutLinksScript}
              disabled={runningScript}
            >
              {runningScript ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Play className="h-4 w-4 mr-1" />
              )}
              Run checkout links script
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://polar.sh"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Open Polar Dashboard
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
