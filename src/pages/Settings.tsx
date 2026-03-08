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
    <div className="flex-1 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl shrink-0">
          <SettingsIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
        </div>
      </div>

      {/* Profile */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 shrink-0" />
            <h2 className="text-lg font-bold">Profile Information</h2>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName" className="text-xs sm:text-sm">First Name</Label>
                <Input id="firstName" defaultValue="Aman" className="mt-1" />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-xs sm:text-sm">Last Name</Label>
                <Input id="lastName" defaultValue="Ahuja" className="mt-1" />
              </div>
            </div>
            <div>
              <Label htmlFor="email" className="text-xs sm:text-sm">Email Address</Label>
              <Input id="email" type="email" defaultValue="amanahuja@gmail.com" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="bio" className="text-xs sm:text-sm">Bio</Label>
              <Textarea id="bio" placeholder="Tell us about yourself..." className="resize-none mt-1" rows={3} />
            </div>
            <Button className="bg-primary text-primary-foreground gap-2" size="sm">
              <Save className="h-4 w-4" /> Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-5 w-5 shrink-0" />
            <h2 className="text-lg font-bold">Appearance</h2>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3">Choose your preferred theme</p>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
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
                <span className="text-xs sm:text-sm font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 shrink-0" />
            <h2 className="text-lg font-bold">Notifications</h2>
          </div>
          <div className="space-y-3">
            {[
              { id: 'email', label: 'Email Notifications', description: 'Receive notifications via email', checked: notifications.email },
              { id: 'push', label: 'Push Notifications', description: 'Receive push notifications in browser', checked: notifications.push },
              { id: 'marketing', label: 'Marketing Emails', description: 'Updates about new features and tips', checked: notifications.marketing },
              { id: 'updates', label: 'Product Updates', description: 'Important product changes', checked: notifications.updates },
            ].map((n) => (
              <div key={n.id} className="flex items-center justify-between p-3 border rounded-lg gap-3">
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

      {/* Security */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 shrink-0" />
            <h2 className="text-lg font-bold">Security</h2>
          </div>
          <div className="space-y-3">
            <div>
              <Label htmlFor="currentPassword" className="text-xs sm:text-sm">Current Password</Label>
              <div className="relative mt-1">
                <Input id="currentPassword" type={showPassword ? "text" : "password"} placeholder="Enter current password" />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="newPassword" className="text-xs sm:text-sm">New Password</Label>
              <Input id="newPassword" type="password" placeholder="Enter new password" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-xs sm:text-sm">Confirm Password</Label>
              <Input id="confirmPassword" type="password" placeholder="Confirm new password" className="mt-1" />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Lock className="h-4 w-4" /> Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 shrink-0" />
            <h2 className="text-lg font-bold">Integrations</h2>
          </div>
          <div className="space-y-3">
            {integrations.map((integration) => {
              const Icon = integration.icon;
              return (
                <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg gap-3">
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
  );
}
