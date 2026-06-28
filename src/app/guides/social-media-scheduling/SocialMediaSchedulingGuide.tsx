"use client";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Star,
  Linkedin,
  Twitter,
  Instagram,
  BarChart3,
  Zap,
  AlertCircle,
  Settings,
  Play,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import { TableOfContents } from "@/components/guides/TableOfContents";
import { EmailCapture } from "@/components/guides/EmailCapture";
import { SocialShare } from "@/components/guides/SocialShare";
import { GuideBreadcrumb } from "@/components/guides/GuideBreadcrumb";
import { siteName, getSiteUrl } from "@/lib/site";
const tocItems = [
  { id: "what-is", text: "What is AI Social Media Scheduling?", level: 2 },
  { id: "benefits", text: "Benefits of Automated Scheduling", level: 2 },
  { id: "how-it-works", text: "How AI Scheduling Works", level: 2 },
  { id: "best-times", text: "Best Times to Post by Platform", level: 2 },
  { id: "platform-tips", text: "Platform-Specific Tips", level: 2 },
  { id: "workflow", text: "Scheduling Workflow", level: 2 },
  { id: "tools", text: "Top AI Scheduling Tools", level: 2 },
  { id: "mistakes", text: "Common Mistakes to Avoid", level: 2 },
];
const bestTimes = [
  {
    platform: "LinkedIn",
    icon: Linkedin,
    color: "#0A66C2",
    bestDays: "Tuesday, Wednesday, Thursday",
    bestTimes: "8:00-10:00 AM, 12:00-1:00 PM, 5:00-6:00 PM",
    frequency: "3-5x per week",
    tip: "Focus on professional topics and thought leadership",
  },
  {
    platform: "Twitter/X",
    icon: Twitter,
    color: "#1DA1F2",
    bestDays: "Tuesday-Friday",
    bestTimes: "9:00-10:00 AM, 1:00-2:00 PM, 5:00 PM",
    frequency: "1-3x per day",
    tip: "Threads perform well early morning and lunch time",
  },
  {
    platform: "Instagram",
    icon: Instagram,
    color: "#E4405F",
    bestDays: "Wednesday, Thursday, Friday",
    bestTimes: "11:00 AM-1:00 PM, 2:00-3:00 PM, 7:00-9:00 PM",
    frequency: "3-7x per week",
    tip: "Stories work all day; feed posts do best mid-day",
  },
  {
    platform: "TikTok",
    icon: Play,
    color: "#000000",
    bestDays: "Tuesday, Thursday, Friday",
    bestTimes: "7:00-9:00 AM, 12:00-1:00 PM, 7:00-9:00 PM",
    frequency: "1-3x per day",
    tip: "Evening posts often see highest engagement",
  },
];
const schedulingSteps = [
  {
    number: "01",
    title: "Connect Your Social Accounts",
    description: "Link all your social profiles to your scheduling tool. Use official API connections for security and reliability.",
  },
  {
    number: "02",
    title: "Set Your Posting Schedule",
    description: "Define your content calendar and posting frequency. Be realistic - consistency matters more than volume.",
  },
  {
    number: "03",
    title: "Create Content in Batches",
    description: "Spend 2-3 hours weekly creating content for the entire week or month. This batching approach saves significant time.",
  },
  {
    number: "04",
    title: "Customize for Each Platform",
    description: "Adapt your message for each platform's format and audience. What works on LinkedIn needs adjustment for Twitter.",
  },
  {
    number: "05",
    title: "Use AI-Powered Optimal Timing",
    description: "Enable AI recommendations to automatically schedule posts when YOUR audience is most active, not just general best times.",
  },
  {
    number: "06",
    title: "Review and Schedule",
    description: "Double-check everything in your content calendar. Once scheduled, posts will publish automatically.",
  },
  {
    number: "07",
    title: "Monitor and Engage",
    description: "While posting is automated, engagement requires your attention. Respond to comments and join conversations.",
  },
];
const platformTips = [
  {
    platform: "LinkedIn",
    tips: [
      "Long-form content (1300+ characters) performs well",
      "Monday motivational posts get high engagement",
      "Use 3-5 hashtags maximum",
      "Native video outperforms shared links",
      "Add a call-to-action at the end",
    ],
  },
  {
    platform: "Twitter/X",
    tips: [
      "Threads (5-10 tweets) generate more engagement",
      "Tweet during commute hours (7-9 AM, 5-6 PM)",
      "Use 1-2 hashtags maximum",
      "Include visual content for higher reach",
      "Engage within 30 minutes of posting",
    ],
  },
  {
    platform: "Instagram",
    tips: [
      "Reels get highest organic reach currently",
      "Post consistently - algorithm rewards regularity",
      "Use 10-30 relevant hashtags",
      "Stories keep you visible between posts",
      "Engage with comments within the first hour",
    ],
  },
];
const mistakes = [
  {
    title: "Set It and Forget It",
    description: "Scheduling automates posting, not engagement. You must still respond to comments and join conversations within 1-2 hours of each post.",
  },
  {
    title: "Over-Scheduling",
    description: "Posting 10+ times daily trains algorithms to deprioritize your content. Focus on quality posts your audience actually wants to see.",
  },
  {
    title: "Ignoring Platform Differences",
    description: "Posting identical content across all platforms ignores each network's unique format and audience expectations. Customize for each.",
  },
  {
    title: "Posting at Wrong Times",
    description: "Even with scheduling, posting when your audience is asleep wastes content. Use AI timing recommendations based on YOUR followers.",
  },
  {
    title: "No Backup Plan",
    description: "Never schedule time-sensitive content far in advance. World events can make scheduled posts inappropriate. Always have a pause button ready.",
  },
];
const aiFeatures = [
  {
    title: "Optimal Timing Prediction",
    description: "AI analyzes when your specific audience is online and predicts the best times to post for maximum engagement.",
    icon: Clock,
  },
  {
    title: "Content Suggestions",
    description: "Based on your past performance, AI suggests content topics and formats likely to resonate with your audience.",
    icon: Sparkles,
  },
  {
    title: "Auto-Rescheduling",
    description: "If a post time conflicts with breaking news or trending topics, AI can automatically reschedule to avoid poor timing.",
    icon: Calendar,
  },
  {
    title: "Performance Prediction",
    description: "Before publishing, AI estimates how well a post will perform based on similar past content.",
    icon: BarChart3,
  },
];
export function SocialMediaSchedulingGuide() {
  const pageUrl = `${getSiteUrl()}/guides/social-media-scheduling`;
  return (
    <MarketingShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:gap-12">
          <article className="prose prose-lg max-w-none dark:prose-invert">
            <GuideBreadcrumb
              items={[
                { label: "Guides", href: "/guides" },
                { label: "Social Media Scheduling", href: "/guides/social-media-scheduling" },
              ]}
            />
            {/* Hero Image Section */}
            <div className="relative mb-8 overflow-hidden rounded-2xl border border-border/50">
              <div className="relative h-64 sm:h-80 lg:h-96">
                {/* Light mode image */}
                <Image
                  src="/images/guides/social-media-scheduling.jpg"
                  alt="Social Media Scheduling Guide"
                  fill
                  className="object-cover dark:hidden"
                  priority
                />
                {/* Dark mode image */}
                <Image
                  src="/images/guides/social-media-scheduling-dark.jpg"
                  alt="Social Media Scheduling Guide"
                  fill
                  className="object-cover hidden dark:block"
                  priority
                />
                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
              </div>
            </div>
            <header className="mb-12">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                  <Calendar className="h-3.5 w-3.5" />
                  Beginner's Guide
                </span>
                <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
                  AI Social Media Scheduling: The Complete Beginner's Guide (2026)
                </h1>
                <p className="mt-4 text-xl leading-relaxed text-muted-foreground">
                  Learn how to use AI-powered social media schedulers to maintain consistent posting, reach your audience at optimal times, and save hours each week.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> 10 min read</span>
                  <span className="flex items-center gap-1.5"><Star className="h-4 w-4" /> Updated June 2026</span>
                  <SocialShare url={pageUrl} title="AI Social Media Scheduling Beginners Guide" />
                </div>
              </div>
            </header>
            <section id="what-is" className="mb-12">
              <h2 className="mb-4 font-display text-2xl font-bold text-foreground sm:text-3xl">
                What is AI Social Media Scheduling?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                AI social media scheduling combines traditional scheduling tools with artificial intelligence to optimize when, what, and how you post. Instead of manually remembering to post at specific times, you create content in batches and schedule it to publish automatically at AI-recommended optimal times.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Modern AI schedulers go beyond basic queueing. They analyze your audience's behavior patterns, predict content performance, suggest improvements, and even generate content drafts. This means you spend less time on logistics and more time on strategy.
              </p>
              <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-6">
                <h3 className="mb-3 font-semibold text-foreground">Key AI Scheduling Capabilities:</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    "Predict optimal posting times for YOUR audience",
                    "Auto-generate post variations for different platforms",
                    "Suggest content based on trending topics",
                    "Analyze performance and recommend improvements",
                    "Automatically reschedule for better times",
                    "Identify your top-performing content types",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <section id="best-times" className="mb-12">
              <h2 className="mb-6 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Best Times to Post on Social Media (2026 Data)
              </h2>
              <p className="mb-6 text-muted-foreground">
                While every audience is different, here are general guidelines based on 2026 engagement data. For personalized recommendations, use AI scheduling tools that analyze your specific followers.
              </p>
              <div className="space-y-4">
                {bestTimes.map((platform) => (
                  <div key={platform.platform} className="rounded-xl border border-border/60 bg-card/50 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${platform.color}15`, color: platform.color }}>
                        <platform.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{platform.platform}</h3>
                        <p className="text-xs text-muted-foreground">Recommended: {platform.frequency}</p>
                      </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 text-sm">
                      <div>
                        <span className="font-medium text-foreground">Best Days:</span>
                        <span className="ml-2 text-muted-foreground">{platform.bestDays}</span>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Best Times:</span>
                        <span className="ml-2 text-muted-foreground">{platform.bestTimes}</span>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-primary">{platform.tip}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Source: Aggregated data from Sprout Social, Hootsuite, and buffer analytics reports 2026. Your optimal times may vary.
              </p>
            </section>
            <section id="platform-tips" className="mb-12">
              <h2 className="mb-6 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Platform-Specific Scheduling Tips
              </h2>
              <div className="space-y-6">
                {platformTips.map((platform) => (
                  <div key={platform.platform} className="rounded-xl border border-border/60 bg-card/50 p-6">
                    <h3 className="mb-4 font-semibold text-foreground text-lg">{platform.platform} Scheduling Tips</h3>
                    <ul className="space-y-2">
                      {platform.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
            <section id="how-it-works" className="mb-12">
              <h2 className="mb-6 font-display text-2xl font-bold text-foreground sm:text-3xl">
                How AI Scheduling Works
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {aiFeatures.map((feature) => (
                  <div key={feature.title} className="rounded-xl border border-border/60 bg-card/50 p-5">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>
            <section id="workflow" className="mb-12">
              <h2 className="mb-6 font-display text-2xl font-bold text-foreground sm:text-3xl">
                The Complete Scheduling Workflow
              </h2>
              <div className="space-y-4">
                {schedulingSteps.map((step) => (
                  <div key={step.number} className="flex gap-4 rounded-xl border border-border/60 bg-card/50 p-5">
                    <span className="shrink-0 font-display text-2xl font-bold text-primary/30">{step.number}</span>
                    <div>
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section id="mistakes" className="mb-12">
              <h2 className="mb-6 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Common Scheduling Mistakes to Avoid
              </h2>
              <div className="space-y-4">
                {mistakes.map((mistake, index) => (
                  <div key={index} className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 shrink-0 text-yellow-500" />
                      <div>
                        <h3 className="font-semibold text-foreground">{mistake.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{mistake.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="mb-12 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-[#ff3d39]/5 p-8 text-center">
              <Calendar className="mx-auto mb-4 h-10 w-10 text-primary" />
              <h3 className="font-display text-2xl font-bold text-foreground">
                Start Scheduling Smarter Today
              </h3>
              <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
                Join thousands who save 5+ hours weekly with AI-powered social media scheduling from {siteName}.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button size="lg" className="h-12 rounded-full bg-gradient-to-r from-[#ff8a1f] to-[#ff3d39] px-8 font-semibold text-white hover:opacity-90" asChild>
                  <Link href="/auth">Get Started Free<ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">No credit card required. 150 free credits to start.</p>
            </section>
            <EmailCapture
              title="Get scheduling tips weekly"
              description="Join marketers who optimize their social strategy with AI-powered scheduling tips and best practices."
            />
          </article>
          <aside className="hidden lg:block">
            <TableOfContents items={tocItems} />
          </aside>
        </div>
      </main>
    </MarketingShell>
  );
}
