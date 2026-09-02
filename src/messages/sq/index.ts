import { mergeMessages } from "../merge-messages"
import authForgotPassword from "./pages/auth/forgot-password.json"
import authLogin from "./pages/auth/login.json"
import authRegister from "./pages/auth/register.json"
import authResetPassword from "./pages/auth/reset-password.json"
import authShared from "./pages/auth/shared.json"
import dashboard from "./pages/dashboard.json"
import supportHeader from "./pages/support-header.json"
import operations from "./pages/operations.json"
import home from "./pages/home.json"
import notFound from "./pages/not-found.json"
import offline from "./pages/offline.json"
import publicSite from "./pages/public-site.json"
import trustPages from "./pages/trust-pages.json"
import portalAlignment from "./pages/portal-alignment.json"
import onboardingDocuments from "./pages/onboarding/documents.json"
import onboardingProfile from "./pages/onboarding/profile.json"
import onboardingReview from "./pages/onboarding/review.json"
import onboardingRole from "./pages/onboarding/role.json"
import onboardingShared from "./pages/onboarding/shared.json"
import common from "./shared/common.json"
import metadata from "./shared/metadata.json"

const publicSiteCustomerCopy = {
  ...publicSite,
  publicSite: {
    ...publicSite.publicSite,
    detail: {
      ...publicSite.publicSite.detail,
      reportHint:
        "Nëse vëren informacion të pasaktë, të pasigurt ose mashtrues, mund ta raportosh te Buildink nga faqja e detajeve.",
    },
    cta: {
      ...publicSite.publicSite.cta,
      body: "Krijo një llogari për ta kthyer zbulimin publik në oferta, aplikime, mesazhe dhe punë të menaxhuar në hapësirën tënde sipas rolit.",
    },
    pages: {
      ...publicSite.publicSite.pages,
      suppliers: {
        ...publicSite.publicSite.pages.suppliers,
        description:
          "Krahaso çfarë ofron secili furnizues, ku operon dhe cilat mënyra kontakti i ka bërë publike.",
      },
      projects: {
        ...publicSite.publicSite.pages.projects,
        description:
          "Shqyrto fushën, kohën, vendndodhjen dhe informacionin publik të buxhetit pa ekspozuar të dhëna private të realizimit.",
      },
      tenders: {
        ...publicSite.publicSite.pages.tenders,
        description:
          "Krahaso burimin, afatin, vendndodhjen dhe mënyrën e dorëzimit përpara se të kalosh në një rrjedhë të mbrojtur ofertimi.",
      },
      howItWorks: {
        ...publicSite.publicSite.pages.howItWorks,
        sectionOneBody:
          "Çdo rol ndjek një rrugë të qartë nga zbulimi publik te aktivitetet e mbrojtura të disponueshme në portalin e tij.",
      },
      verification: {
        ...publicSite.publicSite.pages.verification,
        cards: {
          ...publicSite.publicSite.pages.verification.cards,
          card1Body:
            "Një distinktiv tregon se informacion specifik është kontrolluar në një moment të caktuar; nuk garanton performancën e ardhshme.",
        },
      },
      about: {
        ...publicSite.publicSite.pages.about,
        sectionOneBody:
          "Historia e Buildink lidhet me punën reale të ndërtimit, rolet që shërben dhe problemet praktike që synon të thjeshtojë.",
      },
      contact: {
        ...publicSite.publicSite.pages.contact,
        sectionOneBody:
          "Kontakti me Buildink ndahet sipas temës, me rrugë të qarta për mbështetje, partneritete dhe pyetje të përgjithshme.",
      },
    },
    home: {
      ...publicSite.publicSite.home,
      proofBody:
        "Përvoja publike tregon thellësinë reale të tregut, sinjalet e besimit dhe rrugët sipas rolit pa ekspozuar të dhëna operative private.",
    },
  },
}

export default mergeMessages(
  metadata,
  common,
  home,
  publicSiteCustomerCopy,
  trustPages,
  authShared,
  authLogin,
  authRegister,
  authForgotPassword,
  authResetPassword,
  onboardingShared,
  onboardingRole,
  onboardingProfile,
  onboardingDocuments,
  onboardingReview,
  dashboard,
  supportHeader,
  operations,
  portalAlignment,
  offline,
  notFound,
)
