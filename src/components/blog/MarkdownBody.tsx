"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const markdownComponents: Components = {
  img({ src, alt, title }) {
    if (!src) return null;
    return (
      <figure className="my-8 not-prose">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt ?? ""}
          title={title}
          loading="lazy"
          className="w-full rounded-xl border border-border/40 shadow-md object-cover"
        />
        {title ? (
          <figcaption className="mt-2 text-center text-sm text-muted-foreground italic">
            {title}
          </figcaption>
        ) : null}
      </figure>
    );
  },
};

export function MarkdownBody({ markdown }: { markdown: string }) {
  return (
    <div
      className={[
        "prose prose-sm max-w-none text-foreground/95 dark:prose-invert sm:prose-base",
        "prose-headings:font-heading prose-headings:tracking-tight",
        "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
        "prose-code:text-foreground prose-pre:bg-muted/60 prose-pre:border prose-pre:border-border/60",
        "prose-img:rounded-xl prose-img:shadow-md",
      ].join(" ")}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {markdown || "_No body yet._"}
      </ReactMarkdown>
    </div>
  );
}
