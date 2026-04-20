"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, ChevronRight, ExternalLink, Loader2, Pencil, Plus, Sparkles, Trash2, Users } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { api } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DateTimePicker } from "@/components/ui/datetime-picker";

type QType =
  | "short_text"
  | "long_text"
  | "yes_no"
  | "single_choice"
  | "multi_choice"
  | "number"
  | "url"
  | "file";

type QuestionDraft = {
  prompt: string;
  question_type: QType;
  required: boolean;
  options: string[];
  max_file_mb: number;
  allowed_file_exts: string[];
};

const defaultQuestion = (): QuestionDraft => ({
  prompt: "",
  question_type: "short_text",
  required: true,
  options: [],
  max_file_mb: 10,
  allowed_file_exts: ["pdf", "doc", "docx"],
});

type JobApplicationFileRow = {
  id: string;
  purpose: string;
  original_name: string;
  public_url: string;
};

type JobQuestionMeta = {
  id: string;
  sort_order: number;
  prompt: string;
  question_type: string;
};

type ApplicationRow = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  linkedin_url?: string | null;
  portfolio_url?: string | null;
  cover_letter?: string | null;
  answers?: Record<string, unknown> | null;
  status?: string;
  created_at: string;
  job_application_files?: JobApplicationFileRow[];
};

function formatScreeningValue(value: unknown): string {
  if (value === undefined || value === null) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.map(String).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function fileForQuestion(files: JobApplicationFileRow[], questionId: string) {
  return files.find((f) => f.purpose === `question:${questionId}`);
}

function generalApplicationFiles(files: JobApplicationFileRow[]) {
  return files.filter((f) => !String(f.purpose).startsWith("question:"));
}

function AppDetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border/40 pt-3 first:border-t-0 first:pt-0">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function ApplicationDetailPanel({ app, questions }: { app: ApplicationRow; questions: JobQuestionMeta[] }) {
  const sorted = [...questions].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const rawAnswers = app.answers && typeof app.answers === "object" && !Array.isArray(app.answers) ? app.answers : {};
  const files = app.job_application_files || [];
  const qIds = new Set(sorted.map((q) => q.id));
  const orphanPairs = Object.entries(rawAnswers).filter(([k]) => !qIds.has(k));
  const docs = generalApplicationFiles(files);

  return (
    <div className="rounded-lg border border-border/60 bg-card/30 p-4 text-sm shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border/40 pb-3">
        <div>
          <p className="font-semibold text-foreground">
            {app.full_name}{" "}
            <span className="font-normal text-muted-foreground">&lt;{app.email}&gt;</span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Applied {new Date(app.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        {app.status ? (
          <Badge variant="secondary" className="shrink-0 capitalize">
            {String(app.status).replace(/_/g, " ")}
          </Badge>
        ) : null}
      </div>

      <div className="mt-4 space-y-4">
        {(app.phone || app.location) && (
          <AppDetailSection title="Contact">
            <dl className="space-y-3 text-xs">
              {app.phone ? (
                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="mt-0.5 text-foreground">{app.phone}</dd>
                </div>
              ) : null}
              {app.location ? (
                <div>
                  <dt className="text-muted-foreground">Location</dt>
                  <dd className="mt-0.5 text-foreground">{app.location}</dd>
                </div>
              ) : null}
            </dl>
          </AppDetailSection>
        )}

        {(app.linkedin_url || app.portfolio_url) && (
          <AppDetailSection title="Links">
            <ul className="space-y-1.5 text-xs">
              {app.linkedin_url ? (
                <li>
                  <a
                    href={app.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                  >
                    LinkedIn <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ) : null}
              {app.portfolio_url ? (
                <li>
                  <a
                    href={app.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
                  >
                    Portfolio / website <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ) : null}
            </ul>
          </AppDetailSection>
        )}

        {app.cover_letter ? (
          <AppDetailSection title="Cover letter">
            <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{app.cover_letter}</p>
          </AppDetailSection>
        ) : null}

        {docs.length > 0 ? (
          <AppDetailSection title="Resume & attachments">
            <ul className="space-y-1.5">
              {docs.map((f) => (
                <li key={f.id}>
                  <a
                    href={f.public_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
                  >
                    <span className="capitalize text-muted-foreground">{f.purpose}:</span> {f.original_name}{" "}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
          </AppDetailSection>
        ) : null}

        {sorted.length > 0 ? (
          <AppDetailSection title="Screening answers">
            <div className="space-y-4">
              {sorted.map((q) => {
                const val = rawAnswers[q.id];
                const isFile = q.question_type === "file";
                const qFile = isFile ? fileForQuestion(files, q.id) : undefined;

                return (
                  <div key={q.id} className="border-b border-border/30 pb-4 last:border-b-0 last:pb-0">
                    <p className="text-xs font-medium text-foreground">{q.prompt}</p>
                    <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {q.question_type.replace(/_/g, " ")}
                    </p>
                    {isFile ? (
                      qFile ? (
                        <a
                          href={qFile.public_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
                        >
                          {qFile.original_name} <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <p className="mt-2 text-xs text-muted-foreground">No file uploaded</p>
                      )
                    ) : (
                      <p
                        className={`mt-2 text-xs text-foreground/90 ${
                          q.question_type === "long_text" ? "whitespace-pre-wrap leading-relaxed" : ""
                        }`}
                      >
                        {formatScreeningValue(val)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </AppDetailSection>
        ) : null}

        {orphanPairs.length > 0 ? (
          <AppDetailSection title="Other responses (legacy or removed questions)">
            <ul className="space-y-2">
              {orphanPairs.map(([k, v]) => (
                <li key={k} className="rounded-md border border-border/30 bg-muted/20 px-3 py-2 text-xs">
                  <span className="font-mono text-[10px] text-muted-foreground">{k}</span>
                  <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{formatScreeningValue(v)}</p>
                </li>
              ))}
            </ul>
          </AppDetailSection>
        ) : null}
      </div>
    </div>
  );
}

type JobRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: string;
  scheduled_publish_at: string | null;
  published_at: string | null;
  updated_at: string;
};

type CopyField =
  | "summary"
  | "description"
  | "responsibilities"
  | "requirements"
  | "nice_to_have"
  | "benefits"
  | "team_overview"
  | "equity_notes";

export default function CareersAdminPage() {
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [appsJobId, setAppsJobId] = useState<string | null>(null);
  const [appQuestionsForModal, setAppQuestionsForModal] = useState<JobQuestionMeta[]>([]);
  /** null = list all applications; set when user opens one applicant's full detail */
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<CopyField | "all" | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("Engineering");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("full_time");
  const [remoteOption, setRemoteOption] = useState("hybrid");
  const [salaryBand, setSalaryBand] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [requirements, setRequirements] = useState("");
  const [niceToHave, setNiceToHave] = useState("");
  const [benefits, setBenefits] = useState("");
  const [teamOverview, setTeamOverview] = useState("");
  const [equityNotes, setEquityNotes] = useState("");
  const [visa, setVisa] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<string>("draft");
  const [scheduledAt, setScheduledAt] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [questions, setQuestions] = useState<QuestionDraft[]>([defaultQuestion()]);

  const load = useCallback(async () => {
    const res = await api.admin.careersListJobs();
    setJobs(res.jobs || []);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        setLoading(true);
        await load();
      } catch (e: unknown) {
        toast({
          title: "Failed to load jobs",
          description: e instanceof Error ? e.message : "Error",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin, load, toast]);

  function openCreate() {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setCategory("Engineering");
    setLocation("");
    setEmploymentType("full_time");
    setRemoteOption("hybrid");
    setSalaryBand("");
    setSummary("");
    setDescription("");
    setResponsibilities("");
    setRequirements("");
    setNiceToHave("");
    setBenefits("");
    setTeamOverview("");
    setEquityNotes("");
    setVisa(false);
    setDeadline("");
    setStatus("draft");
    setScheduledAt("");
    setDisplayOrder(0);
    setQuestions([defaultQuestion()]);
    setEditorOpen(true);
  }

  async function openEdit(id: string) {
    try {
      const res = await api.admin.careersGetJob(id);
      const j = res.job;
      setEditingId(id);
      setTitle(j.title || "");
      setSlug(j.slug || "");
      setCategory(j.category || "General");
      setLocation(j.location || "");
      setEmploymentType(j.employment_type || "full_time");
      setRemoteOption(j.remote_option || "hybrid");
      setSalaryBand(j.salary_band || "");
      setSummary(j.summary || "");
      setDescription(j.description || "");
      setResponsibilities(j.responsibilities || "");
      setRequirements(j.requirements || "");
      setNiceToHave(j.nice_to_have || "");
      setBenefits(j.benefits || "");
      setTeamOverview(j.team_overview || "");
      setEquityNotes(j.equity_notes || "");
      setVisa(Boolean(j.visa_sponsorship));
      setDeadline(
        j.application_deadline ? new Date(j.application_deadline as string).toISOString() : "",
      );
      setStatus(j.status || "draft");
      setScheduledAt(
        j.scheduled_publish_at ? new Date(j.scheduled_publish_at as string).toISOString() : "",
      );
      setDisplayOrder(j.display_order ?? 0);
      const qs = (res.questions || []).map((q: any) => ({
        prompt: q.prompt,
        question_type: q.question_type as QType,
        required: q.required !== false,
        options: Array.isArray(q.options) ? q.options : [],
        max_file_mb: q.max_file_mb ?? 10,
        allowed_file_exts: Array.isArray(q.allowed_file_exts) ? q.allowed_file_exts : ["pdf", "doc", "docx"],
      }));
      setQuestions(qs.length ? qs : [defaultQuestion()]);
      setEditorOpen(true);
    } catch (e: unknown) {
      toast({
        title: "Load failed",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    }
  }

  async function saveJob() {
    if (!title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    if (status === "scheduled" && !scheduledAt.trim()) {
      toast({
        title: "Pick a publish time",
        description: "Scheduled listings need a date and time.",
        variant: "destructive",
      });
      return;
    }
    const payload: Record<string, unknown> = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      category: category.trim(),
      location: location.trim() || undefined,
      employment_type: employmentType,
      remote_option: remoteOption,
      salary_band: salaryBand.trim() || undefined,
      summary: summary.trim() || undefined,
      description: description.trim(),
      responsibilities: responsibilities.trim() || undefined,
      requirements: requirements.trim() || undefined,
      nice_to_have: niceToHave.trim() || undefined,
      benefits: benefits.trim() || undefined,
      team_overview: teamOverview.trim() || undefined,
      equity_notes: equityNotes.trim() || undefined,
      visa_sponsorship: visa,
      application_deadline: deadline ? new Date(deadline).toISOString() : null,
      status,
      scheduled_publish_at:
        status === "scheduled" && scheduledAt ? new Date(scheduledAt).toISOString() : null,
      display_order: displayOrder,
      questions: questions
        .filter((q) => q.prompt.trim())
        .map((q, i) => ({
          sort_order: i,
          prompt: q.prompt.trim(),
          question_type: q.question_type,
          required: q.required,
          options: ["single_choice", "multi_choice"].includes(q.question_type) ? q.options.filter(Boolean) : [],
          max_file_mb: q.question_type === "file" ? q.max_file_mb : undefined,
          allowed_file_exts: q.question_type === "file" ? q.allowed_file_exts : undefined,
        })),
    };
    try {
      setSaving(true);
      if (editingId) {
        await api.admin.careersUpdateJob(editingId, payload);
        toast({ title: "Job updated" });
      } else {
        await api.admin.careersCreateJob(payload);
        toast({ title: "Job created" });
      }
      setEditorOpen(false);
      await load();
    } catch (e: unknown) {
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

  async function deleteJob(id: string) {
    if (!confirm("Delete this job and all applications?")) return;
    try {
      await api.admin.careersDeleteJob(id);
      toast({ title: "Deleted" });
      await load();
    } catch (e: unknown) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    }
  }

  async function openApps(jobId: string) {
    try {
      const res = await api.admin.careersListApplications(jobId) as {
        applications?: ApplicationRow[];
        questions?: JobQuestionMeta[];
      };
      setSelectedApplicationId(null);
      setApplications(res.applications || []);
      setAppQuestionsForModal(res.questions || []);
      setAppsJobId(jobId);
      setAppsOpen(true);
    } catch (e: unknown) {
      toast({
        title: "Failed to load applications",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    }
  }

  function buildCopyContext() {
    return {
      title: title.trim(),
      category: category.trim() || undefined,
      location: location.trim() || undefined,
      employment_type: employmentType,
      remote_option: remoteOption,
      salary_band: salaryBand.trim() || undefined,
      visa_sponsorship: visa,
    };
  }

  function draftForField(field: CopyField): string | undefined {
    const map: Record<CopyField, string> = {
      summary,
      description,
      responsibilities,
      requirements,
      nice_to_have: niceToHave,
      benefits,
      team_overview: teamOverview,
      equity_notes: equityNotes,
    };
    const v = map[field]?.trim();
    return v || undefined;
  }

  async function runAiField(field: CopyField) {
    if (!title.trim()) {
      toast({ title: "Add a title first", description: "AI uses title, category, location, and role type as context.", variant: "destructive" });
      return;
    }
    setAiLoading(field);
    try {
      const res = await api.admin.careersAiField({
        field,
        context: buildCopyContext(),
        existingDraft: draftForField(field),
      });
      const text = (res?.text as string) || "";
      if (field === "summary") setSummary(text);
      else if (field === "description") setDescription(text);
      else if (field === "responsibilities") setResponsibilities(text);
      else if (field === "requirements") setRequirements(text);
      else if (field === "nice_to_have") setNiceToHave(text);
      else if (field === "benefits") setBenefits(text);
      else if (field === "team_overview") setTeamOverview(text);
      else if (field === "equity_notes") setEquityNotes(text);
      toast({ title: "AI draft ready", description: `Updated ${field.replace(/_/g, " ")} — review and edit before saving.` });
    } catch (e: unknown) {
      toast({
        title: "AI failed",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    } finally {
      setAiLoading(null);
    }
  }

  async function runAiAll() {
    if (!title.trim()) {
      toast({ title: "Add a title first", variant: "destructive" });
      return;
    }
    const existing: Record<string, string> = {};
    const pairs: [CopyField, string][] = [
      ["summary", summary],
      ["description", description],
      ["responsibilities", responsibilities],
      ["requirements", requirements],
      ["nice_to_have", niceToHave],
      ["benefits", benefits],
      ["team_overview", teamOverview],
      ["equity_notes", equityNotes],
    ];
    for (const [k, v] of pairs) {
      if (v.trim()) existing[k] = v;
    }
    setAiLoading("all");
    try {
      const res = await api.admin.careersAiAllSections({
        context: buildCopyContext(),
        existing: Object.keys(existing).length ? existing : undefined,
      });
      const s = res.sections as Record<string, string>;
      if (s.summary != null) setSummary(s.summary);
      if (s.description != null) setDescription(s.description);
      if (s.responsibilities != null) setResponsibilities(s.responsibilities);
      if (s.requirements != null) setRequirements(s.requirements);
      if (s.nice_to_have != null) setNiceToHave(s.nice_to_have);
      if (s.benefits != null) setBenefits(s.benefits);
      if (s.team_overview != null) setTeamOverview(s.team_overview);
      if (s.equity_notes != null) setEquityNotes(s.equity_notes);
      toast({ title: "All sections generated", description: "Review each block and save when ready." });
    } catch (e: unknown) {
      toast({
        title: "AI failed",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      });
    } finally {
      setAiLoading(null);
    }
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-heading text-2xl font-bold">Admin only</h1>
        <p className="mt-2 text-muted-foreground">Sign in with the admin account to manage careers.</p>
        <Button asChild className="mt-6 rounded-full">
          <Link href="/auth">Sign in</Link>
        </Button>
      </div>
    );
  }

  const selectedApplication =
    selectedApplicationId === null
      ? undefined
      : applications.find((a) => a.id === selectedApplicationId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">Careers admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Draft, schedule, publish, and review applicants.</p>
        </div>
        <Button className="rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff5d4f] font-semibold text-white" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New job
        </Button>
      </div>

      {loading ? (
        <div className="mt-16 flex justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-border/60">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id} className="border-t border-border/50">
                  <td className="px-4 py-3 font-medium">{j.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{j.category}</td>
                  <td className="px-4 py-3">
                    <Badge variant={j.status === "published" ? "default" : "secondary"}>{j.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => void openEdit(j.id)} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => void openApps(j.id)} aria-label="Applications">
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => void deleteJob(j.id)} aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center text-muted-foreground">
              <Briefcase className="h-8 w-8 opacity-50" />
              <p>No jobs yet. Create one to appear on the public careers page when published.</p>
            </div>
          ) : null}
        </div>
      )}

      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl gap-0 overflow-y-auto p-4 sm:p-5">
          <DialogHeader className="space-y-1 pb-2">
            <DialogTitle className="text-lg">{editingId ? "Edit job" : "New job"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 sm:grid-cols-2 [&_label]:text-xs [&_input]:h-9 [&_input]:min-h-9 [&_input]:py-1.5 [&_input]:text-sm [&_[role=combobox]]:h-9 [&_[role=combobox]]:min-h-9 [&_[role=combobox]]:py-0 [&_[role=combobox]]:text-sm [&_textarea]:text-sm">
            <div className="space-y-1 sm:col-span-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Slug (optional)</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto from title" />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Engineering, Product, …" />
            </div>
            <div className="space-y-1">
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Employment</Label>
              <Select value={employmentType} onValueChange={setEmploymentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full time</SelectItem>
                  <SelectItem value="part_time">Part time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Remote</Label>
              <Select value={remoteOption} onValueChange={setRemoteOption}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="on_site">On-site</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Salary band (text)</Label>
              <Input value={salaryBand} onChange={(e) => setSalaryBand(e.target.value)} placeholder="e.g. Competitive + equity" />
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 sm:col-span-2">
              <p className="text-xs font-semibold sm:text-sm">AI copy</p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground sm:text-xs">
                Fill Title, Category, Location, Employment, Remote, and Salary band first. Use one button to draft every long section from that context, or use{" "}
                <span className="font-medium text-foreground">AI</span> beside each field to create or refine only that block.
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-2 gap-2 h-8 text-xs"
                disabled={aiLoading !== null || !title.trim()}
                onClick={() => void runAiAll()}
              >
                {aiLoading === "all" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate all sections
              </Button>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Summary</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5 h-8"
                  disabled={aiLoading !== null || !title.trim()}
                  onClick={() => void runAiField("summary")}
                >
                  {aiLoading === "summary" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  AI
                </Button>
              </div>
              <Textarea rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Description</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5 h-8"
                  disabled={aiLoading !== null || !title.trim()}
                  onClick={() => void runAiField("description")}
                >
                  {aiLoading === "description" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  AI
                </Button>
              </div>
              <Textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Responsibilities</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5 h-8"
                  disabled={aiLoading !== null || !title.trim()}
                  onClick={() => void runAiField("responsibilities")}
                >
                  {aiLoading === "responsibilities" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  AI
                </Button>
              </div>
              <Textarea rows={4} value={responsibilities} onChange={(e) => setResponsibilities(e.target.value)} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Requirements</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5 h-8"
                  disabled={aiLoading !== null || !title.trim()}
                  onClick={() => void runAiField("requirements")}
                >
                  {aiLoading === "requirements" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  AI
                </Button>
              </div>
              <Textarea rows={4} value={requirements} onChange={(e) => setRequirements(e.target.value)} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Nice to have</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5 h-8"
                  disabled={aiLoading !== null || !title.trim()}
                  onClick={() => void runAiField("nice_to_have")}
                >
                  {aiLoading === "nice_to_have" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  AI
                </Button>
              </div>
              <Textarea rows={3} value={niceToHave} onChange={(e) => setNiceToHave(e.target.value)} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Benefits</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5 h-8"
                  disabled={aiLoading !== null || !title.trim()}
                  onClick={() => void runAiField("benefits")}
                >
                  {aiLoading === "benefits" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  AI
                </Button>
              </div>
              <Textarea rows={3} value={benefits} onChange={(e) => setBenefits(e.target.value)} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Team overview</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5 h-8"
                  disabled={aiLoading !== null || !title.trim()}
                  onClick={() => void runAiField("team_overview")}
                >
                  {aiLoading === "team_overview" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  AI
                </Button>
              </div>
              <Textarea rows={3} value={teamOverview} onChange={(e) => setTeamOverview(e.target.value)} />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Equity notes</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5 h-8"
                  disabled={aiLoading !== null || !title.trim()}
                  onClick={() => void runAiField("equity_notes")}
                >
                  {aiLoading === "equity_notes" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  AI
                </Button>
              </div>
              <Textarea rows={2} value={equityNotes} onChange={(e) => setEquityNotes(e.target.value)} />
            </div>

            <div className="sm:col-span-2 space-y-3 border-t border-border/50 pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Listing & schedule
              </p>
              <p className="-mt-2 text-[10px] leading-snug text-muted-foreground">
                Set how the job appears, when it goes live (if scheduled), and when applications close.
              </p>

              <div className="space-y-1">
                <Label>Listing status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft (hidden)</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="published">Published (live)</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {status === "scheduled" ? (
                <div className="space-y-1">
                  <DateTimePicker
                    label="Publish at"
                    value={scheduledAt || ""}
                    onChange={setScheduledAt}
                    minDate={new Date().toISOString()}
                    clearable
                    showQuickActions
                    compact
                    className="w-full"
                  />
                  <p className="text-[10px] leading-snug text-muted-foreground">
                    Same date/time picker as post scheduling; uses your preferred timezone.
                  </p>
                </div>
              ) : null}

              <div className="space-y-1">
                <DateTimePicker
                  label="Application deadline"
                  value={deadline || ""}
                  onChange={setDeadline}
                  clearable
                  showQuickActions
                  compact
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-start">
                <div className="space-y-1">
                  <Label htmlFor="careers-display-order">Display order</Label>
                  <Input
                    id="careers-display-order"
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value) || 0)}
                    className="w-full"
                  />
                  <p className="text-[10px] leading-snug text-muted-foreground">Higher numbers sort first on the public careers page.</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium leading-tight text-foreground">Visa sponsorship</span>
                  <label
                    htmlFor="visa"
                    title="Offer visa sponsorship for this role where legally applicable."
                    className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-2.5 text-[10px] font-normal leading-none text-foreground shadow-sm sm:text-[11px]"
                  >
                    <input
                      type="checkbox"
                      id="visa"
                      checked={visa}
                      onChange={(e) => setVisa(e.target.checked)}
                      className="h-3.5 w-3.5 shrink-0 rounded border-input"
                    />
                    <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                      Offer visa sponsorship
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 border-t border-border/60 pt-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold sm:text-sm">Screening questions</p>
              <Button type="button" variant="outline" size="sm" onClick={() => setQuestions((q) => [...q, defaultQuestion()])}>
                Add question
              </Button>
            </div>
            <div className="mt-2 space-y-2">
              {questions.map((q, idx) => (
                <div key={idx} className="rounded-md border border-border/60 p-2.5">
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-xs">Prompt</Label>
                      <Input value={q.prompt} onChange={(e) => {
                        const next = [...questions];
                        next[idx] = { ...q, prompt: e.target.value };
                        setQuestions(next);
                      }} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Type</Label>
                      <Select
                        value={q.question_type}
                        onValueChange={(v) => {
                          const next = [...questions];
                          next[idx] = { ...q, question_type: v as QType };
                          setQuestions(next);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short_text">Short text</SelectItem>
                          <SelectItem value="long_text">Long text</SelectItem>
                          <SelectItem value="yes_no">Yes / No</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                          <SelectItem value="single_choice">Single choice</SelectItem>
                          <SelectItem value="multi_choice">Multi choice</SelectItem>
                          <SelectItem value="file">File upload</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end gap-2 pb-1">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => {
                            const next = [...questions];
                            next[idx] = { ...q, required: e.target.checked };
                            setQuestions(next);
                          }}
                        />
                        Required
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        Remove
                      </Button>
                    </div>
                    {["single_choice", "multi_choice"].includes(q.question_type) ? (
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs">Options (comma-separated)</Label>
                        <Input
                          value={q.options.join(", ")}
                          onChange={(e) => {
                            const next = [...questions];
                            next[idx] = {
                              ...q,
                              options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                            };
                            setQuestions(next);
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="mt-2 gap-2 border-t border-border/40 pt-3 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" disabled={saving} onClick={() => void saveJob()} className="rounded-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={appsOpen}
        onOpenChange={(open) => {
          setAppsOpen(open);
          if (!open) {
            setAppsJobId(null);
            setAppQuestionsForModal([]);
            setApplications([]);
            setSelectedApplicationId(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedApplicationId ? "Application detail" : "Applications"}
            </DialogTitle>
            <DialogDescription>
              {appsJobId ? (
                <>
                  <span className="font-medium text-foreground/90">
                    {jobs.find((j) => j.id === appsJobId)?.title ?? "Job"}
                  </span>
                  {selectedApplicationId
                    ? " — review this submission below, or go back to the list."
                    : " — select an applicant to open their full application."}
                </>
              ) : (
                "Select a job from the list, then choose an applicant to see their full application."
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedApplicationId ? (
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setSelectedApplicationId(null)}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                All applications ({applications.length})
              </Button>
              <ScrollArea className="max-h-[65vh] pr-3">
                {selectedApplication ? (
                  <ApplicationDetailPanel app={selectedApplication} questions={appQuestionsForModal} />
                ) : (
                  <div className="space-y-3 py-2">
                    <p className="text-sm text-muted-foreground">This application is no longer in the list.</p>
                    <Button type="button" size="sm" variant="outline" onClick={() => setSelectedApplicationId(null)}>
                      Back to list
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </div>
          ) : (
            <ScrollArea className="max-h-[70vh] pr-3">
              {applications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No applications yet.</p>
              ) : (
                <ul className="space-y-2">
                  {applications.map((a) => (
                    <li key={a.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedApplicationId(a.id)}
                        className="flex w-full items-center gap-3 rounded-lg border border-border/60 bg-card/20 px-3 py-3 text-left text-sm transition-colors hover:border-border hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-foreground">{a.full_name}</p>
                          <p className="truncate text-xs text-muted-foreground">{a.email}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {new Date(a.created_at).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                        {a.status ? (
                          <Badge variant="secondary" className="shrink-0 capitalize">
                            {String(a.status).replace(/_/g, " ")}
                          </Badge>
                        ) : null}
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
