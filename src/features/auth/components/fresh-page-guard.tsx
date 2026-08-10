"use client"

import { useEffect } from "react"

export function FreshPageGuard() {
  useEffect(() => {
    function refreshRestoredPage(event: PageTransitionEvent) {
      if (event.persisted) window.location.reload()
    }

    window.addEventListener("pageshow", refreshRestoredPage)
    return () => window.removeEventListener("pageshow", refreshRestoredPage)
  }, [])

  return null
}
