"use client";

/**
 * /admin/bio-generator — Owner-only analytics dashboard for the free Bio
 * Generator tool. Mirrors the thin-page pattern used by every other
 * per-tool admin route (transcription, feedback, etc.): gate on the shared
 * admin hook, then render the view component.
 */

import { AdminBioGeneratorView } from "@/components/admin/AdminBioGeneratorView";
import { useAdminSectionGate } from "@/hooks/useAdminAreaAccess";

export default function AdminBioGeneratorPage() {
  const { loading, allowed } = useAdminSectionGate("feedback");

  if (loading || !allowed) {
    return (
      <div className="max-w-5xl mx-auto p-4 text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 pb-16">
      <AdminBioGeneratorView />
    </div>
  );
}
