import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff
} from "lucide-react";
import { useTheme } from "next-themes";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: true,
    updates: true
  });

  return (
    <div className="flex-1 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl">
            <SettingsIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account and application preferences
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile', icon: User },
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                  { id: 'security', label: 'Security', icon: Shield },
                  { id: 'appearance', label: 'Appearance', icon: Palette },
                  { id: 'integrations', label: 'Integrations', icon: Globe },
                ].map((item) => (
                  <button
                    key={item.id}
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-muted/50 transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="Aman" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Ahuja" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue="amanahuja@gmail.com" />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell us about yourself..."
                  className="resize-none"
                  rows={3}
                />
              </div>
              <Button className="gradient-primary gap-2">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-base font-medium">Theme</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Choose your preferred theme
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'system', label: 'System', icon: Monitor },
                  ].map((themeOption) => (
                    <button
                      key={themeOption.id}
                      onClick={() => setTheme(themeOption.id)}
                      className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all hover:shadow-md ${
                        theme === themeOption.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <themeOption.icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{themeOption.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  id: 'email',
                  label: 'Email Notifications',
                  description: 'Receive notifications via email',
                  checked: notifications.email
                },
                {
                  id: 'push',
                  label: 'Push Notifications',
                  description: 'Receive push notifications in your browser',
                  checked: notifications.push
                },
                {
                  id: 'marketing',
                  label: 'Marketing Emails',
                  description: 'Receive updates about new features and tips',
                  checked: notifications.marketing
                },
                {
                  id: 'updates',
                  label: 'Product Updates',
                  description: 'Get notified about important product changes',
                  checked: notifications.updates
                },
              ].map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{notification.label}</h4>
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                  </div>
                  <Switch
                    checked={notification.checked}
                    onCheckedChange={(checked) =>
                      setNotifications(prev => ({ ...prev, [notification.id]: checked }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" placeholder="Enter new password" />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="Confirm new password" />
              </div>
              <Button variant="outline" className="gap-2">
                <Lock className="h-4 w-4" />
                Update Password
              </Button>
            </CardContent>
          </Card>

          {/* Integrations */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {[
                  { name: 'LinkedIn', status: 'connected', color: 'bg-blue-600' },
                  { name: 'Twitter', status: 'disconnected', color: 'bg-black' },
                  { name: 'Instagram', status: 'disconnected', color: 'bg-pink-600' },
                  { name: 'Facebook', status: 'disconnected', color: 'bg-blue-700' },
                ].map((integration) => (
                  <div key={integration.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${integration.color} flex items-center justify-center text-white font-bold text-sm`}>
                        {integration.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-medium">{integration.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {integration.status === 'connected' ? 'Connected' : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {integration.status === 'connected' ? (
                        <Badge variant="secondary" className="gap-1">
                          <Zap className="h-3 w-3 text-green-500" />
                          Connected
                        </Badge>
                      ) : (
                        <Button variant="outline" size="sm">
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}