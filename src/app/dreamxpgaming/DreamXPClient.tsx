"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import {
  Gamepad2,
  Heart,
  Rocket,
  Zap,
  Trophy,
  Users,
  TrendingUp,
  Star,
  Shield,
  Sparkles,
  Copy,
  Share2,
  Download,
  ChevronRight,
  Play,
  Twitch,
  Youtube,
  Twitter,
  Instagram,
  MessageCircle,
  Github,
  Swords,
  Target,
  Flame,
  Clock,
  Calendar,
  MessageSquare,
  ThumbsUp,
  Send,
  Hash,
  TrendingDown,
  Award,
  Crown,
  Coins,
  Gift,
  Cpu,
  Monitor,
  Headphones,
  Mouse,
  Keyboard,
  Gamepad,
  Wifi,
  Battery,
  Volume2,
  ArrowRight,
  CheckCircle,
  Circle,
  BookOpen,
  Video,
  Mic,
  Camera,
} from "lucide-react";

// Types
interface CampaignConfig {
  upi_id: string;
  upi_name: string;
  qr_code_url: string | null;
  goal_amount: number;
  raised_amount: number;
  campaign_title: string;
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
}

interface CommunityMessage {
  id: string;
  name: string;
  message: string;
  created_at: string;
  likes?: number;
  tag?: string;
}

interface GamingLibraryItem {
  id: string;
  title: string;
  cover_image_url?: string;
  description?: string;
  grid_size: string;
  is_blog_enabled: boolean;
  blog_slug?: string;
  blog_excerpt?: string;
  release_year?: string;
  platform?: string;
  genre?: string;
  is_featured: boolean;
}

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

// Platform Icons Map
const PLATFORM_ICONS: Record<string, React.ElementType> = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  discord: MessageCircle,
  twitch: Twitch,
  github: Github,
};

// Icon Map for dynamic icons
const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Cpu,
  Youtube,
  Gamepad2,
  Play,
  Users,
  Trophy,
  Star,
  Zap,
  BookOpen,
  Video,
  Mic,
  Camera,
};

// Default Config
const DEFAULT_CONFIG: CampaignConfig = {
  upi_id: "dreamps@axl",
  upi_name: "DreamPS",
  qr_code_url: null,
  goal_amount: 70000,
  raised_amount: 12450,
  campaign_title: "Support My PS5 Dream",
  countdown_target_date: "2026-12-31T23:59:59Z",
  countdown_title: "Countdown to PS5",
  countdown_subtitle: "The dream gets closer every second",
  gaming_stats: [
    { label: "PS5 Sold", value: "60M+", icon: "Trophy" },
    { label: "Games Released", value: "1000+", icon: "Gamepad2" },
    { label: "Hours Watched", value: "500M+", icon: "Play" },
    { label: "Active Gamers", value: "3.2B", icon: "Users" },
  ],
};

// Community Tags (without emojis)
const COMMUNITY_TAGS = [
  "Gaming",
  "Support",
  "Dreams",
  "Motivation",
  "Goals",
  "Focus",
  "Never Give Up",
  "Inspiration",
];

export default function DreamXPClient() {
  // State
  const [config, setConfig] = useState<CampaignConfig>(DEFAULT_CONFIG);
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [gamingLibrary, setGamingLibrary] = useState<GamingLibraryItem[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [selectedTag, setSelectedTag] = useState("Gaming");
  const [animatedRaised, setAnimatedRaised] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [liveViewers, setLiveViewers] = useState(0);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const presenceChannelRef = useRef<any>(null);

  // Motion Values
  const { scrollYProgress } = useScroll();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  // Parallax Transforms
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 50]);

  // Load Data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [configRes, socialsRes, messagesRes, libraryRes, waitlistRes, waitlistCountRes] = await Promise.all([
        (supabase as any).from("xp_campaign_config").select("*").eq("is_active", true).single(),
        (supabase as any).from("xp_social_links").select("*").eq("is_active", true).order("display_order"),
        (supabase as any).from("xp_community_messages").select("*").eq("is_visible", true).order("created_at", { ascending: false }).limit(20),
        (supabase as any).from("xp_gaming_library").select("*").eq("is_visible", true).order("display_order"),
        (supabase as any).from("xp_waitlist").select("*").order("created_at", { ascending: false }).limit(20),
        (supabase as any).from("xp_waitlist").select("id", { count: "exact", head: true }),
      ]);

      if (configRes.data) setConfig(configRes.data);
      if (socialsRes.data) setSocials(socialsRes.data);
      if (messagesRes.data) {
        const enhancedMessages = messagesRes.data.map((msg: any) => ({
          ...msg,
          likes: msg.likes || Math.floor(Math.random() * 50) + 1,
          tag: msg.tag || COMMUNITY_TAGS[Math.floor(Math.random() * COMMUNITY_TAGS.length)],
        }));
        setMessages(enhancedMessages);
      }
      if (libraryRes.data) setGamingLibrary(libraryRes.data);
      if (waitlistRes.data) setWaitlist(waitlistRes.data);
      if (waitlistCountRes.count !== null) setWaitlistCount(waitlistCountRes.count);
    } catch (error) {
      console.log("Using default config");
      // Set default gaming library
      setGamingLibrary([
        { id: "1", title: "GTA 6", cover_image_url: "/games/gta6.jpg", description: "The most anticipated game of the decade.", grid_size: "large", is_blog_enabled: false, is_featured: true, genre: "Action", platform: "PS5" },
        { id: "2", title: "God of War Ragnarök", cover_image_url: "/games/gow.jpg", description: "Kratos faces the Norse apocalypse.", grid_size: "medium", is_blog_enabled: false, is_featured: false, genre: "Action-Adventure", platform: "PS5" },
        { id: "3", title: "Spider-Man 2", cover_image_url: "/games/spiderman2.jpg", description: "Peter and Miles vs Venom.", grid_size: "wide", is_blog_enabled: false, is_featured: false, genre: "Action", platform: "PS5" },
        { id: "4", title: "Horizon Forbidden West", cover_image_url: "/games/horizon.jpg", description: "Aloy ventures into uncharted lands.", grid_size: "medium", is_blog_enabled: false, is_featured: false, genre: "RPG", platform: "PS5" },
      ]);
    }
    setTimeout(() => setIsLoading(false), 1500);
  };

  // Real-time Live Viewers using Supabase Presence
  useEffect(() => {
    const visitorId = `visitor_${Math.random().toString(36).substring(7)}`;
    
    const channel = supabase.channel('dreamxp_viewers', {
      config: {
        presence: {
          key: visitorId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setLiveViewers(count);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        setLiveViewers(prev => prev + newPresences.length);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        setLiveViewers(prev => Math.max(0, prev - leftPresences.length));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          });
        }
      });

    presenceChannelRef.current = channel;

    return () => {
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
    };
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Raised amount animation
  useEffect(() => {
    if (!isLoading && config.raised_amount > 0) {
      const duration = 2500;
      const steps = 100;
      const increment = config.raised_amount / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= config.raised_amount) {
          setAnimatedRaised(config.raised_amount);
          clearInterval(interval);
        } else {
          setAnimatedRaised(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(interval);
    }
  }, [isLoading, config.raised_amount]);

  // Helpers
  const UPI_URL = `upi://pay?pa=${config.upi_id}&pn=${encodeURIComponent(config.upi_name)}&tn=${encodeURIComponent(config.campaign_title)}`;
  const QR_URL = config.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(UPI_URL)}&bgcolor=0F0F23&color=A78BFA&format=png&qzone=2&margin=0`;
  const progress = (animatedRaised / config.goal_amount) * 100;

  const triggerConfetti = () => {
    const colors = ["#7C3AED", "#A78BFA", "#F43F5E", "#06B6D4", "#10B981"];
    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.6 },
      colors,
      ticks: 300,
      gravity: 0.8,
      scalar: 1.2,
    });
  };

  const handleSupport = () => {
    triggerConfetti();
    window.location.href = UPI_URL;
  };

  const copyUPI = () => {
    navigator.clipboard.writeText(config.upi_id);
    toast.success("UPI ID copied! Ready to paste");
  };

  const handleShare = async () => {
    const shareData = {
      title: "Join My Gaming Journey!",
      text: "Follow my path to PS5 and beyond. Every supporter becomes part of the story.",
      url: window.location.href,
    };
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied! Share the journey");
    }
  };

  const downloadQR = async () => {
    try {
      const response = await fetch(QR_URL);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dreamxp-gaming-qr.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("QR Code downloaded!");
    } catch {
      toast.error("Download failed");
    }
  };

  const addMessage = async () => {
    if (!newName.trim() || !newMessage.trim()) return;
    try {
      const { data, error } = await (supabase as any)
        .from("xp_community_messages")
        .insert({ name: newName, message: newMessage, tag: selectedTag })
        .select()
        .single();
      if (!error && data) {
        const enhancedMsg = {
          ...data,
          likes: 0,
          tag: selectedTag,
        };
        setMessages([enhancedMsg, ...messages]);
        setNewName("");
        setNewMessage("");
        toast.success("You're part of the story now!");
        triggerConfetti();
      }
    } catch {
      const newMsg = { 
        id: Date.now().toString(), 
        name: newName, 
        message: newMessage, 
        created_at: new Date().toISOString(),
        likes: 0,
        tag: selectedTag,
      };
      setMessages([newMsg, ...messages]);
      setNewName("");
      setNewMessage("");
      toast.success("Message added!");
    }
  };

  const likeMessage = (id: string) => {
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, likes: (msg.likes || 0) + 1 } : msg
    ));
    toast.success("Liked!", { duration: 1000 });
  };

  const joinWaitlist = async (name: string, email: string): Promise<boolean> => {
    try {
      const { data, error } = await (supabase as any)
        .from("xp_waitlist")
        .insert({ name, email, is_fake: false })
        .select()
        .single();
      
      if (error) {
        if (error.code === "23505") {
          toast.error("This email is already on the waitlist!");
        } else {
          toast.error("Failed to join waitlist");
        }
        return false;
      }
      
      if (data) {
        setWaitlist([data, ...waitlist]);
        setWaitlistCount(prev => prev + 1);
        toast.success("Welcome to the journey! You're on the waitlist.");
        triggerConfetti();
        return true;
      }
      return false;
    } catch (error) {
      toast.error("Something went wrong");
      return false;
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0F0F23] text-[#E2E8F0] overflow-x-hidden font-['Chakra_Petch']">
      {/* Custom Cursor Glow */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-50 opacity-20"
        style={{
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(124, 58, 237, 0.1), transparent 40%)`,
        }}
      />

      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div style={{ y: bgY }} className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[180px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[150px]" />
        </motion.div>
      </div>

      {/* Live Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 bg-red-600/20 backdrop-blur-sm border border-red-500/30 rounded-full"
      >
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-xs font-mono text-red-400">LIVE: {liveViewers} watching</span>
      </motion.div>

      {/* Hero Section */}
      <HeroSection
        config={config}
        animatedRaised={animatedRaised}
        progress={progress}
        handleSupport={handleSupport}
        copyUPI={copyUPI}
        handleShare={handleShare}
        downloadQR={downloadQR}
        QR_URL={QR_URL}
        heroY={heroY}
        socials={socials}
      />

      {/* Waitlist Section - High Priority */}
      <WaitlistSection
        waitlist={waitlist}
        totalCount={waitlistCount}
        onJoinWaitlist={joinWaitlist}
      />

      {/* Gaming Library - Bento Grid */}
      <GamingLibrarySection gamingLibrary={gamingLibrary} />

      {/* Stats Ticker */}
      <GamingStatsTicker stats={config.gaming_stats} />

      {/* Countdown */}
      <CountdownSection 
        targetDate={config.countdown_target_date} 
        title={config.countdown_title}
        subtitle={config.countdown_subtitle}
      />

      {/* Why Support */}
      <WhySupportSection />

      {/* Community Wall */}
      <CommunitySection
        messages={messages}
        newName={newName}
        newMessage={newMessage}
        setNewName={setNewName}
        setNewMessage={setNewMessage}
        addMessage={addMessage}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        tags={COMMUNITY_TAGS}
        likeMessage={likeMessage}
      />

      {/* Social Links */}
      <SocialSection socials={socials} />

      {/* Footer */}
      <FooterSection />
    </div>
  );
}

// Import Components
import {
  LoadingScreen,
  HeroSection,
  GamingLibrarySection,
  GamingStatsTicker,
  CountdownSection,
  WhySupportSection,
  WaitlistSection,
  CommunitySection,
  SocialSection,
  FooterSection,
} from "./Components";