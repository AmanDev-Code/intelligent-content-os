"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ContentEngineSidebar } from "@/components/content-engine/ContentEngineSidebar";
import { DashboardSection } from "@/components/content-engine/DashboardSection";
import { GenerateSection } from "@/components/content-engine/GenerateSection";
import { ArticlesSection, type ArticlesView } from "@/components/content-engine/ArticlesSection";
import { ClustersSection } from "@/components/content-engine/ClustersSection";
import { KeywordsSection } from "@/components/content-engine/KeywordsSection";
import { DistributionSection } from "@/components/content-engine/DistributionSection";
import { InternalLinksSection } from "@/components/content-engine/InternalLinksSection";
import { ScoringSection } from "@/components/content-engine/ScoringSection";
import { PlatformAccountsSection } from "@/components/content-engine/PlatformAccountsSection";
import { ImageEngineSection } from "@/components/content-engine/ImageEngineSection";
import { SchemaEngineSection } from "@/components/content-engine/SchemaEngineSection";
import { OptimizationSection } from "@/components/content-engine/OptimizationSection";
import { RankTrackingSection } from "@/components/content-engine/RankTrackingSection";
import { BacklinksSection } from "@/components/content-engine/BacklinksSection";
import { NewsletterSection } from "@/components/content-engine/NewsletterSection";

export type ContentEngineSection =
  | "dashboard"
  | "generate"
  | "articles"
  | "clusters"
  | "keywords"
  | "distribution"
  | "internal-links"
  | "scoring"
  | "accounts"
  | "images"
  | "schemas"
  | "optimization"
  | "rankings"
  | "backlinks"
  | "newsletter";

const VALID_SECTIONS = new Set<string>([
  "dashboard",
  "generate",
  "articles",
  "clusters",
  "keywords",
  "distribution",
  "internal-links",
  "scoring",
  "accounts",
  "images",
  "schemas",
  "optimization",
  "rankings",
  "backlinks",
  "newsletter",
]);

const VALID_ARTICLE_VIEWS = new Set<string>(["list", "editors", "page-seo"]);

function parseSection(tab: string | null): ContentEngineSection {
  if (tab && VALID_SECTIONS.has(tab)) return tab as ContentEngineSection;
  return "dashboard";
}

function parseArticlesView(view: string | null): ArticlesView {
  if (view && VALID_ARTICLE_VIEWS.has(view)) return view as ArticlesView;
  return "list";
}

export default function ContentEnginePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeSection = parseSection(searchParams.get("tab"));
  const editId = searchParams.get("edit");
  const articlesView = parseArticlesView(searchParams.get("view"));

  const replaceParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams],
  );

  const setActiveSection = useCallback(
    (section: ContentEngineSection) => {
      replaceParams((params) => {
        params.set("tab", section);
        params.delete("edit");
        if (section !== "articles") params.delete("view");
      });
    },
    [replaceParams],
  );

  const openArticleEditor = useCallback(
    (id: string) => {
      replaceParams((params) => {
        params.set("tab", "articles");
        params.set("edit", id);
        params.delete("view");
      });
    },
    [replaceParams],
  );

  const setArticleEdit = useCallback(
    (id: string | null) => {
      replaceParams((params) => {
        params.set("tab", "articles");
        if (id) params.set("edit", id);
        else params.delete("edit");
      });
    },
    [replaceParams],
  );

  const setArticlesView = useCallback(
    (view: ArticlesView) => {
      replaceParams((params) => {
        params.set("tab", "articles");
        params.set("view", view);
        params.delete("edit");
      });
    },
    [replaceParams],
  );

  const onArticleSavedFromGenerate = useCallback(
    (postId: string) => {
      openArticleEditor(postId);
    },
    [openArticleEditor],
  );

  const sectionContent = useMemo(() => {
    switch (activeSection) {
      case "dashboard":
        return (
          <DashboardSection
            onNavigate={setActiveSection}
            onOpenArticle={openArticleEditor}
          />
        );
      case "generate":
        return <GenerateSection onArticleSaved={onArticleSavedFromGenerate} />;
      case "articles":
        return (
          <ArticlesSection
            editId={editId}
            onEditChange={setArticleEdit}
            view={articlesView}
            onViewChange={setArticlesView}
          />
        );
      case "clusters":
        return <ClustersSection />;
      case "keywords":
        return <KeywordsSection />;
      case "distribution":
        return <DistributionSection />;
      case "internal-links":
        return <InternalLinksSection />;
      case "scoring":
        return <ScoringSection />;
      case "accounts":
        return <PlatformAccountsSection />;
      case "images":
        return <ImageEngineSection />;
      case "schemas":
        return <SchemaEngineSection />;
      case "optimization":
        return <OptimizationSection />;
      case "rankings":
        return <RankTrackingSection />;
      case "backlinks":
        return <BacklinksSection />;
      case "newsletter":
        return <NewsletterSection />;
      default:
        return null;
    }
  }, [
    activeSection,
    articlesView,
    editId,
    onArticleSavedFromGenerate,
    openArticleEditor,
    setActiveSection,
    setArticleEdit,
    setArticlesView,
  ]);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <ContentEngineSidebar active={activeSection} onSelect={setActiveSection} />
      <main className="flex-1 overflow-y-auto bg-muted/30">
        <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">{sectionContent}</div>
      </main>
    </div>
  );
}
