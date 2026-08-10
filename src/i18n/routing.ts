import { defineRouting } from "next-intl/routing"

import { DEFAULT_LOCALE, LOCALE_COOKIE } from "@/shared/constants/platform"
import { locales } from "@/shared/types/platform"

export const routing = defineRouting({
  locales,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
  localeCookie: { name: LOCALE_COOKIE, sameSite: "lax" },
  localeDetection: false,
})
