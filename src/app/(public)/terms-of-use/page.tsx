import { permanentRedirect } from "next/navigation";

export default function TermsOfUseRedirect() {
  permanentRedirect("/legal/terms");
}
