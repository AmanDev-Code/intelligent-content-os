import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Plus,
  Linkedin,
  Twitter,
  Instagram,
  Facebook
} from "lucide-react";
import { SOCIAL_PLATFORMS } from "@/lib/constants";

interface SocialChannel {
  id: string;
  name: string;
  connected: boolean;
  followers?: string;
  engagement?: string;
  posts?: number;
}

export function SocialChannels() {
  // Mock data - in real app this would come from API
  const [channels] = useState<SocialChannel[]>([
    {
      id: 'linkedin',
      name: 'LinkedIn',
      connected: false, // Set to false as requested
      followers: '0',
      engagement: '0%',
      posts: 0
    },
    {
      id: 'twitter',
      name: 'Twitter',
      connected: false,
      followers: '0',
      engagement: '0%',
      posts: 0
    },
    {
      id: 'instagram',
      name: 'Instagram',
      connected: false,
      followers: '0',
      engagement: '0%',
      posts: 0
    },
    {
      id: 'facebook',
      name: 'Facebook',
      connected: false,
      followers: '0',
      engagement: '0%',
      posts: 0
    }
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
    // This would trigger OAuth flow in real app
    console.log(`Connecting to ${channelId}`);
    // For now, just show a message
    alert(`OAuth connection for ${channelId} would be implemented here`);
  };

  return (
    <Card className="border-0">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Social Channels</CardTitle>
              <p className="text-sm text-muted-foreground">Connect your social media accounts</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Channel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {channels.map((channel) => {
            const Icon = getIcon(channel.id);
            const platformColor = getPlatformColor(channel.id);
            
            return (
              <Card
                key={channel.id}
                className="border transition-all hover:shadow-sm"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: platformColor }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    {channel.connected && (
                      <Badge variant="secondary" className="gap-1 text-xs">
                        Connected
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">{channel.name}</h3>
                    {channel.connected ? (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Followers</span>
                          <span className="font-medium">{channel.followers}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Engagement</span>
                          <span className="font-medium">{channel.engagement}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Posts</span>
                          <span className="font-medium">{channel.posts} this month</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Not connected</p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleConnect(channel.id)}
                        >
                          Connect
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}