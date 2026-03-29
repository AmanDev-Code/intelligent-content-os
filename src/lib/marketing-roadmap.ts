import type { IconType } from "react-icons";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaRedditAlien,
  FaTwitch,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

export type MarketingRoadmapItem = {
  quarter: string;
  status: "Live now" | "In progress" | "Planned";
  title: string;
  body: string;
  icons: { Icon: IconType; color: string }[];
};

/** Single source of truth for Evolution timeline on Landing + Features */
export const marketingRoadmap: MarketingRoadmapItem[] = [
  {
    quarter: "Q1 '26",
    status: "Live now",
    title: "LinkedIn + core platform",
    body: "AI drafts, calendar, media & analytics in one workspace.",
    icons: [{ Icon: FaLinkedinIn, color: "text-[#0A66C2]" }],
  },
  {
    quarter: "Q2 '26",
    status: "In progress",
    title: "Multi-channel publishing",
    body: "Publish to X, IG, FB & YouTube from one queue.",
    icons: [
      { Icon: FaXTwitter, color: "text-zinc-800 dark:text-white" },
      { Icon: FaInstagram, color: "text-[#E4405F]" },
      { Icon: FaFacebookF, color: "text-[#1877F2]" },
      { Icon: FaYoutube, color: "text-[#FF0000]" },
    ],
  },
  {
    quarter: "Q3 '26",
    status: "In progress",
    title: "LinkedIn outreach engine",
    body: "Smart outreach to grow your network & pipeline.",
    icons: [{ Icon: FaLinkedinIn, color: "text-[#0A66C2]" }],
  },
  {
    quarter: "Q4 '26",
    status: "Planned",
    title: "Twitch + Reddit expansion",
    body: "Community automation for Twitch & Reddit.",
    icons: [
      { Icon: FaTwitch, color: "text-[#9146FF]" },
      { Icon: FaRedditAlien, color: "text-[#FF4500]" },
    ],
  },
];
