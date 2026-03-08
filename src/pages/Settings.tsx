import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Zap,
  Save,
  Moon,
  Sun,
  Monitor,
  Lock,
  Eye,
  EyeOff,
  Linkedin,
  Twitter,
  Instagram,
  Facebook
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: true,
    updates: true
  });

  const integrations = [
    { name: 'LinkedIn', id: 'linkedin', icon: Linkedin, connected: false, color: '#0A66C2' },
    { name: 'Twitter', id: 'twitter', icon: Twitter, connected: false, color: '#000000' },
    { name: 'Instagram', id: 'instagram', icon: Instagram, connected: false, color: '#E4405F' },
    { name: 'Facebook', id: 'facebook', icon: Facebook, connected: false, color: '#1877F2' },
  ];

  const handleConnect = (id: string) => {
    toast.info(`OAuth connection for ${id} will be implemented`);
  };

  return (
    <div className="flex-1 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl shrink-0">
          <SettingsIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Settings</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Manage your account and preferences</p>
        </div>
      </div>

      {/* Two-column layout on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Profile */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 shrink-0 text-primary" />
              <h2 className="text-base font-semibold">Profile Information</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName" className="text-xs">First Name</Label>
                    <Input id="firstName" defaultValue="Aman" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-xs">Last Name</Label>
                    <Input id="lastName" defaultValue="Ahuja" className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email" className="text-xs">Email Address</Label>
                  <Input id="email" type="email" defaultValue="amanahuja@gmail.com" className="mt-1" />
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="bio" className="text-xs">Bio</Label>
                  <Textarea id="bio" placeholder="Tell us about yourself..." className="resize-none mt-1 h-[104px]" />
                </div>
              </div>
            </div>
            <Button className="bg-primary text-primary-foreground gap-2 mt-4" size="sm">
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-5 w-5 shrink-0 text-primary" />
              <h2 className="text-base font-semibold">Appearance</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Choose your preferred theme</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'system', label: 'System', icon: Monitor },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTheme(opt.id)}
                  className={`p-3 border-2 rounded-lg flex flex-col items-center gap-1.5 transition-all ${
                    theme === opt.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <opt.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 shrink-0 text-primary" />
              <h2 className="text-base font-semibold">Security</h2>
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="currentPassword" className="text-xs">Current Password</Label>
                <div className="relative mt-1">
                  <Input id="currentPassword" type={showPassword ? "text" : "password"} placeholder="Enter current password" />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="newPassword" className="text-xs">New Password</Label>
                <Input id="newPassword" type="password" placeholder="Enter new password" className="mt-1" />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Lock className="h-4 w-4" /> Update Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 shrink-0 text-primary" />
              <h2 className="text-base font-semibold">Notifications</h2>
            </div>
            <div className="space-y-2">
              {[
                { id: 'email', label: 'Email Notifications', description: 'Receive notifications via email', checked: notifications.email },
                { id: 'push', label: 'Push Notifications', description: 'Browser push notifications', checked: notifications.push },
                { id: 'marketing', label: 'Marketing Emails', description: 'New features and tips', checked: notifications.marketing },
                { id: 'updates', label: 'Product Updates', description: 'Important product changes', checked: notifications.updates },
              ].map((n) => (
                <div key={n.id} className="flex items-center justify-between p-2.5 border rounded-lg gap-3">
                  <div className="min-w-0">
                    <h4 className="font-medium text-sm">{n.label}</h4>
                    <p className="text-xs text-muted-foreground truncate">{n.description}</p>
                  </div>
                  <Switch
                    checked={n.checked}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, [n.id]: checked }))}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 shrink-0 text-primary" />
              <h2 className="text-base font-semibold">Integrations</h2>
            </div>
            <div className="space-y-2">
              {integrations.map((integration) => {
                const Icon = integration.icon;
                return (
                  <div key={integration.id} className="flex items-center justify-between p-2.5 border rounded-lg gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: integration.color }}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-sm">{integration.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {integration.connected ? 'Connected' : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    {integration.connected ? (
                      <Badge variant="secondary" className="gap-1 text-xs shrink-0">
                        <Zap className="h-3 w-3 text-green-500" /> Connected
                      </Badge>
                    ) : (
                      <Button variant="outline" size="sm" className="shrink-0 h-8 text-xs" onClick={() => handleConnect(integration.id)}>
                        Connect
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
