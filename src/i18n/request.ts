import { hasLocale } from "next-intl"
import { getRequestConfig } from "next-intl/server"

import type { Messages } from "@/messages/merge-messages"
import type { Locale } from "@/shared/types/platform"
import { routing } from "./routing"

const messageLoaders = {
  en: () => import("@/messages/en"),
  it: () => import("@/messages/it"),
  ar: () => import("@/messages/ar"),
} satisfies Record<Locale, () => Promise<{ default: Messages }>>

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  return {
    locale,
    timeZone: "Europe/Rome",
    messages: (await messageLoaders[locale]()).default,
  }
})
