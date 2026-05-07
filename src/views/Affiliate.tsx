"use client";

import { ReferralDashboard } from "@/components/referral/ReferralDashboard";

export default function Affiliate() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Affiliate & Referrals</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Share Trndinn with friends and earn credits when they join
        </p>
      </div>
      <ReferralDashboard />
    </div>
  );
}
