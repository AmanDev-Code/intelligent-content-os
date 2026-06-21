"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  FileJson,
  Search,
  Loader2,
  Sparkles,
  Check,
  Copy,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { parseAdminBlogPostsList } from "@/lib/blogAdminPosts";
import { useToast } from "@/hooks/use-toast";

type PostRow = { id: string; title: string; slug: string };

const schemaTypeLabels: Record<string, string> = {
  article: "Article",
  faq: "FAQ",
  breadcrumb: "Breadcrumb",
  organization: "Organization",
  howTo: "HowTo",
  softwareApplication: "SoftwareApplication",
};

const schemaTypeColors: Record<string, string> = {
  article: "bg-blue-500/10 text-blue-700 border-blue-200",
  faq: "bg-green-500/10 text-green-700 border-green-200",
  breadcrumb: "bg-amber-500/10 text-amber-700 border-amber-200",
  organization: "bg-purple-500/10 text-purple-700 border-purple-200",
  howTo: "bg-pink-500/10 text-pink-700 border-pink-200",
  softwareApplication: "bg-cyan-500/10 text-cyan-700 border-cyan-200",
};

function SchemaCard({
  schemaKey,
  schema,
}: {
  schemaKey: string;
  schema: any;
}) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const jsonStr = JSON.stringify(schema, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonStr);
    toast({ title: "Schema copied to clipboard" });
  };

  return (
    <Card className="border border-border/60 shadow-none">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-[10px] uppercase ${schemaTypeColors[schemaKey] || ""}`}>
            {schemaTypeLabels[schemaKey] || schemaKey}
          </Badge>
          <Check className="h-3.5 w-3.5 text-green-600 ml-1" />
          <span className="text-[10px] text-green-600 font-medium">Valid</span>
          <div className="ml-auto flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={handleCopy}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        {expanded && (
          <pre className="text-[11px] bg-muted/50 border border-border/50 rounded-md p-3 overflow-x-auto max-h-64 overflow-y-auto font-mono leading-relaxed">
            {jsonStr}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}

export function SchemaEngineSection() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [schemas, setSchemas] = useState<Record<string, any> | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingSchemas, setLoadingSchemas] = useState(false);
  const [generating, setGenerating] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const data = await apiClient.get("/admin/blog/posts", { params: { q: search || undefined } });
      setPosts(parseAdminBlogPostsList<PostRow>(data));
    } catch {
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, [search]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const loadSchemas = useCallback(async (postId: string) => {
    setLoadingSchemas(true);
    try {
      const data = await apiClient.get(`/admin/content-engine/schemas/${postId}`);
      setSchemas(data && typeof data === "object" && Object.keys(data).length > 0 ? data : null);
    } catch {
      setSchemas(null);
    } finally {
      setLoadingSchemas(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPostId) loadSchemas(selectedPostId);
    else setSchemas(null);
  }, [selectedPostId, loadSchemas]);

  const handleGenerate = async () => {
    if (!selectedPostId) return;
    setGenerating(true);
    try {
      const data = await apiClient.post(`/admin/content-engine/schemas/${selectedPostId}/generate`, {});
      setSchemas(data);
      toast({ title: "Schemas generated" });
    } catch {
      toast({ title: "Failed to generate schemas", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const schemaEntries = schemas ? Object.entries(schemas) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Schema Engine</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Auto-generated JSON-LD structured data for SEO rich results
        </p>
      </div>

      <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-900 dark:bg-purple-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <FileJson className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                What Happens
              </p>
              <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1.5">
                <li><strong>Generate:</strong> AI creates JSON-LD structured data for your article (Article, HowTo, FAQ, etc.)</li>
                <li><strong>Auto-detection:</strong> We analyze your content to determine the best schema types to include</li>
                <li><strong>Schema helps SEO:</strong> Search engines understand your content better, enabling rich results like stars, FAQs, breadcrumbs</li>
                <li><strong>Auto-embedded:</strong> Schema is automatically injected into your published blog page&apos;s &lt;head&gt; tag</li>
                <li><strong>Copy and inspect:</strong> Review or copy the JSON-LD to validate with Google&apos;s Rich Results Test</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Post selector */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loadingPosts ? (
        <Skeleton className="h-10 w-full max-w-sm rounded-lg" />
      ) : (
        <div className="flex flex-wrap gap-2">
          {posts.slice(0, 20).map((post) => (
            <button
              key={post.id}
              onClick={() => setSelectedPostId(post.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors cursor-pointer ${
                selectedPostId === post.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {post.title.slice(0, 40)}{post.title.length > 40 ? "..." : ""}
            </button>
          ))}
        </div>
      )}

      {selectedPostId && (
        <>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="gap-2"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {schemas ? "Regenerate Schemas" : "Generate Schemas"}
            </Button>

            {schemaEntries.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {schemaEntries.length} schema{schemaEntries.length !== 1 ? "s" : ""} generated
              </span>
            )}
          </div>

          {loadingSchemas ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : schemaEntries.length === 0 ? (
            <Card className="border border-border/60 shadow-none">
              <CardContent className="py-12 text-center">
                <FileJson className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">
                  No schemas yet — click "Generate Schemas" to create JSON-LD markup
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {schemaEntries.map(([key, schema]) => (
                <SchemaCard key={key} schemaKey={key} schema={schema} />
              ))}

              <Card className="border border-dashed border-border/60 shadow-none">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">
                    These schemas are automatically injected in the blog post&apos;s{" "}
                    <code className="text-[10px] px-1 py-0.5 bg-muted rounded">&lt;head&gt;</code>{" "}
                    tag when published.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
