"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  Network,
  KeyRound,
  Share2,
  BarChart3,
  Link2,
  Link,
  ImageIcon,
  FileJson,
  Zap,
  TrendingUp,
  ExternalLink,
  Mail,
} from "lucide-react";
import type { ContentEngineSection } from "@/views/ContentEnginePage";

const sections: {
  id: ContentEngineSection;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "generate", label: "Generate", icon: Sparkles },
  { id: "articles", label: "Articles", icon: FileText },
  { id: "clusters", label: "Clusters", icon: Network },
  { id: "keywords", label: "Keywords", icon: KeyRound },
  { id: "distribution", label: "Distribution", icon: Share2 },
  { id: "internal-links", label: "Internal Links", icon: Link },
  { id: "optimization", label: "Optimization", icon: Zap },
  { id: "images", label: "Images", icon: ImageIcon },
  { id: "schemas", label: "Schemas", icon: FileJson },
  { id: "rankings", label: "Rank Tracking", icon: TrendingUp },
  { id: "backlinks", label: "Backlinks", icon: ExternalLink },
  { id: "newsletter", label: "Newsletter", icon: Mail },
  { id: "accounts", label: "Platform Accounts", icon: Link2 },
  { id: "scoring", label: "Scoring", icon: BarChart3 },
];

interface ContentEngineSidebarProps {
  active: ContentEngineSection;
  onSelect: (section: ContentEngineSection) => void;
}

export function ContentEngineSidebar({ active, onSelect }: ContentEngineSidebarProps) {
  return (
    <aside className="hidden md:flex w-56 flex-col border-r border-border/50 bg-background shrink-0">
      <div className="px-4 py-5 border-b border-border/50">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Content Engine</h2>
        <p className="text-xs text-muted-foreground mt-0.5">SEO Content Operations</p>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {sections.map((section) => {
          const isActive = active === section.id;
          return (
            <button
              key={section.id}
              onClick={() => onSelect(section.id)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <section.icon className="h-4 w-4 shrink-0" />
              <span>{section.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
