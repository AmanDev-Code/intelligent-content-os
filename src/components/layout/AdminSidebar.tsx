"use client";

import Link from "next/link";
import { NavLink } from "@/components/NavLink";
import { usePathname } from "next/navigation";
import { TrndinnLogo } from "@/components/brand/TrndinnLogo";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  MessageSquareText,
  BookOpen,
  Briefcase,
  Settings,
  Menu,
  ArrowLeft,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAdminAreaAccess } from "@/hooks/useAdminAreaAccess";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function SidebarContent({
  collapsed,
  onToggle,
  onItemClick,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onItemClick?: () => void;
}) {
  const pathname = usePathname();
  const { sections } = useAdminAreaAccess();

  const items: {
    to: string;
    icon: typeof LayoutDashboard;
    label: string;
    show: boolean;
  }[] = [
    { to: "/admin", icon: LayoutDashboard, label: "Overview", show: sections.overview },
    { to: "/admin/users", icon: Users, label: "Users", show: sections.users },
    { to: "/admin/feedback", icon: MessageSquareText, label: "Feedback", show: sections.feedback },
    { to: "/admin/blog", icon: BookOpen, label: "Blog & CMS", show: sections.blog },
    { to: "/admin/careers", icon: Briefcase, label: "Careers", show: sections.careers },
    { to: "/admin/settings", icon: Settings, label: "Admin settings", show: sections.settings },
  ];

  return (
    <div className="flex flex-col h-full">
      <div
        className={cn(
          "flex h-16 items-center border-b border-border/50 shrink-0",
          collapsed ? "justify-center px-2" : "justify-between px-4",
        )}
      >
        {!collapsed && (
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <Shield className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            <span className="text-sm font-semibold tracking-tight truncate">Admin</span>
          </div>
        )}
        {collapsed && (
          <Shield className="h-6 w-6 text-primary mx-auto" aria-hidden />
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 rounded-lg shrink-0"
            aria-label="Collapse sidebar"
          >
            <Menu className="h-4 w-4" aria-hidden />
          </Button>
        )}
      </div>

      {collapsed && (
        <div className="px-2 py-3 border-b border-border/50 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="w-full h-10 rounded-lg"
            aria-label="Expand sidebar"
          >
            <Menu className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      )}

      <div className={cn("py-4 shrink-0 border-b border-border/50", collapsed ? "px-2" : "px-4")}>
        <Button
          asChild
          className={cn(
            "w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
            collapsed ? "h-12 px-0 rounded-xl" : "rounded-lg justify-start gap-2",
          )}
          size={collapsed ? "icon" : "default"}
        >
          <Link href="/dashboard" onClick={onItemClick} aria-label="Back to app">
            <ArrowLeft className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} />
            {!collapsed && <span>Back to app</span>}
          </Link>
        </Button>
      </div>

      <nav className={cn("flex-1 space-y-1 overflow-y-auto", collapsed ? "px-2 py-2" : "px-4 py-2")}>
        {!collapsed && (
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Platform
          </p>
        )}
        {items
          .filter((i) => i.show)
          .map((item) => {
            const isActive =
              item.to === "/admin" ? pathname === "/admin" : pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                href={item.to}
                onClick={onItemClick}
                className={cn(
                  "flex items-center transition-all duration-200 group relative",
                  collapsed ? "justify-center w-full h-12 rounded-xl" : "gap-3 rounded-lg px-3 py-2.5",
                  "text-sm font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} aria-hidden />
                {!collapsed && <span>{item.label}</span>}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
      </nav>

      <div className={cn("mt-auto border-t border-border/50 py-3 shrink-0", collapsed ? "px-2" : "px-4")}>
        <Link
          href="/dashboard"
          onClick={onItemClick}
          className="flex items-center justify-center text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {!collapsed ? "Main app" : <TrndinnLogo variant="icon" className="h-8 w-8 mx-auto opacity-90" priority />}
        </Link>
      </div>
    </div>
  );
}

export function AdminSidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={(open) => !open && onMobileClose?.()}>
        <SheetContent side="left" className="p-0 w-[86vw] max-w-72" hideClose>
          <SidebarContent collapsed={false} onToggle={() => onMobileClose?.()} onItemClick={onMobileClose} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-background transition-all duration-300 flex flex-col border-r border-border/50",
        collapsed ? "w-16" : "w-64",
      )}
      role="navigation"
      aria-label="Admin navigation"
    >
      <SidebarContent collapsed={collapsed} onToggle={onToggle} />
    </aside>
  );
}
