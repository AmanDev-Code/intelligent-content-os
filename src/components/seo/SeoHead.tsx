"use client";

import type { ReactNode } from "react";
import Head from "next/head";
import type { Metadata } from "next";
import { getSiteUrl, siteName } from "@/lib/site";

interface SeoHeadProps {
  /** Page metadata object */
  metadata?: Metadata;
  /** Additional scripts or tags */
  children?: ReactNode;
  /** Override the default title */
  title?: string;
  /** Override the default description */
  description?: string;
}

/**
 * SeoHead - Client-side SEO head component
 * 
 * Note: Use this sparingly. Prefer the server-side metadata export in Next.js App Router.
 * This component is useful for:
 * - Client-side pages that need dynamic SEO
 * - Preview/debug pages
 * - Pages outside the App Router
 * 
 * For App Router pages, export metadata from page.tsx instead:
 * ```tsx
 * export const metadata: Metadata = {
 *   title: "My Page",
 *   description: "Page description"
 * };
 * ```
 */
export function SeoHead({ metadata, children, title, description }: SeoHeadProps) {
  const base = getSiteUrl().replace(/\/$/, "");
  
  const resolvedTitle = title || metadata?.title?.toString() || siteName;
  const resolvedDescription = description || metadata?.description || "";

  return (
    <Head>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      
      {/* Open Graph */}
      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:url" content={base} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      
      {/* Robots */}
      <meta name="robots" content="index, follow" />
      
      {children}
    </Head>
  );
}

/**
 * CanonicalLink - Adds canonical URL to page
 * Use in the <head> section or export from page metadata
 */
export function CanonicalLink({ href }: { href: string }) {
  return <link rel="canonical" href={href} />;
}

/**
 * NoIndex - Adds noindex meta tag for pages that shouldn't be indexed
 * Usage: <NoIndex reason="Preview page" />
 */
export function NoIndex({ reason }: { reason?: string }) {
  console.log(`Page blocked from indexing: ${reason || "No reason provided"}`);
  return <meta name="robots" content="noindex, nofollow" />;
}

/**
 * HrefLang - Adds hreflang tags for international SEO
 * Usage: <HrefLang languages={['en', 'es', 'fr']} />
 */
export function HrefLang({ 
  languages, 
  defaultLang = "en" 
}: { 
  languages: string[]; 
  defaultLang?: string;
}) {
  const base = getSiteUrl().replace(/\/$/, "");
  
  return (
    <>
      <link rel="alternate" hrefLang="x-default" href={base} />
      {languages.map((lang) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={`${base}?lang=${lang}`} />
      ))}
    </>
  );
}
