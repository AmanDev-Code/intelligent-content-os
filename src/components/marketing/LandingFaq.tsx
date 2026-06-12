"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";

type FaqItem = { q?: string; a?: string };

export function LandingFaq({ title, items }: { title?: string; items: FaqItem[] }) {
  return (
    <Section>
      <SectionHeading eyebrow="FAQ" title={title ?? "Questions, answered"} />

      <Reveal delay={80} className="mx-auto mt-8 max-w-3xl md:mt-10">
        <Accordion
          type="single"
          collapsible
          className="space-y-2 rounded-2xl bg-card/80 p-2 backdrop-blur-md dark:bg-white/[0.04] sm:p-3"
        >
          {items.map((item, index) => (
            <AccordionItem
              key={item.q ?? index}
              value={`item-${index}`}
              className="overflow-hidden rounded-xl border-b-0 px-3 transition-colors data-[state=open]:bg-muted/40 sm:px-4 dark:data-[state=open]:bg-white/[0.04]"
            >
              <AccordionTrigger className="text-left font-display text-base font-semibold text-foreground hover:no-underline sm:text-lg">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </Section>
  );
}
