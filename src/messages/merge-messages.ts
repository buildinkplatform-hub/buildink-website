export type MessageValue = string | Messages
export interface Messages {
  [key: string]: MessageValue
}

function isMessageGroup(value: unknown): value is Messages {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function mergeInto(target: Messages, source: Messages, path = "") {
  for (const [key, value] of Object.entries(source)) {
    const keyPath = path ? `${path}.${key}` : key
    if (!(key in target)) {
      target[key] = isMessageGroup(value) ? mergeMessages(value) : value
      continue
    }

    const existing = target[key]

    if (isMessageGroup(existing) && isMessageGroup(value)) {
      mergeInto(existing, value, keyPath)
      continue
    }

    throw new Error(`Duplicate translation key: ${keyPath}`)
  }
}

export function mergeMessages(...catalogs: Messages[]): Messages {
  const messages: Messages = {}

  for (const catalog of catalogs) mergeInto(messages, catalog)

  return messages
}
