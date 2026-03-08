import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SOCIAL_CHANNELS } from "@/lib/constants";
import { Linkedin, Twitter, Instagram, Facebook, Save } from "lucide-react";

const iconMap: Record<string, React.ElementType> = { Linkedin, Twitter, Instagram, Facebook };

export default function Settings() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [username, setUsername] = useState(profile?.username ?? "");
  const [saving, setSaving] = useState(false);

  // Sync state when profile loads
  useState(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setUsername(profile.username ?? "");
    }
  });

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, username })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Settings saved" });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile */}
      <Card className="p-6 border border-border">
        <h3 className="text-sm font-semibold mb-4">Profile</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName" className="text-xs">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="username" className="text-xs">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs">Email</Label>
            <Input value={user?.email ?? ""} disabled className="mt-1" />
          </div>
          <Button onClick={handleSave} disabled={saving} size="sm" className="gradient-primary text-primary-foreground">
            <Save className="h-3 w-3 mr-1" /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>

      <Separator />

      {/* Connected Accounts */}
      <Card className="p-6 border border-border">
        <h3 className="text-sm font-semibold mb-4">Connected Accounts</h3>
        <div className="space-y-3">
          {SOCIAL_CHANNELS.map((ch) => {
            const Icon = iconMap[ch.icon];
            return (
              <div key={ch.id} className="flex items-center justify-between p-3 rounded-md border border-border">
                <div className="flex items-center gap-2">
                  {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                  <span className="text-sm">{ch.label}</span>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Connect
                </Button>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
