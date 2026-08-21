"use client";

/**
 * BioGeneratorView — Main orchestrator for the modular Bio Generator tool.
 *
 * Layout: Side-by-side on desktop (form left, output right), stacked on mobile.
 * Matches BioLoom's split-pane pattern where config and output live next to each
 * other so users can tweak inputs and see results without scrolling.
 */

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Loader2 } from "lucide-react";
import { BioHero } from "./BioHero";
import { BioInputForm } from "./BioInputForm";
import { BioOutputTabs } from "./BioOutputTabs";
import { BioPendingState } from "./BioPendingState";
import { useBioStream } from "./use-bio-stream";
import type { BioPlatform, BioGeneratorViewHeroVariant } from "./types";

export interface BioGeneratorViewProps {
  heroVariant?: BioGeneratorViewHeroVariant;
  defaultPlatform?: BioPlatform;
  faqs: Array<{ question: string; answer: string }>;
}

export default function BioGeneratorView({
  heroVariant,
  defaultPlatform,
  faqs,
}: BioGeneratorViewProps) {
  const bio = useBioStream(defaultPlatform);

  return (
    <MarketingShell>
      <div className="min-h-screen bg-gradient-to-b from-[hsl(var(--background))] via-[hsl(var(--muted))]/40 to-[hsl(var(--background))]">
        {/* Hero */}
        <BioHero variant={heroVariant} />

        {/* Main content — side-by-side on desktop, stacked on mobile */}
        <section className="mx-auto max-w-7xl px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-6 items-start">
            {/* LEFT: Input form (sticky on desktop so it stays visible while scrolling output) */}
            <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:scrollbar-thin">
              <BioInputForm
                role={bio.form.role}
                setRole={bio.setRole}
                facts={bio.form.facts}
                setFacts={bio.setFacts}
                goal={bio.form.goal}
                setGoal={bio.setGoal}
                audience={bio.form.audience}
                setAudience={bio.setAudience}
                length={bio.form.length}
                setLength={bio.setLength}
                emojis={bio.form.emojis}
                setEmojis={bio.setEmojis}
                tone={bio.form.tone}
                setTone={bio.setTone}
                bioType={bio.form.bioType}
                setBioType={bio.setBioType}
                focusAreas={bio.form.focusAreas}
                platforms={bio.form.platforms}
                togglePlatform={bio.togglePlatform}
                toggleFocusArea={bio.toggleFocusArea}
                loadTemplate={bio.loadTemplate}
                isGenerating={bio.isGenerating}
                submit={bio.submit}
              />
            </div>

            {/* RIGHT: Output — streaming results appear here */}
            <div ref={bio.outputRef} className="min-h-[400px]">
              {/* Loading — no results yet, generation started */}
              {bio.results.length === 0 && bio.isGenerating && (
                <BioPendingState
                  pendingPlatforms={bio.pendingPlatforms}
                  isGenerating={bio.isGenerating}
                  hasResults={false}
                />
              )}

              {/* Results streaming in — tabs + cards */}
              {(bio.results.length > 0 || (bio.pendingPlatforms.size > 0 && bio.activeTab)) && bio.activeTab && (
                <BioOutputTabs
                  results={bio.results}
                  activeTab={bio.activeTab}
                  setActiveTab={bio.setActiveTab}
                  pendingPlatforms={bio.pendingPlatforms}
                  scores={bio.scores}
                  scoring={bio.scoring}
                  copiedKey={bio.copiedKey}
                  regenKey={bio.regenKey}
                  onCopy={bio.copyBio}
                  onRegenerate={bio.regenerateOne}
                  onScore={bio.scoreOne}
                />
              )}

              {/* Empty state — before any generation */}
              {bio.results.length === 0 && !bio.isGenerating && (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-lg border-2 border-dashed border-[hsl(var(--border))] p-10 text-center space-y-4">
                  <div className="h-14 w-14 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center">
                    <svg className="h-7 w-7 text-[hsl(var(--muted-foreground))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-heading text-lg text-[hsl(var(--foreground))]">Ready to generate</h3>
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))] max-w-xs mx-auto">
                      Fill in your details and click Generate to create 3 personalised bios per platform.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FAQ — full-width below the split */}
        {faqs.length > 0 && (
          <section className="mx-auto max-w-3xl px-4 pb-16">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center mb-8">
              Frequently asked questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="group rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 open:shadow-sm"
                >
                  <summary className="cursor-pointer font-medium text-[hsl(var(--foreground))] flex justify-between items-center">
                    {faq.question}
                    <span className="text-[hsl(var(--muted-foreground))] group-open:rotate-180 transition">▾</span>
                  </summary>
                  <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>
    </MarketingShell>
  );
}
