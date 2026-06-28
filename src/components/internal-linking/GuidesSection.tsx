"use client";

import { Section, SectionHeading } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";
import { BookOpen, Sparkles } from "lucide-react";
import { GuideCard } from "./GuideCard";
import { getAllGuides, GUIDES } from "@/lib/internalLinking";

export type GuidesSectionContent = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  guideOrder?: Array<"ai-social-media-marketing" | "linkedin-automation" | "content-repurposing" | "social-media-scheduling">;
};

export function GuidesSection({
  title,
  subtitle,
  eyebrow,
  guideOrder,
}: GuidesSectionContent = {}) {
  const sectionTitle =
    title ?? "Master social media with our expert guides";
  const sectionSubtitle =
    subtitle ??
    "Step-by-step resources to help you automate LinkedIn, repurpose content, and leverage AI for social growth.";
  const sectionEyebrow = eyebrow ?? "Guides";

  // Get guides in specified order, or default to all guides
  const guides = guideOrder
    ? guideOrder.map((key) => GUIDES[key]).filter(Boolean)
    : getAllGuides();

  return (
    <Section
      id="guides"
      className="relative overflow-hidden"
      containerClassName="relative z-10"
    >
      {/* Background accents */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/5 to-transparent blur-3xl dark:from-primary/10" />
      <div className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-3xl dark:bg-emerald-500/10" />
      <div className="pointer-events-none absolute -left-32 top-1/2 -z-10 h-[300px] w-[300px] rounded-full bg-violet-500/5 blur-3xl dark:bg-violet-500/10" />

      <SectionHeading
        eyebrow={sectionEyebrow}
        title={sectionTitle}
        subtitle={sectionSubtitle}
        align="center"
      />

      {/* Guide Cards Grid */}
      <div className="mt-10 sm:mt-12">
        <nav aria-label="Marketing guides">
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {guides.map((guide, index) => (
              <li key={guide.key}>
                <GuideCard guide={guide} index={index} variant="featured" />
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* SEO-optimized footer content */}
      <Reveal delay={100}>
        <footer className="mt-10 flex flex-col items-center text-center sm:mt-12">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4 text-primary" aria-hidden />
            <span>
              Social media marketing guides: LinkedIn automation, AI content
              generation, content repurposing, social media scheduling
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted-foreground/70">
            Learn how to automate your social media workflow with our
            comprehensive guides. From LinkedIn automation strategies to
            AI-powered content creation and smart content repurposing
            techniques — everything you need to scale your social presence
            without the manual work.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground/60">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {guides.length} expert guides
            </span>
            <span>•</span>
            <span>Free resources for marketers</span>
            <span>•</span>
            <span>Updated regularly</span>
          </div>
        </footer>
      </Reveal>
    </Section>
  );
}
