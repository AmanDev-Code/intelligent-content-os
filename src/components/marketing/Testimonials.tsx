"use client";

import { Quote, Star } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";

type Testimonial = { quote: string; name: string; role: string; initials: string };

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I paste in a few of my best posts and Trndinn drafts in my voice instantly. A week of LinkedIn content now takes one coffee.",
    name: "Maya R.",
    role: "Founder, B2B SaaS",
    initials: "MR",
  },
  {
    quote:
      "The calendar plus reliable scheduling means we finally publish on cadence. Nothing slips, and the history makes reporting trivial.",
    name: "Daniel K.",
    role: "Content Lead, Agency",
    initials: "DK",
  },
  {
    quote:
      "What sold me was control. It only uses the examples I give it. No scraping, my data stays mine, and it still sounds like me.",
    name: "Priya S.",
    role: "Solo creator",
    initials: "PS",
  },
  {
    quote:
      "Variants from a single prompt let me A/B hooks without rewriting from scratch. Engagement on our page is up and steady.",
    name: "Tomás G.",
    role: "Growth Marketer",
    initials: "TG",
  },
  {
    quote:
      "We manage several company pages from one workspace. Brand voice stays consistent across the whole team, and that is the win.",
    name: "Hannah L.",
    role: "Head of Marketing",
    initials: "HL",
  },
  {
    quote:
      "Setup was honest and simple: connect, add examples, schedule. It does exactly what it says and stays out of the way.",
    name: "Arjun M.",
    role: "Indie founder",
    initials: "AM",
  },
];

export function Testimonials() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Wall of love"
        title="Teams and creators who publish with confidence"
        subtitle="Real-world workflows, in their words. You stay in control of your voice and your data."
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 md:mt-10">
        {TESTIMONIALS.map((t, index) => (
          <Reveal key={t.name} delay={(index % 3) * 80} className="h-full">
            <figure className="group relative flex h-full flex-col rounded-2xl bg-card/80 p-6 backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5 dark:bg-white/[0.04]">
              <Quote className="h-7 w-7 text-primary/30" aria-hidden />
              <div className="mt-3 flex gap-0.5" role="img" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" aria-hidden />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 pt-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#ff8a1f] to-[#ff3d39] text-sm font-bold text-white">
                  {t.initials}
                </span>
                <span className="leading-tight">
                  <span className="block text-sm font-semibold text-foreground">{t.name}</span>
                  <span className="block text-xs text-muted-foreground">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
