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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Greeting */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting()}, <span className="gradient-text">{name}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's your content command center.
          </p>
        </div>
        <Button onClick={() => navigate("/generate")} className="gradient-primary shadow-lg">
          <Zap className="h-4 w-4 mr-2" />
          Generate Post
        </Button>
      </div>

      {/* KPI Cards */}
      <KPICards />

      {/* Content Feed */}
      <ContentFeed />
    </div>
  );
}
