"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  RotateCcw,
  Copy,
  Save,
  Eye,
} from "lucide-react";
import { ArticlePreview, type ArticlePreviewData } from "./ArticlePreview";
import { apiClient } from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

type WizardStep = "research" | "plan" | "generating" | "review";

interface ResearchInput {
  primary_keyword: string;
  secondary_keywords: string;
  target_audience: string;
  business_type: string;
  country: string;
  language: string;
  search_intent: string;
  competitors: string;
  article_length: string;
}

interface ContentPlan {
  suggested_title: string;
  heading_structure: { level: string; text: string }[];
  recommended_word_count: number;
  content_angle: string;
  keyword_placement: string;
}

interface GeneratedArticle {
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  body: string;
  tags: string[];
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  faq_json: { question: string; answer: string }[];
  reading_minutes: number;
  og_image_prompt: string;
  seo_score: number;
  aeo_score: number;
  geo_score: number;
  eeat_score: number;
  readability_score: number;
  quality_score: number;
  internal_link_suggestions: string[];
}

const AUDIENCES = [
  "founders",
  "marketers",
  "developers",
  "creators",
  "agencies",
  "businesses",
];

const INTENTS = ["informational", "commercial", "transactional", "navigational"];

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "India",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Global",
];

const LENGTHS = [
  { value: "1500", label: "Short (1,500 words)" },
  { value: "2500", label: "Medium (2,500 words)" },
  { value: "3500", label: "Long (3,500 words)" },
  { value: "5000", label: "Comprehensive (5,000 words)" },
];

interface ArticleGeneratorWizardProps {
  onArticleSaved?: (postId: string) => void;
}

export function ArticleGeneratorWizard({ onArticleSaved }: ArticleGeneratorWizardProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<WizardStep>("research");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<ContentPlan | null>(null);
  const [article, setArticle] = useState<GeneratedArticle | null>(null);
  const [generationProgress, setGenerationProgress] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [input, setInput] = useState<ResearchInput>({
    primary_keyword: "",
    secondary_keywords: "",
    target_audience: "",
    business_type: "",
    country: "United States",
    language: "English",
    search_intent: "informational",
    competitors: "",
    article_length: "2500",
  });

  const updateInput = (key: keyof ResearchInput, value: string) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const handleGeneratePlan = async () => {
    if (!input.primary_keyword.trim()) {
      toast({ title: "Primary keyword required", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        primary_keyword: input.primary_keyword.trim(),
        secondary_keywords: input.secondary_keywords
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        target_audience: input.target_audience,
        business_type: input.business_type,
        country: input.country,
        language: input.language,
        search_intent: input.search_intent,
        competitors: input.competitors
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        article_length: parseInt(input.article_length),
      };
      const result = await apiClient.post("/admin/content-engine/generate-plan", payload);
      setPlan(result as ContentPlan);
      setStep("plan");
    } catch {
      toast({ title: "Failed to generate plan", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateArticle = async () => {
    if (!plan) return;
    setStep("generating");
    setGenerationProgress([]);

    const steps = [
      "Generating title & meta...",
      "Building heading structure...",
      "Writing content sections...",
      "Creating FAQ schema...",
      "Generating image prompts...",
      "Calculating quality scores...",
    ];

    for (let i = 0; i < steps.length - 1; i++) {
      setGenerationProgress((prev) => [...prev, steps[i]]);
      await new Promise((r) => setTimeout(r, 800));
    }

    try {
      const payload = {
        plan,
        input: {
          primary_keyword: input.primary_keyword.trim(),
          secondary_keywords: input.secondary_keywords
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          target_audience: input.target_audience,
          business_type: input.business_type,
          country: input.country,
          language: input.language,
          search_intent: input.search_intent,
          competitors: input.competitors
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          article_length: parseInt(input.article_length),
        },
      };
      const result = await apiClient.post("/admin/content-engine/generate-article", payload);
      const generatedArticle = result as GeneratedArticle;
      
      // Auto-insert images into markdown body
      const bodyWithImages = insertImagesIntoMarkdown(
        generatedArticle.body,
        input.primary_keyword,
        plan.heading_structure
      );
      
      setArticle({ ...generatedArticle, body: bodyWithImages });
      setGenerationProgress(steps);
      setTimeout(() => setStep("review"), 600);
    } catch {
      toast({ title: "Failed to generate article", variant: "destructive" });
      setStep("plan");
    }
  };

  function insertImagesIntoMarkdown(
    body: string,
    keyword: string,
    headings: { level: string; text: string }[]
  ): string {
    let result = body;
    
    // 1. Hero image at top
    const slug = keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const heroUrl = `https://picsum.photos/seed/${slug}/1200/600`;
    result = `![${keyword}](${heroUrl} "${keyword} overview")\n\n${result}`;
    
    // 2. Detect visual content patterns and insert images intelligently
    const visualPatterns = [
      // Comparison patterns
      { 
        pattern: /(?:^|\n)(#{2,3}\s+.+?(?:comparison|vs\.?|versus|compared|difference|alternative).+?)(\n|$)/gi,
        type: 'comparison',
        keywords: ['comparison chart', 'versus', 'side by side']
      },
      // Chart/Graph patterns
      {
        pattern: /(?:^|\n)(#{2,3}\s+.+?(?:performance|metrics|statistics|data|numbers|results).+?)(\n|$)/gi,
        type: 'chart',
        keywords: ['chart', 'graph', 'data visualization']
      },
      // Workflow patterns
      {
        pattern: /(?:^|\n)(#{2,3}\s+.+?(?:process|workflow|steps|how to|guide|tutorial).+?)(\n|$)/gi,
        type: 'workflow',
        keywords: ['workflow diagram', 'process flow', 'step by step']
      },
      // Market/Analysis patterns
      {
        pattern: /(?:^|\n)(#{2,3}\s+.+?(?:market|share|breakdown|distribution|analysis).+?)(\n|$)/gi,
        type: 'pie-chart',
        keywords: ['pie chart', 'market share', 'distribution']
      },
      // Timeline/Growth patterns
      {
        pattern: /(?:^|\n)(#{2,3}\s+.+?(?:timeline|growth|trend|history|evolution).+?)(\n|$)/gi,
        type: 'timeline',
        keywords: ['timeline', 'trend graph', 'growth chart']
      },
    ];
    
    const insertedPositions: number[] = [];
    
    // Process each pattern type
    for (const { pattern, type, keywords } of visualPatterns) {
      const matches = [...result.matchAll(pattern)];
      
      for (const match of matches) {
        if (!match.index) continue;
        
        const heading = match[1];
        const headingEnd = match.index + match[0].length;
        
        // Skip if we already inserted an image near this position
        if (insertedPositions.some(pos => Math.abs(pos - headingEnd) < 200)) {
          continue;
        }
        
        // Extract keywords from heading for image search
        const headingText = heading.replace(/^#{2,3}\s+/, '');
        const cleanHeading = headingText.toLowerCase().replace(/[^a-z0-9\s]/g, '');
        const headingWords = cleanHeading.split(/\s+/).slice(0, 4).join(' ');
        
        // Build image prompt with type-specific keywords
        const imageKeyword = `${headingWords} ${keywords[Math.floor(Math.random() * keywords.length)]}`;
        const headingSlug = headingWords.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const imageUrl = `https://picsum.photos/seed/${headingSlug}/800/500`;
        
        // Create caption that describes the visual type
        const visualTypeLabel = type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        const imageMarkdown = `\n\n![${headingText}](${imageUrl} "${visualTypeLabel}: ${headingText}")\n\n`;
        
        // Insert after heading
        result = result.slice(0, headingEnd) + imageMarkdown + result.slice(headingEnd);
        insertedPositions.push(headingEnd);
      }
    }
    
    // 3. Add remaining section images after H2 headings (for content that doesn't match patterns)
    const h2Pattern = /^## (.+)$/gm;
    const h2Matches = [...result.matchAll(h2Pattern)];
    
    // Insert from bottom to top to avoid position shifts
    for (let i = h2Matches.length - 1; i >= 0; i--) {
      const match = h2Matches[i];
      const heading = match[1];
      const position = match.index! + match[0].length;
      
      // Skip if we already inserted an image near this position
      if (insertedPositions.some(pos => Math.abs(pos - position) < 200)) {
        continue;
      }
      
      // Skip the first H2 (usually intro) and add images to subsequent ones at intervals
      if (i > 0 && i % 3 === 0) {
        const imageKeyword = heading.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(' ').slice(0, 3).join(' ');
        const headingSlug = imageKeyword.replace(/\s+/g, '-');
        const imageUrl = `https://picsum.photos/seed/${headingSlug}/800/400`;
        const imageMarkdown = `\n\n![${heading}](${imageUrl})\n\n`;
        result = result.slice(0, position) + imageMarkdown + result.slice(position);
        insertedPositions.push(position);
      }
    }
    
    return result;
  }

  const createPostPayload = () => ({
    title: article!.title,
    slug: article!.slug,
    subtitle: article!.subtitle,
    excerpt: article!.excerpt,
    body: article!.body,
    tags: article!.tags,
    seo_title: article!.seo_title,
    seo_description: article!.seo_description,
    seo_keywords: article!.seo_keywords,
    reading_minutes: article!.reading_minutes,
  });

  const handlePublish = async () => {
    if (!article) return;
    setLoading(true);
    try {
      const created = (await apiClient.post("/admin/blog/posts", {
        ...createPostPayload(),
        status: "published",
      })) as { id?: string };
      toast({ title: "Article published!" });
      if (created.id) onArticleSaved?.(created.id);
    } catch {
      toast({ title: "Failed to publish", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!article) return;
    setLoading(true);
    try {
      const created = (await apiClient.post("/admin/blog/posts", {
        ...createPostPayload(),
        status: "draft",
      })) as { id?: string };
      toast({ title: "Saved as draft" });
      if (created.id) onArticleSaved?.(created.id);
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {(["research", "plan", "generating", "review"] as WizardStep[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                step === s
                  ? "bg-primary text-primary-foreground"
                  : (["research", "plan", "generating", "review"].indexOf(step) > i)
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {["research", "plan", "generating", "review"].indexOf(step) > i ? (
                <Check className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </div>
            {i < 3 && (
              <div className={`w-8 h-0.5 ${
                ["research", "plan", "generating", "review"].indexOf(step) > i
                  ? "bg-emerald-300"
                  : "bg-border"
              }`} />
            )}
          </div>
        ))}
        <span className="ml-3 text-sm font-medium text-muted-foreground capitalize">{step}</span>
      </div>

      {/* Step 1: Research Input */}
      {step === "research" && (
        <Card className="border border-border/60 shadow-none">
          <CardContent className="p-6 space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Research Input</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Provide keyword and audience details for AI-powered content planning
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="primary_keyword">Primary Keyword *</Label>
                <Input
                  id="primary_keyword"
                  placeholder="e.g., content marketing strategy"
                  value={input.primary_keyword}
                  onChange={(e) => updateInput("primary_keyword", e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="secondary_keywords">Secondary Keywords</Label>
                <Input
                  id="secondary_keywords"
                  placeholder="Comma-separated: content planning, editorial calendar, ..."
                  value={input.secondary_keywords}
                  onChange={(e) => updateInput("secondary_keywords", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select value={input.target_audience} onValueChange={(v) => updateInput("target_audience", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    {AUDIENCES.map((a) => (
                      <SelectItem key={a} value={a} className="capitalize">
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_type">Business Type / Industry</Label>
                <Input
                  id="business_type"
                  placeholder="e.g., SaaS, E-commerce"
                  value={input.business_type}
                  onChange={(e) => updateInput("business_type", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={input.country} onValueChange={(v) => updateInput("country", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Search Intent</Label>
                <Select value={input.search_intent} onValueChange={(v) => updateInput("search_intent", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTENTS.map((i) => (
                      <SelectItem key={i} value={i} className="capitalize">
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Article Length</Label>
                <Select value={input.article_length} onValueChange={(v) => updateInput("article_length", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LENGTHS.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input
                  id="language"
                  value={input.language}
                  onChange={(e) => updateInput("language", e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="competitors">Competitors (one per line)</Label>
                <Textarea
                  id="competitors"
                  placeholder="https://competitor1.com/article&#10;https://competitor2.com/guide"
                  value={input.competitors}
                  onChange={(e) => updateInput("competitors", e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleGeneratePlan} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate Content Plan
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Content Plan */}
      {step === "plan" && plan && (
        <Card className="border border-border/60 shadow-none">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">Content Plan</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Review the AI-generated plan before proceeding
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleGeneratePlan} className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                Regenerate
              </Button>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-border/60 p-4 space-y-3">
                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Suggested Title
                  </span>
                  <p className="text-base font-semibold mt-1">{plan.suggested_title}</p>
                </div>

                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Heading Structure
                  </span>
                  <div className="mt-2 space-y-1">
                    {plan.heading_structure.map((h, i) => (
                      <div
                        key={i}
                        className={`text-sm ${h.level === "h2" ? "font-medium" : "pl-4 text-muted-foreground"}`}
                      >
                        <span className="text-xs text-muted-foreground mr-2 uppercase">
                          {h.level}
                        </span>
                        {h.text}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Word Count
                    </span>
                    <p className="text-sm font-medium mt-1">{plan.recommended_word_count.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Content Angle
                    </span>
                    <p className="text-sm mt-1">{plan.content_angle}</p>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Keyword Placement
                  </span>
                  <p className="text-sm text-muted-foreground mt-1">{plan.keyword_placement}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep("research")} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleGenerateArticle} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Generate Article
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Generation Progress */}
      {step === "generating" && (
        <Card className="border border-border/60 shadow-none">
          <CardContent className="p-6 space-y-5">
            <div>
              <h3 className="text-lg font-semibold">Generating Article</h3>
              <p className="text-sm text-muted-foreground mt-1">
                AI is crafting your content — this may take a moment
              </p>
            </div>

            <div className="space-y-3">
              {[
                "Generating title & meta...",
                "Building heading structure...",
                "Writing content sections...",
                "Creating FAQ schema...",
                "Generating image prompts...",
                "Calculating quality scores...",
              ].map((s, i) => {
                const completed = generationProgress.includes(s);
                const current =
                  !completed && generationProgress.length === i;
                return (
                  <div key={s} className="flex items-center gap-3">
                    {completed ? (
                      <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                    ) : current ? (
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-muted" />
                    )}
                    <span
                      className={`text-sm ${
                        completed
                          ? "text-foreground"
                          : current
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                      }`}
                    >
                      {s}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review & Publish */}
      {step === "review" && article && (
        <div className="space-y-4">
          <Card className="border border-border/60 shadow-none">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Review Article</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Review generated content before publishing
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setStep("plan")} className="gap-1.5">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Plan
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase">Title</Label>
                  <p className="text-base font-semibold mt-1">{article.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase">Slug</Label>
                    <p className="text-sm text-muted-foreground mt-1 font-mono">/{article.slug}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase">Reading Time</Label>
                    <p className="text-sm mt-1">{article.reading_minutes} min</p>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase">Excerpt</Label>
                  <p className="text-sm mt-1">{article.excerpt}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase">Tags</Label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {article.tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Scores */}
          <Card className="border border-border/60 shadow-none">
            <CardContent className="p-6">
              <h4 className="text-sm font-semibold mb-4">Quality Scores</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: "SEO", value: article.seo_score },
                  { label: "AEO", value: article.aeo_score },
                  { label: "GEO", value: article.geo_score },
                  { label: "E-E-A-T", value: article.eeat_score },
                  { label: "Readability", value: article.readability_score },
                  { label: "Overall", value: article.quality_score },
                ].map((s) => (
                  <div key={s.label} className="text-center p-3 rounded-lg bg-muted/50">
                    <p className="text-2xl font-semibold">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SEO Meta */}
          <Card className="border border-border/60 shadow-none">
            <CardContent className="p-6 space-y-3">
              <h4 className="text-sm font-semibold">SEO Metadata</h4>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase">SEO Title</Label>
                  <p className="text-sm mt-0.5">{article.seo_title}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase">Meta Description</Label>
                  <p className="text-sm text-muted-foreground mt-0.5">{article.seo_description}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase">Keywords</Label>
                  <p className="text-sm text-muted-foreground mt-0.5">{article.seo_keywords}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          {article.faq_json.length > 0 && (
            <Card className="border border-border/60 shadow-none">
              <CardContent className="p-6 space-y-3">
                <h4 className="text-sm font-semibold">FAQ Schema ({article.faq_json.length} items)</h4>
                <div className="space-y-2">
                  {article.faq_json.map((faq, i) => (
                    <div key={i} className="rounded-lg border border-border/50 p-3">
                      <p className="text-sm font-medium">{faq.question}</p>
                      <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end sticky bottom-0 bg-muted/30 py-4">
            <Button variant="outline" onClick={() => setPreviewOpen(true)} className="gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button variant="outline" onClick={handleSaveDraft} disabled={loading} className="gap-2">
              <Save className="h-4 w-4" />
              Save as Draft
            </Button>
            <Button onClick={handlePublish} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Publish Article
            </Button>
          </div>

          {/* Article Preview Modal */}
          <ArticlePreview
            open={previewOpen}
            onOpenChange={setPreviewOpen}
            article={{
              title: article.title,
              slug: article.slug,
              subtitle: article.subtitle,
              excerpt: article.excerpt,
              body: article.body,
              tags: article.tags,
              seo_title: article.seo_title,
              seo_description: article.seo_description,
              seo_keywords: article.seo_keywords,
              reading_minutes: article.reading_minutes,
              faq_json: article.faq_json,
            }}
            onEdit={() => setPreviewOpen(false)}
            onPublish={() => {
              setPreviewOpen(false);
              handlePublish();
            }}
            publishLabel="Publish to Trndinn Blog"
          />
        </div>
      )}
    </div>
  );
}
