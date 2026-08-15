import { Star } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PublicReviewForm } from "@/features/public/components/public-review-form"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/shared/types/platform"
import type {
  PublicReview,
  PublicReviewSummary,
  PublicReviewTarget,
  ReviewEligibility,
  ReviewEligibilityReason,
} from "@/features/public/types/public.types"

function eligibilityCopy(
  t: Awaited<ReturnType<typeof getTranslations>>,
  reason: ReviewEligibilityReason,
) {
  switch (reason) {
    case "self_target":
      return t("userReviews.selfTarget")
    case "already_reviewed":
      return t("userReviews.alreadyReviewed")
    case "not_eligible":
      return t("userReviews.ineligibleBody")
    case "verified_engagement":
    case "verified_interaction":
      return null
    default: {
      const exhaustive: never = reason
      return exhaustive
    }
  }
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={
            value <= rating
              ? "size-4 fill-primary text-primary"
              : "size-4 text-slate-300"
          }
        />
      ))}
    </div>
  )
}

export async function PublicReviewsPanel({
  target,
  locale,
  signedIn,
  loginHref,
  reviews,
  eligibility,
}: {
  target: PublicReviewTarget
  locale: Locale
  signedIn: boolean
  loginHref: string
  reviews: { items: PublicReview[]; summary: PublicReviewSummary } | null
  eligibility: ReviewEligibility | null
}) {
  const t = await getTranslations("publicSite")
  const items = reviews?.items ?? []
  const summary = reviews?.summary ?? {
    average: 0,
    count: 0,
    histogram: [1, 2, 3, 4, 5].map((rating) => ({ rating, count: 0 })),
  }
  const blockedReason = eligibility
    ? eligibilityCopy(t, eligibility.reason)
    : null

  return (
    <Card className="rounded-[30px] border-white/70 p-6 shadow-[var(--shadow-card)] sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-brand-navy text-2xl font-bold">
            {t("userReviews.title")}
          </h2>
          <p className="text-muted mt-2 text-sm leading-6">
            {t("userReviews.subtitle")}
          </p>
        </div>
        <div className="text-end">
          <p className="text-brand-navy text-2xl font-bold">
            {summary.count > 0
              ? t("userReviews.average", {
                  rating: summary.average.toFixed(1),
                })
              : "—"}
          </p>
          <p className="text-muted text-sm">
            {t("userReviews.count", { count: summary.count })}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-[linear-gradient(180deg,#fff_0%,#f6f9ff_100%)] p-5">
          <p className="text-brand-navy font-semibold">
            {t("userReviews.emptyTitle")}
          </p>
          <p className="text-muted mt-2 text-sm leading-6">
            {t("userReviews.emptyBody")}
          </p>
        </div>
      ) : (
        <>
          <p className="text-brand-navy mt-6 text-sm font-semibold">
            {t("userReviews.histogram")}
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-5">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count =
                summary.histogram.find((item) => item.rating === rating)
                  ?.count ?? 0
              const percent = summary.count
                ? Math.round((count / summary.count) * 100)
                : 0
              return (
                <div
                  key={rating}
                  className="rounded-2xl border border-slate-100 bg-white p-3"
                >
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{t("userReviews.histogramStar", { count: rating })}</span>
                    <span>{count}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="bg-primary h-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <ul className="mt-6 space-y-4">
          {items.map((review) => (
            <li
              key={review.id}
              className="rounded-2xl border border-slate-100 bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-brand-navy font-semibold">
                  {review.authorDisplayName}
                </p>
                <StarRow rating={review.rating} />
              </div>
              {review.title ? (
                <p className="text-brand-navy mt-2 text-sm font-semibold">
                  {review.title}
                </p>
              ) : null}
              <p className="text-muted mt-2 text-sm leading-6">{review.comment}</p>
              {review.verifiedEngagement ? (
                <p className="text-primary mt-3 text-xs font-semibold">
                  {t("userReviews.verifiedBadge")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
        </>
      )}

      <div className="mt-8 border-t border-slate-100 pt-6">
        {signedIn && eligibility?.eligible ? (
          <PublicReviewForm
            targetType={target.type}
            targetId={target.id}
            locale={locale}
            labels={{
              formTitle: t("userReviews.formTitle"),
              rating: t("userReviews.rating"),
              starLabel: t("userReviews.starLabel"),
              titleLabel: t("userReviews.titleLabel"),
              comment: t("userReviews.comment"),
              locale: t("userReviews.locale"),
              submit: t("userReviews.submit"),
              success: t("userReviews.success"),
              pendingTitle: t("userReviews.pendingTitle"),
              pendingBody: t("userReviews.pendingBody"),
            }}
          />
        ) : null}
        {signedIn && !eligibility?.eligible ? (
          <div>
            <p className="text-brand-navy font-semibold">
              {t("userReviews.ineligible")}
            </p>
            <p className="text-muted mt-2 text-sm leading-6">
              {blockedReason ?? t("userReviews.ineligibleBody")}
            </p>
          </div>
        ) : null}
        {!signedIn ? (
          <div>
            <p className="text-brand-navy font-semibold">
              {t("userReviews.signIn")}
            </p>
            <p className="text-muted mt-2 text-sm leading-6">
              {t("userReviews.signInBody")}
            </p>
            <div className="mt-4">
              <Button asChild>
                <Link href={{ pathname: "/login", query: { next: loginHref } }}>
                  {t("userReviews.signIn")}
                </Link>
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  )
}
