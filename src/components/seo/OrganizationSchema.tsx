import { defaultDescription, getSiteUrl, siteName, siteTagline, supportEmail, linkedInCompany, twitterHandle } from "@/lib/site";

interface OrganizationSchemaProps {
  name?: string;
  description?: string;
  url?: string;
  logoUrl?: string;
  sameAs?: string[];
  foundingDate?: string;
}

/**
 * OrganizationSchema - Comprehensive Organization structured data (Schema.org)
 * Use on home page and any page that represents the company
 */
export function OrganizationSchema({
  name = siteName,
  description = defaultDescription,
  url = getSiteUrl().replace(/\/$/, ""),
  logoUrl = `${getSiteUrl().replace(/\/$/, "")}/og/default.png`,
  sameAs = [
    "https://twitter.com/trndinn",
    "https://www.linkedin.com/company/trndinn",
  ],
  foundingDate = "2026",
}: OrganizationSchemaProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${url}/#organization`,
    name,
    url: url,
    logo: {
      "@type": "ImageObject",
      "@id": `${url}/#logo`,
      url: logoUrl,
      width: 1200,
      height: 799,
    },
    sameAs,
    description,
    foundingDate,
    areaServed: "Global",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: supportEmail,
      url: `${url}/contact`,
      availableLanguage: "English",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * WebSiteSchema - WebSite structured data with search action
 * Use on home page for sitelinks searchbox eligibility
 */
export function WebSiteSchema() {
  const base = getSiteUrl().replace(/\/$/, "");
  const data = {
    "@context": "https://schema.org",
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
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * WebApplicationSchema - SaaS/WebApplication structured data
 * Use on product/marketing pages
 */
export function WebApplicationSchema() {
  const base = getSiteUrl().replace(/\/$/, "");
  const data = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${base}/#app`,
    name: `${siteName} - ${siteTagline}`,
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
      "Agentic in-app AI Agent",
      "Brand Voice from your examples",
      "LinkedIn scheduling and publishing",
      "Visual content calendar",
      "Content Engine for SEO and distribution",
      "Public API v1 and webhooks",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * SoftwareApplicationSchema - Competitor comparison schema
 * Use on comparison pages (vs Buffer, vs Postiz, etc.)
 */
interface SoftwareApplicationSchemaProps {
  appName: string;
  appUrl: string;
  description: string;
  features: string[];
  hasFreeTier?: boolean;
  isCompetitor?: boolean;
}

export function SoftwareApplicationSchema({
  appName,
  appUrl,
  description,
  features,
  hasFreeTier = true,
  isCompetitor = false,
}: SoftwareApplicationSchemaProps) {
  const base = getSiteUrl().replace(/\/$/, "");
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": isCompetitor ? `${appUrl}/#software` : `${base}/#${appName.toLowerCase().replace(/\s+/g, "-")}-app`,
    name: appName,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: appUrl,
    description,
    ...(hasFreeTier && {
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free tier available",
      },
    }),
    featureList: features,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
