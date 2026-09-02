import type { Locale } from "@/shared/types/platform"

import type {
  PublicContentArticleSummaryView,
  PublicContentCollectionView,
} from "../types/public-content.types"

const updatedAt = "2026-08-29"

function article(
  locale: Locale,
  slug: string,
  title: string,
  excerpt: string,
  category: string,
  sections: PublicContentArticleSummaryView["sections"],
): PublicContentArticleSummaryView {
  return {
    contentType: "help",
    slug,
    locale,
    version: 1,
    publishedAt: `${updatedAt}T00:00:00.000Z`,
    updatedAt,
    title,
    excerpt,
    category,
    author: "Buildink Support",
    readingTime: "3 min",
    featuredImageUrl: null,
    sections,
  }
}

const collections: Record<Locale, PublicContentCollectionView> = {
  en: {
    type: "help",
    hero: {
      eyebrow: "Support articles",
      title: "Help center",
      description:
        "Clear answers for account setup, verification, public discovery and protected Buildink workflows.",
    },
    items: [
      article(
        "en",
        "choose-the-right-profile-type",
        "How to choose the right profile type",
        "Choose the account type that matches the work you actually want to do on Buildink.",
        "Account setup",
        [
          {
            id: "match",
            title: "Match the role to your real activity",
            body: "Your account type controls onboarding questions and the portal capabilities available after sign-in. Choose the option that best reflects your normal construction activity.",
          },
          {
            id: "change",
            title: "Need to change later?",
            body: "If your business model changes, contact Buildink support before creating duplicate accounts or company records.",
          },
        ],
      ),
      article(
        "en",
        "verification-guide",
        "Verification guide",
        "Understand verification status, required documents and what a public verification badge means.",
        "Verification",
        [
          {
            id: "documents",
            title: "Upload the documents requested for your account type",
            body: "The Verification page lists the evidence required for the active policy. Keep documents current and replace expired files before requesting another review.",
          },
          {
            id: "badge",
            title: "A badge has clear limits",
            body: "A public verification badge means Buildink reviewed specific information at a point in time. It is not a guarantee of future performance or a substitute for commercial due diligence.",
          },
        ],
      ),
      article(
        "en",
        "public-contact-settings",
        "How public contact settings work",
        "Control which approved contact details appear on your public marketplace profile.",
        "Privacy and visibility",
        [
          {
            id: "visibility",
            title: "Only enabled fields are public",
            body: "Email, phone, exact address and other contact fields remain private unless the relevant visibility setting is enabled.",
          },
          {
            id: "review",
            title: "Review your profile after changes",
            body: "Open your public listing after changing visibility settings and confirm that only the information you intended to publish is visible.",
          },
        ],
      ),
    ],
  },
  it: {
    type: "help",
    hero: {
      eyebrow: "Articoli di assistenza",
      title: "Centro assistenza",
      description:
        "Risposte chiare su configurazione dell'account, verifica, ricerca pubblica e flussi protetti Buildink.",
    },
    items: [
      article(
        "it",
        "scegliere-il-tipo-di-profilo",
        "Come scegliere il tipo di profilo corretto",
        "Scegli il tipo di account che corrisponde al lavoro che svolgi realmente su Buildink.",
        "Configurazione account",
        [
          {
            id: "match",
            title: "Associa il ruolo alla tua attività reale",
            body: "Il tipo di account determina le domande di onboarding e le funzionalità disponibili nel portale dopo l'accesso. Scegli l'opzione che rappresenta meglio la tua attività abituale nel settore edile.",
          },
          {
            id: "change",
            title: "Devi cambiarlo in seguito?",
            body: "Se il modello operativo cambia, contatta l'assistenza Buildink prima di creare account o aziende duplicati.",
          },
        ],
      ),
      article(
        "it",
        "guida-alla-verifica",
        "Guida alla verifica",
        "Comprendi lo stato di verifica, i documenti richiesti e il significato del badge pubblico.",
        "Verifica",
        [
          {
            id: "documents",
            title: "Carica i documenti richiesti per il tuo tipo di account",
            body: "La pagina Verifica mostra le prove richieste dalla policy attiva. Mantieni i documenti aggiornati e sostituisci i file scaduti prima di richiedere una nuova revisione.",
          },
          {
            id: "badge",
            title: "Il badge ha limiti chiari",
            body: "Un badge pubblico indica che Buildink ha verificato informazioni specifiche in un determinato momento. Non garantisce le prestazioni future e non sostituisce le normali verifiche commerciali.",
          },
        ],
      ),
      article(
        "it",
        "impostazioni-contatti-pubblici",
        "Come funzionano le impostazioni dei contatti pubblici",
        "Controlla quali contatti approvati compaiono nel tuo profilo pubblico del marketplace.",
        "Privacy e visibilità",
        [
          {
            id: "visibility",
            title: "Sono pubblici solo i campi abilitati",
            body: "Email, telefono, indirizzo esatto e altri dati di contatto restano privati finché non abiliti la relativa impostazione di visibilità.",
          },
          {
            id: "review",
            title: "Controlla il profilo dopo le modifiche",
            body: "Dopo aver modificato la visibilità, apri il tuo annuncio pubblico e verifica che siano visibili solo le informazioni che intendevi pubblicare.",
          },
        ],
      ),
    ],
  },
  ar: {
    type: "help",
    hero: {
      eyebrow: "مقالات الدعم",
      title: "مركز المساعدة",
      description:
        "إجابات واضحة حول إعداد الحساب والتحقق والاكتشاف العام ومسارات Buildink المحمية.",
    },
    items: [
      article(
        "ar",
        "choose-profile-type",
        "اختيار نوع الملف الشخصي المناسب",
        "اختر نوع الحساب الذي يطابق العمل الذي تريد القيام به فعليًا على Buildink.",
        "إعداد الحساب",
        [
          {
            id: "match",
            title: "اختر الدور الذي يعكس نشاطك",
            body: "نوع الحساب يحدد أسئلة الإعداد والوظائف المتاحة بعد تسجيل الدخول.",
          },
        ],
      ),
      article(
        "ar",
        "verification-guide",
        "دليل التحقق",
        "تعرّف على حالة التحقق والمستندات المطلوبة ومعنى شارة التحقق العامة.",
        "التحقق",
        [
          {
            id: "documents",
            title: "ارفع المستندات المطلوبة",
            body: "تعرض صفحة التحقق الأدلة المطلوبة وفق السياسة النشطة. حافظ على تحديث المستندات واستبدل الملفات المنتهية.",
          },
        ],
      ),
      article(
        "ar",
        "public-contact-settings",
        "إعدادات الاتصال العامة",
        "تحكم في بيانات الاتصال المعتمدة التي تظهر في ملفك العام.",
        "الخصوصية",
        [
          {
            id: "visibility",
            title: "تظهر الحقول المفعلة فقط",
            body: "تبقى بيانات الاتصال الخاصة مخفية ما لم تقم بتمكين إعداد الظهور الخاص بها.",
          },
        ],
      ),
    ],
  },
  ro: {
    type: "help",
    hero: {
      eyebrow: "Articole de asistență",
      title: "Centru de ajutor",
      description:
        "Răspunsuri clare despre configurarea contului, verificare, descoperirea publică și fluxurile protejate Buildink.",
    },
    items: [
      article(
        "ro",
        "alege-tipul-de-profil",
        "Cum alegi tipul potrivit de profil",
        "Alege tipul de cont care corespunde activității pe care vrei să o desfășori pe Buildink.",
        "Configurarea contului",
        [
          {
            id: "match",
            title: "Potrivește rolul cu activitatea reală",
            body: "Tipul contului stabilește întrebările de onboarding și funcțiile disponibile după autentificare.",
          },
        ],
      ),
      article(
        "ro",
        "ghid-verificare",
        "Ghid de verificare",
        "Înțelege starea verificării, documentele necesare și semnificația insignei publice.",
        "Verificare",
        [
          {
            id: "documents",
            title: "Încarcă documentele solicitate",
            body: "Pagina Verificare afișează dovezile cerute de politica activă. Păstrează documentele actualizate.",
          },
        ],
      ),
      article(
        "ro",
        "setari-contact-public",
        "Cum funcționează setările de contact public",
        "Controlează ce date de contact aprobate apar în profilul tău public.",
        "Confidențialitate",
        [
          {
            id: "visibility",
            title: "Doar câmpurile activate sunt publice",
            body: "Datele private rămân ascunse până când activezi setarea de vizibilitate corespunzătoare.",
          },
        ],
      ),
    ],
  },
  sq: {
    type: "help",
    hero: {
      eyebrow: "Artikuj ndihme",
      title: "Qendra e ndihmës",
      description:
        "Përgjigje të qarta për konfigurimin e llogarisë, verifikimin, zbulimin publik dhe rrjedhat e mbrojtura Buildink.",
    },
    items: [
      article(
        "sq",
        "zgjidh-llojin-e-profilit",
        "Si të zgjedhësh llojin e duhur të profilit",
        "Zgjidh llojin e llogarisë që përputhet me punën që dëshiron të bësh në Buildink.",
        "Konfigurimi i llogarisë",
        [
          {
            id: "match",
            title: "Përshtat rolin me aktivitetin real",
            body: "Lloji i llogarisë përcakton pyetjet e regjistrimit dhe funksionet e disponueshme pas hyrjes.",
          },
        ],
      ),
      article(
        "sq",
        "udhezues-verifikimi",
        "Udhëzuesi i verifikimit",
        "Kupto statusin e verifikimit, dokumentet e kërkuara dhe kuptimin e distinktivit publik.",
        "Verifikimi",
        [
          {
            id: "documents",
            title: "Ngarko dokumentet e kërkuara",
            body: "Faqja e Verifikimit tregon provat që kërkon politika aktive. Mbaji dokumentet të përditësuara.",
          },
        ],
      ),
      article(
        "sq",
        "cilësimet-e-kontaktit-publik",
        "Si funksionojnë cilësimet e kontaktit publik",
        "Kontrollo cilat të dhëna kontakti të miratuara shfaqen në profilin publik.",
        "Privatësia",
        [
          {
            id: "visibility",
            title: "Vetëm fushat e aktivizuara janë publike",
            body: "Të dhënat private mbeten të fshehura derisa të aktivizosh cilësimin përkatës të dukshmërisë.",
          },
        ],
      ),
    ],
  },
}

export function getSourceControlledHelpCollection(
  locale: Locale,
): PublicContentCollectionView {
  return collections[locale] ?? collections.en
}

export function getSourceControlledHelpArticle(
  locale: Locale,
  slug: string,
): PublicContentArticleSummaryView | null {
  const collection = getSourceControlledHelpCollection(locale)
  return collection.items.find((item) => item.slug === slug) ?? null
}
