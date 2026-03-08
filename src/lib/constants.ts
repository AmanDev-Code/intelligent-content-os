// Centralized constants — never use import.meta.env directly in components

export const APP_NAME = "ContentOS";

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
export const SUPABASE_PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;
export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL as string) || "http://localhost:3000";

export const CALENDAR_VIEWS = ["Day", "Week", "Month", "List"] as const;
export type CalendarView = (typeof CALENDAR_VIEWS)[number];

export interface SocialChannel {
  id: string;
  label: string;
  icon: string; // lucide icon name
  color: string; // tailwind token
}

export const SOCIAL_CHANNELS: SocialChannel[] = [
  { id: "linkedin", label: "LinkedIn", icon: "Linkedin", color: "primary" },
  { id: "twitter", label: "Twitter", icon: "Twitter", color: "accent" },
  { id: "instagram", label: "Instagram", icon: "Instagram", color: "destructive" },
  { id: "facebook", label: "Facebook", icon: "Facebook", color: "accent" },
];

export const PLAN_TIERS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    credits: 5,
    features: ["5 AI generations/month", "Basic analytics", "1 social channel"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    credits: 100,
    features: ["100 AI generations/month", "Advanced analytics", "All social channels", "Visual content", "Carousel posts"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    credits: -1,
    features: ["Unlimited generations", "Priority support", "Custom integrations", "Team management", "API access"],
  },
];

export const HOURS_OF_DAY = Array.from({ length: 18 }, (_, i) => i + 6); // 6AM to 11PM
