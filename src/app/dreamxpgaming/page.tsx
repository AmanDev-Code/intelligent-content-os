import type { Metadata } from "next";
import DreamXPClient from "./DreamXPClient";
import { Russo_One, Chakra_Petch } from "next/font/google";

const russoOne = Russo_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-russo",
});

const chakraPetch = Chakra_Petch({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-chakra",
});

export const metadata: Metadata = {
  title: "Level Up My Reality | DreamXP Gaming",
  description:
    "Join the ultimate gaming quest. Help a passionate gamer unlock their PS5 dream and become part of an epic gaming journey.",
  openGraph: {
    title: "Level Up My Reality | DreamXP Gaming",
    description:
      "Every gamer deserves their dream setup. Be part of the story.",
    type: "website",
    images: [
      {
        url: "/og-dreamxp.jpg",
        width: 1200,
        height: 630,
        alt: "DreamXP Gaming - Level Up My Reality",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Level Up My Reality | DreamXP Gaming",
    description: "Join the ultimate gaming quest. Support a PS5 dream.",
  },
};

export default function DreamXPPage() {
  return (
    <div className={`${russoOne.variable} ${chakraPetch.variable}`}>
      <DreamXPClient />
    </div>
  );
}
