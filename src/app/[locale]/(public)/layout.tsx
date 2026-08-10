import { PublicFooter } from "@/components/layout/public-footer"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicCookieBanner } from "@/features/public/components/public-cookie-banner"
import { getTranslations } from "next-intl/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = await getTranslations("publicSite")
  return (
    <>
      <PublicHeader />
      {children}
      <PublicFooter />
      <PublicCookieBanner
        title={t("cookiesBanner.title")}
        body={t("cookiesBanner.body")}
        acceptLabel={t("cookiesBanner.accept")}
        manageLabel={t("cookiesBanner.manage")}
      />
    </>
  )
}
