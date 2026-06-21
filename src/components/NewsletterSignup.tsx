"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Loader2, Mail, AlertCircle, X } from "lucide-react";
import { apiClient } from "@/lib/apiClient";

export interface NewsletterSignupProps {
  variant?: "inline" | "card" | "modal";
  title?: string;
  description?: string;
  showName?: boolean;
  source?: string;
  onSuccess?: () => void;
  onClose?: () => void;
  className?: string;
}

type FormState = "idle" | "loading" | "success" | "error";

export function NewsletterSignup({
  variant = "card",
  title = "Stay in the loop",
  description = "Get the latest insights on AI, content strategy, and growth delivered to your inbox.",
  showName = false,
  source = "website",
  onSuccess,
  onClose,
  className,
}: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || state === "loading") return;

      setState("loading");
      setErrorMessage("");

      try {
        await apiClient.post("/newsletter/subscribe", {
          email,
          name: showName ? name : undefined,
          source,
        });
        setState("success");
        onSuccess?.();
      } catch (err: any) {
        setState("error");
        setErrorMessage(err?.message || "Something went wrong. Please try again.");
      }
    },
    [email, name, showName, source, state, onSuccess]
  );

  const resetForm = useCallback(() => {
    setState("idle");
    setEmail("");
    setName("");
    setErrorMessage("");
  }, []);

  if (variant === "inline") {
    return (
      <div className={cn("w-full max-w-md", className)}>
        {state === "success" ? (
          <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">You're subscribed!</p>
              <p className="text-xs text-muted-foreground">Check your inbox for a welcome email.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-center">
            {showName && (
              <Input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 bg-background/80 backdrop-blur-sm border-border/60 focus:border-primary/50"
                disabled={state === "loading"}
              />
            )}
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 min-w-0 w-full flex-1 bg-background/80 backdrop-blur-sm border-border/60 focus:border-primary/50"
              disabled={state === "loading"}
            />
            <Button
              type="submit"
              disabled={state === "loading" || !email}
              className="h-11 shrink-0 px-6 cursor-pointer transition-all duration-150 sm:w-auto"
            >
              {state === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Subscribe"
              )}
            </Button>
          </form>
        )}
        {state === "error" && (
          <p className="mt-2 text-sm text-destructive flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5" />
            {errorMessage}
          </p>
        )}
      </div>
    );
  }

  if (variant === "modal") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <Card
          className={cn(
            "relative w-full max-w-md border border-border/60 shadow-2xl bg-background/95 backdrop-blur-md",
            className
          )}
        >
          {onClose && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <CardContent className="p-8">
            {state === "success" ? (
              <div className="text-center py-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2">You're in!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Thanks for subscribing. Check your inbox for a welcome email.
                </p>
                <Button variant="outline" onClick={onClose} className="cursor-pointer">
                  Close
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {showName && (
                    <Input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-11"
                      disabled={state === "loading"}
                    />
                  )}
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                    disabled={state === "loading"}
                  />
                  {state === "error" && (
                    <p className="text-sm text-destructive flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errorMessage}
                    </p>
                  )}
                  <Button
                    type="submit"
                    disabled={state === "loading" || !email}
                    className="w-full h-11 cursor-pointer transition-all duration-150"
                  >
                    {state === "loading" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Subscribe"
                    )}
                  </Button>
                </form>
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  No spam, unsubscribe anytime.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "w-full max-w-md border border-border/60 shadow-none bg-gradient-to-br from-background to-muted/30",
        className
      )}
    >
      <CardContent className="p-5 sm:p-6">
        {state === "success" ? (
          <div className="text-center py-2">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold mb-1">You're subscribed!</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Check your inbox for a welcome email.
            </p>
            <Button variant="ghost" size="sm" onClick={resetForm} className="cursor-pointer">
              Subscribe another email
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-primary" />
                <h3 className="text-base font-semibold tracking-tight">{title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-center"
            >
              {showName && (
                <Input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10"
                  disabled={state === "loading"}
                />
              )}
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 min-w-0 w-full flex-1"
                disabled={state === "loading"}
              />
              <Button
                type="submit"
                disabled={state === "loading" || !email}
                className="h-10 shrink-0 px-6 cursor-pointer transition-all duration-150 sm:w-auto"
              >
                {state === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Subscribe"
                )}
              </Button>
            </form>
            {state === "error" && (
              <p className="mt-2 max-w-md text-sm text-destructive flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                {errorMessage}
              </p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              No spam, unsubscribe anytime.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
