import { redirect } from "next/navigation";

export default function LegacyPlatformAdminUsersRedirect() {
  redirect("/admin/users");
}
