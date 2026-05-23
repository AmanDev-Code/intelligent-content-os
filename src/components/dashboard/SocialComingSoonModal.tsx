"use client";

import { useState, useEffect } from "react";
import {
  X,
  Rocket,
  Bell,
  CheckCircle2,
  Clock,
  Star,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SocialComingSoonModalProps {
  platform: string | null;
  onClose: () => void;
}

type ItemStatus = "done" | "in-progress" | "coming-soon" | "future";

interface RoadmapItem {
  text: string;
  status: ItemStatus;
  platform?: string;
}

interface RoadmapPhase {
  phase: string;
  period: string;
  label: string;
  labelVariant: "current" | "next" | "future" | "vision";
  items: RoadmapItem[];
}

const ROADMAP_PHASES: RoadmapPhase[] = [
  {
    phase: "Phase 1",
    period: "Q2 2026",
    label: "NOW — Current",
    labelVariant: "current",
    items: [
      { text: "LinkedIn Integration", status: "done" },
      { text: "AI Content Generation", status: "done" },
      { text: "Custom Topic Posts", status: "done" },
      { text: "Carousel & Image Generation", status: "done" },
      { text: "Post Scheduling", status: "done" },
      { text: "Platform Analytics", status: "in-progress" },
    ],
  },
  {
    phase: "Phase 2",
    period: "Q3 2026",
    label: "Coming Next",
    labelVariant: "next",
    items: [
      { text: "X (Twitter) Integration", status: "coming-soon", platform: "twitter" },
      { text: "Multi-platform simultaneous publishing", status: "coming-soon" },
      { text: "Advanced analytics dashboard", status: "coming-soon" },
      { text: "Team collaboration features", status: "coming-soon" },
    ],
  },
  {
    phase: "Phase 3",
    period: "Q4 2026",
    label: "Future",
    labelVariant: "future",
    items: [
      { text: "Instagram Integration", status: "coming-soon", platform: "instagram" },
      { text: "Facebook Integration", status: "coming-soon", platform: "facebook" },
      { text: "TikTok Integration", status: "future" },
      { text: "YouTube Shorts", status: "future" },
      { text: "AI-powered best time to post", status: "future" },
      { text: "Audience insights & growth tracking", status: "future" },
      { text: "White-label options", status: "future" },
    ],
  },
  {
    phase: "Phase 4",
    period: "Late Q4 2026",
    label: "Vision",
    labelVariant: "vision",
    items: [
      { text: "Pinterest Integration", status: "future" },
      { text: "Threads Integration", status: "future" },
      { text: "Enterprise SSO", status: "future" },
      { text: "Custom AI model fine-tuning", status: "future" },
      { text: "API access for developers", status: "future" },
    ],
  },
  {
    phase: "Phase 5",
    period: "2027",
    label: "Vision",
    labelVariant: "vision",
    items: [
      { text: "Global enterprise rollout", status: "future" },
      { text: "Advanced AI fine-tuning per brand", status: "future" },
      { text: "Full developer API & webhooks", status: "future" },
      { text: "Partner & reseller program", status: "future" },
    ],
  },
];

const LABEL_STYLES: Record<string, string> = {
  current: "bg-green-500/20 text-green-400 border border-green-500/30",
  next: "bg-primary/20 text-primary border border-primary/30",
  future: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
  vision: "bg-muted text-muted-foreground border border-border",
};

const PLATFORM_DISPLAY: Record<string, string> = {
  twitter: "X (Twitter)",
  instagram: "Instagram",
  facebook: "Facebook",
};

function ItemStatusIcon({ status }: { status: ItemStatus }) {
  switch (status) {
    case "done":
      return <CheckCircle2 className="text-green-500 shrink-0" size={16} />;
    case "in-progress":
      return <Clock className="text-blue-400 shrink-0" size={16} />;
    case "coming-soon":
      return <ArrowRight className="text-orange-400 shrink-0" size={16} />;
    case "future":
      return <Sparkles className="text-purple-400 shrink-0" size={16} />;
  }
}

export function SocialComingSoonModal({ platform, onClose }: SocialComingSoonModalProps) {
  const [notified, setNotified] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (platform) {
      const t = setTimeout(() => setVisible(true), 10);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [platform]);

  if (!platform) return null;

  const platformName = PLATFORM_DISPLAY[platform] ?? platform;

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200);
  };

  const handleNotify = () => {
    setNotified(true);
    setTimeout(() => setNotified(false), 4000);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-200 ${
        visible ? "bg-black/60 backdrop-blur-sm" : "bg-black/0 backdrop-blur-none pointer-events-none"
      }`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="roadmap-modal-title"
    >
      <div
        className={`relative w-full sm:max-w-2xl max-h-[92dvh] sm:max-h-[85dvh] flex flex-col bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 id="roadmap-modal-title" className="text-lg font-bold">
                Trndinn Roadmap
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                We&apos;re building fast. Here&apos;s what&apos;s coming.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close roadmap"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable timeline */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[18px] top-2 bottom-2 w-px bg-border" aria-hidden="true" />

            <div className="space-y-8">
              {ROADMAP_PHASES.map((phase) => {
                const isActivePhase = phase.items.some(
                  (item) => item.platform === platform
                );

                return (
                  <div key={phase.phase}>
                    <div className="flex items-center gap-4 mb-3">
                      <div
                        className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center border-2 transition-colors z-10 ${
                          isActivePhase
                            ? "border-primary bg-[hsl(var(--card))]"
                            : phase.labelVariant === "current"
                            ? "border-green-500 bg-[hsl(var(--card))]"
                            : "border-border bg-[hsl(var(--card))]"
                        }`}
                        aria-hidden="true"
                      >
                        {phase.labelVariant === "current" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        ) : isActivePhase ? (
                          <Star className="h-4 w-4 text-primary" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 min-w-0">
                        <span className="font-semibold text-sm">{phase.phase}</span>
                        <span className="text-muted-foreground text-sm">—</span>
                        <span className="font-medium text-sm">{phase.period}</span>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                            LABEL_STYLES[phase.labelVariant]
                          }`}
                        >
                          {phase.label}
                        </span>
                      </div>
                    </div>

                    {/* Items — indented to align with header text */}
                    <div className="space-y-2 pl-[calc(2.25rem+1rem)]">
                      {phase.items.map((item, idx) => {
                        const isHighlighted = item.platform === platform;
                        return (
                          <div
                            key={idx}
                            className={`flex items-center gap-2.5 text-sm px-3 py-2 rounded-lg transition-colors ${
                              isHighlighted
                                ? "bg-primary/10 border border-primary/30 text-foreground"
                                : "text-muted-foreground"
                            } ${item.status === "in-progress" ? "opacity-80" : ""}`}
                          >
                            <ItemStatusIcon status={item.status} />
                            <span className={isHighlighted ? "font-medium text-foreground" : ""}>
                              {item.text}
                            </span>
                            {isHighlighted && (
                              <Badge className="ml-auto text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary border-primary/30 border">
                                Selected
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-border p-4 sm:p-5 bg-card">
          {notified ? (
            <div className="flex items-center justify-center gap-2 py-2 text-green-400 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" />
              You&apos;ll be the first to know!
            </div>
          ) : (
            <Button
              className="w-full gap-2"
              onClick={handleNotify}
              aria-label={`Get notified when ${platformName} launches`}
            >
              <Bell className="h-4 w-4" />
              Get notified when {platformName} launches
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
