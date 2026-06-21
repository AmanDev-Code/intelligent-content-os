"use client";

import {
  Linkedin,
  FileText,
  Hash,
  Mail,
  MessageCircle,
  Globe,
  Camera,
  Newspaper,
  Ghost,
  Send,
  BookOpen,
  Code,
  Lightbulb,
  TrendingUp,
  Users,
  Rocket,
  BarChart3,
  Brain,
  Pen,
  Building2,
  Zap,
} from "lucide-react";

const iconMap: Record<string, typeof Linkedin> = {
  // Tier 1: Auto-publish platforms
  linkedin_article: Linkedin,
  linkedin_post: Linkedin,
  medium: FileText,
  hashnode: Hash,
  devto: Code,
  ghost: Ghost,
  beehiiv: Mail,
  telegraph: Send,
  blogger: BookOpen,
  
  // Tier 2: Submit for review platforms
  hackernoon: Newspaper,
  towards_ai: Brain,
  analytics_vidhya: BarChart3,
  freecodecamp: Code,
  smashing_magazine: Zap,
  sitepoint: Globe,
  readwrite: Pen,
  yourstory: Building2,
  startuptalky: Rocket,
  inc42: TrendingUp,
  techstory: Lightbulb,
  
  // Tier 3: Discussion platforms
  reddit: MessageCircle,
  indiehackers: Users,
  producthunt_discussions: Rocket,
  growthhackers: TrendingUp,
  hackernews: Newspaper,
  huggingface_community: Brain,
  
  // Legacy platforms
  substack: Mail,
  newsletter: Mail,
  twitter_thread: MessageCircle,
  facebook: Globe,
  instagram: Camera,
};

interface PlatformIconProps {
  platform: string;
  className?: string;
}

export function PlatformIcon({ platform, className }: PlatformIconProps) {
  const Icon = iconMap[platform] ?? Globe;
  return <Icon className={className} />;
}
