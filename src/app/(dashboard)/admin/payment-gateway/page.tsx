"use client";

import { CreditCard } from "lucide-react";
import { useAdminSectionGate } from "@/hooks/useAdminAreaAccess";
import { PaymentGatewayAdmin } from "@/components/admin/PaymentGatewayAdmin";

export default function AdminPaymentGatewayPage() {
  const { loading, allowed } = useAdminSectionGate("settings");

  if (loading || !allowed) {
    return (
      <div className="w-full max-w-none p-4 text-muted-foreground text-sm">Loading…</div>
    );
  }

  return (
    <div className="w-full max-w-none space-y-6 p-4 pb-16">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CreditCard className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Payment Gateway</h1>
          </div>
        </div>
        <p className="text-muted-foreground text-sm mt-3">
          Manage launch pricing with INR-to-USD conversion, coupon codes, and monitor payment
          gateway health. All billing is handled through Polar.
        </p>
      </div>
      <PaymentGatewayAdmin />
    </div>
  );
}
