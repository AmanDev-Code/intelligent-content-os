import { SOCIAL_CHANNELS } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Linkedin, Twitter, Instagram, Facebook } from "lucide-react";
import { useNavigate } from "react-router-dom";

const iconMap: Record<string, React.ElementType> = {
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
};

export function SocialChannels() {
  const navigate = useNavigate();

  return (
    <Card className="p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Social Channels</h3>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-7"
          onClick={() => navigate("/settings")}
        >
          Manage
        </Button>
      </div>

      <div className="space-y-2">
        {SOCIAL_CHANNELS.map((channel) => {
          const Icon = iconMap[channel.icon];
          // All channels start as not connected — real OAuth will be added later
          return (
            <div
              key={channel.id}
              className="flex items-center justify-between p-2 rounded-md border border-border"
            >
              <div className="flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                <span className="text-sm text-foreground">{channel.label}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => navigate("/settings")}
              >
                Connect
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
