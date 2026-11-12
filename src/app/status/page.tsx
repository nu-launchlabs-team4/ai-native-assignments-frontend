import type { Metadata } from "next";

import { HealthStatus } from "@/components/HealthStatus";
import { PagePlaceholder } from "@/components/PagePlaceholder";
import { env } from "@/lib/env";

export const metadata: Metadata = { title: "Status" };

export default function StatusPage() {
  return (
    <PagePlaceholder
      title="System status"
      description={`Calls /api/health, which Next.js forwards to the backend at ${env.apiUrl}.`}
    >
      <HealthStatus />
    </PagePlaceholder>
  );
}
