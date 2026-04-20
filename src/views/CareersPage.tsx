"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, MapPin, Radio, Sparkles } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/apiClient";
import { cn } from "@/lib/utils";

type JobRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  location: string | null;
  employment_type: string;
  remote_option: string;
  salary_band: string | null;
  summary: string | null;
  published_at: string | null;
  application_deadline: string | null;
  visa_sponsorship: boolean;
};

export default function CareersPage() {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [catRes, jobsRes] = await Promise.all([
          api.careers.categories(),
          api.careers.jobs({ category: filter === "all" ? undefined : filter }),
        ]);
        if (cancelled) return;
        setCategories(catRes.categories || []);
        setJobs(jobsRes.jobs || []);
        setError(null);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load openings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filter]);

  return (
    <MarketingShell>
      <main className="pb-24">
        <section className="relative overflow-hidden px-4 pt-12 sm:px-6 sm:pt-16">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/4 top-0 h-[min(50vw,420px)] w-[min(50vw,420px)] -translate-x-1/2 rounded-full bg-primary/20 blur-[100px]" />
            <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-red-500/10 blur-[90px]" />
          </div>
          <div className="mx-auto max-w-6xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-card/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <Briefcase className="h-3.5 w-3.5 text-primary" />
              Talent network
            </p>
            <h1 className="mt-5 font-heading text-4xl font-black tracking-tight sm:text-6xl">
              Build the calm command center for social growth.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              We are a small, product-obsessed team shipping AI-assisted workflows for creators and teams. If you love
              crisp UX, reliable systems, and moving fast with care, you will fit right in.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                className="rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff5d4f] px-8 font-semibold text-white shadow-xl shadow-primary/25"
                asChild
              >
                <Link href="/contact">Refer a friend</Link>
              </Button>
              <Button variant="outline" className="rounded-full border-white/15 bg-background/40 backdrop-blur-md" asChild>
                <Link href="/features">See the product</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold sm:text-3xl">Open roles</h2>
              <p className="mt-1 text-sm text-muted-foreground">Filter by team. Remote-friendly unless noted.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  filter === "all"
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground",
                )}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFilter(c)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                    filter === c
                      ? "border-primary/50 bg-primary/15 text-primary"
                      : "border-border/60 bg-card/40 text-muted-foreground hover:text-foreground",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="mt-10 rounded-2xl border border-white/10 bg-card/30 p-12 text-center text-muted-foreground">
              Loading openings…
            </div>
          ) : error ? (
            <div className="mt-10 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center text-sm text-destructive">
              {error}
            </div>
          ) : jobs.length === 0 ? (
            <div className="mt-10 rounded-[1.75rem] border border-white/10 bg-card/40 p-12 text-center backdrop-blur-xl">
              <Sparkles className="mx-auto h-10 w-10 text-primary opacity-80" />
              <p className="mt-4 font-heading text-lg font-semibold">No published roles right now</p>
              <p className="mt-2 text-sm text-muted-foreground">
                We still love meeting great people—say hello via{" "}
                <Link href="/contact" className="text-primary underline-offset-4 hover:underline">
                  Contact
                </Link>
                .
              </p>
            </div>
          ) : (
            <ul className="mt-10 grid gap-5 md:grid-cols-2">
              {jobs.map((job) => (
                <li key={job.id}>
                  <Link
                    href={`/careers/${job.slug}`}
                    className="group flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-card/40 p-6 shadow-xl backdrop-blur-xl transition hover:border-primary/35 hover:bg-card/55"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">{job.category}</p>
                        <h3 className="mt-2 font-heading text-xl font-semibold group-hover:text-primary">{job.title}</h3>
                      </div>
                      <Radio className="h-5 w-5 shrink-0 text-muted-foreground opacity-60 group-hover:text-primary" />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {job.location ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location}
                        </span>
                      ) : null}
                      <span className="capitalize">{job.employment_type.replace(/_/g, " ")}</span>
                      <span className="capitalize">{job.remote_option.replace(/_/g, " ")}</span>
                      {job.visa_sponsorship ? <span>Visa considered</span> : null}
                    </div>
                    {job.summary ? <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{job.summary}</p> : null}
                    {job.salary_band ? (
                      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{job.salary_band}</p>
                    ) : null}
                    <span className="mt-6 text-sm font-semibold text-primary">View role →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </MarketingShell>
  );
}
