"use client";

import { Suspense } from "react";
import ContentEnginePage from "@/views/ContentEnginePage";

function ContentEngineFallback() {
  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-sm text-muted-foreground">
      Loading Content Engine…
    </div>
  );
}

export default function ContentEngineRoute() {
  return (
    <Suspense fallback={<ContentEngineFallback />}>
      <ContentEnginePage />
    </Suspense>
  );
}
