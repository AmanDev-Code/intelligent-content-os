"use client";

import { useState, useEffect } from "react";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">XP Campaign Control</h1>
          <p className="text-muted-foreground">Manage DreamXP Gaming campaign settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button asChild>
            <a href="/dreamxpgaming" target="_blank">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Page
            </a>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="campaign" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaign">Campaign Settings</TabsTrigger>
          <TabsTrigger value="library">Gaming Library ({gamingLibrary.length})</TabsTrigger>
          <TabsTrigger value="socials">Social Links</TabsTrigger>
          <TabsTrigger value="messages">Community Messages ({messages.length})</TabsTrigger>
        </TabsList>

        {/* Campaign Settings Tab */}
        <TabsContent value="campaign" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* UPI Settings */}
            <Card>
              <CardHeader>
                <CardTitle>UPI Payment Settings</CardTitle>
                <CardDescription>Configure UPI ID and payment details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>UPI ID</Label>
                  <Input
                    value={config?.upi_id || ""}
                    onChange={(e) => config && setConfig({ ...config, upi_id: e.target.value })}
                    placeholder="example@upi"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input
                    value={config?.upi_name || ""}
                    onChange={(e) => config && setConfig({ ...config, upi_name: e.target.value })}
                    placeholder="DreamPS"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Campaign Title</Label>
                  <Input
                    value={config?.campaign_title || ""}
                    onChange={(e) => config && setConfig({ ...config, campaign_title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={config?.campaign_description || ""}
                    onChange={(e) => config && setConfig({ ...config, campaign_description: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* QR Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  QR Code
                </CardTitle>
                <CardDescription>Upload custom QR code or use auto-generated</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {config?.qr_code_url ? (
                  <div className="text-center">
                    <img
                      src={config.qr_code_url}
                      alt="QR Code"
                      className="w-48 h-48 mx-auto rounded-lg border"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => config && setConfig({ ...config, qr_code_url: null })}
                    >
                      Remove custom QR
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-8 border-2 border-dashed rounded-lg">
                    <QrCode className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Using auto-generated QR from UPI ID
                    </p>
                  </div>
                )}
                <div>
                  <Label htmlFor="qr-upload" className="cursor-pointer">
                    <div className="flex items-center justify-center gap-2 p-3 border rounded-lg hover:bg-muted transition-colors">
                      {uploadingQR ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {uploadingQR ? "Uploading..." : "Upload Custom QR Code"}
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
              </CardContent>
            </Card>

            {/* Goal Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Funding Progress</CardTitle>
                <CardDescription>Set goal and track raised amount</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Goal Amount (₹)</Label>
                  <Input
                    type="number"
                    value={config?.goal_amount || 0}
                    onChange={(e) =>
                      config && setConfig({ ...config, goal_amount: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Raised Amount (₹)</Label>
                  <Input
                    type="number"
                    value={config?.raised_amount || 0}
                    onChange={(e) =>
                      config && setConfig({ ...config, raised_amount: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>
                      {config ? Math.round((config.raised_amount / config.goal_amount) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                      style={{
                        width: `${config ? (config.raised_amount / config.goal_amount) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Status</CardTitle>
                <CardDescription>Enable or disable the campaign</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Campaign Active</p>
                    <p className="text-sm text-muted-foreground">
                      {config?.is_active ? "Campaign is live" : "Campaign is paused"}
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
              <CardHeader>
                <CardTitle>Countdown Timer</CardTitle>
                <CardDescription>Configure the countdown section</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Target Date</Label>
                  <Input
                    type="datetime-local"
                    value={config?.countdown_target_date ? new Date(config.countdown_target_date).toISOString().slice(0, 16) : ""}
                    onChange={(e) => config && setConfig({ ...config, countdown_target_date: new Date(e.target.value).toISOString() })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={config?.countdown_title || ""}
                    onChange={(e) => config && setConfig({ ...config, countdown_title: e.target.value })}
                    placeholder="Countdown to PS5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    value={config?.countdown_subtitle || ""}
                    onChange={(e) => config && setConfig({ ...config, countdown_subtitle: e.target.value })}
                    placeholder="The dream gets closer every second"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Gaming Stats */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Gaming Stats Ticker</CardTitle>
                <CardDescription>Configure the scrolling stats displayed on the page</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(config?.gaming_stats || []).map((stat, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <Input
                        value={stat.label}
                        onChange={(e) => {
                          if (!config) return;
                          const newStats = [...(config.gaming_stats || [])];
                          newStats[index] = { ...newStats[index], label: e.target.value };
                          setConfig({ ...config, gaming_stats: newStats });
                        }}
                        placeholder="Label (e.g., PS5 Sold)"
                      />
                      <Input
                        value={stat.value}
                        onChange={(e) => {
                          if (!config) return;
                          const newStats = [...(config.gaming_stats || [])];
                          newStats[index] = { ...newStats[index], value: e.target.value };
                          setConfig({ ...config, gaming_stats: newStats });
                        }}
                        placeholder="Value (e.g., 60M+)"
                      />
                      <Select
                        value={stat.icon}
                        onValueChange={(value) => {
                          if (!config) return;
                          const newStats = [...(config.gaming_stats || [])];
                          newStats[index] = { ...newStats[index], icon: value };
                          setConfig({ ...config, gaming_stats: newStats });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Icon" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Trophy">Trophy</SelectItem>
                          <SelectItem value="Gamepad2">Gamepad</SelectItem>
                          <SelectItem value="Play">Play</SelectItem>
                          <SelectItem value="Users">Users</SelectItem>
                          <SelectItem value="Star">Star</SelectItem>
                          <SelectItem value="Heart">Heart</SelectItem>
                          <SelectItem value="Zap">Zap</SelectItem>
                          <SelectItem value="Award">Award</SelectItem>
                          <SelectItem value="Crown">Crown</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (!config) return;
                        const newStats = (config.gaming_stats || []).filter((_, i) => i !== index);
                        setConfig({ ...config, gaming_stats: newStats });
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!config) return;
                    const newStats = [...(config.gaming_stats || []), { label: "", value: "", icon: "Trophy" }];
                    setConfig({ ...config, gaming_stats: newStats });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stat
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveConfig} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </TabsContent>

        {/* Gaming Library Tab */}
        <TabsContent value="library" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5" />
                  Gaming Library
                </CardTitle>
                <CardDescription>
                  Manage games in the Bento Grid. Enable blog for each game to create detailed posts.
                </CardDescription>
              </div>
              <Button onClick={openNewGame}>
                <Plus className="w-4 h-4 mr-2" />
                Add Game
              </Button>
            </CardHeader>
            <CardContent>
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
                        {game.is_blog_enabled ? (
                          <Badge className="bg-green-500/20 text-green-500">
                            <FileText className="w-3 h-3 mr-1" />
                            Enabled
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Disabled</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {game.is_featured && (
                            <Badge className="bg-purple-500/20 text-purple-500">Featured</Badge>
                          )}
                          <Badge variant={game.is_visible ? "default" : "secondary"}>
                            {game.is_visible ? "Visible" : "Hidden"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditGame(game)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleGameVisibility(game.id, !game.is_visible)}
                          >
                            {game.is_visible ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete {game.title}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove this game from the library.
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
                  {gamingLibrary.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No games added yet. Click "Add Game" to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Links Tab */}
        <TabsContent value="socials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Social Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="Platform (instagram, youtube, twitter...)"
                  value={newSocial.platform}
                  onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value })}
                  className="flex-1"
                />
                <Input
                  placeholder="Username"
                  value={newSocial.username}
                  onChange={(e) => setNewSocial({ ...newSocial, username: e.target.value })}
                  className="flex-1"
                />
                <Input
                  placeholder="Full URL"
                  value={newSocial.url}
                  onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
                  className="flex-[2]"
                />
                <Button onClick={addSocialLink}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Platform</TableHead>
                    <TableHead>Username</TableHead>
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
                        <TableCell>@{social.username}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          <a href={social.url} target="_blank" className="text-blue-500 hover:underline">
                            {social.url}
                          </a>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={social.is_active}
                            onCheckedChange={(checked) => updateSocialLink(social.id, { is_active: checked })}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete social link?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove the {social.platform} link from the campaign page.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteSocialLink(social.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Community Messages</CardTitle>
              <CardDescription>Manage messages left by supporters</CardDescription>
            </CardHeader>
            <CardContent>
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
                        <Badge variant={msg.is_visible ? "default" : "secondary"}>
                          {msg.is_visible ? "Visible" : "Hidden"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleMessageVisibility(msg.id, !msg.is_visible)}
                          >
                            {msg.is_visible ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete message?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the message from {msg.name}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteMessage(msg.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {messages.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No messages yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Game Editor Dialog */}
      <Dialog open={gameDialogOpen} onOpenChange={setGameDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                <Gamepad2 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {editingGame ? "Edit Game" : "Add New Game"}
                </DialogTitle>
                <DialogDescription className="text-sm mt-0.5">
                  {editingGame
                    ? "Update game details and blog settings"
                    : "Add a new game to your gaming library"}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid gap-6 py-6 max-h-[65vh] overflow-y-auto pr-2">
            {/* Title & Slug Row */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  Title <span className="text-red-400">*</span>
                </Label>
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
                  className="h-11 bg-background/50 border-border/60 focus:border-purple-500/50 transition-colors"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  Slug <span className="text-red-400">*</span>
                </Label>
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
                  className="h-11 bg-background/50 border-border/60 focus:border-purple-500/50 transition-colors font-mono text-sm"
                />
              </div>
            </div>

            {/* Cover Image - Enhanced */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Cover Image</Label>
              <div className="flex items-start gap-5">
                <div className="relative group">
                  {(editingGame?.cover_image_url || newGame.cover_image_url) ? (
                    <>
                      <img
                        src={editingGame?.cover_image_url || newGame.cover_image_url || ""}
                        alt="Cover"
                        className="w-28 h-36 object-cover rounded-xl border-2 border-border/60 shadow-lg"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 w-7 h-7 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          if (editingGame) {
                            setEditingGame({ ...editingGame, cover_image_url: null });
                          } else {
                            setNewGame({ ...newGame, cover_image_url: undefined });
                          }
                        }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  ) : (
                    <div className="w-28 h-36 border-2 border-dashed border-border/60 rounded-xl flex flex-col items-center justify-center bg-muted/30 gap-2">
                      <Image className="w-7 h-7 text-muted-foreground/60" />
                      <span className="text-[10px] text-muted-foreground/60 font-medium">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <Label htmlFor="cover-upload" className="cursor-pointer block">
                    <div className="flex items-center justify-center gap-2.5 py-3.5 px-4 border-2 border-dashed border-purple-500/30 rounded-xl hover:bg-purple-500/5 hover:border-purple-500/50 transition-all duration-200 group">
                      {uploadingCover ? (
                        <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
                      ) : (
                        <Upload className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                      )}
                      <span className="font-medium text-sm text-purple-400">
                        {uploadingCover ? "Uploading..." : "Upload Cover Image"}
                      </span>
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
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/50" />
                    Recommended: 400x500px or similar portrait ratio
                  </p>
                </div>
              </div>
            </div>

            {/* Description & Grid Size - Enhanced Layout */}
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Description</Label>
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
                  rows={4}
                  className="bg-background/50 border-border/60 focus:border-purple-500/50 transition-colors resize-none"
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Grid Size</Label>
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
                    <SelectTrigger className="h-11 bg-background/50 border-border/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="large">
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded bg-purple-500/30 border border-purple-500/50" />
                          Large (2x2)
                        </span>
                      </SelectItem>
                      <SelectItem value="wide">
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-3 rounded bg-blue-500/30 border border-blue-500/50" />
                          Wide (2x1)
                        </span>
                      </SelectItem>
                      <SelectItem value="tall">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-5 rounded bg-green-500/30 border border-green-500/50" />
                          Tall (1x2)
                        </span>
                      </SelectItem>
                      <SelectItem value="medium">
                        <span className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded bg-orange-500/30 border border-orange-500/50" />
                          Medium (1x1)
                        </span>
                      </SelectItem>
                      <SelectItem value="small">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded bg-gray-500/30 border border-gray-500/50" />
                          Small (1x1)
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Platform</Label>
                    <Input
                      value={editingGame?.platform || newGame.platform || ""}
                      onChange={(e) => {
                        if (editingGame) {
                          setEditingGame({ ...editingGame, platform: e.target.value });
                        } else {
                          setNewGame({ ...newGame, platform: e.target.value });
                        }
                      }}
                      placeholder="PS5, PC..."
                      className="h-11 bg-background/50 border-border/60 focus:border-purple-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Genre</Label>
                    <Input
                      value={editingGame?.genre || newGame.genre || ""}
                      onChange={(e) => {
                        if (editingGame) {
                          setEditingGame({ ...editingGame, genre: e.target.value });
                        } else {
                          setNewGame({ ...newGame, genre: e.target.value });
                        }
                      }}
                      placeholder="Action, RPG..."
                      className="h-11 bg-background/50 border-border/60 focus:border-purple-500/50 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status Toggles - Enhanced Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div 
                className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  (editingGame?.is_visible ?? newGame.is_visible ?? true)
                    ? 'border-green-500/50 bg-green-500/10'
                    : 'border-border/60 bg-muted/20 hover:border-border'
                }`}
                onClick={() => {
                  const newVal = !(editingGame?.is_visible ?? newGame.is_visible ?? true);
                  if (editingGame) {
                    setEditingGame({ ...editingGame, is_visible: newVal });
                  } else {
                    setNewGame({ ...newGame, is_visible: newVal });
                  }
                }}
              >
                <Switch
                  checked={editingGame?.is_visible ?? newGame.is_visible ?? true}
                  onCheckedChange={(checked) => {
                    if (editingGame) {
                      setEditingGame({ ...editingGame, is_visible: checked });
                    } else {
                      setNewGame({ ...newGame, is_visible: checked });
                    }
                  }}
                  className="data-[state=checked]:bg-green-500"
                />
                <div>
                  <Label className="text-sm font-medium cursor-pointer">Visible</Label>
                  <p className="text-[10px] text-muted-foreground">Show on page</p>
                </div>
              </div>
              <div 
                className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  (editingGame?.is_featured ?? newGame.is_featured ?? false)
                    ? 'border-orange-500/50 bg-orange-500/10'
                    : 'border-border/60 bg-muted/20 hover:border-border'
                }`}
                onClick={() => {
                  const newVal = !(editingGame?.is_featured ?? newGame.is_featured ?? false);
                  if (editingGame) {
                    setEditingGame({ ...editingGame, is_featured: newVal });
                  } else {
                    setNewGame({ ...newGame, is_featured: newVal });
                  }
                }}
              >
                <Switch
                  checked={editingGame?.is_featured ?? newGame.is_featured ?? false}
                  onCheckedChange={(checked) => {
                    if (editingGame) {
                      setEditingGame({ ...editingGame, is_featured: checked });
                    } else {
                      setNewGame({ ...newGame, is_featured: checked });
                    }
                  }}
                  className="data-[state=checked]:bg-orange-500"
                />
                <div>
                  <Label className="text-sm font-medium cursor-pointer">Featured</Label>
                  <p className="text-[10px] text-muted-foreground">Highlight game</p>
                </div>
              </div>
              <div 
                className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  (editingGame?.is_blog_enabled ?? newGame.is_blog_enabled ?? false)
                    ? 'border-purple-500/50 bg-purple-500/10'
                    : 'border-border/60 bg-muted/20 hover:border-border'
                }`}
                onClick={() => {
                  const newVal = !(editingGame?.is_blog_enabled ?? newGame.is_blog_enabled ?? false);
                  if (editingGame) {
                    setEditingGame({ ...editingGame, is_blog_enabled: newVal });
                  } else {
                    setNewGame({ ...newGame, is_blog_enabled: newVal });
                  }
                }}
              >
                <Switch
                  checked={editingGame?.is_blog_enabled ?? newGame.is_blog_enabled ?? false}
                  onCheckedChange={(checked) => {
                    if (editingGame) {
                      setEditingGame({ ...editingGame, is_blog_enabled: checked });
                    } else {
                      setNewGame({ ...newGame, is_blog_enabled: checked });
                    }
                  }}
                  className="data-[state=checked]:bg-purple-500"
                />
                <div>
                  <Label className="text-sm font-medium cursor-pointer">Blog</Label>
                  <p className="text-[10px] text-muted-foreground">Enable article</p>
                </div>
              </div>
            </div>

            {/* Blog Settings (shown when blog is enabled) */}
            {(editingGame?.is_blog_enabled || newGame.is_blog_enabled) && (
              <div className="space-y-5 p-5 border-2 border-purple-500/30 rounded-xl bg-gradient-to-br from-purple-500/5 to-blue-500/5">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-purple-500/20">
                    <FileText className="w-4 h-4 text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-sm">Blog Settings</h4>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Blog Excerpt</Label>
                  <Textarea
                    value={editingGame?.blog_excerpt || newGame.blog_excerpt || ""}
                    onChange={(e) => {
                      if (editingGame) {
                        setEditingGame({ ...editingGame, blog_excerpt: e.target.value });
                      } else {
                        setNewGame({ ...newGame, blog_excerpt: e.target.value });
                      }
                    }}
                    placeholder="Short preview text for the blog card..."
                    rows={2}
                    className="bg-background/50 border-border/60 focus:border-purple-500/50 transition-colors resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Blog Content (Markdown/HTML)</Label>
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
                    rows={6}
                    className="font-mono text-sm bg-background/50 border-border/60 focus:border-purple-500/50 transition-colors"
                  />
                </div>

                {/* SEO Fields */}
                <div className="space-y-4 pt-4 border-t border-border/40">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SEO Settings</span>
                    <div className="flex-1 h-px bg-border/40" />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">SEO Title</Label>
                      <Input
                        value={editingGame?.seo_title || newGame.seo_title || ""}
                        onChange={(e) => {
                          if (editingGame) {
                            setEditingGame({ ...editingGame, seo_title: e.target.value });
                          } else {
                            setNewGame({ ...newGame, seo_title: e.target.value });
                          }
                        }}
                        placeholder="Custom title for search engines"
                        className="h-10 bg-background/50 border-border/60 focus:border-purple-500/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">SEO Keywords</Label>
                      <Input
                        value={(editingGame?.seo_keywords || newGame.seo_keywords || []).join(", ")}
                        onChange={(e) => {
                          const keywords = e.target.value.split(",").map((k) => k.trim()).filter(Boolean);
                          if (editingGame) {
                            setEditingGame({ ...editingGame, seo_keywords: keywords });
                          } else {
                            setNewGame({ ...newGame, seo_keywords: keywords });
                          }
                        }}
                        placeholder="gaming, ps5, review..."
                        className="h-10 bg-background/50 border-border/60 focus:border-purple-500/50 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">SEO Description</Label>
                    <Textarea
                      value={editingGame?.seo_description || newGame.seo_description || ""}
                      onChange={(e) => {
                        if (editingGame) {
                          setEditingGame({ ...editingGame, seo_description: e.target.value });
                        } else {
                          setNewGame({ ...newGame, seo_description: e.target.value });
                        }
                      }}
                      placeholder="Meta description for search engines (150-160 chars)"
                      rows={2}
                      className="bg-background/50 border-border/60 focus:border-purple-500/50 transition-colors resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">OG Image URL (optional)</Label>
                    <Input
                      value={editingGame?.og_image_url || newGame.og_image_url || ""}
                      onChange={(e) => {
                        if (editingGame) {
                          setEditingGame({ ...editingGame, og_image_url: e.target.value });
                        } else {
                          setNewGame({ ...newGame, og_image_url: e.target.value });
                        }
                      }}
                      placeholder="https://... (defaults to cover image)"
                      className="h-10 bg-background/50 border-border/60 focus:border-purple-500/50 transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-4 border-t border-border/50 gap-3">
            <Button 
              variant="outline" 
              onClick={() => setGameDialogOpen(false)}
              className="px-5"
            >
              Cancel
            </Button>
            <Button 
              onClick={saveGameItem} 
              disabled={saving}
              className="px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? "Saving..." : editingGame ? "Update Game" : "Add Game"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
