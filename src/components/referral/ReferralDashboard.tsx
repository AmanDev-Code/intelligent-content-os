"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/apiClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Copy,
  Share2,
  Gift,
  Users,
  CheckCircle2,
  Clock,
  Coins,
  ExternalLink,
  Linkedin,
  Twitter,
  Mail,
} from "lucide-react";

type ReferralCode = {
  code: string;
  referralLink: string;
  isActive: boolean;
  usageCount: number;
  creditsPerReferral: number;
  isProgramActive: boolean;
};

type ReferralStats = {
  code: string;
  usage_count: number;
  is_active: boolean;
  total_referred: number;
  pending_count: number;
  completed_count: number;
  total_credits_earned: number;
  creditsPerReferral: number;
  isProgramActive: boolean;
};

type Referral = {
  id: string;
  status: "pending" | "completed" | "credited" | "expired";
  credits_awarded: number;
  created_at: string;
  completed_at: string | null;
  referred_user?: {
    username: string | null;
    full_name: string | null;
  };
};

type ReferralBanner = {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
};

export function ReferralDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [codeData, setCodeData] = useState<ReferralCode | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [banners, setBanners] = useState<ReferralBanner[]>([]);
  const [totalReferrals, setTotalReferrals] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [codeRes, statsRes, referralsRes, bannersRes] = await Promise.all([
        api.referral.getMyCode(),
        api.referral.getStats(),
        api.referral.getMyReferrals({ limit: 10 }),
        api.referral.getBanners(),
      ]);

      if (codeRes.success) setCodeData(codeRes.data);
      if (statsRes.success) setStats(statsRes.data);
      if (referralsRes.success) {
        setReferrals(referralsRes.data);
        setTotalReferrals(referralsRes.total);
      }
      if (bannersRes.success) setBanners(bannersRes.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load referral data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareToLinkedIn = () => {
    if (!codeData) return;
    const text = `Join me on Trndinn and get started with AI-powered content creation! Use my referral link: ${codeData.referralLink}`;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(codeData.referralLink)}&summary=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const shareToTwitter = () => {
    if (!codeData) return;
    const text = `Join me on @Trndinn and supercharge your content creation with AI! 🚀\n\nUse my referral link to get started:`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(codeData.referralLink)}`,
      "_blank"
    );
  };

  const shareViaEmail = () => {
    if (!codeData) return;
    const subject = "Join me on Trndinn!";
    const body = `Hey!\n\nI've been using Trndinn to create amazing AI-powered content and thought you might like it too.\n\nUse my referral link to sign up: ${codeData.referralLink}\n\nLet me know what you think!`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const shareToWhatsApp = () => {
    if (!codeData) return;
    const text = `Join Trndinn using my referral link and get started with AI-powered content creation! ${codeData.referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const getStatusBadge = (status: Referral["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case "completed":
      case "credited":
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle2 className="h-3 w-3" /> Completed</Badge>;
      case "expired":
        return <Badge variant="outline" className="gap-1 text-muted-foreground">Expired</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!codeData?.isProgramActive) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Gift className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Referral Program Paused</h2>
          <p className="text-muted-foreground">
            The referral program is currently not active. Check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Share Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Gift className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Refer & Earn</h2>
              </div>
              <p className="text-muted-foreground max-w-md">
                Share your unique referral code with friends. When they sign up and create their first content,
                you'll earn <span className="font-semibold text-primary">{codeData?.creditsPerReferral || 50} credits</span>!
              </p>
            </div>

            <div className="flex flex-col gap-3 min-w-[280px]">
              <div className="flex items-center gap-2 bg-background rounded-lg border p-3">
                <code className="flex-1 font-mono text-lg font-semibold tracking-wider">
                  {codeData?.code}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(codeData?.code || "", "Referral code")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => copyToClipboard(codeData?.referralLink || "", "Referral link")}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button variant="outline" size="icon" onClick={shareToLinkedIn}>
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={shareToTwitter}>
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={shareViaEmail}>
                  <Mail className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={shareToWhatsApp}
                  className="hover:bg-[#25D366]/10 hover:text-[#25D366] hover:border-[#25D366]"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Referred
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.total_referred || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">{stats?.pending_count || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats?.completed_count || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Credits Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{stats?.total_credits_earned || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Promotional Banners */}
      {banners.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Promotional Materials</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {banners.map((banner) => (
              <Card key={banner.id} className="overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
                {banner.link_url ? (
                  <a href={banner.link_url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-full h-40 object-cover"
                    />
                    <CardContent className="p-3">
                      <p className="font-medium flex items-center gap-2">
                        {banner.title}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                    </CardContent>
                  </a>
                ) : (
                  <>
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="w-full h-40 object-cover"
                    />
                    <CardContent className="p-3">
                      <p className="font-medium">{banner.title}</p>
                    </CardContent>
                  </>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Referrals
          </CardTitle>
          <CardDescription>
            {totalReferrals > 0
              ? `Showing ${referrals.length} of ${totalReferrals} referrals`
              : "No referrals yet. Share your code to get started!"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Share2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">No referrals yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Share your referral code with friends and colleagues to start earning credits!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {referral.referred_user?.full_name ||
                          referral.referred_user?.username ||
                          "Anonymous User"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Joined {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {referral.credits_awarded > 0 && (
                      <span className="text-sm font-medium text-green-600">
                        +{referral.credits_awarded} credits
                      </span>
                    )}
                    {getStatusBadge(referral.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h4 className="font-medium mb-1">Share Your Code</h4>
              <p className="text-sm text-muted-foreground">
                Copy your unique referral code or link and share it with friends
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h4 className="font-medium mb-1">Friend Signs Up</h4>
              <p className="text-sm text-muted-foreground">
                Your friend creates an account using your referral code
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h4 className="font-medium mb-1">Earn Credits</h4>
              <p className="text-sm text-muted-foreground">
                When they generate their first content, you earn {codeData?.creditsPerReferral || 50} credits!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
