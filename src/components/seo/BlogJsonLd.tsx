import { getSiteUrl, siteName } from "@/lib/site";
import { BLOG_BASE_PATH } from "@/lib/blogPublic";

type BlogPost = Record<string, unknown>;

interface Props {
  post: BlogPost;
  slugPath: string;
}

export function BlogJsonLd({ post, slugPath }: Props) {
  const base = getSiteUrl().replace(/\/$/, "");
  const canonical =
    (post.canonical_url as string)?.trim() ||
    `${base}${BLOG_BASE_PATH}/${slugPath}`;
  const title = (post.seo_title as string)?.trim() || (post.title as string) || "";
  const description =
    (post.seo_description as string)?.trim() ||
    (post.excerpt as string)?.trim() ||
    "";
  const image =
    (post.og_image_url as string)?.trim() ||
    (post.featured_image_url as string)?.trim() ||
    `${base}/og/default.png`;
  const authorName = (post.author_display_name as string)?.trim() || siteName;
  const publishedAt = (post.published_at as string) || undefined;
  const updatedAt = (post.updated_at as string) || publishedAt;

  // BreadcrumbList segments
  const segments = slugPath.split("/").filter(Boolean);
  const breadcrumbItems = [
    { "@type": "ListItem", position: 1, name: "Home", item: base },
    { "@type": "ListItem", position: 2, name: "Blog", item: `${base}${BLOG_BASE_PATH}` },
    ...segments.map((seg, i) => ({
      "@type": "ListItem",
      position: i + 3,
      name: i === segments.length - 1 ? title : seg.replace(/-/g, " "),
      item: `${base}${BLOG_BASE_PATH}/${segments.slice(0, i + 1).join("/")}`,
    })),
  ];

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${canonical}#article`,
        headline: title,
        description,
        image: { "@type": "ImageObject", url: image },
        url: canonical,
        ...(publishedAt ? { datePublished: publishedAt } : {}),
        ...(updatedAt ? { dateModified: updatedAt } : {}),
        author: {
          "@type": "Person",
          name: authorName,
        },
        publisher: {
          "@type": "Organization",
          "@id": `${base}/#organization`,
          name: siteName,
          logo: { "@type": "ImageObject", url: `${base}/og/default.png` },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
        inLanguage: "en-US",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbItems,
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
