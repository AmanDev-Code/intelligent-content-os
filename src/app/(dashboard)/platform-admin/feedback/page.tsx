import { redirect } from "next/navigation";

export default function LegacyPlatformAdminFeedbackRedirect() {
  redirect("/admin/feedback");
}
