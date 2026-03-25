import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:8080");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Trndinn — AI content for LinkedIn",
    template: "%s | Trndinn",
  },
  description:
    "Trndinn is your AI-powered content OS: create, schedule, and grow on LinkedIn from one workspace.",
  applicationName: "Trndinn",
  keywords: [
    "Trndinn",
    "LinkedIn",
    "AI content",
    "social media scheduling",
    "content creation",
  ],
  authors: [{ name: "Trndinn" }],
  openGraph: {
    title: "Trndinn — AI content for LinkedIn",
    description:
      "Create, schedule, and publish AI-assisted content. Built for creators and teams.",
    type: "website",
    locale: "en_US",
    siteName: "Trndinn",
    url: "/",
    images: [
      {
        url: "/og/default.png",
        width: 1200,
        height: 799,
        alt: "Trndinn — AI-powered content creation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trndinn — AI content for LinkedIn",
    description:
      "Create, schedule, and publish AI-assisted content from one workspace.",
    images: ["/og/default.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
