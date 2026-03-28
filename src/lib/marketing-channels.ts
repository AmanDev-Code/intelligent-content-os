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
  { name: "LinkedIn", Icon: FaLinkedinIn, status: "Live", tone: "text-sky-600 dark:text-sky-300" },
  { name: "X", Icon: FaXTwitter, status: "Roadmap", tone: "text-zinc-700 dark:text-zinc-300" },
  { name: "Instagram", Icon: FaInstagram, status: "Roadmap", tone: "text-pink-600 dark:text-pink-300" },
  { name: "Facebook", Icon: FaFacebookF, status: "Roadmap", tone: "text-blue-600 dark:text-blue-300" },
  { name: "YouTube", Icon: FaYoutube, status: "Roadmap", tone: "text-red-600 dark:text-red-300" },
  { name: "Twitch", Icon: FaTwitch, status: "Roadmap", tone: "text-purple-600 dark:text-purple-300" },
  { name: "Reddit", Icon: FaRedditAlien, status: "Roadmap", tone: "text-orange-600 dark:text-orange-300" },
];
