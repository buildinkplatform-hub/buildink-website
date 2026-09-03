import { getLocale, getTranslations } from "next-intl/server"

import { PublicFooter } from "@/components/layout/public-footer"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicCookieBanner } from "@/features/public/components/public-cookie-banner"
import type { Locale } from "@/shared/types/platform"

export const instant = false

const consentLabels: Record<Locale, { accept: string; reject: string }> = {
  it: { accept: "Accetta tutto", reject: "Rifiuta tutto" },
  en: { accept: "Accept all", reject: "Reject all" },
  ar: { accept: "قبول الكل", reject: "رفض الكل" },
  ro: { accept: "Acceptă tot", reject: "Respinge tot" },
  sq: { accept: "Prano të gjitha", reject: "Refuzo të gjitha" },
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = await getTranslations("publicSite")
  const locale = (await getLocale()) as Locale
  const consent = consentLabels[locale]
  return (
    <>
      <PublicHeader />
      {children}
      <PublicFooter />
      <PublicCookieBanner
        title={t("cookiesBanner.title")}
        body={t("cookiesBanner.body")}
        acceptLabel={consent.accept}
        rejectLabel={consent.reject}
        manageLabel={t("cookiesBanner.manage")}
      />
    </>
  )
}
