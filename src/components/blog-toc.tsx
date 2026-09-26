"use client";

import dynamic from "next/dynamic";

// Renders nothing until headings are measured client-side, so skip SSR and keep motion out of the initial bundle.
const DynamicIslandTOC = dynamic(
  () => import("@/components/ui/dynamic-island-toc").then((m) => m.DynamicIslandTOC),
  { ssr: false },
);

export function BlogTOC() {
  return <DynamicIslandTOC />;
}
