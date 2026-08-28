"use client"

import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  submitPublicContactAction,
  type PublicContactCategory,
} from "@/features/public/actions/public-forms.actions"
import type { Locale } from "@/shared/types/platform"

const contactCopy = {
  en: {
    phone: "Phone number (optional)",
    category: "Contact category",
    profileType: "Profile type (optional)",
    referenceUrl: "Relevant URL (optional)",
    referenceItemId: "Relevant item ID (optional)",
    illegalTitle: "Illegal content / abuse details",
    illegalReason: "Why is this content illegal or abusive?",
    legalBasis: "Law or right you believe is affected",
    evidenceContext: "Evidence or additional context (optional)",
    goodFaith:
      "I confirm in good faith that the information in this report is accurate to the best of my knowledge.",
    categories: {
      ACCOUNT: "Account",
      VERIFICATION: "Verification",
      PROJECT_TENDER_BID: "Project / tender / bid",
      PRIVACY_DATA_RIGHTS: "Privacy / data rights",
      ILLEGAL_CONTENT_ABUSE: "Illegal content / abuse",
      GENERAL_SUPPORT: "General support",
    },
    profileTypes: {
      individual: "Individual",
      project_owner: "Project owner",
      worker: "Worker",
      contractor_company: "Contractor / company",
      subcontractor: "Subcontractor",
      supplier: "Supplier",
      service_provider: "Service provider",
      other: "Other",
    },
  },
  it: {
    phone: "Numero di telefono (facoltativo)",
    category: "Categoria di contatto",
    profileType: "Tipo di profilo (facoltativo)",
    referenceUrl: "URL pertinente (facoltativo)",
    referenceItemId: "ID dell'elemento pertinente (facoltativo)",
    illegalTitle: "Dettagli su contenuti illegali / abusi",
    illegalReason: "Perché ritieni che il contenuto sia illegale o abusivo?",
    legalBasis: "Norma o diritto che ritieni violato",
    evidenceContext: "Prove o contesto aggiuntivo (facoltativo)",
    goodFaith:
      "Confermo in buona fede che le informazioni contenute in questa segnalazione sono accurate per quanto a mia conoscenza.",
    categories: {
      ACCOUNT: "Account",
      VERIFICATION: "Verifica",
      PROJECT_TENDER_BID: "Progetto / gara / offerta",
      PRIVACY_DATA_RIGHTS: "Privacy / diritti sui dati",
      ILLEGAL_CONTENT_ABUSE: "Contenuti illegali / abusi",
      GENERAL_SUPPORT: "Assistenza generale",
    },
    profileTypes: {
      individual: "Individuo",
      project_owner: "Proprietario di progetto",
      worker: "Lavoratore",
      contractor_company: "Impresa / appaltatore",
      subcontractor: "Subappaltatore",
      supplier: "Fornitore",
      service_provider: "Prestatore di servizi",
      other: "Altro",
    },
  },
  ar: {
    phone: "رقم الهاتف (اختياري)",
    category: "فئة التواصل",
    profileType: "نوع الملف الشخصي (اختياري)",
    referenceUrl: "الرابط ذي الصلة (اختياري)",
    referenceItemId: "معرّف العنصر ذي الصلة (اختياري)",
    illegalTitle: "تفاصيل المحتوى غير القانوني / الإساءة",
    illegalReason: "لماذا تعتقد أن هذا المحتوى غير قانوني أو مسيء؟",
    legalBasis: "القانون أو الحق الذي تعتقد أنه قد تم انتهاكه",
    evidenceContext: "الأدلة أو السياق الإضافي (اختياري)",
    goodFaith:
      "أؤكد بحسن نية أن المعلومات الواردة في هذا البلاغ صحيحة حسب أفضل ما لدي من معرفة.",
    categories: {
      ACCOUNT: "الحساب",
      VERIFICATION: "التحقق",
      PROJECT_TENDER_BID: "مشروع / مناقصة / عرض",
      PRIVACY_DATA_RIGHTS: "الخصوصية / حقوق البيانات",
      ILLEGAL_CONTENT_ABUSE: "محتوى غير قانوني / إساءة",
      GENERAL_SUPPORT: "الدعم العام",
    },
    profileTypes: {
      individual: "فرد",
      project_owner: "مالك مشروع",
      worker: "عامل",
      contractor_company: "مقاول / شركة",
      subcontractor: "مقاول من الباطن",
      supplier: "مورد",
      service_provider: "مقدم خدمة",
      other: "أخرى",
    },
  },
  ro: {
    phone: "Număr de telefon (opțional)",
    category: "Categoria solicitării",
    profileType: "Tip de profil (opțional)",
    referenceUrl: "URL relevant (opțional)",
    referenceItemId: "ID relevant al elementului (opțional)",
    illegalTitle: "Detalii despre conținut ilegal / abuz",
    illegalReason:
      "De ce considerați că acest conținut este ilegal sau abuziv?",
    legalBasis: "Legea sau dreptul despre care considerați că este afectat",
    evidenceContext: "Dovezi sau context suplimentar (opțional)",
    goodFaith:
      "Confirm cu bună-credință că informațiile din această sesizare sunt corecte după cunoștințele mele.",
    categories: {
      ACCOUNT: "Cont",
      VERIFICATION: "Verificare",
      PROJECT_TENDER_BID: "Proiect / licitație / ofertă",
      PRIVACY_DATA_RIGHTS: "Confidențialitate / drepturi privind datele",
      ILLEGAL_CONTENT_ABUSE: "Conținut ilegal / abuz",
      GENERAL_SUPPORT: "Asistență generală",
    },
    profileTypes: {
      individual: "Persoană fizică",
      project_owner: "Proprietar de proiect",
      worker: "Lucrător",
      contractor_company: "Contractant / companie",
      subcontractor: "Subcontractant",
      supplier: "Furnizor",
      service_provider: "Furnizor de servicii",
      other: "Altul",
    },
  },
  sq: {
    phone: "Numri i telefonit (opsional)",
    category: "Kategoria e kontaktit",
    profileType: "Lloji i profilit (opsional)",
    referenceUrl: "URL-ja përkatëse (opsionale)",
    referenceItemId: "ID-ja e elementit përkatës (opsionale)",
    illegalTitle: "Detajet për përmbajtje të paligjshme / abuzim",
    illegalReason:
      "Pse mendoni se kjo përmbajtje është e paligjshme ose abuzive?",
    legalBasis: "Ligji ose e drejta që mendoni se është cenuar",
    evidenceContext: "Prova ose kontekst shtesë (opsional)",
    goodFaith:
      "Konfirmoj me mirëbesim se informacioni në këtë raport është i saktë sipas njohurive të mia më të mira.",
    categories: {
      ACCOUNT: "Llogaria",
      VERIFICATION: "Verifikimi",
      PROJECT_TENDER_BID: "Projekt / tender / ofertë",
      PRIVACY_DATA_RIGHTS: "Privatësia / të drejtat e të dhënave",
      ILLEGAL_CONTENT_ABUSE: "Përmbajtje e paligjshme / abuzim",
      GENERAL_SUPPORT: "Mbështetje e përgjithshme",
    },
    profileTypes: {
      individual: "Individ",
      project_owner: "Pronar projekti",
      worker: "Punëtor",
      contractor_company: "Kontraktor / kompani",
      subcontractor: "Nënkontraktor",
      supplier: "Furnitor",
      service_provider: "Ofrues shërbimi",
      other: "Tjetër",
    },
  },
} as const

const categories = [
  "ACCOUNT",
  "VERIFICATION",
  "PROJECT_TENDER_BID",
  "PRIVACY_DATA_RIGHTS",
  "ILLEGAL_CONTENT_ABUSE",
  "GENERAL_SUPPORT",
] as const satisfies readonly PublicContactCategory[]

const profileTypes = [
  "individual",
  "project_owner",
  "worker",
  "contractor_company",
  "subcontractor",
  "supplier",
  "service_provider",
  "other",
] as const

export function PublicContactForm({
  nameLabel,
  emailLabel,
  messageLabel,
  action,
  success,
  locale,
}: {
  nameLabel: string
  emailLabel: string
  messageLabel: string
  action: string
  success: string
  locale: Locale
}) {
  const [done, setDone] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] =
    useState<PublicContactCategory>("GENERAL_SUPPORT")
  const copy = contactCopy[locale]
  const illegalReport = category === "ILLEGAL_CONTENT_ABUSE"

  if (done) {
    return (
      <div
        className="border-success/20 bg-success/5 text-brand-navy flex items-start gap-3 rounded-2xl border p-4 font-semibold"
        role="status"
      >
        <CheckCircle2 className="text-success mt-0.5 size-5 shrink-0" />
        <span>{success}</span>
      </div>
    )
  }

  return (
    <form
      className="mt-6 grid gap-5 sm:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault()
        if (pending) return
        setPending(true)
        setError(null)
        try {
          const form = new FormData(event.currentTarget)
          const result = await submitPublicContactAction({
            name: String(form.get("name") ?? ""),
            email: String(form.get("email") ?? ""),
            phone: String(form.get("phone") ?? "") || undefined,
            category,
            profileType: String(form.get("profileType") ?? "") || undefined,
            referenceUrl: String(form.get("referenceUrl") ?? "") || undefined,
            referenceItemId:
              String(form.get("referenceItemId") ?? "") || undefined,
            message: String(form.get("message") ?? ""),
            illegalReason: String(form.get("illegalReason") ?? "") || undefined,
            legalBasis: String(form.get("legalBasis") ?? "") || undefined,
            evidenceContext:
              String(form.get("evidenceContext") ?? "") || undefined,
            goodFaith: form.get("goodFaith") === "on",
            locale,
          })
          if (result.ok) {
            setDone(true)
            setError(null)
          } else {
            setError(result.message)
          }
        } finally {
          setPending(false)
        }
      }}
    >
      <label className="text-brand-navy space-y-2 text-sm font-semibold">
        <span>{nameLabel}</span>
        <Input name="name" required autoComplete="name" disabled={pending} />
      </label>
      <label className="text-brand-navy space-y-2 text-sm font-semibold">
        <span>{emailLabel}</span>
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={pending}
        />
      </label>
      <label className="text-brand-navy space-y-2 text-sm font-semibold">
        <span>{copy.phone}</span>
        <Input name="phone" type="tel" autoComplete="tel" disabled={pending} />
      </label>
      <label className="text-brand-navy space-y-2 text-sm font-semibold">
        <span>{copy.category}</span>
        <select
          name="category"
          value={category}
          disabled={pending}
          onChange={(event) =>
            setCategory(event.currentTarget.value as PublicContactCategory)
          }
          className="border-input bg-background focus:border-primary/50 focus:ring-primary/10 h-11 w-full rounded-2xl border px-4 text-sm font-normal transition outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {categories.map((value) => (
            <option key={value} value={value}>
              {copy.categories[value]}
            </option>
          ))}
        </select>
      </label>
      <label className="text-brand-navy space-y-2 text-sm font-semibold">
        <span>{copy.profileType}</span>
        <select
          name="profileType"
          disabled={pending}
          defaultValue=""
          className="border-input bg-background focus:border-primary/50 focus:ring-primary/10 h-11 w-full rounded-2xl border px-4 text-sm font-normal transition outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">—</option>
          {profileTypes.map((value) => (
            <option key={value} value={value}>
              {copy.profileTypes[value]}
            </option>
          ))}
        </select>
      </label>
      <label className="text-brand-navy space-y-2 text-sm font-semibold">
        <span>{copy.referenceItemId}</span>
        <Input name="referenceItemId" disabled={pending} />
      </label>
      <label className="text-brand-navy space-y-2 text-sm font-semibold sm:col-span-2">
        <span>
          {illegalReport
            ? copy.referenceUrl
                .replace(" (optional)", "")
                .replace(" (facoltativo)", "")
                .replace(" (اختياري)", "")
                .replace(" (opțional)", "")
                .replace(" (opsionale)", "")
            : copy.referenceUrl}
        </span>
        <Input
          name="referenceUrl"
          type="url"
          required={illegalReport}
          disabled={pending}
          placeholder="https://"
          className="ltr-content"
        />
      </label>
      <label className="text-brand-navy space-y-2 text-sm font-semibold sm:col-span-2">
        <span>{messageLabel}</span>
        <textarea
          name="message"
          required
          minLength={10}
          disabled={pending}
          className="border-input bg-background focus:border-primary/50 focus:ring-primary/10 min-h-36 w-full resize-y rounded-2xl border px-4 py-3 text-sm font-normal transition outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </label>

      {illegalReport ? (
        <fieldset className="border-danger/15 bg-danger/3 space-y-5 rounded-2xl border p-5 sm:col-span-2">
          <legend className="text-brand-navy px-2 text-base font-bold">
            {copy.illegalTitle}
          </legend>
          <label className="text-brand-navy block space-y-2 text-sm font-semibold">
            <span>{copy.illegalReason}</span>
            <textarea
              name="illegalReason"
              required
              minLength={10}
              disabled={pending}
              className="border-input bg-background focus:border-primary/50 focus:ring-primary/10 min-h-28 w-full resize-y rounded-2xl border px-4 py-3 text-sm font-normal transition outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
          <label className="text-brand-navy block space-y-2 text-sm font-semibold">
            <span>{copy.legalBasis}</span>
            <textarea
              name="legalBasis"
              required
              minLength={3}
              disabled={pending}
              className="border-input bg-background focus:border-primary/50 focus:ring-primary/10 min-h-24 w-full resize-y rounded-2xl border px-4 py-3 text-sm font-normal transition outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
          <label className="text-brand-navy block space-y-2 text-sm font-semibold">
            <span>{copy.evidenceContext}</span>
            <textarea
              name="evidenceContext"
              disabled={pending}
              className="border-input bg-background focus:border-primary/50 focus:ring-primary/10 min-h-24 w-full resize-y rounded-2xl border px-4 py-3 text-sm font-normal transition outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
          <label className="text-muted flex cursor-pointer items-start gap-3 text-sm leading-6">
            <Checkbox name="goodFaith" required disabled={pending} />
            <span>{copy.goodFaith}</span>
          </label>
        </fieldset>
      ) : null}

      {error ? (
        <p className="text-destructive text-sm sm:col-span-2" role="alert">
          {error}
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending} className="min-w-36">
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {action}
        </Button>
      </div>
    </form>
  )
}
