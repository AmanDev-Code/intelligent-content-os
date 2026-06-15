import type { Metadata } from "next";
import { credentialPageMetadata } from "@/lib/credentialPageMetadata";

export const metadata: Metadata = credentialPageMetadata;

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
