import type { Metadata } from "next";
import { LinkedInAutomationGuide } from "./LinkedInAutomationGuide";
import { getSiteUrl, siteName } from "@/lib/site";
const ROUTE = "/guides/linkedin-automation";
const TARGET_KEYWORD = "how to automate linkedin posts with ai";
export const metadata: Metadata = {
  title: "How to Automate LinkedIn Posts with AI: A Complete Step-by-Step Tutorial",
  description: `Learn how to automate LinkedIn posts with AI in 2026. Step-by-step tutorial covering setup, scheduling, content creation, and best practices using ${siteName} and other top tools.`,
  alternates: { canonical: `${getSiteUrl()}${ROUTE}` },
  keywords: [
    TARGET_KEYWORD,
    "linkedin automation",
    "linkedin scheduler",
    "ai linkedin posts",
    "automate linkedin content",
    "linkedin post scheduler",
    "linkedin marketing automation",
    "linkedin content automation",
    "linkedin post ideas",
    "linkedin scheduler free",
  ],
  openGraph: {
    title: "How to Automate LinkedIn Posts with AI: A Complete Step-by-Step Tutorial",
    description: `Learn how to automate LinkedIn posts with AI in 2026. Complete tutorial with screenshots, tool recommendations, and best practices.`,
    url: ROUTE,
    type: "article",
    authors: [siteName],
    publishedTime: "2026-06-27T00:00:00Z",
    modifiedTime: "2026-06-27T00:00:00Z",
  },
};
// Article Schema
const baseUrl = getSiteUrl().replace(/\/$/, "");
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "How to Automate LinkedIn Posts with AI: A Complete Step-by-Step Tutorial",
  description: "A comprehensive tutorial on automating LinkedIn posts using AI tools in 2026.",
  image: `${baseUrl}/og/default.png`,
  author: {
    "@type": "Organization",
    name: siteName,
    url: baseUrl,
  },
  publisher: {
    "@type": "Organization",
    name: siteName,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/og/default.png`,
    },
  },
  datePublished: "2026-06-27",
  dateModified: "2026-06-27",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `${baseUrl}${ROUTE}`,
  },
  articleBody: "Complete step-by-step guide covering LinkedIn profile optimization, content strategy, AI content generation, scheduling, and automation best practices.",
};
// FAQ Schema
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is LinkedIn automation allowed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "LinkedIn allows scheduling and automation tools that use their official API. However, they prohibit spam, bulk messaging, and engagement pods. Always use approved tools like Trndinn, Buffer, or Hootsuite that work within LinkedIn's terms of service. Avoid automation that sends unsolicited connection requests or messages at scale.",
      },
    },
    {
      "@type": "Question",
      name: "Can AI write LinkedIn posts?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, AI can write LinkedIn posts. Advanced tools like Trndinn learn your personal writing style and generate authentic-sounding content. AI can create long-form posts, short updates, thought leadership pieces, and even poll questions. Always review and personalize AI-generated content before posting.",
      },
    },
    {
      "@type": "Question",
      name: "What is the best time to post on LinkedIn?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The best times to post on LinkedIn are typically Tuesday through Thursday, between 8:00 AM and 10:00 AM, and 5:00 PM to 6:00 PM in your audience's time zone. However, optimal times vary by industry and audience. AI scheduling tools analyze your specific audience's activity patterns to recommend personalized posting times.",
      },
    },
    {
      "@type": "Question",
      name: "How often should I post on LinkedIn?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For optimal LinkedIn engagement, post 3-5 times per week. Consistency matters more than frequency - aim for a sustainable schedule you can maintain. Quality over quantity is key. Posting daily is fine if you have valuable content, but don't post just to hit a number. Use automation to maintain consistency during busy periods.",
      },
    },
    {
      "@type": "Question",
      name: "Can I schedule LinkedIn posts for free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, many tools offer free LinkedIn scheduling. Trndinn provides 150 free credits monthly for content generation and scheduling. Buffer offers a free plan with limited posts. LinkedIn's native scheduling is free but basic. For advanced features like AI content generation and optimal timing, paid plans start around $15-30/month.",
      },
    },
    {
      "@type": "Question",
      name: "How do I make automated LinkedIn posts sound authentic?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "To maintain authenticity with automated LinkedIn posts: 1) Train AI tools with examples of your writing style, 2) Always review and edit AI drafts before posting, 3) Add personal anecdotes and experiences, 4) Engage genuinely in comments - automation should never replace interaction, 5) Mix automated content with manual posts, 6) Use your actual voice and opinions, 7) Share real stories, not generic advice.",
      },
    },
  ],
};
export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(faqSchema) }}
      />
      <LinkedInAutomationGuide />
    </>
  );
}
