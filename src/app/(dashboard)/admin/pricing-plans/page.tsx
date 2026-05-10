"use client";

import { useAdminSectionGate } from "@/hooks/useAdminAreaAccess";
import { PricingPlansAdmin } from "@/components/admin/PricingPlansAdmin";

export default function AdminPricingPlansPage() {
  const { loading, allowed } = useAdminSectionGate("settings");

  if (loading || !allowed) {
    return (
      <div className="max-w-5xl mx-auto p-4 text-muted-foreground text-sm">Loading…</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 pb-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pricing plans</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Control marketing and in-app display names, bullets, and per-currency list/offer amounts. Checkout still uses Paddle.
        </p>
      </div>
      <PricingPlansAdmin />
    </div>
  );
}
