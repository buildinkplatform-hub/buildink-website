import { Star } from "lucide-react"
import { getFormatter, getTranslations } from "next-intl/server"

import { Card } from "@/components/ui/card"
import { listMyReviews } from "@/features/dashboard/data/portal-client"

type ReviewStatus = "PENDING" | "PUBLISHED" | "HIDDEN" | "REMOVED"

function asReviewStatus(value: string): ReviewStatus | null {
  switch (value.toUpperCase()) {
    case "PENDING":
    case "PUBLISHED":
    case "HIDDEN":
    case "REMOVED":
      return value.toUpperCase() as ReviewStatus
    default:
      return null
  }
}

function statusCopy(
  t: (key: "pending" | "published" | "hidden" | "removed") => string,
  status: ReviewStatus,
) {
  switch (status) {
    case "PENDING":
      return t("pending")
    case "PUBLISHED":
      return t("published")
    case "HIDDEN":
      return t("hidden")
    case "REMOVED":
      return t("removed")
    default: {
      const exhaustive: never = status
      return exhaustive
    }
  }
}

export async function MyReviewsPanel() {
  const t = await getTranslations("dashboard.myReviews")
  const format = await getFormatter()
  const result = await listMyReviews({ page: 1, pageSize: 20 })

  return (
    <Card className="p-6 shadow-sm">
      <h2 className="text-brand-navy font-bold">{t("title")}</h2>
      {result.items.length ? (
        <ul className="mt-5 space-y-3">
          {result.items.map((item) => {
            const status = asReviewStatus(item.status)
            return (
              <li
                key={item.id}
                className="rounded-xl border border-slate-100 bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-brand-navy font-semibold">
                      {item.title || item.targetName}
                    </p>
                    <p className="text-muted mt-1 text-sm">{item.targetName}</p>
                  </div>
                  <span className="text-muted inline-flex items-center gap-1 text-sm font-semibold">
                    <Star className="fill-primary text-primary size-4" />
                    {t("stars", { rating: item.rating })}
                  </span>
                </div>
                <p className="text-muted mt-3 text-sm leading-6">
                  {item.comment}
                </p>
                <p className="text-muted mt-3 text-xs font-semibold">
                  {status ? statusCopy(t, status) : item.status}
                  {" · "}
                  {format.dateTime(new Date(item.createdAt), {
                    dateStyle: "medium",
                  })}
                </p>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-muted mt-4 text-sm">{t("empty")}</p>
      )}
    </Card>
  )
}
