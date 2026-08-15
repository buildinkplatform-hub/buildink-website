import { Suspense } from "react"

import { PortalPageSkeleton } from "@/components/shared/page-skeletons"

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode
}) {
  return <Suspense fallback={<PortalPageSkeleton />}>{children}</Suspense>
}
