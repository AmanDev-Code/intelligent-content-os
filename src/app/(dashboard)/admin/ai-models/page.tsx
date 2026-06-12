"use client";

import { AdminAiModels } from "@/components/admin/AdminAiModels";

export default function AdminAiModelsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Models</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the Bifrost gateway model used across all text-AI features.
        </p>
      </div>
      <AdminAiModels />
    </div>
  );
}
