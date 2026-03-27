"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Clock3, Mail, MessageSquare, Send } from "lucide-react";
import { FaInstagram, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const supportEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@trndinn.com";

export default function ContactPage() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Trndinn contact: ${name || "Website"}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nCompany: ${company}\n\n${message}`);
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
    toast({
      title: "Opening your email app",
      description: `If nothing opens, email ${supportEmail} directly.`,
    });
  }

  return (
    <MarketingShell>
      <main className="pb-24">
        <section className="mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-card/45 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              Inquiry Terminal
            </p>
            <h1 className="mt-5 font-heading text-4xl font-black tracking-tight sm:text-6xl">Let us sync up.</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Whether you are launching solo or scaling a team, we can help you set up the right Trndinn workflow.
            </p>
          </div>
        </section>

        <section className="mx-auto mt-10 grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-12">
          <form
            onSubmit={handleSubmit}
            className="rounded-[1.75rem] border border-white/10 bg-card/40 p-6 shadow-xl backdrop-blur-2xl sm:p-8 lg:col-span-7"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" className="border-white/15 bg-background/60" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@company.com" className="border-white/15 bg-background/60" />
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <Label htmlFor="company">Organization</Label>
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company or team name" className="border-white/15 bg-background/60" />
            </div>
            <div className="mt-5 space-y-2">
              <Label htmlFor="message">Project goals</Label>
              <Textarea id="message" required rows={6} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Share your goals, team size, channels, and timeline." className="resize-none border-white/15 bg-background/60" />
            </div>
            <Button type="submit" className="mt-6 w-full rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff5d4f] py-6 text-base font-semibold text-white sm:w-auto sm:px-10">
              <Send className="mr-2 h-4 w-4" />
              Initialize sync
            </Button>
          </form>

          <aside className="space-y-6 rounded-[1.75rem] border border-white/10 bg-card/25 p-6 backdrop-blur-xl sm:p-8 lg:col-span-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Support protocol</p>
              <a href={`mailto:${supportEmail}`} className="mt-2 inline-flex items-center gap-2 text-xl font-semibold hover:text-primary">
                <Mail className="h-5 w-5" />
                {supportEmail}
              </a>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Availability window</p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Clock3 className="h-4 w-4 text-primary" />
                Monday-Friday, 09:00 to 17:00 UTC
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Network nodes</p>
              <div className="mt-3 flex gap-3">
                <Link href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-background/60 text-[#0A66C2] hover:border-primary/40" aria-label="LinkedIn">
                  <FaLinkedinIn className="h-4 w-4" />
                </Link>
                <Link href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-background/60 text-foreground hover:border-primary/40" aria-label="X">
                  <FaXTwitter className="h-4 w-4" />
                </Link>
                <Link href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-background/60 text-pink-500 hover:border-primary/40" aria-label="Instagram">
                  <FaInstagram className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </MarketingShell>
  );
}
