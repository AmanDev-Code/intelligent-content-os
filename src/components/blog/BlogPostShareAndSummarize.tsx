"use client";

import { useCallback, useMemo, useState } from "react";
import { Calendar, Check, Link2, Sparkles, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function summarizePrompt(articleUrl: string, title: string): string {
  const t = title.trim() || "this post";
  return `Read this Trndinn article (${t}) and summarize it in 5 bullet points with the most actionable takeaways for a social / growth team. Link: ${articleUrl}`;
}

/**
 * External "open provider with prefilled prompt" URLs.
 * Several providers periodically change query parameters; callers should treat these as best-effort.
 * ChatGPT/Grok/Gemini: `q`/`prompt` conventions are not formally documented publicly.
 */
function aiProviderUrls(prompt: string) {
  const enc = encodeURIComponent(prompt);
  return {
    chatgpt: `https://chatgpt.com/?q=${enc}`,
    claude: `https://claude.ai/new?q=${enc}`,
    grok: `https://grok.com/?q=${enc}`,
    /** Gemini URL pattern is brittle; falls back to app root if query is ignored client-side */
    gemini: `https://gemini.google.com/app?q=${enc}`,
    perplexity: `https://www.perplexity.ai/search?q=${enc}`,
  };
}

function IconTwitterX({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconLinkedIn({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

/** Reddit Snoo outline — avoids the filled-disc path that renders as a solid orange blob */
function IconReddit({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" aria-hidden>
      {/* Scale up vs default 24×24 outline so optical size matches filled X/LinkedIn/Facebook; stroke stays same width */}
      <g transform="translate(12 12) scale(1.22) translate(-12 -12)">
        {/* Antenna */}
        <path
          d="M9 7h6 M12 11V7"
          strokeWidth={1.6}
          strokeLinecap="round"
          vectorEffect="nonScalingStroke"
        />
        {/* Head */}
        <circle cx="12" cy="13.75" r="4.85" strokeWidth={1.5} vectorEffect="nonScalingStroke" />
        {/* Eyes */}
        <circle cx="9.95" cy="13.85" r="0.92" fill="currentColor" stroke="none" />
        <circle cx="14.05" cy="13.85" r="0.92" fill="currentColor" stroke="none" />
        {/* Smile */}
        <path
          d="M8.95 17.85c1.08 2.06 7.06 2.06 8.13 0"
          strokeWidth={1.35}
          strokeLinecap="round"
          vectorEffect="nonScalingStroke"
        />
      </g>
    </svg>
  );
}

export function BlogPostShareAndSummarize({
  title,
  articleUrl,
  publishedAt,
  authorDisplayName,
  placement = "footer",
}: {
  title: string;
  articleUrl: string;
  publishedAt?: string | null;
  authorDisplayName?: string | null;
  /** `preCover`: Crowbert-style — author row + share/AI before the cover image. `belowIntro`: legacy. `footer`: end of article. */
  placement?: "preCover" | "belowIntro" | "footer";
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareTargets = useMemo(
    () => [
      {
        label: "Share on X",
        href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title.trim() || "")}&url=${encodeURIComponent(
          articleUrl,
        )}`,
        icon: IconTwitterX,
      },
      {
        label: "Share on LinkedIn",
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`,
        icon: IconLinkedIn,
      },
      {
        label: "Share on Facebook",
        href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`,
        icon: IconFacebook,
      },
      {
        label: "Share on Reddit",
        href: `https://www.reddit.com/submit?url=${encodeURIComponent(articleUrl)}&title=${encodeURIComponent(
          title.trim() || "",
        )}`,
        icon: IconReddit,
      },
    ],
    [articleUrl, title],
  );

  const ai = useMemo(() => aiProviderUrls(summarizePrompt(articleUrl, title)), [articleUrl, title]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      toast({ title: "Link copied" });
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      toast({ title: "Could not copy", variant: "destructive" });
    }
  }, [articleUrl, toast]);

  const dateLabel =
    publishedAt &&
    new Date(publishedAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const compactMeta = placement === "preCover";

  if (compactMeta) {
    const aiPairs = [
      ["ChatGPT", ai.chatgpt],
      ["Claude", ai.claude],
      ["Grok", ai.grok],
      ["Gemini", ai.gemini],
      ["Perplexity", ai.perplexity],
    ] as const;

    return (
      <section
        aria-label="Share and summarize"
        className={cn(
          "mt-4 border-y border-border/30 py-4 text-[13px] text-foreground/90 dark:border-border/40",
        )}
      >
        {/* Row 1 — metadata (matches reference: person + author, calendar + date) */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {authorDisplayName?.trim() ? (
            <span className="inline-flex items-center gap-2 font-semibold text-foreground">
              <User className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              {authorDisplayName.trim()}
            </span>
          ) : null}
          {dateLabel ? (
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <time dateTime={publishedAt!}>{dateLabel}</time>
            </span>
          ) : null}
        </div>

        {/* Rows 2–3 — labels on one justified row, buttons in two aligned columns */}
        <div className="mt-6 pt-1">
          <div className="flex justify-between gap-4">
            <p className="text-[13px] font-semibold text-foreground">Share this post</p>
            <p className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground whitespace-nowrap">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
              Summarize with AI
            </p>
          </div>

          <div className="mt-2.5 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8">
            <div className="flex flex-wrap items-center gap-2">
              {shareTargets.map(({ label, href, icon: Ico }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background shadow-sm",
                    "text-foreground/85 transition-colors hover:border-border hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <Ico className="h-4 w-4" />
                </a>
              ))}
              <button
                type="button"
                aria-label="Copy link"
                title="Copy link"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background shadow-sm",
                  "text-foreground/85 transition-colors hover:border-border hover:bg-muted/50 hover:text-foreground",
                )}
                onClick={() => void copyLink()}
              >
                {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 sm:justify-end">
              {aiPairs.map(([name, url]) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={name}
                  className={cn(
                    "inline-flex shrink-0 items-center justify-center rounded-full border border-border/60 bg-background px-3 py-1 shadow-sm",
                    "text-[11px] font-semibold text-foreground transition-colors hover:border-primary/35 hover:bg-primary/5",
                  )}
                >
                  {name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Share and summarize"
      className={cn(
        placement === "belowIntro" && "mt-8 sm:mt-10",
        placement === "footer" &&
          "mt-14 flex flex-col gap-10 border-t border-border/60 pb-6 pt-10 dark:border-border/50",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-2">
        {dateLabel ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0 text-foreground/60" aria-hidden />
            <time dateTime={publishedAt!}>{dateLabel}</time>
          </p>
        ) : null}
        {authorDisplayName?.trim() ? (
          <p className="text-sm font-medium text-foreground">
            By <span className="font-semibold">{authorDisplayName.trim()}</span>
          </p>
        ) : null}
      </div>

      <div className="space-y-8">
        <div>
          <p className="font-semibold text-sm text-foreground">Share this post</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {shareTargets.map(({ label, href, icon: Ico }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background/60 text-foreground/85 shadow-sm backdrop-blur-sm",
                  "transition-colors hover:border-border hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <Ico className="h-[18px] w-[18px]" />
              </a>
            ))}
            <button
              type="button"
              aria-label="Copy link"
              title="Copy link"
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background/60 text-foreground/85 shadow-sm backdrop-blur-sm",
                "transition-colors hover:border-border hover:bg-muted/50 hover:text-foreground",
              )}
              onClick={() => void copyLink()}
            >
              {copied ? <Check className="h-[18px] w-[18px]" /> : <Link2 className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-foreground/55" aria-hidden />
            Summarize with AI
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Opens the provider with a prefilled prompt about this URL (manual send if your client blocks auto-fill).
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(
              [
                ["ChatGPT", ai.chatgpt],
                ["Claude", ai.claude],
                ["Grok", ai.grok],
                ["Gemini", ai.gemini],
                ["Perplexity", ai.perplexity],
              ] as const
            ).map(([name, url]) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex min-w-[6.25rem] shrink-0 justify-center rounded-full border border-border/70 bg-background/60 text-center text-xs font-semibold text-foreground/90",
                  "transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
                  "px-4 py-1.5",
                )}
              >
                {name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
