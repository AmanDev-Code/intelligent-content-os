import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LogOut, User, Bell, Sun, Moon, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface TopBarProps {
  onMobileMenuToggle?: () => void;
}

export function TopBar({ onMobileMenuToggle }: TopBarProps) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [notifications] = useState(3);
  const [notifOpen, setNotifOpen] = useState(false);
  const isMobile = useIsMobile();

  const initials = (profile?.full_name || user?.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-14 md:h-16 border-b border-border/50 bg-background/80 backdrop-blur-lg flex items-center justify-between px-3 sm:px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        {isMobile && (
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onMobileMenuToggle} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {!isMobile && (
          <Badge variant="secondary" className="text-xs capitalize">
            {profile?.plan || "free"}
          </Badge>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 relative" aria-label="Notifications">
              <Bell className="h-4 w-4 text-muted-foreground" />
              {notifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {notifications}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 max-w-[calc(100vw-2rem)] p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-sm">Notifications</h3>
              <Badge variant="secondary" className="text-[10px]">{notifications} new</Badge>
            </div>
            <div className="max-h-[50vh] overflow-y-auto divide-y divide-border">
              {[
                { dot: "bg-primary", title: "Content Generated", time: "2m ago", msg: "Your AI content has been generated successfully." },
                { dot: "bg-muted-foreground", title: "Post Scheduled", time: "1h ago", msg: "Your post is scheduled for tomorrow at 10:00 AM." },
                { dot: "bg-destructive", title: "AI Credits Low", time: "3h ago", msg: "You have 5 AI credits remaining." },
              ].map((n, i) => (
                <DropdownMenuItem key={i} className="px-4 py-3 flex items-start gap-2.5 cursor-pointer focus:bg-accent">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.dot}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm truncate">{n.title}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.msg}</p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <div className="p-2 border-t">
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => navigate("/notifications")}>
                View All Notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 w-9 rounded-full p-0" aria-label="User menu">
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <User className="mr-2 h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
