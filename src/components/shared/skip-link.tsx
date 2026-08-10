import { useTranslations } from "next-intl"

export function SkipLink() {
  const t = useTranslations("common")
  return (
    <a
      href="#main-content"
      className="bg-brand-navy fixed start-4 top-3 z-[100] -translate-y-20 rounded-lg px-4 py-3 text-sm font-semibold text-white focus:translate-y-0"
    >
      {t("skipContent")}
    </a>
  )
}
