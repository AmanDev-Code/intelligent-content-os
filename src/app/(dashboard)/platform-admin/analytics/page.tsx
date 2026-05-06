import { redirect } from "next/navigation";

export default function LegacyPlatformAdminAnalyticsRedirect() {
  redirect("/admin/users?tab=overview");
}
