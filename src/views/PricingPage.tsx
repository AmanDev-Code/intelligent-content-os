"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, HelpCircle, ShieldCheck, Users, Zap } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SUBSCRIPTION_PLANS, calculateYearlyDiscount } from "@/config/plans";
import { cn } from "@/lib/utils";

const plans = SUBSCRIPTION_PLANS.filter((p) => ["free", "standard", "pro", "ultimate"].includes(p.id));

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <MarketingShell>
      <main className="pb-24">
        <section className="mx-auto max-w-6xl px-4 pt-12 text-center sm:px-6 sm:pt-16">
          <h1 className="font-heading text-4xl font-black tracking-tight sm:text-6xl">Pricing plans for every creator</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Start lean, then scale into a full social operating system as your output and pipeline grow.
          </p>
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-card/35 px-4 py-2">
            <span className={cn("text-sm", !annual && "font-semibold text-foreground")}>Monthly</span>
            <Switch checked={annual} onCheckedChange={setAnnual} aria-label="Toggle billing" />
            <span className={cn("text-sm", annual && "font-semibold text-foreground")}>
              Yearly <span className="text-primary">(save vs monthly x 12)</span>
            </span>
          </div>
        </section>

        <section className="mx-auto mt-12 grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-4">
          {plans.map((plan) => {
            const monthly = plan.pricing.monthly;
            const yearly = plan.pricing.yearly;
            const display = annual && yearly > 0 ? Math.round((yearly / 12) * 100) / 100 : monthly;
            const discount = monthly > 0 && yearly > 0 ? calculateYearlyDiscount(monthly, yearly) : 0;

            return (
              <article
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-card/40 p-6 backdrop-blur-xl transition",
                  plan.popular
                    ? "scale-[1.02] border-primary/40 shadow-xl shadow-primary/15"
                    : "border-white/10 hover:border-primary/25",
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff5d4f] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                    Most popular
                  </span>
                )}
                <h2 className="font-heading text-xl font-bold">{plan.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-6">
                  {monthly === 0 && yearly === 0 ? (
                    <span className="font-heading text-4xl font-black">$0</span>
                  ) : (
                    <span className="font-heading text-4xl font-black">
                      ${display}
                      <span className="text-base font-medium text-muted-foreground">/mo</span>
                    </span>
                  )}
                  {discount > 0 && annual && <p className="mt-1 text-xs text-primary">~{discount}% off yearly</p>}
                </div>
                <ul className="mt-6 flex-1 space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  className={cn(
                    "mt-8 w-full rounded-full font-semibold",
                    plan.popular
                      ? "bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] text-white"
                      : "bg-background/70",
                  )}
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <Link href="/auth">{plan.id === "free" ? "Start free" : "Choose plan"}</Link>
                </Button>
              </article>
            );
          })}
        </section>

        <section className="mx-auto mt-14 grid max-w-6xl gap-6 rounded-2xl border border-white/10 bg-card/25 p-8 px-4 sm:px-8 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Secure billing", text: "Paddle-powered checkout and subscription lifecycle." },
            { icon: Users, title: "Team-ready plans", text: "From solo creators to multi-seat publishing teams." },
            { icon: Zap, title: "Scale velocity", text: "More credits, deeper automation, and higher throughput." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <Icon className="mt-0.5 h-5 w-5 text-primary" />
              <div>
                <h3 className="font-heading font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mx-auto mt-14 max-w-3xl px-4 sm:px-6">
          <h2 className="text-center font-heading text-2xl font-bold">FAQ</h2>
          <Accordion type="single" collapsible className="mt-6">
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
            ].map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`} className="border-border/60">
                <AccordionTrigger className="text-left font-heading hover:no-underline">
                  <span className="inline-flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-primary" />
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
