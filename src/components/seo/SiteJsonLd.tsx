import { getSiteUrl, siteName } from "@/lib/site";

export function SiteJsonLd() {
  const base = getSiteUrl().replace(/\/$/, "");
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${base}/#organization`,
        name: siteName,
        url: base,
        logo: {
          "@type": "ImageObject",
          "@id": `${base}/#logo`,
          url: `${base}/og/default.png`,
          width: 1200,
          height: 799,
        },
        sameAs: [
          "https://twitter.com/trndinn",
          "https://www.linkedin.com/company/trndinn",
        ],
        description:
          "AI-powered social content platform for scheduling, publishing, video reels, and analytics.",
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: siteName,
        publisher: { "@id": `${base}/#organization` },
        inLanguage: "en-US",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${base}/blog?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
