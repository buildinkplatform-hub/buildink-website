import { CheckCircle2, CircleAlert } from "lucide-react"
import { Card } from "@/components/ui/card"
import { confirmPublicNewsletterAction } from "@/features/public/actions/public-forms.actions"
import type { Locale } from "@/shared/types/platform"

const copy = {
  en: [
    "Subscription confirmed",
    "Your email is confirmed and can now receive Buildink updates.",
    "The confirmation link is invalid or has expired.",
  ],
  it: [
    "Iscrizione confermata",
    "La tua email è confermata e può ricevere gli aggiornamenti Buildink.",
    "Il link di conferma non è valido o è scaduto.",
  ],
  ar: [
    "تم تأكيد الاشتراك",
    "تم تأكيد بريدك ويمكنه الآن تلقي تحديثات Buildink.",
    "رابط التأكيد غير صالح أو انتهت صلاحيته.",
  ],
  ro: [
    "Abonare confirmată",
    "Adresa ta este confirmată și poate primi noutăți Buildink.",
    "Linkul de confirmare este invalid sau a expirat.",
  ],
  sq: [
    "Abonimi u konfirmua",
    "Emaili yt u konfirmua dhe mund të marrë përditësime nga Buildink.",
    "Lidhja e konfirmimit është e pavlefshme ose ka skaduar.",
  ],
} satisfies Record<Locale, string[]>

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ token?: string }>
}) {
  const [{ locale }, { token }] = await Promise.all([params, searchParams])
  const result = token
    ? await confirmPublicNewsletterAction(token)
    : { ok: false as const }
  const text = copy[locale]
  const Icon = result.ok ? CheckCircle2 : CircleAlert
  return (
    <div className="page-container py-20">
      <Card className="mx-auto max-w-xl rounded-[30px] p-8 text-center">
        <Icon
          className={`mx-auto size-12 ${result.ok ? "text-success" : "text-destructive"}`}
        />
        <h1 className="text-brand-navy mt-5 text-3xl font-bold">
          {result.ok ? text[0] : text[2]}
        </h1>
        {result.ok ? <p className="text-muted mt-3">{text[1]}</p> : null}
      </Card>
    </div>
  )
}
