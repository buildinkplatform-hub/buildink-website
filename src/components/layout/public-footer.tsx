import { getTranslations } from "next-intl/server"

import { BrandLogo } from "@/components/shared/brand-logo"
import { footerColumns } from "@/features/public/config/public-site.config"
import { Link } from "@/i18n/navigation"

export async function PublicFooter() {
  const t = await getTranslations("publicSite")
  const home = await getTranslations("public")

  return (
    <footer className="border-t bg-brand-navy py-14 text-white">
      <div className="page-container grid gap-10 lg:grid-cols-[1.35fr_1fr_1fr_1fr_1fr]">
        <div className="max-w-sm space-y-4">
          <BrandLogo className="rounded-xl bg-white p-1.5" />
          <p className="mt-4 text-sm leading-6 text-white/65">
            {t("footer.note")}
          </p>
          <p className="text-sm leading-6 text-white/55">
            {t("footer.details")}
          </p>
        </div>
        {footerColumns.map((column) => (
          <div key={column.key}>
            <h2 className="text-sm font-semibold tracking-[0.08em] uppercase text-white/90">
              {t(column.labelKey)}
            </h2>
            <div className="mt-4 h-px w-16 bg-white/15" />
            <div className="mt-4 space-y-3">
              {column.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-sm text-white/70 transition hover:text-white"
                >
                  {t(item.labelKey)}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="page-container mt-10 border-t border-white/10 pt-6 text-xs text-white/55">
        {home("copyright")}
      </div>
    </footer>
  )
}
