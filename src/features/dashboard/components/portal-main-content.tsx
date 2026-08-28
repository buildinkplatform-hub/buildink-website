"use client"

import { motion, useReducedMotion } from "motion/react"
import { useEffect } from "react"

import { usePathname } from "@/i18n/navigation"
import { usePortalNavigationStore } from "@/stores/portal-navigation-store"

export function PortalMainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const finish = usePortalNavigationStore((state) => state.finish)
  const reduced = useReducedMotion()

  useEffect(() => {
    finish()
  }, [pathname, finish])

  // Keep the previous route interactive while Next prepares the next segment.
  // The route swap uses only a short opacity transition so navigation does not
  // feel like a full page reload on slower authenticated data requests.
  return (
    <motion.div
      key={pathname}
      className="mx-auto w-full max-w-[1460px]"
      initial={reduced ? false : { opacity: 0.72 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
