"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewsletterDashboard } from "./NewsletterDashboard";
import { CampaignCreator } from "./CampaignCreator";
import { SubscriberManager } from "./SubscriberManager";
import { SubscriberImport } from "./SubscriberImport";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, ExternalLink, CheckCircle, XCircle, Loader2, HelpCircle, Info } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ListmonkConfig {
  configured: boolean;
  url?: string;
  connected?: boolean;
  lists?: Array<{ id: number; name: string; subscriber_count: number }>;
}

export function NewsletterSection() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [config, setConfig] = useState<ListmonkConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    apiClient
      .get("/admin/newsletter/config")
      .then((res) => setConfig(res as ListmonkConfig))
      .catch(() => setConfig({ configured: false }))
      .finally(() => setLoadingConfig(false));
  }, []);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">Newsletter</h1>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">
                    Powered by Listmonk. Manage subscribers, create campaigns, and track email analytics.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Manage subscribers, campaigns, and email analytics
            </p>
          </div>
        <div className="flex items-center gap-3">
          {loadingConfig ? (
            <Badge variant="secondary" className="gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" />
              Checking connection...
            </Badge>
          ) : config?.configured ? (
            <Badge
              variant={config.connected ? "default" : "destructive"}
              className="gap-1.5"
            >
              {config.connected ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <XCircle className="h-3 w-3" />
              )}
              Listmonk {config.connected ? "Connected" : "Disconnected"}
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1.5 text-amber-600 border-amber-300">
              <Settings className="h-3 w-3" />
              Listmonk Not Configured
            </Badge>
          )}
          {config?.url && (
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <a href={config.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
                Open Listmonk
              </a>
            </Button>
          )}
        </div>
      </div>

      {!config?.configured && !loadingConfig && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Settings className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Listmonk Integration Required
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  To send newsletters, configure Listmonk by setting these environment variables:
                </p>
                <ul className="mt-2 text-xs text-amber-600 dark:text-amber-400 space-y-1 font-mono">
                  <li>LISTMONK_URL=https://your-listmonk-instance.com</li>
                  <li>LISTMONK_API_USER=your-api-user</li>
                  <li>LISTMONK_API_PASSWORD=your-api-password</li>
                  <li>LISTMONK_DEFAULT_LIST_ID=1</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {config?.configured && config?.connected && (
        <>
          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    How to use Newsletter
                  </p>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                    <li><strong>Dashboard:</strong> View subscriber stats, recent campaigns, and growth trends</li>
                    <li><strong>Campaigns:</strong> Create and send email campaigns to your subscribers</li>
                    <li><strong>Subscribers:</strong> Manage individual subscribers, view activity</li>
                    <li><strong>Import:</strong> Bulk import subscribers from CSV or other sources</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                    What Happens
                  </p>
                  <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1.5">
                    <li><strong>Create campaigns:</strong> Select articles to send to your subscriber list</li>
                    <li><strong>Subscribers synced:</strong> All subscriber data is stored in Listmonk (external tool) and synced here</li>
                    <li><strong>Track performance:</strong> View open rates and click rates per campaign in the dashboard</li>
                    <li><strong>Import bulk subscribers:</strong> Upload CSV files to add multiple subscribers at once</li>
                    <li><strong>Listmonk handles delivery:</strong> Actual email sending, unsubscribes, and bounce handling are managed by Listmonk</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-0">
          <NewsletterDashboard />
        </TabsContent>

        <TabsContent value="campaigns" className="mt-0">
          <CampaignCreator />
        </TabsContent>

        <TabsContent value="subscribers" className="mt-0">
          <SubscriberManager />
        </TabsContent>

        <TabsContent value="import" className="mt-0">
          <SubscriberImport />
        </TabsContent>
      </Tabs>
    </div>
    </TooltipProvider>
  );
}
