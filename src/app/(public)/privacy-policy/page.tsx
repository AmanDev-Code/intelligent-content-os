import { permanentRedirect } from "next/navigation";

export default function PrivacyPolicyRedirect() {
  permanentRedirect("/legal/privacy");
}
