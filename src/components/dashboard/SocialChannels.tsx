import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, Plus, Linkedin, Twitter, Instagram, Facebook } from "lucide-react";
import { SOCIAL_PLATFORMS } from "@/lib/constants";

interface SocialChannel {
  id: string; name: string; connected: boolean; followers?: string; engagement?: string; posts?: number;
}

export function SocialChannels() {
  const [channels] = useState<SocialChannel[]>([
    { id: 'linkedin', name: 'LinkedIn', connected: false, followers: '0', engagement: '0%', posts: 0 },
    { id: 'twitter', name: 'Twitter', connected: false, followers: '0', engagement: '0%', posts: 0 },
    { id: 'instagram', name: 'Instagram', connected: false, followers: '0', engagement: '0%', posts: 0 },
    { id: 'facebook', name: 'Facebook', connected: false, followers: '0', engagement: '0%', posts: 0 }
  ]);

  const getIcon = (platformId: string) => {
    switch (platformId) {
      case 'linkedin': return Linkedin;
      case 'twitter': return Twitter;
      case 'instagram': return Instagram;
      case 'facebook': return Facebook;
      default: return Globe;
    }
  };

  const getPlatformColor = (platformId: string) => {
    const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
    return platform?.color || '#6B7280';
  };

  const handleConnect = (channelId: string) => {
    console.log(`Connecting to ${channelId}`);
    alert(`OAuth connection for ${channelId} would be implemented here`);
  };

  return (
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
          return (
            <Card key={channel.id} className="h-full flex flex-col">
              <CardContent className="p-3 sm:p-4 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white" style={{ backgroundColor: platformColor }}>
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  {channel.connected && (
                    <Badge variant="secondary" className="gap-1 text-[10px] sm:text-xs hidden sm:flex">Connected</Badge>
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <h3 className="font-semibold text-sm">{channel.name}</h3>
                  {channel.connected ? (
                    <div className="space-y-1 text-xs mt-1">
                      <div className="flex justify-between"><span className="text-muted-foreground">Followers</span><span className="font-medium">{channel.followers}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Engagement</span><span className="font-medium">{channel.engagement}</span></div>
                    </div>
                  ) : (
                    <div className="flex flex-col flex-1 mt-1">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Not connected</p>
                      <div className="mt-auto pt-2">
                        <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => handleConnect(channel.id)}>Connect</Button>
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
  );
}
