import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import type { Locale } from "@/shared/types/platform"

export async function directoryMetadata(
  titleKey: string,
  locale: Locale,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "publicSite" })
  return {
    title: t(`pages.${titleKey}.title`),
    description: t(`pages.${titleKey}.description`),
  }
}
