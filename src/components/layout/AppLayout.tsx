import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        collapsed={isMobile ? false : collapsed}
        onToggle={() => (isMobile ? setMobileOpen(false) : setCollapsed(!collapsed))}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div
        className={cn(
          "transition-all duration-300 flex flex-col min-h-screen",
          isMobile ? "ml-0" : collapsed ? "ml-16" : "ml-64"
        )}
      >
        <TopBar onMobileMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
