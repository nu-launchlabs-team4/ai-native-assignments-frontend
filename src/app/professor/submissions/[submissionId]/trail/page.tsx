import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/PagePlaceholder";

export const metadata: Metadata = { title: "Full trail" };

export default function TrailPage() {
  return (
    <PagePlaceholder
      title="Full trail"
      description="The student's full trail, in order, arrives in issue #12."
    />
  );
}
