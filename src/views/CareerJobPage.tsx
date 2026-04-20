"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, Clock, MapPin } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { JobApplicationForm, type JobQuestion } from "@/components/careers/JobApplicationForm";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/apiClient";

type Job = {
  id: string;
  slug: string;
  title: string;
  category: string;
  location: string | null;
  employment_type: string;
  remote_option: string;
  salary_band: string | null;
  summary: string | null;
  description: string;
  responsibilities: string | null;
  requirements: string | null;
  nice_to_have: string | null;
  benefits: string | null;
  team_overview: string | null;
  equity_notes: string | null;
  visa_sponsorship: boolean;
  application_deadline: string | null;
};

export default function CareerJobPage({ slug }: { slug: string }) {
  const [job, setJob] = useState<Job | null>(null);
  const [questions, setQuestions] = useState<JobQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.careers.job(slug);
        if (cancelled) return;
        setJob(res.job);
        setQuestions(res.questions || []);
        setError(null);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Role not found");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <MarketingShell>
      <main className="pb-24">
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
          <Button variant="ghost" size="sm" className="mb-6 rounded-full -ml-2" asChild>
            <Link href="/careers" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              All roles
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="mx-auto max-w-6xl px-4 py-16 text-center text-muted-foreground sm:px-6">Loading…</div>
        ) : error || !job ? (
          <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6">
            <p className="text-destructive">{error || "Not found"}</p>
            <Button asChild className="mt-6 rounded-full" variant="outline">
              <Link href="/careers">Back to careers</Link>
            </Button>
          </div>
        ) : (
          <>
            <section className="mx-auto max-w-6xl px-4 sm:px-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-card/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                {job.category}
              </p>
              <h1 className="mt-4 font-heading text-3xl font-black tracking-tight sm:text-5xl">{job.title}</h1>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                {job.location ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-primary" />
                    {job.location}
                  </span>
                ) : null}
                <span className="capitalize">{job.employment_type.replace(/_/g, " ")}</span>
                <span className="capitalize">{job.remote_option.replace(/_/g, " ")}</span>
                {job.application_deadline ? (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4 text-primary" />
                    Apply by {new Date(job.application_deadline).toLocaleDateString()}
                  </span>
                ) : null}
                {job.visa_sponsorship ? <span>Visa sponsorship possible</span> : null}
              </div>
              {job.salary_band ? <p className="mt-3 text-sm font-medium text-muted-foreground">{job.salary_band}</p> : null}
              {job.summary ? <p className="mt-6 max-w-3xl text-lg text-muted-foreground">{job.summary}</p> : null}
            </section>

            <section className="mx-auto mt-12 grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-12">
              <article className="space-y-10 lg:col-span-7">
                {job.description ? (
                  <div className="rounded-2xl border border-white/10 bg-card/30 p-6 backdrop-blur-xl">
                    <h2 className="font-heading text-lg font-semibold">About the role</h2>
                    <div className="prose prose-invert mt-3 max-w-none whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                      {job.description}
                    </div>
                  </div>
                ) : null}
                {job.responsibilities ? (
                  <div className="rounded-2xl border border-white/10 bg-card/30 p-6 backdrop-blur-xl">
                    <h2 className="font-heading text-lg font-semibold">What you will do</h2>
                    <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{job.responsibilities}</div>
                  </div>
                ) : null}
                {job.requirements ? (
                  <div className="rounded-2xl border border-white/10 bg-card/30 p-6 backdrop-blur-xl">
                    <h2 className="font-heading text-lg font-semibold">Requirements</h2>
                    <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{job.requirements}</div>
                  </div>
                ) : null}
                {job.nice_to_have ? (
                  <div className="rounded-2xl border border-white/10 bg-card/30 p-6 backdrop-blur-xl">
                    <h2 className="font-heading text-lg font-semibold">Nice to have</h2>
                    <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{job.nice_to_have}</div>
                  </div>
                ) : null}
                {job.benefits ? (
                  <div className="rounded-2xl border border-white/10 bg-card/30 p-6 backdrop-blur-xl">
                    <h2 className="font-heading text-lg font-semibold">Benefits</h2>
                    <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{job.benefits}</div>
                  </div>
                ) : null}
                {job.team_overview ? (
                  <div className="rounded-2xl border border-white/10 bg-card/30 p-6 backdrop-blur-xl">
                    <h2 className="font-heading text-lg font-semibold">Team</h2>
                    <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{job.team_overview}</div>
                  </div>
                ) : null}
                {job.equity_notes ? (
                  <div className="rounded-2xl border border-white/10 bg-card/30 p-6 backdrop-blur-xl">
                    <h2 className="font-heading text-lg font-semibold">Equity</h2>
                    <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{job.equity_notes}</div>
                  </div>
                ) : null}
              </article>
              <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
                <JobApplicationForm slug={slug} questions={questions} />
              </div>
            </section>
          </>
        )}
      </main>
    </MarketingShell>
  );
}
