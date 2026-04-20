"use client";

import { useMemo, useState } from "react";
import { Loader2, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/apiClient";

export type JobQuestion = {
  id: string;
  sort_order: number;
  prompt: string;
  question_type: string;
  required: boolean;
  options: string[] | null;
  max_file_mb: number;
  allowed_file_exts: string[] | null;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

export function JobApplicationForm({ slug, questions }: { slug: string; questions: JobQuestion[] }) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[] | boolean>>({});
  const [fileByQuestion, setFileByQuestion] = useState<Record<string, File | null>>({});

  const sortedQuestions = useMemo(
    () => [...questions].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [questions],
  );

  function setAnswer(id: string, v: string | string[] | boolean) {
    setAnswers((prev) => ({ ...prev, [id]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast({ title: "Missing info", description: "Name and email are required.", variant: "destructive" });
      return;
    }
    const attachments: Array<{
      purpose: string;
      filename: string;
      mime_type: string;
      data_base64: string;
    }> = [];

    if (resumeFile) {
      const b64 = await fileToBase64(resumeFile);
      attachments.push({
        purpose: "resume",
        filename: resumeFile.name,
        mime_type: resumeFile.type || "application/octet-stream",
        data_base64: b64,
      });
    }

    for (const q of sortedQuestions) {
      if (q.question_type !== "file") continue;
      const f = fileByQuestion[q.id];
      if (f) {
        const b64 = await fileToBase64(f);
        attachments.push({
          purpose: `question:${q.id}`,
          filename: f.name,
          mime_type: f.type || "application/octet-stream",
          data_base64: b64,
        });
      }
    }

    const payloadAnswers: Record<string, string | string[] | number | boolean> = {};
    for (const q of sortedQuestions) {
      if (q.question_type === "file") continue;
      const v = answers[q.id];
      if (v === undefined) continue;
      if (q.question_type === "number" && typeof v === "string" && v.trim() !== "") {
        payloadAnswers[q.id] = Number(v);
      } else if (q.question_type === "yes_no") {
        payloadAnswers[q.id] = Boolean(v);
      } else {
        payloadAnswers[q.id] = v as string | string[];
      }
    }

    try {
      setSubmitting(true);
      await api.careers.apply(slug, {
        full_name: fullName,
        email,
        phone: phone || undefined,
        location: location || undefined,
        linkedin_url: linkedinUrl || undefined,
        portfolio_url: portfolioUrl || undefined,
        cover_letter: coverLetter || undefined,
        answers: payloadAnswers,
        attachments,
      });
      toast({
        title: "Application sent",
        description: "Thank you—we will review your profile and be in touch if there is a fit.",
      });
      setFullName("");
      setEmail("");
      setPhone("");
      setLocation("");
      setLinkedinUrl("");
      setPortfolioUrl("");
      setCoverLetter("");
      setResumeFile(null);
      setAnswers({});
      setFileByQuestion({});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Could not submit", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-6 rounded-[1.75rem] border border-white/10 bg-card/40 p-6 shadow-xl backdrop-blur-xl sm:p-8">
      <div>
        <h2 className="font-heading text-xl font-bold">Apply</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Attach a résumé (PDF or DOCX). Optional cover letter in text or file via screening questions below.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ca-name">Full name</Label>
          <Input id="ca-name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="border-white/15 bg-background/60" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ca-email">Email</Label>
          <Input id="ca-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="border-white/15 bg-background/60" />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ca-phone">Phone</Label>
          <Input id="ca-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="border-white/15 bg-background/60" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ca-loc">Location</Label>
          <Input id="ca-loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, country" className="border-white/15 bg-background/60" />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ca-li">LinkedIn</Label>
          <Input id="ca-li" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://…" className="border-white/15 bg-background/60" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ca-port">Portfolio</Label>
          <Input id="ca-port" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://…" className="border-white/15 bg-background/60" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ca-resume">Résumé / CV</Label>
        <Input
          id="ca-resume"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
          className="border-white/15 bg-background/60"
        />
        <p className="text-xs text-muted-foreground">PDF or Word, max ~8MB per file.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ca-cover">Cover letter (optional)</Label>
        <Textarea id="ca-cover" rows={5} value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} className="resize-none border-white/15 bg-background/60" />
      </div>

      {sortedQuestions.length > 0 ? (
        <div className="space-y-6 border-t border-white/10 pt-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Screening questions</p>
          {sortedQuestions.map((q) => (
            <div key={q.id} className="space-y-2">
              <Label className="text-sm font-medium">
                {q.prompt}
                {q.required ? <span className="text-destructive"> *</span> : null}
              </Label>
              {q.question_type === "short_text" || q.question_type === "url" ? (
                <Input
                  value={(answers[q.id] as string) || ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  required={q.required}
                  className="border-white/15 bg-background/60"
                />
              ) : null}
              {q.question_type === "long_text" ? (
                <Textarea
                  rows={4}
                  value={(answers[q.id] as string) || ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  required={q.required}
                  className="resize-none border-white/15 bg-background/60"
                />
              ) : null}
              {q.question_type === "number" ? (
                <Input
                  type="number"
                  value={(answers[q.id] as string) || ""}
                  onChange={(e) => setAnswer(q.id, e.target.value)}
                  required={q.required}
                  className="border-white/15 bg-background/60"
                />
              ) : null}
              {q.question_type === "yes_no" ? (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`yn-${q.id}`}
                    checked={Boolean(answers[q.id])}
                    onCheckedChange={(c) => setAnswer(q.id, c === true)}
                  />
                  <Label htmlFor={`yn-${q.id}`} className="text-sm font-normal text-muted-foreground">
                    Yes
                  </Label>
                </div>
              ) : null}
              {q.question_type === "single_choice" && q.options?.length ? (
                <Select
                  value={(answers[q.id] as string) || ""}
                  onValueChange={(v) => setAnswer(q.id, v)}
                  required={q.required}
                >
                  <SelectTrigger className="border-white/15 bg-background/60">
                    <SelectValue placeholder="Choose one" />
                  </SelectTrigger>
                  <SelectContent>
                    {q.options.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
              {q.question_type === "multi_choice" && q.options?.length ? (
                <div className="space-y-2">
                  {q.options.map((opt) => {
                    const selected = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : [];
                    const on = selected.includes(opt);
                    return (
                      <label key={opt} className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={on}
                          onCheckedChange={(c) => {
                            const next = new Set(selected);
                            if (c === true) next.add(opt);
                            else next.delete(opt);
                            setAnswer(q.id, Array.from(next));
                          }}
                        />
                        {opt}
                      </label>
                    );
                  })}
                </div>
              ) : null}
              {q.question_type === "file" ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept={(q.allowed_file_exts || ["pdf", "doc", "docx"]).map((x) => `.${x}`).join(",")}
                    onChange={(e) =>
                      setFileByQuestion((prev) => ({ ...prev, [q.id]: e.target.files?.[0] || null }))
                    }
                    className="border-white/15 bg-background/60"
                  />
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff5d4f] py-6 text-base font-semibold text-white sm:w-auto sm:px-10"
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : (
          "Submit application"
        )}
      </Button>
    </form>
  );
}
