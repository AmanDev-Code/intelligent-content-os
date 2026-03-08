import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGenerationJob } from "@/hooks/useGenerationJob";
import { useSmoothProgress } from "@/hooks/useSmoothProgress";
import { useToast } from "@/hooks/use-toast";
import { BACKEND_URL } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, AlertCircle, RefreshCw, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";

type Tab = "viral" | "custom";

interface ContentRow {
  id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
}

export default function AIAgent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("viral");
  const [customTopic, setCustomTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>("Starting...");
  const [isFailed, setIsFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { displayProgress, setTarget } = useSmoothProgress();
  const [recentContent, setRecentContent] = useState<ContentRow[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  // Fetch recent generations
  useEffect(() => {
    if (!user) return;
    const fetchRecent = async () => {
      const { data } = await supabase
        .from("generated_content")
        .select("id, title, content, status, created_at")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(10);
      setRecentContent((data as ContentRow[] | null) ?? []);
      setLoadingRecent(false);
    };
    fetchRecent();
  }, [user, isGenerating]);

  const handleComplete = useCallback(
    (_contentId: string | null) => {
      setTarget(100);
      setIsGenerating(false);
      setIsFailed(false);
      setJobId(null);
      toast({ title: "Content generated!", description: "Your post is ready." });
    },
    [toast, setTarget]
  );

  const handleFailed = useCallback(
    (error: string | null) => {
      setIsGenerating(false);
      setIsFailed(true);
      setErrorMessage(error);
      setTarget(0);
      setStage("Failed");
      toast({ title: "Generation failed", description: error || "Something went wrong.", variant: "destructive" });
    },
    [toast, setTarget]
  );

  const handleProgress = useCallback(
    (p: number, s: string | null) => {
      setTarget(p);
      setStage(s);
    },
    [setTarget]
  );

  useGenerationJob({ jobId, onComplete: handleComplete, onFailed: handleFailed, onProgress: handleProgress });

  const handleGenerate = async () => {
    if (isGenerating) return;
    if (tab === "custom" && !customTopic.trim()) {
      toast({ title: "Enter a topic", description: "Please enter a topic to generate content.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setIsFailed(false);
    setErrorMessage(null);
    setTarget(0);
    setStage("Starting...");

    try {
      const response = await fetch(`${BACKEND_URL}/generation/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: {},
          ...(tab === "custom" ? { topic: customTopic.trim() } : {}),
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (!data?.jobId) throw new Error("No job ID returned from server");

      setJobId(data.jobId);
      setTarget(20);
    } catch (error) {
      setIsGenerating(false);
      setIsFailed(true);
      const msg = error instanceof Error ? error.message : "Could not reach the server.";
      setErrorMessage(msg);
      toast({ title: "Failed to start generation", description: msg, variant: "destructive" });
    }
  };

  const handleRetry = async () => {
    if (!jobId || isGenerating) return;
    setIsGenerating(true);
    setTarget(0);
    setStage("Retrying...");

    try {
      const response = await fetch(`${BACKEND_URL}/generation/job/${jobId}/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      toast({ title: "Retry initiated", description: "Your job has been requeued." });
      setTarget(20);
    } catch (error) {
      setIsGenerating(false);
      toast({
        title: "Retry failed",
        description: error instanceof Error ? error.message : "Could not retry.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-border pb-2">
        <button
          onClick={() => setTab("viral")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === "viral" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Find Viral Topics
        </button>
        <button
          onClick={() => setTab("custom")}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === "custom" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Custom Topic
        </button>
      </div>

      {/* Generation panel */}
      <Card className="p-6 border border-border">
        {tab === "viral" ? (
          <div className="text-center space-y-4">
            <Sparkles className="h-8 w-8 text-primary mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">Generate Viral Topics</h3>
              <p className="text-sm text-muted-foreground mt-1">
                AI will scan trending content and generate a strategic LinkedIn post.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Custom Topic</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your topic and AI will research and create content.
              </p>
            </div>
            <Input
              placeholder="e.g. AI agents will replace SaaS tools"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="text-sm"
              disabled={isGenerating}
            />
          </div>
        )}

        {/* Progress */}
        {isGenerating && (
          <div className="mt-6 space-y-3">
            <Progress value={displayProgress} className="h-2" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{stage || "Processing"}</span>
              <span className="font-medium text-foreground">{Math.round(displayProgress)}%</span>
            </div>
          </div>
        )}

        {/* Error state */}
        {!isGenerating && isFailed && jobId && (
          <div className="mt-6 space-y-3">
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-xs text-foreground">{errorMessage || "Generation failed."}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRetry} size="sm" variant="outline" className="text-xs">
                <RefreshCw className="h-3 w-3 mr-1" /> Retry
              </Button>
              <Button
                onClick={() => { setJobId(null); setIsFailed(false); setErrorMessage(null); }}
                size="sm"
                variant="ghost"
                className="text-xs"
              >
                Start New
              </Button>
            </div>
          </div>
        )}

        {/* Action button */}
        {!isGenerating && !isFailed && (
          <div className="mt-6">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full gradient-primary text-primary-foreground h-10 text-sm font-medium"
            >
              <Zap className="h-4 w-4 mr-2" />
              {tab === "viral" ? "Find Viral Topics" : "Generate Content"}
            </Button>
          </div>
        )}
      </Card>

      {/* Recent Generations */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Generations</h3>
        {loadingRecent ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-md bg-muted animate-pulse" />
            ))}
          </div>
        ) : recentContent.length === 0 ? (
          <Card className="p-8 text-center border border-border">
            <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No content generated yet.</p>
          </Card>
        ) : (
          <div className="space-y-1">
            {recentContent.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/content/${item.id}`)}
                className="flex items-center gap-3 p-3 rounded-md border border-border hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="w-1 h-8 rounded-full bg-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(item.created_at), "MMM d, yyyy")}
                  </p>
                </div>
                <Badge
                  variant={item.status === "failed" ? "destructive" : "secondary"}
                  className="text-xs shrink-0"
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
