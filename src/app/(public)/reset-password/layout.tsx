import type { Metadata } from "next";
import { credentialPageMetadata } from "@/lib/credentialPageMetadata";

export const metadata: Metadata = credentialPageMetadata;

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
