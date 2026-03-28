import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import { SiteJsonLd } from "@/components/seo/SiteJsonLd";
import { defaultDescription, getSiteUrl, siteName } from "@/lib/site";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
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
      <body className={`${poppins.variable} min-h-screen bg-background font-sans antialiased`}>
        <SiteJsonLd />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
