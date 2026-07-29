import { getSiteUrl, siteName } from "@/lib/site";

interface WebApplicationSchemaProps {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
  screenshot?: string;
  featureList?: string[];
}

/**
 * WebApplicationSchema - Schema.org WebApplication structured data
 * Use on free tool pages to enable rich results showing the tool as a web app.
 */
export function WebApplicationSchema({
  name,
  description,
  url,
  applicationCategory = "UtilityApplication",
  operatingSystem = "All",
  offers,
  screenshot,
  featureList,
}: WebApplicationSchemaProps) {
  const base = getSiteUrl().replace(/\/$/, "");

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url: `${base}${url}`,
    applicationCategory,
    operatingSystem,
    provider: {
      "@type": "Organization",
      name: siteName,
      url: base,
    },
    offers: {
      "@type": "Offer",
      price: offers?.price ?? "0",
      priceCurrency: offers?.priceCurrency ?? "USD",
    },
  };

  if (screenshot) {
    data.screenshot = screenshot;
  }

  if (featureList && featureList.length > 0) {
    data.featureList = featureList.join(", ");
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
