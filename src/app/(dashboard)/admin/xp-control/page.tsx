"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/apiClient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  QrCode,
  Upload,
  Save,
  Trash2,
  Plus,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  Instagram,
  Youtube,
  Twitter,
  MessageCircle,
  Globe,
  Gamepad2,
  FileText,
  Image,
  Edit,
  X,
} from "lucide-react";
import { readFileAsDataURL } from "@/components/media/uploadImageFile";

interface CampaignConfig {
  id: string;
  upi_id: string;
  upi_name: string;
  qr_code_url: string | null;
  goal_amount: number;
  raised_amount: number;
  campaign_title: string;
  campaign_description: string | null;
  is_active: boolean;
  countdown_target_date?: string;
  countdown_title?: string;
  countdown_subtitle?: string;
  gaming_stats?: Array<{ label: string; value: string; icon: string }>;
}

interface SocialLink {
  id: string;
  platform: string;
  username: string;
  url: string;
  icon_name: string | null;
  display_order: number;
  is_active: boolean;
}

interface CommunityMessage {
  id: string;
  name: string;
  message: string;
  is_approved: boolean;
  is_visible: boolean;
  created_at: string;
}

interface GamingLibraryItem {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  description: string | null;
  grid_size: "large" | "wide" | "tall" | "medium" | "small";
  is_blog_enabled: boolean;
  blog_content: string | null;
  blog_excerpt: string | null;
  blog_published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  og_image_url: string | null;
  is_visible: boolean;
  is_featured: boolean;
  release_year: number | null;
  platform: string | null;
  genre: string | null;
  rating: number | null;
  display_order: number;
  created_at: string;
}

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  discord: MessageCircle,
  website: Globe,
};

export default function XPControlPage() {
  const [config, setConfig] = useState<CampaignConfig | null>(null);
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [gamingLibrary, setGamingLibrary] = useState<GamingLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingQR, setUploadingQR] = useState(false);
  const [newSocial, setNewSocial] = useState({ platform: "", username: "", url: "" });
  
  // Gaming Library Editor State
  const [editingGame, setEditingGame] = useState<GamingLibraryItem | null>(null);
  const [gameDialogOpen, setGameDialogOpen] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [newGame, setNewGame] = useState<Partial<GamingLibraryItem>>({
    title: "",
    slug: "",
    description: "",
    grid_size: "medium",
    is_blog_enabled: false,
    blog_content: "",
    blog_excerpt: "",
    seo_title: "",
    seo_description: "",
    seo_keywords: [],
    is_visible: true,
    is_featured: false,
    platform: "",
    genre: "",
  });

  // Auto-save refs
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const configRef = useRef<CampaignConfig | null>(null);

  // Keep configRef in sync
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Auto-save campaign config with debounce
  const autoSaveConfig = useCallback(async () => {
    if (!configRef.current) return;
    setSaving(true);
    try {
      const { error } = await (supabase as any)
        .from("xp_campaign_config")
        .update({
          upi_id: configRef.current.upi_id,
          upi_name: configRef.current.upi_name,
          qr_code_url: configRef.current.qr_code_url,
          goal_amount: configRef.current.goal_amount,
          raised_amount: configRef.current.raised_amount,
          campaign_title: configRef.current.campaign_title,
          campaign_description: configRef.current.campaign_description,
          is_active: configRef.current.is_active,
          countdown_target_date: configRef.current.countdown_target_date,
          countdown_title: configRef.current.countdown_title,
          countdown_subtitle: configRef.current.countdown_subtitle,
          gaming_stats: configRef.current.gaming_stats,
        })
        .eq("id", configRef.current.id);

      if (error) throw error;
      toast.success("Saved!", { duration: 1500 });
    } catch (error) {
      toast.error("Failed to save");
    }
    setSaving(false);
  }, []);

  // Trigger auto-save when config changes (debounced)
  useEffect(() => {
    if (!config || loading) return;
    
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveConfig();
    }, 1500); // 1.5 second debounce

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [config, loading, autoSaveConfig]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
    const [configRes, socialsRes, messagesRes, libraryRes] = await Promise.all([
        (supabase as any).from("xp_campaign_config").select("*").single(),
        (supabase as any).from("xp_social_links").select("*").order("display_order"),
        (supabase as any).from("xp_community_messages").select("*").order("created_at", { ascending: false }),
        (supabase as any).from("xp_gaming_library").select("*").order("display_order"),
      ]);

      if (configRes.data) setConfig(configRes.data);
      if (socialsRes.data) setSocials(socialsRes.data);
      if (messagesRes.data) setMessages(messagesRes.data);
      if (libraryRes.data) setGamingLibrary(libraryRes.data);
    } catch (error) {
      toast.error("Failed to load data");
    }
    setLoading(false);
  };

  const saveConfig = async () => {
    if (!config) return;
    setSaving(true);
    try {
    const { error } = await (supabase as any)
        .from("xp_campaign_config")
        .update({
          upi_id: config.upi_id,
          upi_name: config.upi_name,
          qr_code_url: config.qr_code_url,
          goal_amount: config.goal_amount,
          raised_amount: config.raised_amount,
          campaign_title: config.campaign_title,
          campaign_description: config.campaign_description,
          is_active: config.is_active,
        })
        .eq("id", config.id);

      if (error) throw error;
      toast.success("Campaign config saved!");
    } catch (error) {
      toast.error("Failed to save config");
    }
    setSaving(false);
  };

  const handleQRUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !config) return;

    setUploadingQR(true);
    try {
      const dataUrl = await readFileAsDataURL(file);
      const fileName = `xp-qr-${Date.now()}.${file.name.split(".").pop()}`;
      
      const res = await api.admin.mediaUpload({
        image: dataUrl,
        filename: fileName,
        path: "media/xp/",
        fullPath: true,
        skipOptimization: false,
        contentType: file.type || "image/jpeg",
      }) as { url?: string };

      if (!res?.url) throw new Error("Upload did not return a URL");
      
      setConfig({ ...config, qr_code_url: res.url });
      toast.success("QR code uploaded to MinIO!");
    } catch (error) {
      console.error("QR upload error:", error);
      toast.error("Failed to upload QR code");
    } finally {
      setUploadingQR(false);
    }
  };

  const addSocialLink = async () => {
    if (!newSocial.platform || !newSocial.username || !newSocial.url) {
      toast.error("Fill all fields");
      return;
    }

    try {
      const { data, error } = await (supabase as any)
        .from("xp_social_links")
        .insert({
          platform: newSocial.platform.toLowerCase(),
          username: newSocial.username,
          url: newSocial.url,
          display_order: socials.length,
        })
        .select()
        .single();

      if (error) throw error;
      setSocials([...socials, data]);
      setNewSocial({ platform: "", username: "", url: "" });
      toast.success("Social link added!");
    } catch (error) {
      toast.error("Failed to add social link");
    }
  };

  const updateSocialLink = async (id: string, updates: Partial<SocialLink>) => {
    try {
      const { error } = await (supabase as any).from("xp_social_links").update(updates).eq("id", id);
      if (error) throw error;
      setSocials(socials.map((s) => (s.id === id ? { ...s, ...updates } : s)));
      toast.success("Updated!");
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const toggleSocialActive = async (id: string, active: boolean) => {
    try {
      const { error } = await (supabase as any).from("xp_social_links").update({ is_active: active }).eq("id", id);
      if (error) throw error;
      setSocials(socials.map((s) => (s.id === id ? { ...s, is_active: active } : s)));
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const deleteSocialLink = async (id: string) => {
    try {
      const { error } = await (supabase as any).from("xp_social_links").delete().eq("id", id);
      if (error) throw error;
      setSocials(socials.filter((s) => s.id !== id));
      toast.success("Deleted!");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const toggleMessageVisibility = async (id: string, visible: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from("xp_community_messages")
        .update({ is_visible: visible })
        .eq("id", id);
      if (error) throw error;
      setMessages(messages.map((m) => (m.id === id ? { ...m, is_visible: visible } : m)));
      toast.success(visible ? "Message shown" : "Message hidden");
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const { error } = await (supabase as any).from("xp_community_messages").delete().eq("id", id);
      if (error) throw error;
      setMessages(messages.filter((m) => m.id !== id));
      toast.success("Message deleted!");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  // Gaming Library Functions
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    try {
      const dataUrl = await readFileAsDataURL(file);
      const fileName = `xp-game-${Date.now()}.${file.name.split(".").pop()}`;
      
      const res = await api.admin.mediaUpload({
        image: dataUrl,
        filename: fileName,
        path: "media/xp/games/",
        fullPath: true,
        skipOptimization: false,
        contentType: file.type || "image/jpeg",
      }) as { url?: string };

      if (!res?.url) throw new Error("Upload did not return a URL");
      
      if (isEditing && editingGame) {
        setEditingGame({ ...editingGame, cover_image_url: res.url });
      } else {
        setNewGame({ ...newGame, cover_image_url: res.url });
      }
      toast.success("Cover image uploaded!");
    } catch (error) {
      console.error("Cover upload error:", error);
      toast.error("Failed to upload cover image");
    } finally {
      setUploadingCover(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const saveGameItem = async () => {
    const gameData = editingGame || newGame;
    if (!gameData.title || !gameData.slug) {
      toast.error("Title and slug are required");
      return;
    }

    setSaving(true);
    try {
      if (editingGame) {
        const { error } = await (supabase as any)
          .from("xp_gaming_library")
          .update({
            title: editingGame.title,
            slug: editingGame.slug,
            cover_image_url: editingGame.cover_image_url,
            description: editingGame.description,
            grid_size: editingGame.grid_size,
            is_blog_enabled: editingGame.is_blog_enabled,
            blog_content: editingGame.blog_content,
            blog_excerpt: editingGame.blog_excerpt,
            seo_title: editingGame.seo_title,
            seo_description: editingGame.seo_description,
            seo_keywords: editingGame.seo_keywords,
            og_image_url: editingGame.og_image_url,
            is_visible: editingGame.is_visible,
            is_featured: editingGame.is_featured,
            platform: editingGame.platform,
            genre: editingGame.genre,
            release_year: editingGame.release_year,
            rating: editingGame.rating,
          })
          .eq("id", editingGame.id);

        if (error) throw error;
        setGamingLibrary(gamingLibrary.map((g) => (g.id === editingGame.id ? editingGame : g)));
        toast.success("Game updated!");
      } else {
        const { data, error } = await (supabase as any)
          .from("xp_gaming_library")
          .insert({
            title: newGame.title,
            slug: newGame.slug,
            cover_image_url: newGame.cover_image_url || null,
            description: newGame.description || null,
            grid_size: newGame.grid_size || "medium",
            is_blog_enabled: newGame.is_blog_enabled || false,
            blog_content: newGame.blog_content || null,
            blog_excerpt: newGame.blog_excerpt || null,
            seo_title: newGame.seo_title || null,
            seo_description: newGame.seo_description || null,
            seo_keywords: newGame.seo_keywords || null,
            og_image_url: newGame.og_image_url || null,
            is_visible: newGame.is_visible ?? true,
            is_featured: newGame.is_featured || false,
            platform: newGame.platform || null,
            genre: newGame.genre || null,
            release_year: newGame.release_year || null,
            rating: newGame.rating || null,
            display_order: gamingLibrary.length,
          })
          .select()
          .single();

        if (error) throw error;
        setGamingLibrary([...gamingLibrary, data]);
        toast.success("Game added!");
      }

      setGameDialogOpen(false);
      setEditingGame(null);
      setNewGame({
        title: "",
        slug: "",
        description: "",
        grid_size: "medium",
        is_blog_enabled: false,
        blog_content: "",
        blog_excerpt: "",
        seo_title: "",
        seo_description: "",
        seo_keywords: [],
        is_visible: true,
        is_featured: false,
        platform: "",
        genre: "",
      });
    } catch (error) {
      console.error("Save game error:", error);
      toast.error("Failed to save game");
    } finally {
      setSaving(false);
    }
  };

  const deleteGameItem = async (id: string) => {
    try {
      const { error } = await (supabase as any).from("xp_gaming_library").delete().eq("id", id);
      if (error) throw error;
      setGamingLibrary(gamingLibrary.filter((g) => g.id !== id));
      toast.success("Game deleted!");
    } catch (error) {
      toast.error("Failed to delete game");
    }
  };

  const toggleGameVisibility = async (id: string, visible: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from("xp_gaming_library")
        .update({ is_visible: visible })
        .eq("id", id);
      if (error) throw error;
      setGamingLibrary(gamingLibrary.map((g) => (g.id === id ? { ...g, is_visible: visible } : g)));
      toast.success(visible ? "Game shown" : "Game hidden");
    } catch (error) {
      toast.error("Failed to update");
    }
  };

  const openEditGame = (game: GamingLibraryItem) => {
    setEditingGame(game);
    setGameDialogOpen(true);
  };

  const openNewGame = () => {
    setEditingGame(null);
    setNewGame({
      title: "",
      slug: "",
      description: "",
      grid_size: "medium",
      is_blog_enabled: false,
      blog_content: "",
      blog_excerpt: "",
      seo_title: "",
      seo_description: "",
      seo_keywords: [],
      is_visible: true,
      is_featured: false,
      platform: "",
      genre: "",
    });
    setGameDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">XP Campaign Control</h1>
          <p className="text-sm text-muted-foreground">Manage DreamXP Gaming campaign settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadData} className="flex-1 sm:flex-none">
            <RefreshCw className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button size="sm" asChild className="flex-1 sm:flex-none">
            <a href="/dreamxpgaming" target="_blank">
              <ExternalLink className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">View Page</span>
            </a>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="campaign" className="space-y-4">
        {/* Scrollable Tabs for Mobile */}
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1 bg-muted/50">
          <TabsTrigger value="campaign" className="text-xs sm:text-sm whitespace-nowrap px-3 py-2">
            Campaign
          </TabsTrigger>
          <TabsTrigger value="library" className="text-xs sm:text-sm whitespace-nowrap px-3 py-2">
            Library ({gamingLibrary.length})
          </TabsTrigger>
          <TabsTrigger value="socials" className="text-xs sm:text-sm whitespace-nowrap px-3 py-2">
            Socials
          </TabsTrigger>
          <TabsTrigger value="messages" className="text-xs sm:text-sm whitespace-nowrap px-3 py-2">
            Messages ({messages.length})
          </TabsTrigger>
        </TabsList>

        {/* Campaign Settings Tab */}
        <TabsContent value="campaign" className="space-y-4">
          {/* Auto-save indicator */}
          {saving && (
            <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Saving...</span>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            {/* UPI Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">UPI Payment Settings</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Configure UPI ID and payment details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm">UPI ID</Label>
                    <Input
                      value={config?.upi_id || ""}
                      onChange={(e) => config && setConfig({ ...config, upi_id: e.target.value })}
                      placeholder="example@upi"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm">Display Name</Label>
                    <Input
                      value={config?.upi_name || ""}
                      onChange={(e) => config && setConfig({ ...config, upi_name: e.target.value })}
                      placeholder="DreamPS"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs sm:text-sm">Campaign Title</Label>
                  <Input
                    value={config?.campaign_title || ""}
                    onChange={(e) => config && setConfig({ ...config, campaign_title: e.target.value })}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs sm:text-sm">Description (optional)</Label>
                  <Textarea
                    value={config?.campaign_description || ""}
                    onChange={(e) => config && setConfig({ ...config, campaign_description: e.target.value })}
                    rows={2}
                    className="text-sm resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* QR Code */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  QR Code
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Upload custom QR code or use auto-generated</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4">
                  {config?.qr_code_url ? (
                    <div className="relative">
                      <img
                        src={config.qr_code_url}
                        alt="QR Code"
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg border object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                        onClick={() => config && setConfig({ ...config, qr_code_url: null })}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/30">
                      <QrCode className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <Label htmlFor="qr-upload" className="cursor-pointer">
                      <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors">
                        {uploadingQR ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span className="text-sm">{uploadingQR ? "Uploading..." : "Upload QR"}</span>
                      </div>
                    </Label>
                    <input
                      id="qr-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleQRUpload}
                      disabled={uploadingQR}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Goal Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Funding Progress</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Set goal and track raised amount</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm">Goal (₹)</Label>
                    <Input
                      type="number"
                      value={config?.goal_amount || 0}
                      onChange={(e) =>
                        config && setConfig({ ...config, goal_amount: parseInt(e.target.value) || 0 })
                      }
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm">Raised (₹)</Label>
                    <Input
                      type="number"
                      value={config?.raised_amount || 0}
                      onChange={(e) =>
                        config && setConfig({ ...config, raised_amount: parseInt(e.target.value) || 0 })
                      }
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span className="font-medium">
                      {config ? Math.round((config.raised_amount / config.goal_amount) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                      style={{
                        width: `${config ? Math.min((config.raised_amount / config.goal_amount) * 100, 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Campaign Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Campaign Active</p>
                    <p className="text-xs text-muted-foreground">
                      {config?.is_active ? "Live" : "Paused"}
                    </p>
                  </div>
                  <Switch
                    checked={config?.is_active || false}
                    onCheckedChange={(checked) => config && setConfig({ ...config, is_active: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Countdown Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Countdown Timer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs sm:text-sm">Target Date</Label>
                  <Input
                    type="datetime-local"
                    value={config?.countdown_target_date ? new Date(config.countdown_target_date).toISOString().slice(0, 16) : ""}
                    onChange={(e) => config && setConfig({ ...config, countdown_target_date: new Date(e.target.value).toISOString() })}
                    className="h-9 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm">Title</Label>
                    <Input
                      value={config?.countdown_title || ""}
                      onChange={(e) => config && setConfig({ ...config, countdown_title: e.target.value })}
                      placeholder="Countdown to PS5"
                      className="h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs sm:text-sm">Subtitle</Label>
                    <Input
                      value={config?.countdown_subtitle || ""}
                      onChange={(e) => config && setConfig({ ...config, countdown_subtitle: e.target.value })}
                      placeholder="The dream gets closer"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Button - Fixed at bottom on mobile */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t sm:relative sm:p-0 sm:bg-transparent sm:border-0 sm:backdrop-blur-none">
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <span className="text-xs text-muted-foreground flex items-center gap-2">
                {saving ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Auto-saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3" />
                    Changes auto-saved
                  </>
                )}
              </span>
              <Button onClick={autoSaveConfig} disabled={saving} size="sm" variant="outline">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span className="ml-2 hidden sm:inline">Save Now</span>
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Gaming Library Tab */}
        <TabsContent value="library" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
              <div>
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4" />
                  Gaming Library
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Manage games in the Bento Grid. Enable blog for each game.
                </CardDescription>
              </div>
              <Button onClick={openNewGame} size="sm" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Game
              </Button>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {/* Mobile Card View */}
              <div className="sm:hidden divide-y">
                {gamingLibrary.map((game) => (
                  <div key={game.id} className="p-4 flex items-center gap-3">
                    {game.cover_image_url ? (
                      <img
                        src={game.cover_image_url}
                        alt={game.title}
                        className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                        <Image className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{game.title}</p>
                      <p className="text-xs text-muted-foreground truncate">/{game.slug}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] capitalize px-1.5 py-0">
                          {game.grid_size}
                        </Badge>
                        {game.is_blog_enabled && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Blog</Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0"
                      onClick={() => {
                        setEditingGame(game);
                        setGameDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {gamingLibrary.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No games added yet. Click "Add Game" to get started.
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Cover</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Grid Size</TableHead>
                      <TableHead>Blog</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gamingLibrary.map((game) => (
                      <TableRow key={game.id}>
                        <TableCell>
                          {game.cover_image_url ? (
                            <img
                              src={game.cover_image_url}
                              alt={game.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                              <Image className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{game.title}</p>
                            <p className="text-xs text-muted-foreground">/{game.slug}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {game.grid_size}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={game.is_blog_enabled ? "default" : "secondary"}>
                            {game.is_blog_enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={game.is_visible ? "default" : "outline"}>
                            {game.is_visible ? "Visible" : "Hidden"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingGame(game);
                                setGameDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Game</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{game.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteGameItem(game.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Links Tab */}
        <TabsContent value="socials" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Add Social Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <Input
                  placeholder="Platform"
                  value={newSocial.platform}
                  onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value })}
                  className="h-9 text-sm"
                />
                <Input
                  placeholder="Username"
                  value={newSocial.username}
                  onChange={(e) => setNewSocial({ ...newSocial, username: e.target.value })}
                  className="h-9 text-sm"
                />
                <Input
                  placeholder="Full URL"
                  value={newSocial.url}
                  onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
                  className="h-9 text-sm sm:col-span-1"
                />
                <Button onClick={addSocialLink} size="sm" className="h-9">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Social Links</CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {/* Mobile Card View */}
              <div className="sm:hidden divide-y">
                {socials.map((social) => {
                  const Icon = PLATFORM_ICONS[social.platform] || Globe;
                  return (
                    <div key={social.id} className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm capitalize">{social.platform}</p>
                        <p className="text-xs text-muted-foreground truncate">{social.url}</p>
                      </div>
                      <Switch
                        checked={social.is_active}
                        onCheckedChange={(checked) => toggleSocialActive(social.id, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0"
                        onClick={() => deleteSocialLink(social.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
                {socials.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No social links added yet.
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {socials.map((social) => {
                      const Icon = PLATFORM_ICONS[social.platform] || Globe;
                      return (
                        <TableRow key={social.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <span className="capitalize">{social.platform}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            <a
                              href={social.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {social.url}
                            </a>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={social.is_active}
                              onCheckedChange={(checked) => toggleSocialActive(social.id, checked)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteSocialLink(social.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Community Messages</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Manage messages left by supporters</CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {/* Mobile Card View */}
              <div className="sm:hidden divide-y">
                {messages.map((msg) => (
                  <div key={msg.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{msg.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm mt-2 line-clamp-2">{msg.message}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Switch
                          checked={msg.is_visible}
                          onCheckedChange={(checked) => toggleMessageVisibility(msg.id, checked)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMessage(msg.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No messages yet.
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Visible</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((msg) => (
                      <TableRow key={msg.id}>
                        <TableCell className="font-medium">{msg.name}</TableCell>
                        <TableCell className="max-w-[300px]">{msg.message}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={msg.is_visible}
                            onCheckedChange={(checked) => toggleMessageVisibility(msg.id, checked)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMessage(msg.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Game Editor Dialog - Mobile Optimized */}
      <Dialog open={gameDialogOpen} onOpenChange={setGameDialogOpen}>
        <DialogContent className="max-w-lg sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <Gamepad2 className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg">
                  {editingGame ? "Edit Game" : "Add New Game"}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">
                  {editingGame ? "Update game details and blog settings" : "Add a new game to your library"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm">Title <span className="text-red-400">*</span></Label>
                <Input
                  value={editingGame?.title || newGame.title || ""}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = generateSlug(title);
                    if (editingGame) {
                      setEditingGame({ ...editingGame, title, slug });
                    } else {
                      setNewGame({ ...newGame, title, slug });
                    }
                  }}
                  placeholder="GTA 6"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm">Slug <span className="text-red-400">*</span></Label>
                <Input
                  value={editingGame?.slug || newGame.slug || ""}
                  onChange={(e) => {
                    if (editingGame) {
                      setEditingGame({ ...editingGame, slug: e.target.value });
                    } else {
                      setNewGame({ ...newGame, slug: e.target.value });
                    }
                  }}
                  placeholder="gta-6"
                  className="h-9 text-sm font-mono"
                />
              </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">Cover Image</Label>
              <div className="flex items-center gap-4">
                {(editingGame?.cover_image_url || newGame.cover_image_url) ? (
                  <div className="relative">
                    <img
                      src={editingGame?.cover_image_url || newGame.cover_image_url || ""}
                      alt="Cover"
                      className="w-20 h-24 sm:w-24 sm:h-32 object-cover rounded-lg border"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
                      onClick={() => {
                        if (editingGame) {
                          setEditingGame({ ...editingGame, cover_image_url: null });
                        } else {
                          setNewGame({ ...newGame, cover_image_url: undefined });
                        }
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-20 h-24 sm:w-24 sm:h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/30">
                    <Image className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <Label htmlFor="cover-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-lg hover:bg-muted/50 transition-colors">
                      {uploadingCover ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span className="text-sm">{uploadingCover ? "Uploading..." : "Upload Cover"}</span>
                    </div>
                  </Label>
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleCoverUpload(e, !!editingGame)}
                    disabled={uploadingCover}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1.5">Recommended: 400x500px</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-sm">Description</Label>
              <Textarea
                value={editingGame?.description || newGame.description || ""}
                onChange={(e) => {
                  if (editingGame) {
                    setEditingGame({ ...editingGame, description: e.target.value });
                  } else {
                    setNewGame({ ...newGame, description: e.target.value });
                  }
                }}
                placeholder="Brief description of the game..."
                rows={2}
                className="text-sm resize-none"
              />
            </div>

            {/* Grid Size & Visibility */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm">Grid Size</Label>
                <Select
                  value={editingGame?.grid_size || newGame.grid_size || "medium"}
                  onValueChange={(value: "large" | "wide" | "tall" | "medium" | "small") => {
                    if (editingGame) {
                      setEditingGame({ ...editingGame, grid_size: value });
                    } else {
                      setNewGame({ ...newGame, grid_size: value });
                    }
                  }}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="large">Large (2x2)</SelectItem>
                    <SelectItem value="wide">Wide (2x1)</SelectItem>
                    <SelectItem value="tall">Tall (1x2)</SelectItem>
                    <SelectItem value="medium">Medium (1x1)</SelectItem>
                    <SelectItem value="small">Small</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs sm:text-sm">Visibility</Label>
                <div className="flex items-center gap-3 h-9 px-3 border rounded-md bg-background">
                  <Switch
                    checked={editingGame?.is_visible ?? newGame.is_visible ?? true}
                    onCheckedChange={(checked) => {
                      if (editingGame) {
                        setEditingGame({ ...editingGame, is_visible: checked });
                      } else {
                        setNewGame({ ...newGame, is_visible: checked });
                      }
                    }}
                  />
                  <span className="text-sm">{(editingGame?.is_visible ?? newGame.is_visible ?? true) ? "Visible" : "Hidden"}</span>
                </div>
              </div>
            </div>

            {/* Blog Settings */}
            <div className="space-y-3 p-3 rounded-lg bg-muted/30 border">
              <div className="flex items-center justify-between">
                <Label className="text-xs sm:text-sm font-medium">Enable Blog</Label>
                <Switch
                  checked={editingGame?.is_blog_enabled || newGame.is_blog_enabled || false}
                  onCheckedChange={(checked) => {
                    if (editingGame) {
                      setEditingGame({ ...editingGame, is_blog_enabled: checked });
                    } else {
                      setNewGame({ ...newGame, is_blog_enabled: checked });
                    }
                  }}
                />
              </div>
              
              {(editingGame?.is_blog_enabled || newGame.is_blog_enabled) && (
                <div className="space-y-3 pt-2 border-t">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Blog Excerpt</Label>
                    <Textarea
                      value={editingGame?.blog_excerpt || newGame.blog_excerpt || ""}
                      onChange={(e) => {
                        if (editingGame) {
                          setEditingGame({ ...editingGame, blog_excerpt: e.target.value });
                        } else {
                          setNewGame({ ...newGame, blog_excerpt: e.target.value });
                        }
                      }}
                      placeholder="Short excerpt for previews..."
                      rows={2}
                      className="text-sm resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Blog Content</Label>
                    <Textarea
                      value={editingGame?.blog_content || newGame.blog_content || ""}
                      onChange={(e) => {
                        if (editingGame) {
                          setEditingGame({ ...editingGame, blog_content: e.target.value });
                        } else {
                          setNewGame({ ...newGame, blog_content: e.target.value });
                        }
                      }}
                      placeholder="Full blog content..."
                      rows={4}
                      className="text-sm resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">SEO Title</Label>
                      <Input
                        value={editingGame?.seo_title || newGame.seo_title || ""}
                        onChange={(e) => {
                          if (editingGame) {
                            setEditingGame({ ...editingGame, seo_title: e.target.value });
                          } else {
                            setNewGame({ ...newGame, seo_title: e.target.value });
                          }
                        }}
                        placeholder="SEO optimized title"
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">SEO Description</Label>
                      <Input
                        value={editingGame?.seo_description || newGame.seo_description || ""}
                        onChange={(e) => {
                          if (editingGame) {
                            setEditingGame({ ...editingGame, seo_description: e.target.value });
                          } else {
                            setNewGame({ ...newGame, seo_description: e.target.value });
                          }
                        }}
                        placeholder="Meta description"
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-4 sm:p-6 pt-3 sm:pt-4 border-t flex-shrink-0 gap-2">
            <Button variant="outline" onClick={() => setGameDialogOpen(false)} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button onClick={saveGameItem} disabled={saving} className="flex-1 sm:flex-none">
              {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {editingGame ? "Update Game" : "Add Game"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
