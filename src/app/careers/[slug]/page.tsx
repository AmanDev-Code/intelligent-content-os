"use client";

import { useParams } from "next/navigation";
import CareerJobPage from "@/views/CareerJobPage";

export default function Page() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  if (!slug) return null;
  return <CareerJobPage slug={slug} />;
}
