"use client";

import type { LucideIcon } from "lucide-react";
import { Lock, ShieldCheck, Trash2, UserCheck } from "lucide-react";
import { Section, SectionHeading } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";

type TrustItem = { key?: string; title?: string; body?: string };

const ICONS: Record<string, LucideIcon> = {
  ownership: UserCheck,
  compliance: ShieldCheck,
  deletion: Trash2,
  security: Lock,
};

export function TrustBand({
  title,
  subtitle,
  disclaimer,
  items,
}: {
  title?: string;
  subtitle?: string;
  disclaimer?: string;
  items: TrustItem[];
}) {
  return (
    <Section>
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-muted/40 via-background to-muted/20 px-6 py-10 sm:px-12 sm:py-12 dark:from-white/[0.05] dark:via-background dark:to-white/[0.02]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        <SectionHeading
          eyebrow="Trust & compliance"
          title={title ?? "Your data. Your voice. Platform policies respected."}
          subtitle={
            subtitle ??
            "Trndinn is built to comply with the developer, platform, and AI policies of every network you connect, with clear ownership and deletion on disconnect."
          }
          className="relative"
        />

        <div className="relative mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 md:mt-10">
          {items.map((item, index) => {
            const Icon = ICONS[item.key ?? ""] ?? ShieldCheck;
            return (
              <Reveal key={item.key ?? index} delay={index * 70}>
                <div className="h-full rounded-2xl bg-card/70 p-5 backdrop-blur-sm dark:bg-white/[0.05]">
                  <Icon className="h-5 w-5 text-primary" aria-hidden />
                  <h3 className="mt-3 font-display text-base font-bold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {disclaimer ? (
          <Reveal delay={200}>
            <p className="relative mt-10 text-center text-xs leading-relaxed text-muted-foreground">
              {disclaimer}
            </p>
          </Reveal>
        ) : null}
      </div>
    </Section>
  );
}
