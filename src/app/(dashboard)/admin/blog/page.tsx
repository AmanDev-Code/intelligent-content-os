"use client";

import BlogAdminPage from "@/views/BlogAdminPage";
import { useAdminSectionGate } from "@/hooks/useAdminAreaAccess";

export default function AdminBlogRoutePage() {
  const { loading, allowed } = useAdminSectionGate("blog");

  if (loading || !allowed) {
    return (
      <div className="max-w-5xl mx-auto p-4 text-muted-foreground text-sm">Loading…</div>
    );
  }

  return <BlogAdminPage />;
}
