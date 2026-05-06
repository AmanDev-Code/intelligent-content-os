"use client";

import { useState, useEffect, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Plus, Linkedin, Instagram, Facebook, Loader2, Lock } from "lucide-react";
import { XIcon } from "@/components/icons/XIcon";
import { SOCIAL_PLATFORMS } from "@/lib/constants";
import { api } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";
import { useLinkedIn } from "@/contexts/LinkedInContext";
import { useLinkedInConnectionStatus } from "@/hooks/useLinkedInConnectionStatus";
import { toast } from "sonner";
import { SocialComingSoonModal } from "./SocialComingSoonModal";

interface SocialChannel {
  id: string;
  name: string;
  connected: boolean;
  comingSoon?: boolean;
  followers?: string;
  engagement?: string;
  posts?: number;
}

function XPlatformIcon({ className }: { className?: string }) {
  return <XIcon className={className} />;
}
XPlatformIcon.displayName = "XPlatformIcon";

const COMING_SOON_PLATFORMS = ["twitter", "instagram", "facebook"];

export function SocialChannels() {
  const { user } = useAuth();
  const { isConnected: linkedinConnected, metrics: linkedinMetrics, needsReauth } = useLinkedIn();
  const { isConnecting, startConnecting, clearConnecting } = useLinkedInConnectionStatus();
  const [comingSoonPlatform, setComingSoonPlatform] = useState<string | null>(null);

  const [channels, setChannels] = useState<SocialChannel[]>([
    { id: "linkedin", name: "LinkedIn", connected: false, followers: "0", engagement: "0%", posts: 0 },
    { id: "twitter", name: "X", connected: false, comingSoon: true },
    { id: "instagram", name: "Instagram", connected: false, comingSoon: true },
    { id: "facebook", name: "Facebook", connected: false, comingSoon: true },
  ]);

  // Update LinkedIn channel data when context changes
  useEffect(() => {
    setChannels((prev) =>
      prev.map((channel) =>
        channel.id === "linkedin"
          ? {
              ...channel,
              connected: linkedinConnected,
              followers: linkedinMetrics?.followers?.toLocaleString() || "0",
              engagement: linkedinMetrics?.engagement || "0%",
              posts: linkedinMetrics?.posts || 0,
            }
          : channel
      )
    );
  }, [linkedinConnected, linkedinMetrics]);

  // When LinkedIn becomes connected, clear the connecting flag
  useEffect(() => {
    if (linkedinConnected && isConnecting) {
      clearConnecting();
    }
  }, [linkedinConnected, isConnecting, clearConnecting]);

  const getIcon = (platformId: string) => {
    switch (platformId) {
      case "linkedin": return Linkedin;
      case "twitter": return XPlatformIcon;
      case "instagram": return Instagram;
      case "facebook": return Facebook;
      default: return Globe;
    }
  };

  const getPlatformColor = (platformId: string) => {
    const platform = SOCIAL_PLATFORMS.find((p) => p.id === platformId);
    return platform?.color || "#6B7280";
  };

  const handleConnect = async (channelId: string) => {
    if (!user) {
      toast.error("Please sign in to connect your account.");
      return;
    }

    if (channelId === "linkedin") {
      try {
        startConnecting();
        const { url } = await api.linkedin.startOAuth();
        window.location.href = url;
      } catch {
        clearConnecting();
        toast.error("Could not start LinkedIn connection. Please try again.");
      }
      return;
    }

    if (COMING_SOON_PLATFORMS.includes(channelId)) {
      setComingSoonPlatform(channelId);
      return;
    }
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">Social Channels</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Connect your social media accounts</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2 self-start sm:self-center">
            <Plus className="h-4 w-4" /> Add Channel
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 items-stretch">
          {channels.map((channel) => {
            const Icon = getIcon(channel.id);
            const platformColor = getPlatformColor(channel.id);
            const isLinkedInConnecting = channel.id === "linkedin" && isConnecting && !channel.connected;

            if (channel.comingSoon) {
              // X → Phase 2 (Q3 2026), Instagram → Phase 3 (Q4 2026), Facebook → Phase 3 late (Q4 2026)
              const launchPeriod =
                channel.id === "twitter" ? "Q3 2026" :
                channel.id === "instagram" ? "Q4 2026" :
                "Q4 2026";
              return (
                <ComingSoonCard
                  key={channel.id}
                  channel={channel}
                  Icon={Icon}
                  platformColor={platformColor}
                  launchPeriod={launchPeriod}
                  onOpen={() => setComingSoonPlatform(channel.id)}
                />
              );
            }

            if (isLinkedInConnecting) {
              return (
                <LinkedInConnectingCard key={channel.id} platformColor={platformColor} />
              );
            }

            return (
              <Card key={channel.id} className="h-full flex flex-col">
                <CardContent className="p-3 sm:p-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <div
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: platformColor }}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    {channel.connected && (
                      <Badge variant="secondary" className="gap-1 text-[10px] sm:text-xs hidden sm:flex">
                        Connected
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col flex-1">
                    <h3 className="font-semibold text-sm">{channel.name}</h3>
                    {channel.connected ? (
                      channel.id === "linkedin" && needsReauth ? (
                        <div className="flex flex-col flex-1 mt-1">
                          <p className="text-[10px] sm:text-xs text-orange-600">Needs re-auth</p>
                          <div className="mt-auto pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full text-xs border-orange-200 text-orange-600"
                              onClick={() => handleConnect(channel.id)}
                            >
                              Reconnect
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1 text-xs mt-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Followers</span>
                            <span className="font-medium">{channel.followers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Engagement</span>
                            <span className="font-medium">{channel.engagement}</span>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col flex-1 mt-1">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Not connected</p>
                        <div className="mt-auto pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs"
                            onClick={() => handleConnect(channel.id)}
                          >
                            Connect
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <SocialComingSoonModal
        platform={comingSoonPlatform}
        onClose={() => setComingSoonPlatform(null)}
      />
    </>
  );
}

/* ── LinkedIn Connecting card ─────────────────────────────────────── */

const LinkedInConnectingCard = memo(function LinkedInConnectingCard({ platformColor }: { platformColor: string }) {
  return (
    <Card className="h-full flex flex-col linkedin-connecting-card">
      <CardContent className="p-3 sm:p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white shrink-0"
            style={{ backgroundColor: platformColor }}
          >
            <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <Badge className="gap-1 text-[10px] sm:text-xs bg-primary/10 text-primary border-primary/30 border hidden sm:flex">
            <Loader2 className="h-2.5 w-2.5 animate-spin" />
            Connecting
          </Badge>
        </div>
        <div className="flex flex-col flex-1">
          <h3 className="font-semibold text-sm">LinkedIn</h3>
          <div className="flex flex-col flex-1 mt-1 justify-between">
            <div className="flex items-center gap-1.5 mt-1">
              <Loader2 className="h-3 w-3 animate-spin text-primary shrink-0" />
              <p className="text-[10px] sm:text-xs text-primary font-medium">Connecting to LinkedIn...</p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">This may take a moment        </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
LinkedInConnectingCard.displayName = "LinkedInConnectingCard";

/* ── Coming Soon card ─────────────────────────────────────────────── */

interface ComingSoonCardProps {
  channel: SocialChannel;
  Icon: React.ComponentType<{ className?: string }>;
  platformColor: string;
  launchPeriod: string;
  onOpen: () => void;
}

const ComingSoonCard = memo(function ComingSoonCard({ channel, Icon, platformColor, launchPeriod, onOpen }: ComingSoonCardProps) {
  return (
    <div className="relative group" title={launchPeriod}>
      <Card
        className="h-full flex flex-col cursor-pointer transition-all duration-200 opacity-60 hover:opacity-80
          group-hover:border-primary/40"
        onClick={onOpen}
        role="button"
        aria-label={`${channel.name} — Coming Soon. Click to view roadmap.`}
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") ? onOpen() : undefined}
      >
        <CardContent className="p-3 sm:p-4 flex flex-col flex-1 relative overflow-hidden">
          {/* Coming Soon badge (top-right overlay) */}
          <div className="absolute top-2 right-2">
            <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 py-0.5 rounded-full
              bg-primary/15 text-primary border border-primary/30 uppercase tracking-wide">
              Soon
            </span>
          </div>

          <div className="flex items-center mb-2 sm:mb-3">
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white shrink-0 grayscale-[30%]"
              style={{ backgroundColor: platformColor }}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          </div>

          <div className="flex flex-col flex-1">
            <h3 className="font-semibold text-sm">{channel.name}</h3>
            <div className="flex flex-col flex-1 mt-1">
              <div className="flex items-center gap-1 mt-0.5">
                <Lock className="h-2.5 w-2.5 text-muted-foreground" />
                <p className="text-[10px] sm:text-xs text-muted-foreground">Coming Soon</p>
              </div>
              <div className="mt-auto pt-2">
                <p className="text-[10px] sm:text-xs text-muted-foreground/70 text-center">
                  {launchPeriod}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
ComingSoonCard.displayName = "ComingSoonCard";
