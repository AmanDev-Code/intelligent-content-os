import { getSiteUrl, siteName, supportEmail } from "@/lib/site";

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
        foundingDate: "2026",
        areaServed: "Global",
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
      {
        "@type": "WebApplication",
        "@id": `${base}/#app`,
        name: `${siteName} - AI Social Content Platform`,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        url: base,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Free trial with 150 credits",
        },
        featureList: [
          "AI content generation",
          "Social media scheduling",
          "Visual content calendar",
          "Brand voice customization",
          "Multi-platform publishing",
          "Analytics and insights",
        ],
      },
      {
        "@type": "ContactPoint",
        "@id": `${base}/#contact`,
        contactType: "Customer Support",
        email: supportEmail,
        url: `${base}/contact`,
        availableLanguage: "English",
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
