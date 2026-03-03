import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useGenerationJob } from "@/hooks/useGenerationJob";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, Sparkles, CheckCircle2 } from "lucide-react";

export default function Generate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<string | null>("Starting...");
  const [isComplete, setIsComplete] = useState(false);

  const handleComplete = useCallback(
    (_contentId: string | null) => {
      setProgress(100);
      setIsComplete(true);
      setIsGenerating(false);
      setJobId(null);
      toast({ title: "Content generated!", description: "Your post is ready." });
      navigate("/content");
    },
    [navigate, toast]
  );

  const handleFailed = useCallback(
    (error: string | null) => {
      setIsGenerating(false);
      setJobId(null);
      setProgress(0);
      setStage(null);
      toast({
        title: "Generation failed",
        description: error || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
    [toast]
  );

  const handleProgress = useCallback((p: number, s: string | null) => {
    setProgress(p);
    setStage(s);
  }, []);

  useGenerationJob({
    jobId,
    onComplete: handleComplete,
    onFailed: handleFailed,
    onProgress: handleProgress,
  });

  const handleGenerate = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    setProgress(0);
    setStage("Starting...");
    setIsComplete(false);

    const { data, error } = await supabase.functions.invoke("generate-post");

    if (error || !data?.jobId) {
      setIsGenerating(false);
      toast({
        title: "Failed to start generation",
        description: error?.message || "Could not reach the server.",
        variant: "destructive",
      });
      return;
    }

    setJobId(data.jobId);
  };

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-lg glass animate-fade-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full gradient-primary glow-primary">
            {isComplete ? (
              <CheckCircle2 className="h-7 w-7 text-primary-foreground" />
            ) : (
              <Sparkles
                className={`h-7 w-7 text-primary-foreground ${isGenerating ? "animate-thinking-pulse" : ""}`}
              />
            )}
          </div>
          <CardTitle className="text-xl">
            {isGenerating
              ? "Generating your post…"
              : isComplete
                ? "Done!"
                : "Generate Content"}
          </CardTitle>
          <CardDescription>
            {isGenerating
              ? stage || "Processing…"
              : isComplete
                ? "Your content is ready."
                : "AI will scan trends, write content, and design visuals for you."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {isGenerating && (
            <div className="space-y-2 animate-fade-in">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {Math.round(progress)}%
              </p>
            </div>
          )}

          {!isGenerating && !isComplete && (
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full gradient-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
              size="lg"
            >
              <Zap className="h-4 w-4 mr-2" />
              Generate Post
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
