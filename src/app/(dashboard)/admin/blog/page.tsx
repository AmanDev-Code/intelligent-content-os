import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ edit?: string; tab?: string; view?: string }>;
};

export default async function AdminBlogRoutePage({ searchParams }: Props) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  params.set("tab", "articles");

  if (sp.edit) params.set("edit", sp.edit);

  if (sp.tab === "editors") params.set("view", "editors");
  else if (sp.tab === "seo") params.set("view", "page-seo");
  else if (sp.view) params.set("view", sp.view);

  redirect(`/admin/content-engine?${params.toString()}`);
}
