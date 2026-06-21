"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const markdownComponents: Components = {
  img({ src, alt, title }) {
    if (!src) return null;
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt ?? ""}
          title={title}
          loading="lazy"
          className="my-8 w-full rounded-xl border border-border/40 shadow-md object-cover"
        />
        {title ? (
          <span className="block -mt-6 mb-8 text-center text-sm text-muted-foreground italic">
            {title}
          </span>
        ) : null}
      </>
    );
  },
  p({ children, ...props }) {
    const hasOnlyImage = 
      Array.isArray(children) && 
      children.length === 1 && 
      typeof children[0] === 'object' && 
      children[0] !== null && 
      'type' in children[0] && 
      children[0].type === 'img';
    
    if (hasOnlyImage) {
      return <>{children}</>;
    }
    
    return <p {...props}>{children}</p>;
  },
};

/**
 * Detect if content is HTML vs Markdown
 */
function isHtml(text: string): boolean {
  return /<(h[1-6]|p|div|span|br|img|a|ul|ol|li)\b[^>]*>/i.test(text);
}

export function MarkdownBody({ markdown }: { markdown: string }) {
  // Safety check: if content is HTML instead of markdown, render it directly
  // This handles legacy content that might have been stored as HTML
  if (markdown && isHtml(markdown)) {
    console.warn('MarkdownBody: Received HTML content instead of markdown. Rendering as HTML.');
    return (
      <div
        className={[
          "prose prose-sm max-w-none text-foreground/95 dark:prose-invert sm:prose-base",
          "prose-headings:font-heading prose-headings:tracking-tight",
          "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
          "prose-code:text-foreground prose-pre:bg-muted/60 prose-pre:border prose-pre:border-border/60",
          "prose-img:rounded-xl prose-img:shadow-md",
        ].join(" ")}
        dangerouslySetInnerHTML={{ __html: markdown }}
      />
    );
  }

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
