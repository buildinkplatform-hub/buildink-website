import type { Metadata } from "next"

import "@/styles/globals.css"

export const metadata: Metadata = {
  title: "Offline | Buildink",
  robots: { index: false, follow: false },
}

export default function OfflineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  )
}
