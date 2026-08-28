"use client"

import { Eye, FileText, UserRound } from "lucide-react"
import { useTranslations } from "next-intl"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { ReactNode } from "react"

import { Card } from "@/components/ui/card"
import { ProfileCollectionsEditor } from "@/features/dashboard/components/profile-collections-editor"
import { ProfileDocumentsManager } from "@/features/dashboard/components/profile-documents-manager"
import { ProfileEditor } from "@/features/dashboard/components/profile-editor"
import {
  PersonaEditor,
  VisibilityEditor,
} from "@/features/dashboard/components/profile-protected"
import type {
  PortalBootstrapProfile,
  PortalDocument,
  PortalProfileCollections,
  PortalVisibility,
} from "@/features/dashboard/data/portal-client"

type PersonaPayload = Awaited<
  ReturnType<
    typeof import("@/features/dashboard/data/portal-client").getPortalPersona
  >
>

export const profileTabs = [
  { id: "overview", icon: UserRound },
  { id: "documents", icon: FileText },
  { id: "visibility", icon: Eye },
] as const

export type ProfileTab = (typeof profileTabs)[number]["id"]

export function ProfilePageClient({
  profile,
  persona,
  collections,
  visibility,
  documents,
  initialTab,
}: {
  profile: PortalBootstrapProfile
  persona: PersonaPayload | null
  collections: PortalProfileCollections | null
  visibility: PortalVisibility | null
  documents: PortalDocument[]
  initialTab?: string
}) {
  const t = useTranslations()
  const params = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const requestedTab = params.get("tab") ?? initialTab
  const tab: ProfileTab = profileTabs.some((item) => item.id === requestedTab)
    ? (requestedTab as ProfileTab)
    : "overview"
  const setTab = (value: ProfileTab) => {
    const next = new URLSearchParams(params.toString())
    if (value === "overview") next.delete("tab")
    else next.set("tab", value)
    const query = next.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    })
  }

  return (
    <div className="space-y-6">
      <ProfileTabNav
        active={tab}
        documentCount={documents.length}
        onChange={setTab}
      />
      {tab === "overview" ? (
        <ProfileOverviewTab
          profile={profile}
          persona={persona}
          collections={collections}
        />
      ) : null}
      {tab === "documents" ? (
        <ProfileTabCard title={t("dashboard.profileTabs.documents")}>
          <ProfileDocumentsManager documents={documents} />
        </ProfileTabCard>
      ) : null}
      {tab === "visibility" && visibility ? (
        <ProfileTabCard title={t("dashboard.profileTabs.visibility")}>
          <VisibilityEditor visibility={visibility} />
        </ProfileTabCard>
      ) : null}
    </div>
  )
}

function ProfileOverviewTab({
  profile,
  persona,
  collections,
}: {
  profile: PortalBootstrapProfile
  persona: PersonaPayload | null
  collections: PortalProfileCollections | null
}) {
  const t = useTranslations()
  return (
    <div className="space-y-6">
      <ProfileTabCard
        title={t("dashboard.profileTabs.overview")}
        description={t("dashboard.profile.accountSummaryDescription")}
      >
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: t("dashboard.profile.email"), value: profile.email },
            {
              label: t("dashboard.profile.displayName"),
              value: profile.displayName,
            },
            { label: t("dashboard.profile.phone"), value: profile.phone },
            {
              label: t("dashboard.profile.accountType"),
              value: (profile.primaryAccountType ?? "—").replaceAll("_", " "),
            },
            {
              label: t("dashboard.profile.onboardingStatus"),
              value: profile.onboardingStatus.replaceAll("_", " "),
            },
            {
              label: t("dashboard.profile.verificationStatus"),
              value: profile.verificationStatus.replaceAll("_", " "),
            },
            {
              label: t("dashboard.profile.publicationStatus"),
              value: profile.publicationStatus.replaceAll("_", " "),
            },
            {
              label: t("dashboard.profile.updatedAt"),
              value: new Date(profile.updatedAt).toLocaleString(),
            },
          ].map((item) => (
            <div key={item.label} className="border-line rounded-xl border p-3">
              <dt className="text-muted text-xs tracking-[0.12em] uppercase">
                {item.label}
              </dt>
              <dd className="text-brand-navy mt-1.5 text-sm font-semibold break-words">
                {item.value || "—"}
              </dd>
            </div>
          ))}
        </dl>
      </ProfileTabCard>
      <ProfileTabCard
        title={t("dashboard.nav.profile")}
        description={t("dashboard.descriptions.profile")}
      >
        <ProfileEditor profile={profile} />
      </ProfileTabCard>
      {persona ? (
        <ProfileTabCard
          title={t("dashboard.profileTabs.persona")}
          description={t("dashboard.profile.personaDescription")}
        >
          <PersonaEditor persona={persona} profileVersion={profile.version} />
        </ProfileTabCard>
      ) : null}
      {collections ? (
        <ProfileTabCard
          title={t("dashboard.profileTabs.collections")}
          description={t("dashboard.profile.collectionsDescription")}
        >
          <ProfileCollectionsEditor collections={collections} />
        </ProfileTabCard>
      ) : null}
    </div>
  )
}

function ProfileTabNav({
  active,
  documentCount,
  onChange,
}: {
  active: ProfileTab
  documentCount: number
  onChange: (tab: ProfileTab) => void
}) {
  const t = useTranslations()
  return (
    <div className="border-line overflow-x-auto border-b">
      <nav
        className="flex min-w-max gap-1"
        aria-label={t("dashboard.nav.profile")}
      >
        {profileTabs.map(({ id, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`flex min-h-11 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              active === id
                ? "border-primary text-primary"
                : "text-muted hover:text-brand-navy border-transparent"
            }`}
            aria-current={active === id ? "page" : undefined}
            onClick={() => onChange(id)}
          >
            <Icon className="size-4" />
            {t(`dashboard.profileTabs.${id}`)}
            {id === "documents" ? (
              <span className="bg-light-blue text-primary rounded-full px-1.5 text-xs">
                {documentCount}
              </span>
            ) : null}
          </button>
        ))}
      </nav>
    </div>
  )
}

export function ProfileTabCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <Card className="rounded-[30px] border-white/70 p-6 shadow-[var(--shadow-card)] sm:p-7">
      <div className="mb-6">
        <h2 className="text-brand-navy text-xl font-semibold">{title}</h2>
        {description ? (
          <p className="text-muted mt-2 text-sm leading-6">{description}</p>
        ) : null}
      </div>
      {children}
    </Card>
  )
}
