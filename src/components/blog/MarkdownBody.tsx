"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownBody({ markdown }: { markdown: string }) {
  return (
    <div
      className={[
        "prose prose-sm max-w-none text-foreground/95 dark:prose-invert sm:prose-base",
        "prose-headings:font-heading prose-headings:tracking-tight",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        "prose-code:text-foreground prose-pre:bg-muted/60 prose-pre:border prose-pre:border-border/60",
      ].join(" ")}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown || "_No body yet._"}</ReactMarkdown>
    </div>
  );
}
