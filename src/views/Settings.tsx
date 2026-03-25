import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Instagram,
  Facebook,
  CheckCircle,
  Wrench,
  Info,
  Mail,
  ExternalLink
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiClient } from '@/lib/apiClient';
import { useTheme } from "next-themes";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XIcon } from "@/components/icons/XIcon";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useLinkedIn } from "@/contexts/LinkedInContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAdmin, ADMIN_USER_ID } from "@/hooks/useAdmin";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { API_CONFIG } from "@/lib/constants";
import AdminNotifications from "@/components/AdminNotifications";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Image from "next/image";
export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile();
  const { isConnected: linkedinConnected, refreshConnection, refreshMetrics, disconnect: disconnectLinkedIn } = useLinkedIn();
  const { isAdmin } = useAdmin();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [quickActionLoading, setQuickActionLoading] = useState(false);
  
  const [profileForm, setProfileForm] = useState({ username: "", full_name: "", avatar_url: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        username: profile.username || "",
        full_name: profile.full_name || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile]);

  const [quickActionDialogs, setQuickActionDialogs] = useState({
    featureUpdate: false,
    maintenance: false,
    educational: false,
  });

  const [quickForms, setQuickForms] = useState({
    featureUpdate: {
      featureName: '',
      description: '',
      benefits: '',
      releaseDate: '',
    },
    maintenance: {
      maintenanceType: '',
      startTime: '',
      endTime: '',
      affectedServices: '',
      reason: '',
    },
    educational: {
      topic: '',
      content: '',
      targetAudience: '',
      callToAction: '',
    },
  });
  
  // Get notification settings with error handling
  let notificationSettings = {
    soundEnabled: true,
    emailEnabled: true,
    pushEnabled: false,
    marketingEnabled: true,
    updatesEnabled: true,
  };
  let updateNotificationSettings = (settings: any) => {
    console.log('Notification settings update:', settings);
  };

  try {
    const notificationContext = useNotifications();
    notificationSettings = notificationContext.settings;
    updateNotificationSettings = notificationContext.updateSettings;
  } catch (error) {
    console.warn('Notification context not available, using default settings');
  }

  const handleQuickAction = async (type: 'featureUpdate' | 'maintenance' | 'educational') => {
    let title = '';
    let message = '';
    let notificationType: 'info' | 'warning' | 'success' = 'info';
    let priority = 0;

    switch (type) {
      case 'featureUpdate': {
        const formData = quickForms.featureUpdate;
        title = `🎉 New Feature: ${formData.featureName}`;
        message = `${formData.description}\n\nBenefits:\n${formData.benefits}${formData.releaseDate ? `\n\nAvailable: ${formData.releaseDate}` : ''}`;
        notificationType = 'success';
        priority = 1;
        break;
      }
      case 'maintenance': {
        const formData = quickForms.maintenance;
        title = `⚠️ Scheduled Maintenance: ${formData.maintenanceType}`;
        message = `We will be performing ${formData.maintenanceType.toLowerCase()} from ${formData.startTime} to ${formData.endTime}.\n\nAffected services: ${formData.affectedServices}\n\nReason: ${formData.reason}`;
        notificationType = 'warning';
        priority = 2;
        break;
      }
      case 'educational': {
        const formData = quickForms.educational;
        title = `💡 ${formData.topic}`;
        message = `${formData.content}${formData.targetAudience ? `\n\nFor: ${formData.targetAudience}` : ''}${formData.callToAction ? `\n\n${formData.callToAction}` : ''}`;
        notificationType = 'info';
        priority = 0;
        break;
      }
    }

    try {
      setQuickActionLoading(true);
      const response = await apiClient.post('/admin/notifications/broadcast', {
        title,
        message,
        type: notificationType,
        category: type === 'maintenance' ? 'announcement' : 'marketing',
        priority,
      });
      
      if (response.success) {
        toast.success(`${type === 'featureUpdate' ? 'Feature update' : type === 'maintenance' ? 'Maintenance notice' : 'Educational content'} sent successfully!`);
        setQuickActionDialogs(prev => ({ ...prev, [type]: false }));
        // Reset form
        setQuickForms(prev => ({
          ...prev,
          [type]: type === 'featureUpdate' ? 
            { featureName: '', description: '', benefits: '', releaseDate: '' } :
            type === 'maintenance' ?
            { maintenanceType: '', startTime: '', endTime: '', affectedServices: '', reason: '' } :
            { topic: '', content: '', targetAudience: '', callToAction: '' }
        }));
      } else {
        toast.error(`Failed to send ${type}`);
      }
    } catch (error: any) {
      console.error(`Failed to send ${type}:`, error);
      toast.error(error.response?.data?.message || `Failed to send ${type}`);
    } finally {
      setQuickActionLoading(false);
    }
  };

  const [integrations, setIntegrations] = useState([
    { name: 'LinkedIn', id: 'linkedin', icon: Linkedin, connected: linkedinConnected, color: '#0A66C2' },
    { name: 'X', id: 'twitter', icon: ({ className }: { className?: string }) => <XIcon className={className} />, connected: false, color: '#000000' },
    { name: 'Instagram', id: 'instagram', icon: Instagram, connected: false, color: '#E4405F' },
    { name: 'Facebook', id: 'facebook', icon: Facebook, connected: false, color: '#1877F2' },
  ]);

  useEffect(() => {
    // If we were redirected back with ?linkedin=connected, refresh LinkedIn context
    const linkedinParam = searchParams.get("linkedin");
    if (linkedinParam === "connected") {
      toast.success("LinkedIn account connected successfully.");
      // Trigger a refresh of LinkedIn connection status across the app
      refreshConnection();
      refreshMetrics();
      // Also trigger localStorage event for other tabs
      localStorage.setItem('linkedin-connected', 'true');
      localStorage.removeItem('linkedin-connected'); // Trigger the event
    }
  }, [searchParams, refreshConnection, refreshMetrics]);

  // Update integrations state when LinkedIn context changes
  useEffect(() => {
    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === "linkedin"
          ? { ...integration, connected: linkedinConnected }
          : integration
      )
    );
  }, [linkedinConnected]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setProfileSaving(true);
    try {
      const res = await apiClient.patch("/profile", {
        username: profileForm.username.trim() || undefined,
        full_name: profileForm.full_name.trim() || undefined,
        avatar_url: profileForm.avatar_url.trim() || undefined,
      });
      if (res.success) {
        toast.success("Profile updated successfully");
        refetchProfile();
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPEG, PNG, GIF, WebP)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    setAvatarUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      setProfileForm((prev) => ({ ...prev, avatar_url: publicUrl }));
      await apiClient.patch("/profile", { avatar_url: publicUrl });
      toast.success("Avatar updated");
      refetchProfile();
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const handleConnect = (id: string) => {
    if (!user) {
      toast.error("Please sign in to connect your account.");
      return;
    }

    if (id === "linkedin") {
      const state = encodeURIComponent(user.id);
      window.location.href = `${API_CONFIG.BASE_URL}/linkedin/auth?state=${state}`;
      return;
    }

    toast.info(`OAuth connection for ${id} will be implemented later`);
  };

  const handleDisconnect = async (id: string) => {
    if (!user) {
      toast.error("Please sign in to disconnect your account.");
      return;
    }

    if (id === "linkedin") {
      try {
        console.log('🔗 Settings: Starting LinkedIn disconnect...');
        await disconnectLinkedIn();
        console.log('✅ Settings: LinkedIn disconnect successful');
        toast.success("LinkedIn account disconnected successfully.");
      } catch (error) {
        console.error("❌ Settings: Error disconnecting LinkedIn:", error);
        console.error("Error details:", {
          message: error?.message,
          stack: error?.stack,
          name: error?.name
        });
        toast.error(`Failed to disconnect LinkedIn account: ${error?.message || 'Unknown error'}`);
      }
      return;
    }

    toast.info(`Disconnect for ${id} will be implemented later`);
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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
        {/* Profile - takes 2 cols */}
        <Card className="xl:col-span-2">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 shrink-0 text-primary" />
              <h2 className="text-base font-semibold">Profile Information</h2>
            </div>
            {profileLoading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {profileForm.avatar_url ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={profileForm.avatar_url}
                          alt="Avatar"
                          fill
                          className="object-cover"
                          sizes="80px"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <User className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs">Profile Photo</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload manually or sync from Google sign-in. JPG, PNG, GIF, WebP. Max 2MB.
                    </p>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="sr-only"
                      id="avatar-upload"
                      onChange={handleAvatarUpload}
                      disabled={avatarUploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => document.getElementById("avatar-upload")?.click()}
                      disabled={avatarUploading}
                    >
                      {avatarUploading ? "Uploading..." : "Upload Photo"}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username" className="text-xs">Username</Label>
                    <Input
                      id="username"
                      placeholder="johndoe"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm((p) => ({ ...p, username: e.target.value.replace(/[^a-zA-Z0-9_-]/g, "") }))}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Letters, numbers, underscores, hyphens. Must be unique.</p>
                  </div>
                  <div>
                    <Label htmlFor="fullName" className="text-xs">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm((p) => ({ ...p, full_name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Email Address</Label>
                  <Input value={user?.email ?? ""} className="mt-1" disabled />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here.</p>
                </div>
                <Button
                  className="bg-primary text-primary-foreground gap-2"
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                >
                  {profileSaving ? (
                    <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
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
                { 
                  id: 'soundEnabled', 
                  label: 'Sound Notifications', 
                  description: 'Play sound when new notifications arrive', 
                  checked: notificationSettings.soundEnabled 
                },
                { 
                  id: 'emailEnabled', 
                  label: 'Email Notifications', 
                  description: 'Receive notifications via email', 
                  checked: notificationSettings.emailEnabled 
                },
                { 
                  id: 'pushEnabled', 
                  label: 'Push Notifications', 
                  description: 'Browser push notifications', 
                  checked: notificationSettings.pushEnabled 
                },
                { 
                  id: 'marketingEnabled', 
                  label: 'Marketing Emails', 
                  description: 'New features and tips', 
                  checked: notificationSettings.marketingEnabled 
                },
                { 
                  id: 'updatesEnabled', 
                  label: 'Product Updates', 
                  description: 'Important product changes', 
                  checked: notificationSettings.updatesEnabled 
                },
              ].map((n) => (
                <div key={n.id} className="flex items-center justify-between p-2.5 border rounded-lg gap-3">
                  <div className="min-w-0">
                    <h4 className="font-medium text-sm">{n.label}</h4>
                    <p className="text-xs text-muted-foreground truncate">{n.description}</p>
                  </div>
                  <Switch
                    checked={n.checked}
                    onCheckedChange={(checked) => updateNotificationSettings({ [n.id]: checked })}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>


        {/* Security */}
        <Card className="xl:col-span-2">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 shrink-0 text-primary" />
              <h2 className="text-base font-semibold">Security</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            </div>
            <Button variant="outline" size="sm" className="gap-2 mt-3">
              <Lock className="h-4 w-4" /> Update Password
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
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium">Theme</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'system', label: 'System', icon: Monitor },
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <Button
                        key={t.id}
                        variant={theme === t.id ? "default" : "outline"}
                        size="sm"
                        className="justify-start gap-2"
                        onClick={() => setTheme(t.id)}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs">{t.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Integrations */}
        <Card className="xl:col-span-2">
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
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Zap className="h-3 w-3 text-green-500" /> Connected
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50" 
                          onClick={() => handleDisconnect(integration.id)}
                        >
                          Disconnect
                        </Button>
                      </div>
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

        {/* Admin Quick Actions - Only show for admin users, positioned next to integrations */}
        {isAdmin && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 shrink-0 text-primary" />
                <h2 className="text-base font-semibold">Quick Actions</h2>
                <Badge variant="destructive" className="text-xs">Admin Only</Badge>
              </div>
              <ErrorBoundary
                fallback={
                  <div className="p-4 text-center text-muted-foreground">
                    <p>Quick actions temporarily unavailable.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.location.reload()}
                      className="mt-2"
                    >
                      Refresh Page
                    </Button>
                  </div>
                }
              >
                <div className="grid gap-3">
                  {/* Feature Update Dialog */}
                  <Dialog open={quickActionDialogs.featureUpdate} onOpenChange={(open) => setQuickActionDialogs(prev => ({ ...prev, featureUpdate: open }))}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-auto p-3 flex flex-col items-center gap-2"
                        disabled={quickActionLoading}
                      >
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                        <div className="text-center">
                          <div className="font-medium text-sm">Feature Update</div>
                          <div className="text-xs text-muted-foreground">Marketing campaign</div>
                        </div>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>🎉 Feature Update Notification</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Feature Name</Label>
                          <Input
                            placeholder="e.g., AI Content Scheduler"
                            value={quickForms.featureUpdate.featureName}
                            onChange={(e) => setQuickForms(prev => ({
                              ...prev,
                              featureUpdate: { ...prev.featureUpdate, featureName: e.target.value }
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            placeholder="Describe the new feature..."
                            value={quickForms.featureUpdate.description}
                            onChange={(e) => setQuickForms(prev => ({
                              ...prev,
                              featureUpdate: { ...prev.featureUpdate, description: e.target.value }
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Benefits</Label>
                          <Textarea
                            placeholder="What benefits does this feature provide?"
                            value={quickForms.featureUpdate.benefits}
                            onChange={(e) => setQuickForms(prev => ({
                              ...prev,
                              featureUpdate: { ...prev.featureUpdate, benefits: e.target.value }
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Release Date (Optional)</Label>
                          <Input
                            type="date"
                            value={quickForms.featureUpdate.releaseDate}
                            onChange={(e) => setQuickForms(prev => ({
                              ...prev,
                              featureUpdate: { ...prev.featureUpdate, releaseDate: e.target.value }
                            }))}
                          />
                        </div>
                        <Button 
                          onClick={() => handleQuickAction('featureUpdate')} 
                          disabled={quickActionLoading || !quickForms.featureUpdate.featureName || !quickForms.featureUpdate.description}
                          className="w-full"
                        >
                          Send Feature Update
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Maintenance Notice Dialog */}
                  <Dialog open={quickActionDialogs.maintenance} onOpenChange={(open) => setQuickActionDialogs(prev => ({ ...prev, maintenance: open }))}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-auto p-3 flex flex-col items-center gap-2"
                        disabled={quickActionLoading}
                      >
                        <Wrench className="h-5 w-5 text-yellow-500" />
                        <div className="text-center">
                          <div className="font-medium text-sm">Maintenance Notice</div>
                          <div className="text-xs text-muted-foreground">System announcement</div>
                        </div>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>⚠️ Maintenance Notification</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Maintenance Type</Label>
                          <Select 
                            value={quickForms.maintenance.maintenanceType} 
                            onValueChange={(value) => setQuickForms(prev => ({
                              ...prev,
                              maintenance: { ...prev.maintenance, maintenanceType: value }
                            }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select maintenance type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Scheduled Maintenance">Scheduled Maintenance</SelectItem>
                              <SelectItem value="Emergency Maintenance">Emergency Maintenance</SelectItem>
                              <SelectItem value="Database Maintenance">Database Maintenance</SelectItem>
                              <SelectItem value="Server Updates">Server Updates</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input
                              type="datetime-local"
                              value={quickForms.maintenance.startTime}
                              onChange={(e) => setQuickForms(prev => ({
                                ...prev,
                                maintenance: { ...prev.maintenance, startTime: e.target.value }
                              }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input
                              type="datetime-local"
                              value={quickForms.maintenance.endTime}
                              onChange={(e) => setQuickForms(prev => ({
                                ...prev,
                                maintenance: { ...prev.maintenance, endTime: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Affected Services</Label>
                          <Input
                            placeholder="e.g., Content Generation, Publishing"
                            value={quickForms.maintenance.affectedServices}
                            onChange={(e) => setQuickForms(prev => ({
                              ...prev,
                              maintenance: { ...prev.maintenance, affectedServices: e.target.value }
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Reason</Label>
                          <Textarea
                            placeholder="Why is this maintenance needed?"
                            value={quickForms.maintenance.reason}
                            onChange={(e) => setQuickForms(prev => ({
                              ...prev,
                              maintenance: { ...prev.maintenance, reason: e.target.value }
                            }))}
                          />
                        </div>
                        <Button 
                          onClick={() => handleQuickAction('maintenance')} 
                          disabled={quickActionLoading || !quickForms.maintenance.maintenanceType || !quickForms.maintenance.startTime}
                          className="w-full"
                        >
                          Send Maintenance Notice
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Educational Content Dialog */}
                  <Dialog open={quickActionDialogs.educational} onOpenChange={(open) => setQuickActionDialogs(prev => ({ ...prev, educational: open }))}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-auto p-3 flex flex-col items-center gap-2"
                        disabled={quickActionLoading}
                      >
                        <Info className="h-5 w-5 text-green-500" />
                        <div className="text-center">
                          <div className="font-medium text-sm">Educational Content</div>
                          <div className="text-xs text-muted-foreground">Marketing campaign</div>
                        </div>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>💡 Educational Content</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Topic</Label>
                          <Input
                            placeholder="e.g., Tips & Tricks, Best Practices"
                            value={quickForms.educational.topic}
                            onChange={(e) => setQuickForms(prev => ({
                              ...prev,
                              educational: { ...prev.educational, topic: e.target.value }
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Content</Label>
                          <Textarea
                            placeholder="Share your educational content..."
                            rows={4}
                            value={quickForms.educational.content}
                            onChange={(e) => setQuickForms(prev => ({
                              ...prev,
                              educational: { ...prev.educational, content: e.target.value }
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Target Audience (Optional)</Label>
                          <Input
                            placeholder="e.g., New users, Pro users, Content creators"
                            value={quickForms.educational.targetAudience}
                            onChange={(e) => setQuickForms(prev => ({
                              ...prev,
                              educational: { ...prev.educational, targetAudience: e.target.value }
                            }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Call to Action (Optional)</Label>
                          <Input
                            placeholder="e.g., Try it now, Learn more"
                            value={quickForms.educational.callToAction}
                            onChange={(e) => setQuickForms(prev => ({
                              ...prev,
                              educational: { ...prev.educational, callToAction: e.target.value }
                            }))}
                          />
                        </div>
                        <Button 
                          onClick={() => handleQuickAction('educational')} 
                          disabled={quickActionLoading || !quickForms.educational.topic || !quickForms.educational.content}
                          className="w-full"
                        >
                          Send Educational Content
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </ErrorBoundary>
            </CardContent>
          </Card>
        )}

        {/* Full Admin Notifications - Only show for admin users, full width below */}
        {isAdmin && (
          <Card className="xl:col-span-3">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 shrink-0 text-primary" />
                <h2 className="text-base font-semibold">Admin Notifications</h2>
                <Badge variant="destructive" className="text-xs">Admin Only</Badge>
              </div>
              <ErrorBoundary
                fallback={
                  <div className="p-4 text-center text-muted-foreground">
                    <p>Admin notifications temporarily unavailable.</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.location.reload()}
                      className="mt-2"
                    >
                      Refresh Page
                    </Button>
                  </div>
                }
              >
                <AdminNotifications />
              </ErrorBoundary>
            </CardContent>
          </Card>
        )}

        {/* Email Dashboard - Admin only, accessible from Settings */}
        {isAdmin && (
          <Card className="xl:col-span-3">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 shrink-0 text-primary" />
                  <h2 className="text-base font-semibold">Email Dashboard</h2>
                  <Badge variant="destructive" className="text-xs">Admin Only</Badge>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/email-templates">
                    Open <ExternalLink className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Manage email templates, view logs, and configure SMTP settings.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Admin user ID: <code className="font-mono">{ADMIN_USER_ID}</code> (must match backend AdminGuard)
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
