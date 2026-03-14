import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Zap,
  Image,
  CreditCard,
  Users,
  Sparkles,
  Menu,
  X,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useQuota } from "@/contexts/QuotaContext";
import { useAdmin } from "@/hooks/useAdmin";
import { getQuotaColor } from "@/services/dataService";
import { supabase } from "@/integrations/supabase/client";

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/agent", icon: Zap, label: "AI Agent" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/media", icon: Image, label: "Media" },
];

const bottomNavItems = [
  { to: "/affiliate", icon: Users, label: "Affiliate" },
  { to: "/billing", icon: CreditCard, label: "Billing" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

function SidebarContent({ collapsed, onToggle, onItemClick }: { collapsed: boolean; onToggle: () => void; onItemClick?: () => void }) {
  const location = useLocation();
  const { user } = useAuth();
  const { quota: userQuota, loading: loadingQuota } = useQuota();
  const { isAdmin } = useAdmin();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center border-b border-border/50 shrink-0",
        collapsed ? "justify-center px-2" : "justify-between px-6"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">Postra</span>
          </div>
        )}
        {collapsed && (
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 rounded-lg"
            aria-label="Collapse sidebar"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Toggle button for collapsed state */}
      {collapsed && (
        <div className="px-2 py-3 border-b border-border/50 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="w-full h-10 rounded-lg"
            aria-label="Expand sidebar"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}

      {/* Create Post button */}
      <div className={cn("py-4 shrink-0", collapsed ? "px-2" : "px-6")}>
        <NavLink to="/agent" onClick={onItemClick}>
          <Button
            className={cn(
              "w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
              collapsed ? "h-12 rounded-xl" : "rounded-lg"
            )}
            size={collapsed ? "icon" : "default"}
          >
            <Zap className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} aria-hidden="true" />
            {!collapsed && <span className="ml-2">Create Post</span>}
          </Button>
        </NavLink>
      </div>

      {/* Nav items */}
      <nav className={cn("flex-1 space-y-1 overflow-y-auto", collapsed ? "px-2" : "px-6")}>
        {navItems.map((item) => {
          const isActive =
            item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onItemClick}
              className={cn(
                "flex items-center transition-all duration-200 group relative",
                collapsed
                  ? "justify-center w-full h-12 rounded-xl"
                  : "gap-3 rounded-lg px-3 py-2.5",
                "text-sm font-medium",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} aria-hidden="true" />
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

      {/* Credits Progress Bar */}
      {!collapsed && userQuota && (
        <div className="px-6 py-4 border-t border-border/50 shrink-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">AI Credits</span>
              </div>
              <Badge 
                variant={
                  userQuota.percentageUsed < 20 
                    ? 'default' 
                    : userQuota.percentageUsed < 80
                    ? 'secondary'
                    : 'destructive'
                }
                className="text-xs"
              >
                {userQuota.percentageUsed.toFixed(0)}%
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="w-full bg-muted/30 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    userQuota.percentageUsed < 20 
                      ? 'bg-green-500' 
                      : userQuota.percentageUsed < 80
                      ? 'bg-orange-500'
                      : 'bg-red-500'
                  }`}
                  style={{ 
                    width: `${Math.max(100 - userQuota.percentageUsed, 0)}%` 
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{userQuota.remainingCredits} left</span>
                <span>{userQuota.totalCredits} total</span>
              </div>
            </div>

            {userQuota.percentageUsed >= 80 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs h-7 hover:bg-primary/5 hover:text-primary"
                onClick={() => window.location.href = '/billing'}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Upgrade
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Collapsed Credits Indicator */}
      {collapsed && userQuota && (
        <div className="px-2 py-2 border-t border-border/50 shrink-0">
          <div className="flex flex-col items-center space-y-1">
            <div className={`w-8 h-1.5 rounded-full ${
              userQuota.percentageUsed < 20 
                ? 'bg-green-500' 
                : userQuota.percentageUsed < 80
                ? 'bg-orange-500'
                : 'bg-red-500'
            }`} />
            <span className="text-xs text-muted-foreground font-medium">
              {userQuota.remainingCredits}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="border-t border-border/50 shrink-0">
        <nav className={cn("py-4 space-y-1", collapsed ? "px-2" : "px-6")}>
          {/* Admin Email Templates Link */}
          {isAdmin && (
            <NavLink
              to="/email-templates"
              onClick={onItemClick}
              className={cn(
                "flex items-center transition-all duration-200 group relative",
                collapsed
                  ? "justify-center w-full h-12 rounded-xl"
                  : "gap-3 rounded-lg px-3 py-2",
                "text-sm font-medium",
                location.pathname === "/email-templates"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              aria-current={location.pathname === "/email-templates" ? "page" : undefined}
              title={collapsed ? "Email Templates" : undefined}
            >
              <Mail className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} aria-hidden="true" />
              {!collapsed && <span>Email Dashboard</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Email Dashboard
                </div>
              )}
            </NavLink>
          )}
          
          {bottomNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onItemClick}
                className={cn(
                  "flex items-center transition-all duration-200 group relative",
                  collapsed
                    ? "justify-center w-full h-12 rounded-xl"
                    : "gap-3 rounded-lg px-3 py-2",
                  "text-sm font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} aria-hidden="true" />
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
      </div>
    </div>
  );
}

export function AppSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: AppSidebarProps) {
  const isMobile = useIsMobile();

  // Mobile: use Sheet
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={(open) => !open && onMobileClose?.()}>
        <SheetContent side="left" className="p-0 w-[86vw] max-w-72" hideClose>
          <SidebarContent collapsed={false} onToggle={() => onMobileClose?.()} onItemClick={onMobileClose} />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: fixed sidebar
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-background transition-all duration-300 flex flex-col border-r border-border/50",
        collapsed ? "w-16" : "w-64"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <SidebarContent collapsed={collapsed} onToggle={onToggle} />
    </aside>
  );
}
