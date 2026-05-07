"use client";

import { AdminOnboardingQuestions } from "@/components/admin/AdminOnboardingQuestions";

export default function AdminOnboardingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Onboarding Questions</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage the questions shown to new users during onboarding.
        </p>
      </div>
      <AdminOnboardingQuestions />
    </div>
  );
}
