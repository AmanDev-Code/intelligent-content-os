import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiClient } from "@/lib/apiClient";

export type OnboardingAnswers = {
  role: string;
  goal: string;
  teamSize: string;
  postingFrequency: string;
  focusArea: string;
  referralSource: string;
  [key: string]: string;
};

type QuestionOption = {
  value: string;
  label: string;
  icon?: string;
};

type OnboardingQuestion = {
  id: string;
  step_number: number;
  question_text: string;
  question_key: string;
  options: QuestionOption[];
  is_required: boolean;
  is_active: boolean;
};

interface OnboardingWizardProps {
  onComplete: (answers: OnboardingAnswers) => Promise<void> | void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([]);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    role: "",
    goal: "",
    teamSize: "",
    postingFrequency: "",
    focusArea: "",
    referralSource: "",
  });

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const res = await apiClient.get("/onboarding/questions");
        const data = (res as { data: OnboardingQuestion[] }).data || [];
        setQuestions(data);
        
        const initialAnswers: OnboardingAnswers = {
          role: "",
          goal: "",
          teamSize: "",
          postingFrequency: "",
          focusArea: "",
          referralSource: "",
        };
        data.forEach((q) => {
          initialAnswers[q.question_key] = "";
        });
        setAnswers(initialAnswers);
      } catch {
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, []);

  const currentQuestion = questions[step];
  const total = questions.length;
  const progress = useMemo(() => (total > 0 ? ((step + 1) / total) * 100 : 0), [step, total]);
  const currentValue = currentQuestion ? answers[currentQuestion.question_key] || "" : "";
  const isLast = step === total - 1;

  const saveCurrentResponse = async () => {
    if (!currentQuestion || !currentValue) return;
    
    try {
      await apiClient.post("/onboarding/response", {
        questionId: currentQuestion.id,
        selectedOption: currentValue,
      });
    } catch {
      // Silently fail - responses will be saved on complete anyway
    }
  };

  const handleNext = async () => {
    if (!currentValue && currentQuestion?.is_required) return;
    
    await saveCurrentResponse();
    
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    
    try {
      setSaving(true);
      
      const responses = questions
        .filter((q) => answers[q.question_key])
        .map((q) => ({
          questionId: q.id,
          selectedOption: answers[q.question_key],
        }));
      
      if (responses.length > 0) {
        await apiClient.post("/onboarding/responses", { responses });
      }
      
      await onComplete(answers);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[90] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (questions.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[90] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl border-border/80">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle>Welcome to Trndinn</CardTitle>
            <span className="text-sm text-muted-foreground">
              Step {step + 1} of {total}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-semibold">{currentQuestion.question_text}</Label>
            {!currentQuestion.is_required && (
              <span className="ml-2 text-xs text-muted-foreground">(optional)</span>
            )}
          </div>

          <RadioGroup
            value={currentValue}
            onValueChange={(value) =>
              setAnswers((prev) => ({ ...prev, [currentQuestion.question_key]: value }))
            }
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => (
              <div
                key={option.value}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors"
              >
                <RadioGroupItem value={option.value} id={`${currentQuestion.question_key}-${option.value}`} />
                <Label
                  htmlFor={`${currentQuestion.question_key}-${option.value}`}
                  className="cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || saving}
            >
              Back
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={(currentQuestion.is_required && !currentValue) || saving}
            >
              {saving ? "Saving..." : isLast ? "Finish onboarding" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
