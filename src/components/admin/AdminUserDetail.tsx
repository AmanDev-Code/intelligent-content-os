"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  plan: string | null;
  account_status: string | null;
  credits_remaining: number | null;
  created_at: string;
  updated_at?: string | null;
};

type SubscriptionRow = {
  plan_type: string;
  billing_cycle: string;
  credits_limit: number | null;
  is_active: boolean | null;
  paddle_subscription_id?: string | null;
  paddle_customer_id?: string | null;
} | null;

type BillingRow = {
  id: string;
  paddle_transaction_id: string;
  invoice_number: string | null;
  status: string;
  amount: number | string;
  currency: string;
  invoice_url: string | null;
  issued_at: string | null;
};

/** Canonical AI credits: same row as `/quota` and billing — `user_quota_view` via backend `quota` object. */
type QuotaPayload = {
  remainingCredits: number;
  usedCredits: number;
  totalCredits: number;
  percentageUsed: number;
  planType: string;
  resetDate: string;
};

function parseQuotaPayload(raw: unknown): QuotaPayload | null {
  if (raw == null || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const remainingCredits = Number(o.remainingCredits ?? o.remaining_credits);
  const usedCredits = Number(o.usedCredits ?? o.used_credits);
  const totalCredits = Number(o.totalCredits ?? o.total_credits);
  const percentageUsed = Number(o.percentageUsed ?? o.percentage_used);
  const planType = String(o.planType ?? o.plan_type ?? "free");
  const resetRaw = o.resetDate ?? o.reset_date;
  const resetDate =
    typeof resetRaw === "string"
      ? resetRaw
      : resetRaw instanceof Date
        ? resetRaw.toISOString()
        : "";
  if (
    ![remainingCredits, usedCredits, totalCredits, percentageUsed].every(Number.isFinite)
  ) {
    return null;
  }
  return {
    remainingCredits,
    usedCredits,
    totalCredits,
    percentageUsed,
    planType,
    resetDate: resetDate || new Date().toISOString(),
  };
}

export function AdminUserDetail({
  userId,
  superAdmin,
}: {
  userId: string;
  superAdmin: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [quota, setQuota] = useState<QuotaPayload | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionRow>(null);
  const [billing, setBilling] = useState<{ items: BillingRow[]; source: string } | null>(
    null,
  );

  const [creditDelta, setCreditDelta] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [planType, setPlanType] = useState("standard");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [detail, inv] = await Promise.all([
        apiClient.get(`/platform-admin/users/${userId}`),
        apiClient.get(`/platform-admin/users/${userId}/billing`).catch(() => null),
      ]);
      setProfile(detail.profile as ProfileRow);
      setQuota(parseQuotaPayload((detail as { quota?: unknown }).quota));
      setSubscription((detail.subscription ?? null) as SubscriptionRow);
      if (inv && typeof inv === "object" && Array.isArray((inv as { items?: unknown }).items)) {
        setBilling(inv as { items: BillingRow[]; source: string });
      } else {
        setBilling(null);
      }
      const sub = detail.subscription as { plan_type?: string; billing_cycle?: string } | null;
      if (sub?.plan_type) setPlanType(sub.plan_type);
      if (sub?.billing_cycle === "monthly" || sub?.billing_cycle === "yearly") {
        setBillingCycle(sub.billing_cycle);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load user");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const applyCredits = async () => {
    const delta = Number.parseInt(creditDelta, 10);
    if (!Number.isFinite(delta) || delta === 0) {
      toast.error("Enter a non-zero integer delta");
      return;
    }
    try {
      await apiClient.patch(`/platform-admin/users/${userId}/credits`, {
        delta,
        reason: creditReason.trim() || undefined,
      });
      toast.success("Credits updated");
      setCreditDelta("");
      setCreditReason("");
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  const applyPlan = async () => {
    try {
      await apiClient.patch(`/platform-admin/users/${userId}/plan`, {
        planType,
        billingCycle,
      });
      toast.success("Plan updated");
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading user…</p>;
  }

  if (!profile) {
    return <p className="text-sm text-destructive">User not found.</p>;
  }

  const invoices = billing?.items ?? [];

  return (
    <div className="max-w-4xl space-y-8 pb-16">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/users?tab=directory"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Directory
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight mt-2">
            {profile.username || "User"}
          </h1>
          <p className="text-muted-foreground text-sm">{profile.full_name || profile.id}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Plan (profile)</span>
              <span className="font-medium">{profile.plan ?? "—"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Credits remaining</span>
              <span className="font-medium tabular-nums">
                {quota != null ? quota.remainingCredits : "—"}
              </span>
            </div>
            {quota != null ? (
              <p className="text-[11px] text-muted-foreground leading-snug">
                Same source as Billing and the app sidebar: plan limit minus usage this billing
                period ({quota.usedCredits.toFixed(1)} / {quota.totalCredits} used).
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground leading-snug">
                Quota unavailable. Profile credits_remaining (may lag the ledger):{" "}
                {profile.credits_remaining ?? "—"}
              </p>
            )}
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium capitalize">{profile.account_status || "active"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Joined</span>
              <span className="text-xs">{new Date(profile.created_at).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscription (DB)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {subscription ? (
              <>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Plan</span>
                  <span className="font-medium">{subscription.plan_type}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Billing</span>
                  <span className="font-medium">{subscription.billing_cycle}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Credits limit</span>
                  <span className="tabular-nums">{subscription.credits_limit ?? "—"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Paddle sub</span>
                  <span className="text-xs truncate max-w-[180px]">
                    {subscription.paddle_subscription_id || "—"}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No row in user_subscriptions.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {superAdmin ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Adjust credits</CardTitle>
              <p className="text-xs text-muted-foreground">
                Sends an in-app notification only (no email).
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="delta">Delta (+/-)</Label>
                <Input
                  id="delta"
                  inputMode="numeric"
                  placeholder="e.g. 500 or -100"
                  value={creditDelta}
                  onChange={(e) => setCreditDelta(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="reason">Reason (optional)</Label>
                <Input
                  id="reason"
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  placeholder="Support adjustment"
                />
              </div>
              <Button type="button" onClick={() => void applyCredits()}>
                Apply credits
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Set plan (database)</CardTitle>
              <p className="text-xs text-muted-foreground">
                Overrides subscription row; does not call Paddle. User gets an in-app notice.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label>Plan</Label>
                <Select value={planType} onValueChange={setPlanType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">free</SelectItem>
                    <SelectItem value="standard">standard</SelectItem>
                    <SelectItem value="pro">pro</SelectItem>
                    <SelectItem value="ultimate">ultimate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Billing cycle</Label>
                <Select
                  value={billingCycle}
                  onValueChange={(v) => setBillingCycle(v as "monthly" | "yearly")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">monthly</SelectItem>
                    <SelectItem value="yearly">yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" onClick={() => void applyPlan()}>
                Save plan
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Super-admin actions (credit refill, plan override) are hidden — delegated staff can view
          directory data only.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment history</CardTitle>
          <p className="text-xs text-muted-foreground">
            Rows from <code className="text-[11px]">billing_invoices</code> (Paddle webhook). If
            empty, billing history is not synced to the database yet.
          </p>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {invoices.length === 0 ? (
            <div className="p-6 space-y-2">
              <p className="text-sm text-muted-foreground">
                No stored Paddle invoices for this user yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Connect Paddle history: ensure webhooks persist to{" "}
                <code className="text-[11px]">billing_invoices</code>, or open Paddle Billing for
                this customer using the IDs above when present.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Issued</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {inv.issued_at ? new Date(inv.issued_at).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {inv.amount} {inv.currency}
                    </TableCell>
                    <TableCell className="text-sm capitalize">{inv.status}</TableCell>
                    <TableCell className="text-right">
                      {inv.invoice_url ? (
                        <a
                          href={inv.invoice_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary text-sm hover:underline"
                        >
                          Open
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
