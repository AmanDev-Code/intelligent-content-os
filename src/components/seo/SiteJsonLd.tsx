import { getSiteUrl, siteName } from "@/lib/site";

export function SiteJsonLd() {
  const url = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: siteName,
        url,
        description:
          "AI-powered social content platform for scheduling, publishing, video reels, and analytics.",
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: siteName,
        publisher: { "@id": `${url}/#organization` },
        inLanguage: "en-US",
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
