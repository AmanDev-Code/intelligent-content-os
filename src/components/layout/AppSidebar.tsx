import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/content", icon: FileText, label: "Content" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <span className="text-lg font-bold gradient-text tracking-tight">ContentOS</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 text-sidebar-foreground"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Generate button */}
      <div className="p-3">
        <NavLink to="/generate">
          <Button
            className={cn(
              "w-full gradient-primary text-primary-foreground shadow-lg",
              collapsed ? "px-0" : ""
            )}
            size={collapsed ? "icon" : "default"}
          >
            <Zap className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Generate</span>}
          </Button>
        </NavLink>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-sidebar-border">
        {!collapsed && (
          <div className="rounded-lg bg-sidebar-accent/50 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-sidebar-foreground">AI Credits</span>
            </div>
            <div className="h-1.5 rounded-full bg-sidebar-border overflow-hidden">
              <div className="h-full w-3/5 rounded-full gradient-primary" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">3 / 5 used today</p>
          </div>
        )}
      </div>
    </aside>
  );
}
