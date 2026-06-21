"use client";

import { ArticleGeneratorWizard } from "./ArticleGeneratorWizard";

interface GenerateSectionProps {
  onArticleSaved?: (postId: string) => void;
}

export function GenerateSection({ onArticleSaved }: GenerateSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Article Generator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate SEO-optimized articles with AI-powered research and writing
        </p>
      </div>
      <ArticleGeneratorWizard onArticleSaved={onArticleSaved} />
    </div>
  );
}
