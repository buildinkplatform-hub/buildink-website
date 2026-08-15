"use client"

import { create } from "zustand"

interface PortalNavigationState {
  pending: boolean
  start: () => void
  finish: () => void
}

export const usePortalNavigationStore = create<PortalNavigationState>((set) => ({
  pending: false,
  start: () => set({ pending: true }),
  finish: () => set({ pending: false }),
}))
