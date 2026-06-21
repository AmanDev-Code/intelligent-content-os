"use client";

import { AdminSeoKeywords } from "@/components/admin/AdminSeoKeywords";
import { Card, CardContent } from "@/components/ui/card";
import { Target } from "lucide-react";

export function KeywordsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Keywords</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your keyword library, clusters, and page assignments
        </p>
      </div>

      <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Target className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                What Happens
              </p>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1.5">
                <li><strong>Add target keywords:</strong> Build your library of keywords you want to rank for</li>
                <li><strong>Keywords feed Article Generator:</strong> Use keywords to create content briefs and outlines</li>
                <li><strong>Track assignments:</strong> See which keywords are assigned to which articles</li>
                <li><strong>Used by Rank Tracking:</strong> Keywords here appear in Rank Tracking to monitor your positions</li>
                <li><strong>Organize by intent:</strong> Tag keywords by search intent (informational, commercial, transactional)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <AdminSeoKeywords />
    </div>
  );
}
