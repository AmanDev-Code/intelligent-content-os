"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmailCaptureProps {
  className?: string;
  variant?: "default" | "compact";
  title?: string;
  description?: string;
}

export function EmailCapture({ className, variant = "default", title, description }: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    await new Promise((resolve) => setTimeout(resolve, 500));
    setStatus("success");
    setEmail("");
  };

  if (variant === "compact") {
    return (
      <div className={cn("bg-muted/50 rounded-lg p-4", className)}>
        <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
          <Mail className="h-4 w-4 text-primary" />
          {title || "Get social tips weekly"}
        </h4>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9 text-sm flex-1"
            required
          />
          <Button type="submit" size="sm" className="h-9 px-3" disabled={status === "loading"}>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-2xl border border-border/60 bg-card/70 p-6 sm:p-8 backdrop-blur-md dark:bg-white/[0.04]",
      className
    )}>
      <div className="flex items-start gap-4">
        <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
          <Mail className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
            <span className="sm:hidden">
              <Mail className="h-5 w-5 text-primary" />
            </span>
            {title || "Get weekly social media tips"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {description || "Join thousands of marketers receiving actionable strategies for growing their social presence with AI."}
          </p>
          {status === "success" ? (
            <div className="mt-4 flex items-center gap-2 text-sm text-green-600 font-medium">
              <Sparkles className="h-4 w-4" />
              You are subscribed! Check your inbox for confirmation.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 flex-1 rounded-full px-5"
                required
              />
              <Button
                type="submit"
                className="h-11 rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] px-6 font-semibold text-white hover:opacity-90"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Subscribing..." : "Subscribe"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </form>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            No spam. Unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </div>
  );
}
