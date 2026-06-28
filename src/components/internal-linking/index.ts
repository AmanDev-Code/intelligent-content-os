/**
 * Internal Linking Components
 * 
 * SEO-focused internal linking system for Trndinn
 * 
 * Usage:
 * 
 * 1. Homepage Guides Section:
 *    import { GuidesSection } from "@/components/internal-linking";
 *    <GuidesSection />
 * 
 * 2. Guide Cards:
 *    import { GuideCard } from "@/components/internal-linking";
 *    <GuideCard guide={guide} index={0} variant="featured" />
 * 
 * 3. Related Guides on Comparison Pages:
 *    import { RelatedGuides } from "@/components/internal-linking";
 *    <RelatedGuides comparisonKey="buffer" />
 * 
 * 4. Breadcrumb Navigation:
 *    import { BreadcrumbNav, ComparisonBreadcrumb } from "@/components/internal-linking";
 *    <ComparisonBreadcrumb competitorName="Buffer" />
 * 
 * 5. SEO-optimized Links:
 *    import { LinkInline, ContentUpgrade } from "@/components/internal-linking";
 *    <LinkInline href="/guides/ai-social-media-marketing" context="AI content" />
 *    <ContentUpgrade href="/guides/linkedin-automation" title="LinkedIn Automation" description="..." />
 * 
 * 6. Contextual Links:
 *    import { ContextualLinks } from "@/components/internal-linking";
 *    <ContextualLinks themes={["AI", "content"]} pageType="features" />
 */

export { GuidesSection, type GuidesSectionContent } from "./GuidesSection";
export { GuideCard, type GuideCardProps } from "./GuideCard";
export {
  RelatedGuides,
  BlogRelatedGuides,
  ContentUpgradeSection,
  type RelatedGuidesProps,
  type BlogRelatedGuidesProps,
} from "./RelatedGuides";
export {
  BreadcrumbNav,
  CompactBreadcrumb,
  GuideBreadcrumb,
  ComparisonBreadcrumb,
  type BreadcrumbNavProps,
} from "./BreadcrumbNav";
export {
  LinkInline,
  SmartLink,
  ContentUpgrade,
  type LinkInlineProps,
  type ContentUpgradeProps,
} from "./LinkInline";
export {
  ContextualLinks,
  FeatureContext,
  FaqLinkPanel,
  type ContextualLinksProps,
  type FaqLinkPanelProps,
} from "./ContextualLinks";
