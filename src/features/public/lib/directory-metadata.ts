import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

export async function directoryMetadata(titleKey: string): Promise<Metadata> {
  const t = await getTranslations("publicSite")
  return {
    title: t(`pages.${titleKey}.title`),
    description: t(`pages.${titleKey}.description`),
  }
}
