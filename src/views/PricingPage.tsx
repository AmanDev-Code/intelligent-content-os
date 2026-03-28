"use client";

import Link from "next/link";
import { HelpCircle, ShieldCheck, Users, Zap } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { MarketingPlanGrid } from "@/components/marketing/MarketingPlanGrid";
import { PricingComparisonTable } from "@/components/marketing/PricingComparisonTable";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

export default function PricingPage() {
  return (
    <MarketingShell>
      <main className="pb-24">
        <section className="relative overflow-hidden px-4 pt-14 sm:px-6 sm:pt-20">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/4 top-0 h-[min(50vw,420px)] w-[min(50vw,420px)] -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
            <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-red-500/10 blur-[90px]" />
            <div className="absolute right-1/3 top-1/3 h-64 w-64 rounded-full bg-cyan-500/10 blur-[80px]" />
          </div>
          <div className="mx-auto max-w-6xl text-center">
            <p className="font-heading text-xs font-semibold uppercase tracking-[0.28em] text-primary">Transparent growth economics</p>
            <h1 className="mt-4 font-heading text-4xl font-black tracking-tight sm:text-6xl md:text-7xl md:leading-[1.05]">
              Credit-based plans that scale with your output
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Start free, graduate to Standard or Pro as volume grows, and open Ultimate when you need fleet-scale credits and
              support. Same numbers everywhere—marketing, app, and checkout.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button className="rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] px-8 font-semibold text-white shadow-xl shadow-primary/25" asChild>
                <Link href="/auth">Start free</Link>
              </Button>
              <Button variant="outline" className="rounded-full border-white/15 bg-background/40 backdrop-blur-md" asChild>
                <Link href="/contact">Talk to sales</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-6xl sm:mt-20">
          <MarketingPlanGrid />
        </section>

        <section className="mx-auto mt-20 sm:mt-24">
          <PricingComparisonTable />
        </section>

        <section className="mx-auto mt-16 grid max-w-6xl gap-6 px-4 sm:mt-20 sm:px-6 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Secure billing", text: "Paddle-powered checkout and subscription lifecycle you can trust." },
            { icon: Users, title: "Built for teams", text: "Collaboration and higher credit pools on Pro and Ultimate." },
            { icon: Zap, title: "Velocity that compounds", text: "More credits mean more generations, schedules, and experiments." },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-2xl bg-gradient-to-br from-card/80 to-card/40 p-6 shadow-xl shadow-black/20 backdrop-blur-xl"
            >
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-heading text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto mt-16 max-w-3xl px-4 sm:mt-20 sm:px-6">
          <h2 className="text-center font-heading text-2xl font-bold sm:text-3xl">FAQ</h2>
          <Accordion type="single" collapsible className="mt-8">
            {[
              {
                q: "Can I change plans any time?",
                a: "Yes. Upgrades apply right away and downgrades apply at the next billing cycle.",
              },
              {
                q: "What is live vs roadmap?",
                a: "LinkedIn publishing, AI creation, scheduling, media, and analytics are live. Multi-channel rollouts, reels expansion, and outreach continue in phased releases.",
              },
              {
                q: "Do you support teams?",
                a: "Yes. Pro and Ultimate are designed for collaborative workflows and larger content operations.",
              },
              {
                q: "How do annual plans help?",
                a: "Annual billing reduces effective monthly spend and improves planning for teams with sustained output.",
              },
              {
                q: "How are credits consumed?",
                a: "The API deducts credits per job. A common text-generation check uses about 1.5 credits; images are often around 1 credit; carousels scale with complexity. Failed jobs can be refunded—see the comparison table for monthly pools per plan.",
              },
            ].map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`} className="border-border/60">
                <AccordionTrigger className="text-left font-heading hover:no-underline">
                  <span className="inline-flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 shrink-0 text-primary" />
                    {item.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
    </MarketingShell>
  );
}
