import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { PublicContentPage } from "@/features/public/content/components/public-content-pages"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("publicSite")
  return {
    title: t("pages.contact.title"),
    description: t("pages.contact.description"),
  }
}

export default function ContactPage() {
  return <PublicContentPage type="contact" />
}
