interface FaqItem {
  question: string;
  answer: string;
}

interface Props {
  faqs: FaqItem[];
}

export function BlogFaqSection({ faqs }: Props) {
  if (!faqs.length) return null;

  return (
    <section className="mt-12 border-t border-border/60 pt-10">
      <h2 className="mb-6 font-heading text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
      <dl className="space-y-6">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-xl border border-border/50 bg-muted/30 px-5 py-4">
            <dt className="font-semibold text-foreground">{faq.question}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/**
 * Inline JSON-LD script for FAQPage schema.
 * Render this in the page <head> (or inline in the component — works either way).
 */
export function BlogFaqJsonLd({ faqs }: Props) {
  if (!faqs.length) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
