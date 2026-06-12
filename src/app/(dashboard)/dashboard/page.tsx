"use client";

import { Suspense } from "react";
import Dashboard from "@/views/Dashboard";

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <Dashboard />
    </Suspense>
  );
}
