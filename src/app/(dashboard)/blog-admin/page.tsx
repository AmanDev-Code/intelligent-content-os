import { redirect } from "next/navigation";

export default function LegacyBlogAdminRedirect() {
  redirect("/admin/content-engine?tab=articles");
}
