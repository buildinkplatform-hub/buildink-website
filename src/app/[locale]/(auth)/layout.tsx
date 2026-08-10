import type { Metadata } from "next"

import { AuthShell } from "@/features/auth/components/auth-shell"
import { FreshPageGuard } from "@/features/auth/components/fresh-page-guard"

export const metadata: Metadata = { robots: { index: false, follow: false } }
export const dynamic = "force-dynamic"
export const revalidate = 0

export default function AuthenticationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthShell>
      <FreshPageGuard />
      {children}
    </AuthShell>
  )
}
