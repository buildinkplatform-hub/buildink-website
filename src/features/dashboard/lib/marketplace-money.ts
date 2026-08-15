export function eurosToMinor(value: string) {
  const amount = Number(value.replace(",", "."))
  if (!Number.isFinite(amount) || amount < 0) return ""
  return String(Math.round(amount * 100))
}

export function minorToEuros(value?: string | null) {
  if (!value) return ""
  return String(Number(value) / 100)
}

export function jsonNotes(value: unknown) {
  if (value && typeof value === "object" && "notes" in value) {
    return String((value as { notes?: unknown }).notes ?? "")
  }
  if (typeof value === "string") return value
  return ""
}

export function notesRecord(value: string) {
  const notes = value.trim()
  return notes ? { notes } : {}
}

export function dateInputValue(value?: string | null) {
  return value?.slice(0, 10) ?? ""
}

export function datetimeInputValue(value?: string | null) {
  return value?.slice(0, 16) ?? ""
}

export function toIsoDateTime(value: string) {
  if (!value) return undefined
  return new Date(value).toISOString()
}
