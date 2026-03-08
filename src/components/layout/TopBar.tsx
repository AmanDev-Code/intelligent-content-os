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
import { LogOut, User, Bell, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useState } from "react";

export function TopBar() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [notifications] = useState(3); // Mock notification count

  const initials = (profile?.full_name || user?.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-16 border-b border-border/50 bg-background/80 backdrop-blur-lg flex items-center justify-between px-6 sticky top-0 z-30">

      <div />
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="text-xs capitalize">
          {profile?.plan || "free"}
        </Badge>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 relative"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
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
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Notifications</h3>
              <Badge variant="secondary" className="text-xs">
                {notifications} new
              </Badge>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <DropdownMenuItem className="p-4 flex flex-col items-start space-y-1">
                <div className="flex items-center gap-2 w-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-sm">Content Generated</span>
                  <span className="text-xs text-muted-foreground ml-auto">2 min ago</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your AI content "Future of Remote Work" has been generated successfully.
                </p>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-4 flex flex-col items-start space-y-1">
                <div className="flex items-center gap-2 w-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-sm">Post Scheduled</span>
                  <span className="text-xs text-muted-foreground ml-auto">1 hour ago</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your post is scheduled for tomorrow at 10:00 AM.
                </p>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-4 flex flex-col items-start space-y-1">
                <div className="flex items-center gap-2 w-full">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="font-medium text-sm">AI Credits Low</span>
                  <span className="text-xs text-muted-foreground ml-auto">3 hours ago</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You have 5 AI credits remaining. Consider upgrading your plan.
                </p>
              </DropdownMenuItem>
            </div>
            <div className="p-4 border-t">
              <Button 
                variant="outline" 
                className="w-full text-sm"
                onClick={() => navigate("/notifications")}
              >
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
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
          ) : (
            <Moon className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 w-9 rounded-full p-0" aria-label="User menu">
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                  {initials}
                </AvatarFallback>
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
