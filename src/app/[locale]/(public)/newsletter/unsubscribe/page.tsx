import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { unsubscribePublicNewsletterFormAction } from "@/features/public/actions/public-forms.actions"
import type { Locale } from "@/shared/types/platform"

const copy = {
  en: [
    "Unsubscribe from Buildink",
    "You will stop receiving marketing emails.",
    "Unsubscribe",
  ],
  it: [
    "Annulla l’iscrizione a Buildink",
    "Non riceverai più email di marketing.",
    "Annulla iscrizione",
  ],
  ar: [
    "إلغاء الاشتراك من Buildink",
    "ستتوقف عن تلقي رسائل التسويق.",
    "إلغاء الاشتراك",
  ],
  ro: [
    "Dezabonare de la Buildink",
    "Nu vei mai primi e-mailuri de marketing.",
    "Dezabonează-mă",
  ],
  sq: [
    "Çabonohu nga Buildink",
    "Nuk do të marrësh më email marketingu.",
    "Çabonohem",
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
  const text = copy[locale]
  return (
    <div className="page-container py-20">
      <Card className="mx-auto max-w-xl rounded-[30px] p-8 text-center">
        <h1 className="text-brand-navy text-3xl font-bold">{text[0]}</h1>
        <p className="text-muted mt-3">{text[1]}</p>
        <form action={unsubscribePublicNewsletterFormAction} className="mt-6">
          <input type="hidden" name="token" value={token ?? ""} />
          <Button type="submit" disabled={!token}>
            {text[2]}
          </Button>
        </form>
      </Card>
    </div>
  )
}
