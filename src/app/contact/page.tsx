import type { Metadata } from "next";
import ContactPage from "@/views/ContactPage";
import { getSiteUrl, siteName } from "@/lib/site";

const url = getSiteUrl();

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${siteName} for product questions, partnerships, and support. We read every message.`,
  alternates: { canonical: `${url}/contact` },
  openGraph: {
    title: `Contact | ${siteName}`,
    description: "Talk to the team behind Trndinn-partnerships, product questions, and support.",
    url: "/contact",
    type: "website",
    siteName,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `Contact | ${siteName}`,
    description: "Reach the Trndinn team.",
  },
};

export default function Page() {
  return <ContactPage />;
}
