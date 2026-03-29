import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaRedditAlien,
  FaTwitch,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import type { MarqueeChannel } from "@/components/marketing/ChannelMarquee";

export const MARKETING_MARQUEE_CHANNELS: MarqueeChannel[] = [
  { name: "LinkedIn", Icon: FaLinkedinIn, status: "Live", tone: "text-[#0A66C2]" },
  { name: "X", Icon: FaXTwitter, status: "Roadmap", tone: "text-zinc-800 dark:text-zinc-200" },
  { name: "Instagram", Icon: FaInstagram, status: "Roadmap", tone: "text-[#E4405F]" },
  { name: "Facebook", Icon: FaFacebookF, status: "Roadmap", tone: "text-[#1877F2]" },
  { name: "YouTube", Icon: FaYoutube, status: "Roadmap", tone: "text-[#FF0000]" },
  { name: "Twitch", Icon: FaTwitch, status: "Roadmap", tone: "text-[#9146FF]" },
  { name: "Reddit", Icon: FaRedditAlien, status: "Roadmap", tone: "text-[#FF4500]" },
];
