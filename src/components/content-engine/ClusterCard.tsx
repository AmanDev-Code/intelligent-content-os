"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";

type ClusterArticle = {
  id: string;
  keyword: string;
  status: string;
  is_pillar: boolean;
  post_id: string | null;
};

interface ClusterCardProps {
  cluster: {
    id: string;
    name: string;
    pillar_keyword: string;
    description: string | null;
    status: string;
    content_cluster_articles: ClusterArticle[];
  };
  onGenerate: (id: string) => void;
}

export function ClusterCard({ cluster, onGenerate }: ClusterCardProps) {
  const articles = cluster.content_cluster_articles;
  const total = articles.length;
  const published = articles.filter((a) => a.status === "published").length;
  const progress = total > 0 ? Math.round((published / total) * 100) : 0;

  const statusColor: Record<string, string> = {
    planning: "bg-blue-100 text-blue-700",
    in_progress: "bg-amber-100 text-amber-700",
    complete: "bg-emerald-100 text-emerald-700",
  };

  return (
    <Card className="border border-border/60 shadow-none hover:border-border transition-colors">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold truncate">{cluster.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pillar: {cluster.pillar_keyword}
            </p>
          </div>
          <Badge
            variant="secondary"
            className={`text-xs capitalize shrink-0 ${statusColor[cluster.status] ?? ""}`}
          >
            {cluster.status.replace("_", " ")}
          </Badge>
        </div>

        {cluster.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{cluster.description}</p>
        )}

        {total > 0 ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{published}/{total} published</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
            <div className="flex flex-wrap gap-1 mt-2">
              {articles.slice(0, 5).map((a) => (
                <Badge
                  key={a.id}
                  variant="outline"
                  className={`text-xs ${a.is_pillar ? "border-primary text-primary" : ""}`}
                >
                  {a.keyword}
                </Badge>
              ))}
              {total > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{total - 5} more
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <div className="pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onGenerate(cluster.id)}
              className="gap-1.5 w-full"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generate Article Suggestions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
