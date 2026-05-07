import { useState } from "react";
import Link from "next/link";
import { NavLink } from "@/components/NavLink";
import { usePathname } from "next/navigation";
import { TrndinnLogo } from "@/components/brand/TrndinnLogo";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart3,
  Settings,
  Zap,
  Image,
  CreditCard,
  Sparkles,
  Menu,
  Calendar,
  Shield,
  MessageSquarePlus,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuota } from "@/contexts/QuotaContext";
import { useAdminAreaAccess } from "@/hooks/useAdminAreaAccess";
import { UserFeedbackModal } from "@/components/feedback/UserFeedbackModal";

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/agent", icon: Zap, label: "AI Agent" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/scheduled-posts", icon: Calendar, label: "Scheduled Posts" },
  { to: "/media", icon: Image, label: "Media" },
];

const bottomNavItems = [
  { to: "/affiliate", icon: Gift, label: "Affiliate & Referrals" },
  { to: "/billing", icon: CreditCard, label: "Billing" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

/** Credits remaining vs plan allocation, capped so bonus/admin credits never overflow the bar. */
function getCreditsRemainingFillPercent(quota: {
  remainingCredits: number;
  totalCredits: number;
}): number {
  const total = Math.max(quota.totalCredits, 1);
  const remaining = Math.max(0, quota.remainingCredits);
  return Math.min(100, (remaining / total) * 100);
}

function getCreditsUsedPercentDisplay(percentageUsed: number): number {
  return Math.min(100, Math.max(0, percentageUsed));
}

function SidebarContent({ collapsed, onToggle, onItemClick }: { collapsed: boolean; onToggle: () => void; onItemClick?: () => void }) {
  const pathname = usePathname();
  const adminArea = useAdminAreaAccess();
  const { quota: userQuota } = useQuota();

  const remainingFillPct = userQuota ? getCreditsRemainingFillPercent(userQuota) : 0;
  const pctUsedDisplay = userQuota ? getCreditsUsedPercentDisplay(userQuota.percentageUsed) : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center border-b border-border/50 shrink-0",
        collapsed ? "justify-center px-2" : "justify-between px-6"
      )}>
        {!collapsed && (
          <Link href="/dashboard" className="flex flex-1 items-center justify-center min-w-0" aria-label="Trndinn home">
            <TrndinnLogo variant="full" priority className="shrink-0" />
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="flex justify-center" aria-label="Trndinn home">
            <TrndinnLogo variant="icon" priority className="h-11 w-11" />
          </Link>
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
        <NavLink href="/agent" onClick={onItemClick}>
          <Button
            data-tour="create-post"
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
            item.to === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.to);
          const tourAttr =
            item.to === "/dashboard"
              ? "nav-dashboard"
              : item.to === "/scheduled-posts"
                ? "nav-scheduled-posts"
                : item.to === "/media"
                  ? "nav-media"
                  : item.to === "/agent"
                    ? "nav-agent"
                    : undefined;
          return (
            <NavLink
              key={item.to}
              href={item.to}
              onClick={onItemClick}
              data-tour={tourAttr}
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

        {!adminArea.loading && adminArea.canEnter ? (
          <div className="space-y-1 shrink-0 border-t border-border/50 pt-3 mt-2">
            {!collapsed && (
              <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                Admin
              </div>
            )}
            <NavLink
              href="/admin"
              onClick={onItemClick}
              className={cn(
                "flex items-center transition-all duration-200 group relative",
                collapsed
                  ? "justify-center w-full h-12 rounded-xl"
                  : "gap-3 rounded-lg px-3 py-2.5",
                "text-sm font-medium",
                pathname.startsWith("/admin")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              aria-current={pathname.startsWith("/admin") ? "page" : undefined}
              title={collapsed ? "Admin panel" : undefined}
            >
              <Shield className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} aria-hidden="true" />
              {!collapsed && <span>Admin panel</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  Admin panel
                </div>
              )}
            </NavLink>
          </div>
        ) : null}
      </nav>

      {/* Credits Progress Bar */}
      {!collapsed && userQuota && (
        <div className="px-6 py-4 border-t border-border/50 shrink-0 min-w-0">
          <div className="space-y-3 min-w-0">
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <Zap className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-medium truncate">AI Credits</span>
              </div>
              <Badge 
                variant={
                  pctUsedDisplay < 20 
                    ? 'default' 
                    : pctUsedDisplay < 80
                    ? 'secondary'
                    : 'destructive'
                }
                className="text-xs shrink-0"
              >
                {pctUsedDisplay.toFixed(0)}%
              </Badge>
            </div>
            
            <div className="space-y-2 min-w-0">
              <div className="w-full max-w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 max-w-full ${
                    pctUsedDisplay < 20 
                      ? 'bg-green-500' 
                      : pctUsedDisplay < 80
                      ? 'bg-orange-500'
                      : 'bg-red-500'
                  }`}
                  style={{ 
                    width: `${remainingFillPct}%`,
                  }}
                />
              </div>
              <div className="flex justify-between gap-2 text-xs text-muted-foreground min-w-0">
                <span className="truncate">{userQuota.remainingCredits} left</span>
                <span className="shrink-0">{userQuota.totalCredits} total</span>
              </div>
            </div>

            {pctUsedDisplay >= 80 && (
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

      {/* Collapsed: vertical "tank" — fill anchored to bottom, shrinks upward as credits are used */}
      {collapsed && userQuota && (
        <div className="px-2 py-3 border-t border-border/50 shrink-0 flex flex-col items-center gap-1.5">
          <div
            className="relative w-2.5 h-14 shrink-0 rounded-full bg-muted/40 overflow-hidden border border-border/40"
            title={`AI Credits: ${userQuota.remainingCredits} left (${userQuota.totalCredits} plan)`}
            aria-label={`AI Credits: ${userQuota.remainingCredits} remaining`}
          >
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 rounded-full transition-all duration-300",
                pctUsedDisplay < 20
                  ? "bg-green-500"
                  : pctUsedDisplay < 80
                    ? "bg-orange-500"
                    : "bg-red-500",
              )}
              style={{ height: `${remainingFillPct}%` }}
            />
          </div>
          <span className="text-[10px] leading-tight text-muted-foreground font-medium tabular-nums max-w-full truncate px-0.5">
            {userQuota.remainingCredits}
          </span>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="border-t border-border/50 shrink-0">
        <nav className={cn("py-4 space-y-1", collapsed ? "px-2" : "px-6")}>
          {bottomNavItems.map((item) => {
            const isActive = pathname.startsWith(item.to);
            const tourAttr =
              item.to === "/settings"
                ? "nav-settings"
                : item.to === "/notifications"
                  ? "nav-notifications"
                  : undefined;
            return (
              <NavLink
                key={item.to}
                href={item.to}
                onClick={onItemClick}
                data-tour={tourAttr}
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

          {/* Feedback Button */}
          <UserFeedbackModal
            trigger={
              <button
                type="button"
                className={cn(
                  "flex items-center transition-all duration-200 group relative w-full",
                  collapsed
                    ? "justify-center h-12 rounded-xl"
                    : "gap-3 rounded-lg px-3 py-2",
                  "text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                title={collapsed ? "Send Feedback" : undefined}
              >
                <MessageSquarePlus className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} aria-hidden="true" />
                {!collapsed && <span>Send Feedback</span>}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Send Feedback
                  </div>
                )}
              </button>
            }
          />
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
