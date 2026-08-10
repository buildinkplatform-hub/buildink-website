import type { Metadata } from "next"

import { PublicPlaceholder } from "@/features/home/components/public-placeholder"

export const metadata: Metadata = { robots: { index: true, follow: true } }

export default function HomePage() {
  return <PublicPlaceholder />
}
