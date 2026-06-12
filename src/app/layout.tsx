import type { Metadata } from "next";
import { Fraunces, Poppins, Space_Grotesk } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import { SiteJsonLd } from "@/components/seo/SiteJsonLd";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { CookieConsent } from "@/components/marketing/CookieConsent";
import { defaultDescription, getSiteUrl, siteName } from "@/lib/site";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${siteName} — AI social content platform`,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  applicationName: siteName,
  keywords: [
    siteName,
    "AI content",
    "social media scheduling",
    "LinkedIn",
    "X Twitter",
    "Instagram scheduling",
    "YouTube Shorts",
    "AI reels",
    "social media analytics",
    "content creation platform",
  ],
  authors: [{ name: siteName }],
  openGraph: {
    title: `${siteName} — AI social content platform`,
    description: defaultDescription,
    type: "website",
    locale: "en_US",
    siteName,
    url: "/",
    images: [
      {
        url: "/og/default.png",
        width: 1200,
        height: 799,
        alt: `${siteName} — AI-powered social workspace`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — AI social content platform`,
    description: defaultDescription,
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
      <body className={`${poppins.variable} ${fraunces.variable} ${spaceGrotesk.variable} min-h-screen bg-background font-sans antialiased`}>
        <GoogleAnalytics />
        <SiteJsonLd />
        <Providers>{children}</Providers>
        <CookieConsent />
      </body>
    </html>
  );
}
