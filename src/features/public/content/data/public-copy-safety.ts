import type { PublicContentPageView } from "../types/public-content.types"

// Public static copy is intentionally source-controlled. This filter is a final
// publication boundary that prevents internal/editorial review notes from ever
// being rendered to anonymous users, even if they remain in the source copy
// while legal/operational facts are being finalized.
const INTERNAL_EDITORIAL_MARKERS = [
  /\bdraft\b/i,
  /\bbozza\b/i,
  /publication status/i,
  /stato di pubblicazione/i,
  /before publication/i,
  /prima della pubblicazione/i,
  /must be confirmed/i,
  /deve essere confermat/i,
  /must come from .*audit/i,
  /production[- ]domain audit/i,
  /audit (?:live|tecnico|technical)/i,
  /do not publish/i,
  /non pubblicare/i,
  /table to complete/i,
  /elenco da compilare/i,
  /legal review/i,
  /revisione legale/i,
  /privacy review/i,
  /revisione .*privacy/i,
  /final review/i,
  /revisione finale/i,
  /must reflect actual technical use/i,
  /should be processed by/i,
] as const

function containsEditorialMarker(value: string | null | undefined) {
  if (!value) return false
  return INTERNAL_EDITORIAL_MARKERS.some((pattern) => pattern.test(value))
}

function sectionBodyContainsEditorialMarker(
  section: PublicContentPageView["sections"][number],
) {
  return (
    containsEditorialMarker(section.title) ||
    containsEditorialMarker(section.body)
  )
}

export function sanitizePublicStaticPage(
  page: PublicContentPageView,
): PublicContentPageView {
  const safeDescriptionFallback = page.eyebrow?.trim() || page.title
  const description: string = containsEditorialMarker(page.description)
    ? safeDescriptionFallback
    : page.description
  const sections = page.sections
    .filter((section) => !sectionBodyContainsEditorialMarker(section))
    .map((section) => ({
      ...section,
      items: section.items?.filter((item) => !containsEditorialMarker(item)),
    }))

  return {
    ...page,
    description,
    sections,
  }
}

export function containsPublicEditorialMarker(page: PublicContentPageView) {
  return [
    page.description,
    ...page.sections.flatMap((section) => [
      section.title,
      section.body,
      ...(section.items ?? []),
    ]),
  ].some(containsEditorialMarker)
}
