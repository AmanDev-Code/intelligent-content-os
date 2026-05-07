"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Settings,
  Image as ImageIcon,
  BarChart3,
  Users,
  Coins,
  TrendingUp,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Save,
  Loader2,
  Trophy,
  Code,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type ReferralSettings = {
  id: string;
  credits_per_referral: number;
  min_actions_to_complete: number;
  is_program_active: boolean;
  terms_and_conditions: string | null;
  updated_at: string;
};

type ReferralBanner = {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
};

type ReferralAnalytics = {
  total_referrals: number;
  referrals_this_month: number;
  pending_referrals: number;
  completed_referrals: number;
  total_credits_awarded: number;
  total_referral_codes: number;
  conversion_rate: number;
};

type TopReferrer = {
  user_id: string;
  username: string | null;
  full_name: string | null;
  total_referred: number;
  completed_referrals: number;
  total_credits_earned: number;
};

type ReferralCode = {
  id: string;
  user_id: string;
  code: string;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  user?: {
    username: string | null;
    email: string | null;
    full_name: string | null;
  };
};

export default function AdminReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [banners, setBanners] = useState<ReferralBanner[]>([]);
  const [analytics, setAnalytics] = useState<ReferralAnalytics | null>(null);
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  const [saving, setSaving] = useState(false);

  // Settings form state
  const [creditsPerReferral, setCreditsPerReferral] = useState(50);
  const [minActions, setMinActions] = useState(1);
  const [isProgramActive, setIsProgramActive] = useState(true);
  const [termsAndConditions, setTermsAndConditions] = useState("");

  // Banner dialog state
  const [bannerDialogOpen, setBannerDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<ReferralBanner | null>(null);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerLinkUrl, setBannerLinkUrl] = useState("");
  const [bannerIsActive, setBannerIsActive] = useState(true);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerSaving, setBannerSaving] = useState(false);

  // Codes state
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [codesTotal, setCodesTotal] = useState(0);
  const [codesPage, setCodesPage] = useState(1);
  const [codesLimit] = useState(20);
  const [codesSearch, setCodesSearch] = useState("");
  const [codesStatus, setCodesStatus] = useState<"active" | "inactive" | "all">("all");
  const [codesLoading, setCodesLoading] = useState(false);
  const [deleteCodeDialogOpen, setDeleteCodeDialogOpen] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState<ReferralCode | null>(null);
  const [deletingCode, setDeletingCode] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsRes, bannersRes, analyticsRes, topReferrersRes] = await Promise.all([
        api.adminReferral.getSettings(),
        api.adminReferral.getBanners(),
        api.adminReferral.getStats(),
        api.adminReferral.getTopReferrers(10),
      ]);

      if (settingsRes.success) {
        setSettings(settingsRes.data);
        setCreditsPerReferral(settingsRes.data.credits_per_referral);
        setMinActions(settingsRes.data.min_actions_to_complete);
        setIsProgramActive(settingsRes.data.is_program_active);
        setTermsAndConditions(settingsRes.data.terms_and_conditions || "");
      }
      if (bannersRes.success) setBanners(bannersRes.data);
      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (topReferrersRes.success) setTopReferrers(topReferrersRes.data);
    } catch (error) {
      toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await api.adminReferral.updateSettings({
        credits_per_referral: creditsPerReferral,
        min_actions_to_complete: minActions,
        is_program_active: isProgramActive,
        terms_and_conditions: termsAndConditions || undefined,
      });
      if (res.success) {
        setSettings(res.data);
        toast.success("Settings saved successfully");
      }
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const openBannerDialog = (banner?: ReferralBanner) => {
    if (banner) {
      setEditingBanner(banner);
      setBannerTitle(banner.title);
      setBannerLinkUrl(banner.link_url || "");
      setBannerIsActive(banner.is_active);
    } else {
      setEditingBanner(null);
      setBannerTitle("");
      setBannerLinkUrl("");
      setBannerIsActive(true);
    }
    setBannerFile(null);
    setBannerDialogOpen(true);
  };

  const saveBanner = async () => {
    if (!bannerTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!editingBanner && !bannerFile) {
      toast.error("Image is required for new banners");
      return;
    }

    setBannerSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", bannerTitle.trim());
      formData.append("link_url", bannerLinkUrl.trim());
      formData.append("is_active", String(bannerIsActive));
      if (bannerFile) {
        formData.append("image", bannerFile);
      }

      let res;
      if (editingBanner) {
        res = await api.adminReferral.updateBanner(editingBanner.id, formData);
      } else {
        res = await api.adminReferral.createBanner(formData);
      }

      if (res.success) {
        toast.success(editingBanner ? "Banner updated" : "Banner created");
        setBannerDialogOpen(false);
        loadData();
      }
    } catch (error) {
      toast.error("Failed to save banner");
    } finally {
      setBannerSaving(false);
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      await api.adminReferral.deleteBanner(id);
      toast.success("Banner deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete banner");
    }
  };

  const toggleBannerActive = async (banner: ReferralBanner) => {
    try {
      const formData = new FormData();
      formData.append("is_active", String(!banner.is_active));
      await api.adminReferral.updateBanner(banner.id, formData);
      loadData();
    } catch (error) {
      toast.error("Failed to update banner");
    }
  };

  const loadCodes = async (page = codesPage, search = codesSearch, status = codesStatus) => {
    setCodesLoading(true);
    try {
      const res = await api.adminReferral.getCodes({
        page,
        limit: codesLimit,
        search: search || undefined,
        status,
      });
      if (res.success) {
        setCodes(res.codes);
        setCodesTotal(res.total);
        setCodesPage(res.page);
      }
    } catch (error) {
      toast.error("Failed to load codes");
    } finally {
      setCodesLoading(false);
    }
  };

  const handleCodesSearch = () => {
    setCodesPage(1);
    loadCodes(1, codesSearch, codesStatus);
  };

  const handleCodesStatusChange = (status: "active" | "inactive" | "all") => {
    setCodesStatus(status);
    setCodesPage(1);
    loadCodes(1, codesSearch, status);
  };

  const toggleCodeActive = async (code: ReferralCode) => {
    try {
      await api.adminReferral.updateCode(code.id, { is_active: !code.is_active });
      toast.success(`Code ${!code.is_active ? "activated" : "deactivated"}`);
      loadCodes();
    } catch (error) {
      toast.error("Failed to update code");
    }
  };

  const confirmDeleteCode = (code: ReferralCode) => {
    setCodeToDelete(code);
    setDeleteCodeDialogOpen(true);
  };

  const handleDeleteCode = async () => {
    if (!codeToDelete) return;
    setDeletingCode(true);
    try {
      await api.adminReferral.deleteCode(codeToDelete.id);
      toast.success("Code deleted");
      setDeleteCodeDialogOpen(false);
      setCodeToDelete(null);
      loadCodes();
    } catch (error) {
      toast.error("Failed to delete code");
    } finally {
      setDeletingCode(false);
    }
  };

  const totalCodesPages = Math.ceil(codesTotal / codesLimit);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Referral Program</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage referral settings, promotional banners, and view analytics
        </p>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="banners" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Banners
          </TabsTrigger>
          <TabsTrigger value="codes" className="gap-2" onClick={() => loadCodes()}>
            <Code className="h-4 w-4" />
            Codes
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Program Settings</CardTitle>
              <CardDescription>
                Configure the referral program parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Program Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable the referral program
                  </p>
                </div>
                <Switch
                  checked={isProgramActive}
                  onCheckedChange={setIsProgramActive}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="credits">Credits per Referral</Label>
                  <Input
                    id="credits"
                    type="number"
                    min={0}
                    value={creditsPerReferral}
                    onChange={(e) => setCreditsPerReferral(parseInt(e.target.value) || 0)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Credits awarded to referrer when referral completes
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minActions">Min Actions to Complete</Label>
                  <Input
                    id="minActions"
                    type="number"
                    min={1}
                    value={minActions}
                    onChange={(e) => setMinActions(parseInt(e.target.value) || 1)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of generations needed to complete referral
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  rows={4}
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  placeholder="Enter the terms and conditions for the referral program..."
                />
              </div>

              <Button onClick={saveSettings} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banners Tab */}
        <TabsContent value="banners" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Promotional Banners</CardTitle>
                <CardDescription>
                  Manage banners displayed on the referral page
                </CardDescription>
              </div>
              <Dialog open={bannerDialogOpen} onOpenChange={setBannerDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => openBannerDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Banner
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingBanner ? "Edit Banner" : "Add Banner"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingBanner
                        ? "Update the banner details"
                        : "Create a new promotional banner"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="bannerTitle">Title</Label>
                      <Input
                        id="bannerTitle"
                        value={bannerTitle}
                        onChange={(e) => setBannerTitle(e.target.value)}
                        placeholder="Banner title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bannerLink">Link URL (optional)</Label>
                      <Input
                        id="bannerLink"
                        value={bannerLinkUrl}
                        onChange={(e) => setBannerLinkUrl(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bannerImage">
                        Image {!editingBanner && "(required)"}
                      </Label>
                      <Input
                        id="bannerImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                      />
                      {editingBanner && !bannerFile && (
                        <p className="text-xs text-muted-foreground">
                          Leave empty to keep current image
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="bannerActive"
                        checked={bannerIsActive}
                        onCheckedChange={setBannerIsActive}
                      />
                      <Label htmlFor="bannerActive">Active</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setBannerDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={saveBanner} disabled={bannerSaving}>
                      {bannerSaving && (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      )}
                      {editingBanner ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {banners.length === 0 ? (
                <div className="text-center py-8">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No banners yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {banners.map((banner) => (
                    <div
                      key={banner.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-24 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{banner.title}</p>
                        {banner.link_url && (
                          <p className="text-sm text-muted-foreground truncate">
                            {banner.link_url}
                          </p>
                        )}
                      </div>
                      <Badge variant={banner.is_active ? "default" : "secondary"}>
                        {banner.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleBannerActive(banner)}
                        >
                          <Switch checked={banner.is_active} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openBannerDialog(banner)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteBanner(banner.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Codes Tab */}
        <TabsContent value="codes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Referral Codes
              </CardTitle>
              <CardDescription>
                Manage all user referral codes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by code..."
                      value={codesSearch}
                      onChange={(e) => setCodesSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCodesSearch()}
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline" onClick={handleCodesSearch}>
                    Search
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={codesStatus === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCodesStatusChange("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant={codesStatus === "active" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCodesStatusChange("active")}
                  >
                    Active
                  </Button>
                  <Button
                    variant={codesStatus === "inactive" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCodesStatusChange("inactive")}
                  >
                    Inactive
                  </Button>
                </div>
              </div>

              {/* Codes Table */}
              {codesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : codes.length === 0 ? (
                <div className="text-center py-8">
                  <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No codes found</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Usage</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {codes.map((code) => (
                        <TableRow key={code.id}>
                          <TableCell>
                            <code className="font-mono font-semibold">{code.code}</code>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {code.user?.full_name || code.user?.username || "Unknown"}
                              </p>
                              {code.user?.email && (
                                <p className="text-xs text-muted-foreground">
                                  {code.user.email}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={code.is_active ? "default" : "secondary"}>
                              {code.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {code.usage_count}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(code.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleCodeActive(code)}
                              >
                                {code.is_active ? "Deactivate" : "Activate"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => confirmDeleteCode(code)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {totalCodesPages > 1 && (
                    <div className="flex items-center justify-between pt-4">
                      <p className="text-sm text-muted-foreground">
                        Showing {(codesPage - 1) * codesLimit + 1} to{" "}
                        {Math.min(codesPage * codesLimit, codesTotal)} of {codesTotal} codes
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={codesPage === 1}
                          onClick={() => {
                            setCodesPage(codesPage - 1);
                            loadCodes(codesPage - 1);
                          }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">
                          Page {codesPage} of {totalCodesPages}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={codesPage === totalCodesPages}
                          onClick={() => {
                            setCodesPage(codesPage + 1);
                            loadCodes(codesPage + 1);
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Delete Code Confirmation Dialog */}
          <Dialog open={deleteCodeDialogOpen} onOpenChange={setDeleteCodeDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Referral Code</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete the code{" "}
                  <code className="font-mono font-semibold">{codeToDelete?.code}</code>?
                  This action cannot be undone. Any referrals using this code will be
                  preserved but unlinked from the code.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteCodeDialogOpen(false)}
                  disabled={deletingCode}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteCode}
                  disabled={deletingCode}
                >
                  {deletingCode && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Referrals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{analytics?.total_referrals || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics?.referrals_this_month || 0} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{analytics?.conversion_rate || 0}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics?.completed_referrals || 0} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  Credits Awarded
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  {analytics?.total_credits_awarded || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total credits given out
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Active Codes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{analytics?.total_referral_codes || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Users with referral codes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Referrers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Top Referrers
              </CardTitle>
              <CardDescription>
                Users with the most successful referrals
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topReferrers.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No referrers yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">Referred</TableHead>
                      <TableHead className="text-right">Completed</TableHead>
                      <TableHead className="text-right">Credits Earned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topReferrers.map((referrer, index) => (
                      <TableRow key={referrer.user_id}>
                        <TableCell>
                          {index < 3 ? (
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                index === 0
                                  ? "bg-amber-100 text-amber-700"
                                  : index === 1
                                    ? "bg-gray-100 text-gray-700"
                                    : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {index + 1}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">{index + 1}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {referrer.full_name || referrer.username || "Anonymous"}
                            </p>
                            {referrer.username && (
                              <p className="text-xs text-muted-foreground">
                                @{referrer.username}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {referrer.total_referred}
                        </TableCell>
                        <TableCell className="text-right">
                          {referrer.completed_referrals}
                        </TableCell>
                        <TableCell className="text-right font-medium text-primary">
                          {referrer.total_credits_earned}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
