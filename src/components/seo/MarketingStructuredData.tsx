interface Props {
  data: unknown;
}

/**
 * Injects a custom JSON-LD script into the page <head>.
 * Render this from a server page.tsx alongside your view component.
 * The `data` value comes from `fetchMarketingStructuredData` in serverSeo.ts.
 */
export function MarketingStructuredData({ data }: Props) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
