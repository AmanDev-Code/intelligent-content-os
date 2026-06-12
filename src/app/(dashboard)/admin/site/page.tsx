"use client";

import { useAdminSectionGate } from "@/hooks/useAdminAreaAccess";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnnouncementsAdmin } from "@/components/admin/AnnouncementsAdmin";
import { MarketingContentAdmin } from "@/components/admin/MarketingContentAdmin";
import { PricingMetaAdmin } from "@/components/admin/PricingMetaAdmin";
import { LegalPagesAdmin } from "@/components/admin/LegalPagesAdmin";

export default function AdminSiteContentPage() {
  const { loading, allowed } = useAdminSectionGate("settings");

  if (loading || !allowed) {
    return <div className="mx-auto max-w-5xl p-4 text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 pb-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Marketing site</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the announcement marquee, marketing copy, pricing display metadata, and legal pages.
          Prices are pulled live from Polar and are not edited here.
        </p>
      </div>

      <Tabs defaultValue="announcements">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="content">Marketing copy</TabsTrigger>
          <TabsTrigger value="pricing">Pricing display</TabsTrigger>
          <TabsTrigger value="legal">Legal pages</TabsTrigger>
        </TabsList>
        <TabsContent value="announcements" className="mt-6">
          <AnnouncementsAdmin />
        </TabsContent>
        <TabsContent value="content" className="mt-6">
          <MarketingContentAdmin />
        </TabsContent>
        <TabsContent value="pricing" className="mt-6">
          <PricingMetaAdmin />
        </TabsContent>
        <TabsContent value="legal" className="mt-6">
          <LegalPagesAdmin />
        </TabsContent>
      </Tabs>
    </div>
  );
}
