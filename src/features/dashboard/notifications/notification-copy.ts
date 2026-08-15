type Translator = {
  (key: string): string
  has: (key: string) => boolean
}

export function portalNotificationTitle(t: object, type: string) {
  const translator = t as Translator
  const key = type.replaceAll(".", "_")
  return translator.has(key) ? translator(key) : label(type)
}

export function label(value: string) {
  return value
    .replaceAll(".", " · ")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function portalNotificationHref(actionUrl: string | null) {
  if (!actionUrl) return "/dashboard/notifications"
  if (actionUrl.startsWith("/dashboard")) return actionUrl
  if (actionUrl.startsWith("http")) {
    try {
      const url = new URL(actionUrl)
      if (url.pathname.includes("/dashboard")) {
        return `${url.pathname}${url.search}`
      }
    } catch {
      return "/dashboard/notifications"
    }
  }
  return "/dashboard/notifications"
}
