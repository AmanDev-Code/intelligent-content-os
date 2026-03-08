import { useProfile } from "@/hooks/useProfile";
import { KPICards } from "@/components/dashboard/KPICards";
import { ContentFeed } from "@/components/dashboard/ContentFeed";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { profile } = useProfile();
  const navigate = useNavigate();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const name = profile?.full_name?.split(" ")[0] || "there";

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative">
      {/* Ambient glow orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-20 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/6 w-72 h-72 rounded-full bg-accent/5 blur-3xl" />
      </div>

      {/* Greeting */}
      <div className="flex items-center justify-between animate-fade-in-up relative z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting()}, <span className="gradient-text">{name}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's your content command center.
          </p>
        </div>
        <Button onClick={() => navigate("/generate")} className="gradient-primary shadow-lg hover:shadow-xl transition-shadow">
          <Zap className="h-4 w-4 mr-2" aria-hidden="true" />
          Generate Post
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="relative z-10" style={{ animationDelay: "100ms" }}>
        <KPICards />
      </div>

      {/* Content Feed */}
      <div className="relative z-10 animate-fade-in-up" style={{ animationDelay: "200ms", animationFillMode: "both" }}>
        <ContentFeed />
      </div>
    </div>
  );
}
