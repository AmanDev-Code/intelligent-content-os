"use client";

import { Section, SectionHeading } from "@/components/marketing/Section";
import { Reveal } from "@/components/marketing/Reveal";
import Image from "next/image";

/** 2×2 positioning matrix from AGENTIC-POSITIONING-STRATEGY §7.1 */
export function PositioningMatrix() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Positioning"
        title="Breadth vs depth"
        subtitle="Postiz leads on channel coverage and agent protocols. Trndinn leads on SEO depth, Brand Voice, and the content-to-social growth loop."
      />

      <Reveal delay={80} className="mx-auto mt-8 max-w-2xl md:mt-10">
        <div className="relative mx-auto w-full max-w-lg">
          <Image
            src="/api/minio-proxy/contentos-media/blog/positioning-matrix.png"
            alt="Positioning matrix: Trndinn in high SEO depth and low channel breadth; Postiz in low SEO depth and high channel breadth"
            width={1200}
            height={1200}
            className="rounded-2xl border border-border/50 bg-card/60 shadow-lg"
            priority
          />
        </div>

        <p className="mt-6 text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
          <strong className="font-semibold text-foreground">Win zone for Trndinn:</strong> B2B founders,
          agencies, and growth leads who need LinkedIn depth, organic content, and agentic automation — not
          just the widest channel list.
        </p>
      </Reveal>
    </Section>
  );
}
