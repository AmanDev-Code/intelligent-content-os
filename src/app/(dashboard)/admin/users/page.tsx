"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminSectionGate } from "@/hooks/useAdminAreaAccess";
import { AdminUsersOverview } from "@/components/admin/AdminUsersOverview";
import { AdminUsersDirectory } from "@/components/admin/AdminUsersDirectory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function AdminUsersTabsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam === "directory" ? "directory" : "overview";

  const [tabValue, setTabValue] = useState(initialTab);

  useEffect(() => {
    setTabValue(tabParam === "directory" ? "directory" : "overview");
  }, [tabParam]);

  const onTabChange = useCallback(
    (v: string) => {
      setTabValue(v);
      const next = new URLSearchParams(searchParams.toString());
      if (v === "overview") {
        next.set("tab", "overview");
      } else {
        next.set("tab", "directory");
      }
      router.replace(`/admin/users?${next.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Analytics overview and searchable directory in one place.
        </p>
      </div>

      <Tabs value={tabValue} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-auto p-1">
          <TabsTrigger value="overview" className="py-2">
            Overview
          </TabsTrigger>
          <TabsTrigger value="directory" className="py-2">
            Directory
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6 focus-visible:outline-none">
          <AdminUsersOverview />
        </TabsContent>
        <TabsContent value="directory" className="mt-6 focus-visible:outline-none">
          <AdminUsersDirectory />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminUsersPage() {
  const { loading, allowed } = useAdminSectionGate("users");

  if (loading || !allowed) {
    return (
      <div className="max-w-6xl mx-auto p-4 text-muted-foreground text-sm">Loading…</div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto p-4 text-muted-foreground text-sm">Loading…</div>
      }
    >
      <AdminUsersTabsInner />
    </Suspense>
  );
}
