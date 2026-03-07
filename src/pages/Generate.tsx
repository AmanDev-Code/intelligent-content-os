import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useGenerationJob } from "@/hooks/useGenerationJob";
import { useSmoothProgress } from "@/hooks/useSmoothProgress";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function Generate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>("Starting...");
  const [isComplete, setIsComplete] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { displayProgress, setTarget} = useSmoothProgress();

  const handleComplete = useCallback(
    (_contentId: string | null) => {
      setTarget(100);
      setIsComplete(true);
      setIsGenerating(false);
      setIsFailed(false);
      setJobId(null);
      toast({ title: "Content generated!", description: "Your post is ready." });
      navigate("/content");
    },
    [navigate, toast, setTarget]
  );

  const handleFailed = useCallback(
    (error: string | null) => {
      setIsGenerating(false);
      setIsFailed(true);
      setErrorMessage(error);
      // Keep jobId so we can show retry button
      setTarget(0);
      setStage("Failed");
      toast({
        title: "Generation failed",
        description: error || "Something went wrong. You can retry below.",
        variant: "destructive",
      });
    },
    [toast, setTarget]
  );

  const handleRetry = async () => {
    if (!jobId || isGenerating) return;

    setIsGenerating(true);
    setTarget(0);
    setStage("Retrying...");

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      const response = await fetch(`${backendUrl}/generation/job/${jobId}/retry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      toast({
        title: "Retry initiated",
        description: "Your job has been requeued for processing.",
      });
      
      setTarget(20);
    } catch (error) {
      setIsGenerating(false);
      toast({
        title: "Retry failed",
        description: error instanceof Error ? error.message : "Could not retry the job.",
        variant: "destructive",
      });
    }
  };

  const handleProgress = useCallback((p: number, s: string | null) => {
    setTarget(p);
    setStage(s);
  }, [setTarget]);

  useGenerationJob({
    jobId,
    onComplete: handleComplete,
    onFailed: handleFailed,
    onProgress: handleProgress,
  });

  const handleGenerate = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setIsFailed(false);
    setErrorMessage(null);
    setTarget(0);
    setStage("Starting...");
    setIsComplete(false);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      const response = await fetch(`${backendUrl}/generation/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          preferences: {},
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data?.jobId) {
        throw new Error("No job ID returned from server");
      }

      setJobId(data.jobId);
      setTarget(20);
    } catch (error) {
      setIsGenerating(false);
      setIsFailed(true);
      const errorMsg = error instanceof Error ? error.message : "Could not reach the server.";
      setErrorMessage(errorMsg);
      toast({
        title: "Failed to start generation",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-lg glass-strong animate-fade-in shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full gradient-primary glow-primary relative">
            {isComplete ? (
              <CheckCircle2 className="h-8 w-8 text-white" />
            ) : isFailed ? (
              <AlertCircle className="h-8 w-8 text-white" />
            ) : (
              <Sparkles
                className={`h-8 w-8 text-white ${isGenerating ? "animate-thinking-pulse" : ""}`}
              />
            )}
            {isGenerating && (
              <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            )}
          </div>
          
          <CardTitle className="text-2xl font-bold">
            {isGenerating
              ? "Generating your post…"
              : isComplete
                ? "Content Ready!"
                : isFailed
                  ? "Generation Failed"
                  : "Generate Content"}
          </CardTitle>
          
          <CardDescription className="text-base mt-2">
            {isGenerating
              ? stage || "Processing…"
              : isComplete
                ? "Your AI-powered content is ready to review."
                : isFailed
                  ? errorMessage || "Something went wrong. You can retry or start fresh."
                  : "AI will discover trends, generate engaging content, and create stunning visuals."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          {isGenerating && (
            <div className="space-y-3 animate-fade-in">
              <div className="relative">
                <Progress value={displayProgress} className="h-3" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{stage || "Processing"}</span>
                <span className="font-semibold text-foreground">{Math.round(displayProgress)}%</span>
              </div>
            </div>
          )}

          {!isGenerating && !isComplete && !jobId && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full gradient-primary text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] h-12 text-base font-semibold"
            >
              <Zap className="h-5 w-5 mr-2" />
              Generate Post
            </Button>
          )}

          {!isGenerating && isFailed && jobId && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Generation failed</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {errorMessage || "The AI workflow encountered an error. You can retry or start a new generation."}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleRetry}
                disabled={isGenerating}
                className="w-full bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] h-11"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Generation
              </Button>
              
              <Button
                onClick={() => {
                  setJobId(null);
                  setStage(null);
                  setIsFailed(false);
                  setErrorMessage(null);
                }}
                variant="outline"
                className="w-full border-border/60 hover:bg-accent/50 hover:border-border transition-all duration-200"
              >
                Start New Generation
              </Button>
            </div>
          )}

          {isComplete && (
            <div className="space-y-3 animate-fade-in">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                  <p className="text-sm font-medium text-foreground">
                    Your content has been generated successfully!
                  </p>
                </div>
              </div>
              
              <Button
                onClick={() => navigate("/content")}
                className="w-full gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] h-11"
              >
                View Content
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
