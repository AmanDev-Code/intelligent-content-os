"use client";
import Link from "next/link";
import {
  Linkedin,
  Clock,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Settings,
  FileText,
  Calendar,
  Zap,
  Star,
  Image as ImageIcon,
  BarChart3,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/button";
import { TableOfContents } from "@/components/guides/TableOfContents";
import { EmailCapture } from "@/components/guides/EmailCapture";
import { SocialShare } from "@/components/guides/SocialShare";
import { GuideBreadcrumb } from "@/components/guides/GuideBreadcrumb";
import { siteName, getSiteUrl } from "@/lib/site";
const tocItems = [
  { id: "overview", text: "Why Automate LinkedIn Posts?", level: 2 },
  { id: "setup", text: "Step 1: Set Up Your LinkedIn Profile", level: 2 },
  { id: "choose-tool", text: "Step 2: Choose Your Automation Tool", level: 2 },
  { id: "connect", text: "Step 3: Connect LinkedIn Account", level: 2 },
  { id: "content-strategy", text: "Step 4: Develop Content Strategy", level: 2 },
  { id: "ai-content", text: "Step 5: Generate AI Content", level: 2 },
  { id: "schedule", text: "Step 6: Schedule and Automate", level: 2 },
  { id: "monitor", text: "Step 7: Monitor and Engage", level: 2 },
  { id: "best-times", text: "Best Times to Post on LinkedIn", level: 2 },
  { id: "mistakes", text: "Common Mistakes to Avoid", level: 2 },
];
const steps = [
  {
    number: "01",
    title: "Optimize Your LinkedIn Profile",
    description: "Before automating posts, ensure your profile is complete and professional. Add a banner, professional headshot, compelling headline, and detailed About section.",
    screenshot: "<!-- TODO: Screenshot - LinkedIn profile optimization checklist -->",
  },
  {
    number: "02",
    title: "Choose an AI-Powered Scheduling Tool",
    description: `Select a tool that supports LinkedIn automation with AI features. ${siteName} offers brand voice learning, optimal timing prediction, and one-click scheduling.`,
    screenshot: "<!-- TODO: Screenshot - Comparing automation tools dashboard -->",
  },
  {
    number: "03",
    title: "Connect Your LinkedIn Account",
    description: "Authorize the tool to access your LinkedIn profile. Use official API integrations for security. Most tools use OAuth for secure connection.",
    screenshot: "<!-- TODO: Screenshot - LinkedIn OAuth connection flow -->",
  },
  {
    number: "04",
    title: "Define Your Content Pillars",
    description: "Identify 3-5 content themes that align with your personal brand. Common pillars include industry insights, personal stories, educational content, and community engagement.",
    screenshot: "<!-- TODO: Screenshot - Content pillar planning template -->",
  },
  {
    number: "05",
    title: "Train AI on Your Voice",
    description: "Upload examples of your best LinkedIn posts to teach the AI your writing style. Include different post types: thought leadership, stories, tips, and questions.",
    screenshot: "<!-- TODO: Screenshot - AI training interface in ${siteName} -->",
  },
  {
    number: "06",
    title: "Generate and Edit AI Content",
    description: "Use AI to generate post drafts based on your content pillars. Always review and personalize before scheduling. Add personal anecdotes and insights.",
    screenshot: "<!-- TODO: Screenshot - AI content generation with edit options -->",
  },
  {
    number: "07",
    title: "Set Up Recurring Schedule",
    description: "Create a consistent posting schedule. Start with 3-5 posts per week and adjust based on engagement. Use AI recommendations for optimal timing.",
    screenshot: "<!-- TODO: Screenshot - Calendar view with scheduled posts -->",
  },
  {
    number: "08",
    title: "Enable Engagement Notifications",
    description: "Turn on notifications for comments and reactions. Automation handles posting, but you must engage authentically with your audience.",
    screenshot: "<!-- TODO: Screenshot - Notification settings configuration -->",
  },
];
const bestTimes = [
  { day: "Tuesday", times: "8:00-10:00 AM, 12:00-1:00 PM, 5:00-6:00 PM", engagement: "High" },
  { day: "Wednesday", times: "8:00-10:00 AM, 12:00-1:00 PM, 5:00-6:00 PM", engagement: "Highest" },
  { day: "Thursday", times: "8:00-10:00 AM, 12:00-1:00 PM, 5:00-6:00 PM", engagement: "High" },
  { day: "Friday", times: "8:00-10:00 AM, 12:00-1:00 PM", engagement: "Moderate" },
  { day: "Monday", times: "8:00-10:00 AM, 5:00-6:00 PM", engagement: "Moderate" },
  { day: "Saturday", times: "9:00-11:00 AM", engagement: "Low" },
  { day: "Sunday", times: "9:00-11:00 AM", engagement: "Low" },
];
const tools = [
  {
    name: siteName,
    features: ["AI content generation", "Brand voice learning", "Optimal timing", "Free tier"],
    bestFor: "Personal brands & professionals",
    pricing: "Free to $49/month",
    featured: true,
  },
  {
    name: "Buffer",
    features: ["Simple scheduling", "Basic analytics", "Multi-platform"],
    bestFor: "Beginners",
    pricing: "Free to $15/month",
    featured: false,
  },
  {
    name: "Hootsuite",
    features: ["Enterprise features", "Advanced analytics", "Team collaboration"],
    bestFor: "Large teams",
    pricing: "$99+/month",
    featured: false,
  },
  {
    name: "Taplio",
    features: ["LinkedIn-focused", "AI writing", "Analytics"],
    bestFor: "LinkedIn power users",
    pricing: "$39+/month",
    featured: false,
  },
];
const mistakes = [
  {
    title: "Over-automating engagement",
    description: "Never automate likes, comments, or connection requests. LinkedIn penalizes this behavior. Only automate content publishing.",
    severity: "high",
  },
  {
    title: "Posting without review",
    description: "Always review AI-generated content. AI can make errors or sound generic. Add personal touches before publishing.",
    severity: "medium",
  },
  {
    title: "Ignoring comments",
    description: "Automation handles posting, but you must manually respond to comments. Ignoring engagement defeats the purpose.",
    severity: "high",
  },
  {
    title: "Using the same content everywhere",
    description: "LinkedIn content should differ from Twitter or Instagram. Each platform has unique conventions and audience expectations.",
    severity: "medium",
  },
  {
    title: "Posting too frequently",
    description: "Quality trumps quantity. Posting 10 times daily trains the algorithm to deprioritize your content.",
    severity: "medium",
  },
  {
    title: "Forgetting to update strategy",
    description: "Review analytics monthly. What worked last quarter may not work now. Adjust content strategy based on performance data.",
    severity: "low",
  },
];
const contentTypes = [
  {
    type: "Thought Leadership",
    description: "Share unique perspectives on industry trends",
    frequency: "2x per week",
    example: "Why I believe remote work is here to stay...",
  },
  {
    type: "Personal Stories",
    description: "Career journey, failures, and lessons learned",
    frequency: "1x per week",
    example: "Three things I wish I knew at 25...",
  },
  {
    type: "Educational",
    description: "Tips, frameworks, and how-to content",
    frequency: "1-2x per week",
    example: "5 frameworks for better decision making...",
  },
  {
    type: "Community Engagement",
    description: "Questions, polls, and discussion starters",
    frequency: "1x per week",
    example: "What is the biggest challenge in your industry?",
  },
];
export function LinkedInAutomationGuide() {
  const pageUrl = getSiteUrl() + "/guides/linkedin-automation";
  return (
    <MarketingShell>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:gap-12">
          <article className="prose prose-lg max-w-none dark:prose-invert">
            <GuideBreadcrumb
              items={[
                { label: "Guides", href: "/guides" },
                { label: "LinkedIn Automation", href: "/guides/linkedin-automation" },
              ]}
            />
            <header className="mb-12">
              <div
                
                
                
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-[#0A66C2]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#0A66C2]">
                  <Linkedin className="h-3.5 w-3.5" />
                  Step-by-Step Tutorial
                </span>
                <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl">
                  How to Automate LinkedIn Posts with AI: A Complete Step-by-Step Tutorial
                </h1>
                <p className="mt-4 text-xl leading-relaxed text-muted-foreground">
                  Learn how to set up automated LinkedIn posting using AI tools. This comprehensive guide covers profile optimization, content strategy, scheduling, and engagement best practices.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    12 min read
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4" />
                    Updated June 2026
                  </span>
                  <SocialShare
                    url={pageUrl}
                    title="How to Automate LinkedIn Posts with AI: Complete Tutorial"
                  />
                </div>
              </div>
            </header>
            <section id="overview" className="mb-12">
              <h2 className="mb-4 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Why Automate LinkedIn Posts?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                LinkedIn automation saves hours each week while maintaining a consistent presence. Studies show professionals who post consistently on LinkedIn see <strong>3x more profile views</strong> and <strong>5x more connection requests</strong> than sporadic posters.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border/60 bg-card/50 p-5">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A66C2]/10 text-[#0A66C2]">
                    <Clock className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground">Save 5+ Hours Weekly</h3>
                  <p className="text-sm text-muted-foreground mt-2">Batch create and schedule a week's content in one session instead of daily posting.</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-card/50 p-5">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A66C2]/10 text-[#0A66C2]">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground">Post at Optimal Times</h3>
                  <p className="text-sm text-muted-foreground mt-2">AI analyzes when your audience is most active and schedules posts for maximum engagement.</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-card/50 p-5">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A66C2]/10 text-[#0A66C2]">
                    <Zap className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground">Maintain Consistency</h3>
                  <p className="text-sm text-muted-foreground mt-2">Consistency signals professionalism. Automation ensures you never miss a posting day.</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-card/50 p-5">
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A66C2]/10 text-[#0A66C2]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground">AI-Powered Content</h3>
                  <p className="text-sm text-muted-foreground mt-2">Generate post ideas, draft content, and optimize messaging with AI assistance.</p>
                </div>
              </div>
            </section>
            <section id="choose-tool" className="mb-12">
              <h2 className="mb-6 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Step 2: Choose Your LinkedIn Automation Tool
              </h2>
              <p className="mb-6 text-muted-foreground">
                Compare the top LinkedIn automation tools to find the right fit for your needs:
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {tools.map((tool) => (
                  <div
                    key={tool.name}
                    className={`rounded-xl border p-5 ${
                      tool.featured
                        ? "border-primary/30 bg-primary/5 dark:bg-primary/10"
                        : "border-border/60 bg-card/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">{tool.name}</h3>
                      {tool.featured && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{tool.bestFor}</p>
                    <ul className="mt-3 space-y-1">
                      {tool.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-3.5 w-3.5 shrink-0 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-sm font-medium text-foreground">{tool.pricing}</p>
                  </div>
                ))}
              </div>
            </section>
            <section id="content-strategy" className="mb-12">
              <h2 className="mb-6 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Step 4: Develop Your LinkedIn Content Strategy
              </h2>
              <p className="mb-6 text-muted-foreground">
                A strong content strategy balances different post types. Here is a recommended content mix:
              </p>
              <div className="overflow-x-auto rounded-xl border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Content Type</th>
                      <th className="px-4 py-3 text-left font-semibold">Description</th>
                      <th className="px-4 py-3 text-left font-semibold">Frequency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {contentTypes.map((item) => (
                      <tr key={item.type}>
                        <td className="px-4 py-3 font-medium text-foreground">{item.type}</td>
                        <td className="px-4 py-3 text-muted-foreground">{item.description}</td>
                        <td className="px-4 py-3 text-primary">{item.frequency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section id="best-times" className="mb-12">
              <h2 className="mb-6 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Best Times to Post on LinkedIn
              </h2>
              <p className="mb-6 text-muted-foreground">
                Post when your audience is active. These times reflect general LinkedIn user behavior:
              </p>
              <div className="overflow-x-auto rounded-xl border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Day</th>
                      <th className="px-4 py-3 text-left font-semibold">Best Times (Your Time Zone)</th>
                      <th className="px-4 py-3 text-left font-semibold">Engagement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {bestTimes.map((item) => (
                      <tr key={item.day}>
                        <td className="px-4 py-3 font-medium text-foreground">{item.day}</td>
                        <td className="px-4 py-3 text-muted-foreground">{item.times}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 text-xs ${
                            item.engagement === "Highest" ? "bg-green-500/10 text-green-500" :
                            item.engagement === "High" ? "bg-primary/10 text-primary" :
                            item.engagement === "Moderate" ? "bg-yellow-500/10 text-yellow-500" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {item.engagement}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Pro tip: Use AI scheduling tools that analyze YOUR specific audience's behavior patterns rather than relying on general guidelines.
              </p>
            </section>
            <section id="mistakes" className="mb-12">
              <h2 className="mb-6 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Common LinkedIn Automation Mistakes to Avoid
              </h2>
              <div className="space-y-4">
                {mistakes.map((mistake, index) => (
                  <div
                    key={index}
                    className={`rounded-xl border p-5 ${
                      mistake.severity === "high"
                        ? "border-red-500/20 bg-red-500/5"
                        : mistake.severity === "medium"
                        ? "border-yellow-500/20 bg-yellow-500/5"
                        : "border-border/60 bg-card/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className={`h-5 w-5 shrink-0 ${
                        mistake.severity === "high" ? "text-red-500" :
                        mistake.severity === "medium" ? "text-yellow-500" :
                        "text-muted-foreground"
                      }`} />
                      <div>
                        <h3 className="font-semibold text-foreground">{mistake.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{mistake.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="mb-12 rounded-2xl border border-[#0A66C2]/20 bg-[#0A66C2]/5 p-8 text-center">
              <Linkedin className="mx-auto mb-4 h-10 w-10 text-[#0A66C2]" />
              <h3 className="font-display text-2xl font-bold text-foreground">
                Ready to Automate Your LinkedIn?
              </h3>
              <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
                Start automating your LinkedIn posts with {siteName}. Get AI-generated content that sounds like you, posted at optimal times.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-[#0A66C2] px-8 font-semibold text-white hover:bg-[#0A66C2]/90"
                  asChild
                >
                  <Link href="/auth">
                    Start Free on LinkedIn
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </section>
            {/* Step by Step Visual Guide */}
            <section className="mb-12">
              <h2 className="mb-6 font-display text-2xl font-bold text-foreground sm:text-3xl">
                Complete Step-by-Step Process
              </h2>
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-border/60 bg-card/50 p-6"
                  >
                    <div className="flex items-start gap-4">
                      <span className="shrink-0 font-display text-3xl font-bold text-[#0A66C2]/30">
                        {step.number}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-lg">{step.title}</h3>
                        <p className="mt-2 text-muted-foreground">{step.description}</p>
                        {/* Screenshot placeholder */}
                        <div className="mt-4 rounded-lg border-2 border-dashed border-border/60 bg-muted/30 p-8 text-center">
                          <ImageIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground">{step.screenshot}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <EmailCapture
              title="Get LinkedIn automation tips weekly"
              description="Subscribe for LinkedIn content strategies, AI writing tips, and automation best practices delivered to your inbox."
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
