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

  // Keep route transitions consistent with the Admin workspace: preserve the
  // old screen while Next prepares the next segment, then use a short motion
  // cue instead of a full-page flash or blank state.
  return (
    <motion.div
      key={pathname}
      className="mx-auto w-full max-w-[1680px]"
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
