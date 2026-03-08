import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import {
  CalendarDays,
  Sparkles,
  FileText,
  BarChart3,
  ImageIcon,
  Settings,
  CreditCard,
  Gift,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const topNav = [
  { to: "/", icon: CalendarDays, label: "Dashboard" },
  { to: "/ai-agent", icon: Sparkles, label: "AI Agent" },
  { to: "/content", icon: FileText, label: "Content" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/media", icon: ImageIcon, label: "Media" },
];

const bottomNav = [
  { to: "/affiliate", icon: Gift, label: "Affiliate" },
  { to: "/billing", icon: CreditCard, label: "Billing" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const renderNav = (items: typeof topNav) =>
    items.map((item) => {
      const active = isActive(item.to);
      return (
        <NavLink
          key={item.to}
          to={item.to}
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors relative",
            active
              ? "bg-primary/10 text-primary"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
          aria-current={active ? "page" : undefined}
        >
          {active && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-primary" />
          )}
          <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          {!collapsed && <span>{item.label}</span>}
        </NavLink>
      );
    });

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-200 flex flex-col",
        collapsed ? "w-14" : "w-56"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between px-3 border-b border-sidebar-border">
        {!collapsed && (
          <span className="text-sm font-bold tracking-tight text-foreground">{APP_NAME}</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-7 w-7 text-sidebar-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")}
            aria-hidden="true"
          />
        </Button>
      </div>

      {/* Top nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">{renderNav(topNav)}</nav>

      {/* Bottom nav */}
      <nav className="px-2 py-3 space-y-0.5 border-t border-sidebar-border">
        {renderNav(bottomNav)}
      </nav>
    </aside>
  );
}
