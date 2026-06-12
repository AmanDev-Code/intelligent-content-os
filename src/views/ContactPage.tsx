"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock3, Loader2, Mail, MessageSquare, Send, Sparkles } from "lucide-react";
import { FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { BackersBand } from "@/components/marketing/BackersBand";
import { Reveal } from "@/components/marketing/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/apiClient";
import { DEFAULT_MARKETING_CONTENT, useSiteContent } from "@/lib/marketing/siteContent";
import { cn } from "@/lib/utils";

import { supportEmail } from "@/lib/site";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Errors = { email?: string; message?: string };

export default function ContactPage({ h1Override }: { h1Override?: string | null }) {
  const { toast } = useToast();
  const { content } = useSiteContent();
  const backers = content.landing_backers ?? DEFAULT_MARKETING_CONTENT.landing_backers;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<{ email?: boolean; message?: boolean }>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  function validate(): Errors {
    const next: Errors = {};
    if (!email.trim()) next.email = "Email is required.";
    else if (!EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address.";
    if (!message.trim()) next.message = "Please add a message.";
    else if (message.trim().length < 10) next.message = "Your message is a little short.";
    return next;
  }

  function handleBlur(field: "email" | "message") {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate());
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    setTouched({ email: true, message: true });
    if (Object.keys(found).length > 0) return;

    setStatus("submitting");
    try {
      await api.contact.submit({
        name: name.trim() || undefined,
        email: email.trim(),
        company: company.trim() || undefined,
        message: message.trim(),
        website: website || undefined,
      });
      setStatus("success");
      toast({ title: "Message sent", description: "We will get back to you soon." });
    } catch (err) {
      setStatus("error");
      toast({
        title: "Something went wrong",
        description: err instanceof Error ? err.message : `Please email ${supportEmail} directly.`,
        variant: "destructive",
      });
    }
  }

  function resetForm() {
    setName("");
    setEmail("");
    setCompany("");
    setMessage("");
    setErrors({});
    setTouched({});
    setStatus("idle");
  }

  const submitting = status === "submitting";

  return (
    <MarketingShell>
      <main>
        {/* Hero — theme-aware glowing band, consistent with landing/features */}
        <section className="relative isolate overflow-hidden">
          {/* Sits on the one page canvas (MarketingShell); only soft in-flow accents on top. */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,hsl(var(--primary)/0.12),transparent_55%)] dark:bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,rgba(255,138,31,0.26),transparent_55%)]" />
          <div className="pointer-events-none absolute -left-32 top-10 -z-10 h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl dark:bg-primary/25" />
          <div className="pointer-events-none absolute -right-24 top-1/3 -z-10 h-[380px] w-[380px] rounded-full bg-[#ff3d39]/10 blur-3xl dark:bg-[#ff3d39]/20" />
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5] dark:opacity-100"
            style={{
              backgroundImage:
                "linear-gradient(to right, hsl(var(--foreground) / 0.07) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground) / 0.07) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse 80% 60% at 50% 25%, black, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 25%, black, transparent 75%)",
            }}
          />

          <div className="mx-auto max-w-3xl px-4 pb-10 pt-10 text-center sm:px-6 sm:pb-16 sm:pt-16 md:pb-20 md:pt-20">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground backdrop-blur-md dark:bg-white/5 dark:text-white/70">
                <MessageSquare className="h-3.5 w-3.5 text-primary" aria-hidden />
                Contact
              </span>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="mt-5 font-display text-[2rem] font-black leading-[1.1] tracking-tight text-foreground sm:mt-6 sm:text-5xl sm:leading-[1.05] md:text-6xl">
                {h1Override ?? (
                  <>
                    Let&apos;s build your{" "}
                    <span className="text-gradient-brand animate-gradient-x">social engine</span>
                  </>
                )}
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mx-auto mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
                Questions about product, partnerships, or getting set up? Send us a note and a real person on the
                Trndinn team will reply.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Form + alternative methods */}
        <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-4 sm:px-6 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-7">
            <div className="p-0 sm:p-0">
              {status === "success" ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-500 dark:text-emerald-400">
                    <CheckCircle2 className="h-8 w-8" aria-hidden />
                  </span>
                  <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-foreground">
                    Message sent
                  </h2>
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Thanks for reaching out. We sent a confirmation to your inbox and a member of the team will be in
                    touch soon.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 cursor-pointer rounded-full"
                    onClick={resetForm}
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {/* Honeypot: hidden from humans, catches bots */}
                  <div className="absolute left-[-9999px]" aria-hidden>
                    <label htmlFor="website">Website</label>
                    <input
                      id="website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Jordan Rivera"
                        autoComplete="name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Work email <span className="text-primary">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => handleBlur("email")}
                        placeholder="you@company.com"
                        autoComplete="email"
                        aria-invalid={touched.email && !!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        className={cn(touched.email && errors.email && "border-destructive focus-visible:ring-destructive")}
                      />
                      {touched.email && errors.email ? (
                        <p id="email-error" className="text-xs font-medium text-destructive">
                          {errors.email}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Acme Inc."
                      autoComplete="organization"
                    />
                  </div>

                  <div className="mt-5 space-y-2">
                    <Label htmlFor="message">
                      How can we help? <span className="text-primary">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onBlur={() => handleBlur("message")}
                      placeholder="Share your goals, team size, the channels you care about, and a timeline."
                      aria-invalid={touched.message && !!errors.message}
                      aria-describedby={errors.message ? "message-error" : undefined}
                      className={cn(
                        "resize-none",
                        touched.message && errors.message && "border-destructive focus-visible:ring-destructive",
                      )}
                    />
                    {touched.message && errors.message ? (
                      <p id="message-error" className="text-xs font-medium text-destructive">
                        {errors.message}
                      </p>
                    ) : null}
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="mt-6 w-full cursor-pointer rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] py-6 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70 sm:w-auto sm:px-10"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" aria-hidden />
                        Send message
                      </>
                    )}
                  </Button>
                  <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                    By submitting, you agree to be contacted about your inquiry. We never sell your data.
                  </p>
                </form>
              )}
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-5">
            <div className="flex h-full flex-col gap-6">
              <div className="p-0 sm:p-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Email us</p>
                <a
                  href={`mailto:${supportEmail}`}
                  className="mt-2 inline-flex items-center gap-2 text-lg font-semibold text-foreground transition-colors hover:text-primary"
                >
                  <Mail className="h-5 w-5 text-primary" aria-hidden />
                  {supportEmail}
                </a>

                <div className="mt-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Response time</p>
                  <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock3 className="h-4 w-4 text-primary" aria-hidden />
                    Usually within one business day
                  </p>
                </div>

                <div className="mt-6">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Follow along</p>
                  <div className="mt-3 flex gap-3">
                    <Link
                      href="https://www.linkedin.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-muted/60 text-[#0A66C2] transition-colors hover:bg-muted dark:bg-white/[0.05] dark:hover:bg-white/[0.08]"
                    >
                      <FaLinkedinIn className="h-4 w-4" aria-hidden />
                    </Link>
                    <Link
                      href="https://twitter.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="X"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-muted/60 text-foreground transition-colors hover:bg-muted dark:bg-white/[0.05] dark:hover:bg-white/[0.08]"
                    >
                      <FaXTwitter className="h-4 w-4" aria-hidden />
                    </Link>
                    <Link
                      href="https://www.instagram.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-muted/60 text-[#E4405F] transition-colors hover:bg-muted dark:bg-white/[0.05] dark:hover:bg-white/[0.08]"
                    >
                      <FaInstagram className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>

              <div className="p-0 sm:p-0">
                <Sparkles className="h-5 w-5 text-primary" aria-hidden />
                <h3 className="mt-3 font-display text-lg font-bold tracking-tight text-foreground">
                  Just want to try it?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Skip the form and start free with 150 credits. No card required.
                </p>
                <Button asChild className="mt-5 cursor-pointer rounded-full" variant="outline">
                  <Link href="/auth">Start free</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>

        <BackersBand
          title={backers?.title}
          subtitle={backers?.subtitle}
          items={backers?.items ?? DEFAULT_MARKETING_CONTENT.landing_backers.items}
        />
      </main>
    </MarketingShell>
  );
}
