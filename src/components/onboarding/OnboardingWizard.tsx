import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type OnboardingAnswers = {
  role: string;
  goal: string;
  teamSize: string;
  postingFrequency: string;
  focusArea: string;
  referralSource: string;
};

type WizardQuestion = {
  key: keyof OnboardingAnswers;
  title: string;
  options: { value: string; label: string }[];
};

const QUESTIONS: WizardQuestion[] = [
  {
    key: "role",
    title: "Who are you?",
    options: [
      { value: "founder", label: "Founder / Entrepreneur" },
      { value: "marketer", label: "Marketer" },
      { value: "creator", label: "Creator" },
      { value: "agency", label: "Agency" },
      { value: "student", label: "Student / Learner" },
    ],
  },
  {
    key: "goal",
    title: "Why are you using Trndinn?",
    options: [
      { value: "brand_growth", label: "Grow personal or company brand" },
      { value: "lead_generation", label: "Generate leads" },
      { value: "consistency", label: "Post consistently" },
      { value: "team_output", label: "Scale team content output" },
    ],
  },
  {
    key: "teamSize",
    title: "What is your team size?",
    options: [
      { value: "solo", label: "Solo" },
      { value: "2_5", label: "2 - 5 people" },
      { value: "6_20", label: "6 - 20 people" },
      { value: "20_plus", label: "20+ people" },
    ],
  },
  {
    key: "postingFrequency",
    title: "How often do you want to publish?",
    options: [
      { value: "daily", label: "Daily" },
      { value: "3_per_week", label: "3 times a week" },
      { value: "weekly", label: "Weekly" },
      { value: "flexible", label: "Flexible / not sure yet" },
    ],
  },
  {
    key: "focusArea",
    title: "Which content type do you want to focus on first?",
    options: [
      { value: "text_posts", label: "Text posts" },
      { value: "image_posts", label: "Image posts" },
      { value: "carousel", label: "Carousel posts" },
      { value: "mixed", label: "Mix of all formats" },
    ],
  },
  {
    key: "referralSource",
    title: "How did you hear about us?",
    options: [
      { value: "search", label: "Search / SEO" },
      { value: "social", label: "Social media" },
      { value: "friend", label: "Friend / colleague" },
      { value: "community", label: "Community / group" },
      { value: "other", label: "Other" },
    ],
  },
];

interface OnboardingWizardProps {
  onComplete: (answers: OnboardingAnswers) => Promise<void> | void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    role: "",
    goal: "",
    teamSize: "",
    postingFrequency: "",
    focusArea: "",
    referralSource: "",
  });

  const currentQuestion = QUESTIONS[step];
  const total = QUESTIONS.length;
  const progress = useMemo(() => ((step + 1) / total) * 100, [step, total]);
  const currentValue = answers[currentQuestion.key];
  const isLast = step === total - 1;

  const handleNext = async () => {
    if (!currentValue) return;
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    try {
      setSaving(true);
      await onComplete(answers);
    } finally {
      setSaving(false);
    }
  };

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
            <Label className="text-base font-semibold">{currentQuestion.title}</Label>
          </div>

          <RadioGroup
            value={currentValue}
            onValueChange={(value) =>
              setAnswers((prev) => ({ ...prev, [currentQuestion.key]: value }))
            }
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => (
              <div
                key={option.value}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/40 transition-colors"
              >
                <RadioGroupItem value={option.value} id={`${currentQuestion.key}-${option.value}`} />
                <Label
                  htmlFor={`${currentQuestion.key}-${option.value}`}
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
            <Button onClick={handleNext} disabled={!currentValue || saving}>
              {saving ? "Saving..." : isLast ? "Finish onboarding" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
