"use client"

import { createContext, useContext, useMemo, useState } from "react"

import type { OnboardingDraft } from "@/shared/types/platform"

interface DraftContextValue {
  draft: OnboardingDraft
  loaded: true
  updateDraft: (update: Partial<OnboardingDraft>) => void
  replaceDraft: (draft: OnboardingDraft) => void
  clearDraft: () => void
}

const DraftContext = createContext<DraftContextValue | null>(null)

export function OnboardingProvider({ children, initialDraft }: { children: React.ReactNode; initialDraft: OnboardingDraft }) {
  const [draft, setDraft] = useState(initialDraft)
  const value = useMemo<DraftContextValue>(() => ({
    draft,
    loaded: true,
    updateDraft: (update) => setDraft((current) => ({ ...current, ...update })),
    replaceDraft: setDraft,
    clearDraft: () => undefined,
  }), [draft])
  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>
}

export function useOnboardingDraft() {
  const context = useContext(DraftContext)
  if (!context) throw new Error("useOnboardingDraft must be used inside OnboardingProvider")
  return context
}
