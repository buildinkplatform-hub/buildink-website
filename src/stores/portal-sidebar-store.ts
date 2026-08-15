"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface PortalSidebarState {
  collapsed: boolean
  toggle: () => void
}

export const usePortalSidebarStore = create<PortalSidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((state) => ({ collapsed: !state.collapsed })),
    }),
    { name: "buildink-portal-sidebar" },
  ),
)
