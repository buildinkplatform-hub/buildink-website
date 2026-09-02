"use client"

import { Eye, FileText, UserRound } from "lucide-react"
import { useTranslations } from "next-intl"
import { usePathname, useSearchParams } from "next/navigation"
import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { cn } from "@/lib/utils/cn"

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
  const requestedTab = params.get("tab") ?? initialTab
  const tab: ProfileTab = profileTabs.some((item) => item.id === requestedTab)
    ? (requestedTab as ProfileTab)
    : "overview"
  const setTab = (value: ProfileTab) => {
    const next = new URLSearchParams(params.toString())
    if (value === "overview") next.delete("tab")
    else next.set("tab", value)
    const query = next.toString()

    // All profile tab data is already available on this client page. Keep the
    // URL in sync without triggering a new Server Component/backend request.
    window.history.replaceState(
      null,
      "",
      query ? `${pathname}?${query}` : pathname,
    )
  }

  return (
    <div className="space-y-5">
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
    <div className="space-y-5">
      <ProfileTabCard
        title={t("dashboard.profileTabs.overview")}
        description={t("dashboard.profile.accountSummaryDescription")}
      >
        <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
            <div
              key={item.label}
              className="border-border/90 rounded-xl border bg-slate-50/60 p-4 dark:bg-white/[0.025]"
            >
              <dt className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
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
    <div className="border-border/90 portal-scrollbar overflow-x-auto rounded-2xl border bg-slate-50/65 p-1 shadow-[var(--shadow-xs)] dark:bg-white/[0.025]">
      <nav
        className="flex min-w-max items-center gap-1"
        aria-label={t("dashboard.nav.profile")}
      >
        {profileTabs.map(({ id, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active === id}
            className={cn(
              "focus-visible:ring-primary/20 inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition-[background-color,color,border-color,box-shadow] outline-none focus-visible:ring-3",
              active === id
                ? "border-border/90 bg-card text-primary border shadow-[var(--shadow-xs)]"
                : "text-muted-foreground hover:bg-card/70 hover:text-foreground",
            )}
            onClick={() => onChange(id)}
          >
            <Icon className="size-4" aria-hidden="true" />
            {t(`dashboard.profileTabs.${id}`)}
            {id === "documents" ? (
              <span className="bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
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
    <Card>
      <CardHeader className="border-border/70 border-b bg-slate-50/55 dark:bg-white/[0.02]">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="pt-5 sm:pt-6">{children}</CardContent>
    </Card>
  )
}
