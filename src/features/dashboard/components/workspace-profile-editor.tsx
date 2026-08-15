"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MultiSelect } from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CityLocationField } from "@/components/forms/city-location-field"
import {
  publishWorkspaceProfileAction,
  requestWorkspaceCapabilityAction,
  updateWorkspaceProfileAction,
} from "@/features/dashboard/actions/portal.actions"
import type {
  PortalTaxonomyItem,
  PortalWorkspaceProfile,
} from "@/features/dashboard/data/portal-client"
import { hasPortalPermission } from "@/features/dashboard/lib/portal-permissions"
import { StatusBadge } from "@/features/dashboard/components/status-badge"

const identifierKinds = [
  "VAT",
  "FISCAL_CODE",
  "REGISTRATION_NUMBER",
  "REA",
  "EORI",
  "LEI",
  "OTHER",
] as const

type IdentifierKind = (typeof identifierKinds)[number]

interface IdentifierRow {
  id?: string
  countryCode: string
  kind: IdentifierKind
  rawValue: string
  isPrimary: boolean
  isPublic: boolean
}

interface ServiceRow {
  id?: string
  name: string
  description: string
}

interface CertificationRow {
  id?: string
  name: string
  issuer: string
  issuedAt: string
  expiresAt: string
}

export interface WorkspaceTaxonomy {
  categories: PortalTaxonomyItem[]
  tags: PortalTaxonomyItem[]
  regions: PortalTaxonomyItem[]
}

function taxonomyLabel(item: PortalTaxonomyItem) {
  if (item.label) return item.label
  if (item.name) return item.name
  const translations = item.translations
  if (translations && typeof translations === "object") {
    const record = translations as Record<string, { name?: string } | string>
    const en = record.en
    if (typeof en === "string") return en
    if (en && typeof en === "object" && en.name) return en.name
  }
  return item.slug ?? item.id
}

const visibilityKeys = [
  "publicProfileVisible",
  "websiteVisible",
  "legalNameVisible",
  "descriptionVisible",
  "logoVisible",
  "galleryVisible",
  "capabilitiesVisible",
  "catalogueVisible",
  "equipmentVisible",
  "projectsVisible",
  "reviewsVisible",
  "generalLocationVisible",
  "emailVisible",
  "phoneVisible",
  "exactAddressVisible",
  "identifiersVisible",
  "websiteUrlVisible",
  "businessHoursVisible",
  "searchEngineIndexable",
] as const

const tabs = [
  "identity",
  "taxonomy",
  "identifiers",
  "services",
  "certifications",
  "visibility",
  "capabilities",
] as const

type WorkspaceTab = (typeof tabs)[number]

export function WorkspaceProfileEditor({
  companyId,
  profile,
  taxonomy,
  permissions,
}: {
  companyId: string
  profile: PortalWorkspaceProfile
  taxonomy: WorkspaceTaxonomy
  permissions: readonly string[]
}) {
  const t = useTranslations()
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const [tab, setTab] = useState<WorkspaceTab>("identity")
  const canPublish = hasPortalPermission(permissions, "company.publish")
  const [categoryIds, setCategoryIds] = useState<string[]>(
    profile.categoryIds ??
      ([profile.categoryId, profile.subcategoryId].filter(
        Boolean,
      ) as string[]) ??
      [],
  )
  const [tagIds, setTagIds] = useState<string[]>(profile.tagIds ?? [])
  const [serviceRegionIds, setServiceRegionIds] = useState<string[]>(
    profile.serviceRegionIds ?? [],
  )
  const [identifiers, setIdentifiers] = useState<IdentifierRow[]>(
    (profile.identifiers ?? []).map((item) => ({
      id: item.id,
      countryCode: item.countryCode,
      kind: item.kind,
      rawValue: item.rawValue,
      isPrimary: item.isPrimary,
      isPublic: item.isPublic,
    })),
  )
  const [services, setServices] = useState<ServiceRow[]>(
    (profile.services ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description ?? "",
    })),
  )
  const [certifications, setCertifications] = useState<CertificationRow[]>(
    (profile.certifications ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      issuer: item.issuer ?? "",
      issuedAt: item.issuedAt ? item.issuedAt.slice(0, 10) : "",
      expiresAt: item.expiresAt ? item.expiresAt.slice(0, 10) : "",
    })),
  )
  const [values, setValues] = useState({
    name: profile.name,
    legalName: profile.legalName ?? "",
    registrationNumber: profile.registrationNumber ?? "",
    vatNumber: profile.vatNumber ?? "",
    description: profile.description ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    website: profile.website ?? "",
    addressLine1: profile.addressLine1 ?? "",
    cityId: profile.cityId ?? "",
    cityText: profile.cityText ?? "",
    region: profile.region ?? "",
    postalCode: profile.postalCode ?? "",
    countryCode: profile.countryCode ?? "IT",
  })
  const [visibility, setVisibility] = useState({
    publicProfileVisible: profile.visibility?.publicProfileVisible ?? false,
    websiteVisible: profile.visibility?.websiteVisible ?? false,
    legalNameVisible: profile.visibility?.legalNameVisible ?? false,
    descriptionVisible: profile.visibility?.descriptionVisible ?? true,
    logoVisible: profile.visibility?.logoVisible ?? true,
    galleryVisible: profile.visibility?.galleryVisible ?? true,
    capabilitiesVisible: profile.visibility?.capabilitiesVisible ?? true,
    catalogueVisible: profile.visibility?.catalogueVisible ?? false,
    equipmentVisible: profile.visibility?.equipmentVisible ?? false,
    projectsVisible: profile.visibility?.projectsVisible ?? true,
    reviewsVisible: profile.visibility?.reviewsVisible ?? true,
    generalLocationVisible: profile.visibility?.generalLocationVisible ?? true,
    emailVisible: profile.visibility?.emailVisible ?? false,
    phoneVisible: profile.visibility?.phoneVisible ?? false,
    exactAddressVisible: profile.visibility?.exactAddressVisible ?? false,
    identifiersVisible: profile.visibility?.identifiersVisible ?? false,
    websiteUrlVisible: profile.visibility?.websiteUrlVisible ?? true,
    businessHoursVisible: profile.visibility?.businessHoursVisible ?? false,
    searchEngineIndexable: profile.visibility?.searchEngineIndexable ?? false,
  })

  function setField(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  async function saveIdentity() {
    setPending(true)
    const result = await updateWorkspaceProfileAction(
      companyId,
      {
        ...values,
        legalName: values.legalName || null,
        registrationNumber: values.registrationNumber || null,
        vatNumber: values.vatNumber || null,
        description: values.description || null,
        email: values.email || null,
        phone: values.phone || null,
        website: values.website || null,
        addressLine1: values.addressLine1 || null,
        cityId: values.cityId || null,
        region: values.region || null,
        cityText: values.cityText || null,
        postalCode: values.postalCode || null,
        countryCode: values.countryCode || null,
        identifiers: profile.identifiers,
      },
      profile.version,
    )
    setPending(false)
    setMessage(result.ok ? t("dashboard.profile.saved") : result.message)
    if (result.ok) router.refresh()
  }

  async function saveTaxonomy() {
    setPending(true)
    const result = await updateWorkspaceProfileAction(
      companyId,
      { categoryIds, tagIds, serviceRegionIds },
      profile.version,
    )
    setPending(false)
    setMessage(result.ok ? t("dashboard.profile.saved") : result.message)
    if (result.ok) router.refresh()
  }

  async function saveIdentifiers() {
    setPending(true)
    const result = await updateWorkspaceProfileAction(
      companyId,
      {
        identifiers: identifiers
          .filter((item) => item.rawValue.trim().length > 0)
          .map((item) => ({
            id: item.id,
            countryCode: item.countryCode.toUpperCase(),
            kind: item.kind,
            rawValue: item.rawValue.trim(),
            isPrimary: item.isPrimary,
            isPublic: item.isPublic,
          })),
      },
      profile.version,
    )
    setPending(false)
    setMessage(result.ok ? t("dashboard.profile.saved") : result.message)
    if (result.ok) router.refresh()
  }

  async function saveServices() {
    setPending(true)
    const result = await updateWorkspaceProfileAction(
      companyId,
      {
        services: services
          .filter((item) => item.name.trim().length > 0)
          .map((item) => ({
            id: item.id,
            name: item.name.trim(),
            description: item.description.trim() || null,
          })),
      },
      profile.version,
    )
    setPending(false)
    setMessage(result.ok ? t("dashboard.profile.saved") : result.message)
    if (result.ok) router.refresh()
  }

  async function saveCertifications() {
    setPending(true)
    const result = await updateWorkspaceProfileAction(
      companyId,
      {
        certifications: certifications
          .filter((item) => item.name.trim().length > 0)
          .map((item) => ({
            id: item.id,
            name: item.name.trim(),
            issuer: item.issuer.trim() || null,
            issuedAt: item.issuedAt || null,
            expiresAt: item.expiresAt || null,
          })),
      },
      profile.version,
    )
    setPending(false)
    setMessage(result.ok ? t("dashboard.profile.saved") : result.message)
    if (result.ok) router.refresh()
  }

  async function publish() {
    setPending(true)
    const result = await publishWorkspaceProfileAction(
      companyId,
      profile.version,
    )
    setPending(false)
    setMessage(
      result.ok ? t("dashboard.workspace.publishRequested") : result.message,
    )
    if (result.ok) router.refresh()
  }

  async function saveVisibility() {
    setPending(true)
    const result = await updateWorkspaceProfileAction(
      companyId,
      { visibility },
      profile.version,
    )
    setPending(false)
    setMessage(result.ok ? t("dashboard.profile.saved") : result.message)
    if (result.ok) router.refresh()
  }

  async function requestCapability(capability: string) {
    setPending(true)
    const result = await requestWorkspaceCapabilityAction(companyId, {
      capability,
    })
    setPending(false)
    setMessage(
      result.ok ? t("dashboard.workspace.capabilityRequested") : result.message,
    )
    if (result.ok) router.refresh()
  }

  return (
    <Card className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {profile.status ? (
            <StatusBadge
              status={profile.status}
              label={t(`dashboard.workspace.status.${profile.status}`)}
            />
          ) : null}
          {profile.publicationStatus ? (
            <StatusBadge
              status={profile.publicationStatus}
              label={t(
                `dashboard.workspace.publication.${profile.publicationStatus}`,
              )}
            />
          ) : null}
        </div>
        {canPublish && profile.publicationStatus !== "PUBLISHED" ? (
          <Button
            type="button"
            size="sm"
            disabled={pending}
            onClick={() => void publish()}
          >
            {t("dashboard.workspace.publish")}
          </Button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <Button
            key={item}
            type="button"
            size="sm"
            variant={tab === item ? "primary" : "secondary"}
            onClick={() => setTab(item)}
          >
            {t(`dashboard.workspace.tabs.${item}`)}
          </Button>
        ))}
      </div>
      {tab === "identity" ? (
        <>
          <Field label={t("dashboard.workspace.name")} htmlFor="company-name">
            <Input
              id="company-name"
              value={values.name}
              onChange={(event) => setField("name", event.target.value)}
            />
          </Field>
          <Field
            label={t("dashboard.workspace.legalName")}
            htmlFor="company-legal"
          >
            <Input
              id="company-legal"
              value={values.legalName}
              onChange={(event) => setField("legalName", event.target.value)}
            />
          </Field>
          <Field
            label={t("dashboard.workspace.registration")}
            htmlFor="company-reg"
          >
            <Input
              id="company-reg"
              value={values.registrationNumber}
              onChange={(event) =>
                setField("registrationNumber", event.target.value)
              }
            />
          </Field>
          <Field label={t("dashboard.workspace.vat")} htmlFor="company-vat">
            <Input
              id="company-vat"
              value={values.vatNumber}
              onChange={(event) => setField("vatNumber", event.target.value)}
            />
          </Field>
          <Field
            label={t("dashboard.publish.description")}
            htmlFor="company-description"
          >
            <Textarea
              id="company-description"
              value={values.description}
              onChange={(event) => setField("description", event.target.value)}
            />
          </Field>
          <Field label={t("dashboard.workspace.email")} htmlFor="company-email">
            <Input
              id="company-email"
              value={values.email}
              onChange={(event) => setField("email", event.target.value)}
            />
          </Field>
          <Field label={t("dashboard.workspace.phone")} htmlFor="company-phone">
            <Input
              id="company-phone"
              value={values.phone}
              onChange={(event) => setField("phone", event.target.value)}
            />
          </Field>
          <Field
            label={t("dashboard.workspace.website")}
            htmlFor="company-website"
          >
            <Input
              id="company-website"
              value={values.website}
              onChange={(event) => setField("website", event.target.value)}
            />
          </Field>
          <Field
            label={t("dashboard.publish.location")}
            htmlFor="company-location"
          >
            <CityLocationField
              cityId={values.cityId || undefined}
              onChange={(cityId, meta) => {
                setValues((current) => ({
                  ...current,
                  cityId,
                  region: meta?.regionLabel ?? current.region,
                  cityText: meta?.cityLabel ?? current.cityText,
                  countryCode: meta?.countryCode ?? current.countryCode,
                }))
              }}
            />
          </Field>
          <Field
            label={t("dashboard.workspace.address")}
            htmlFor="company-address"
          >
            <Input
              id="company-address"
              value={values.addressLine1}
              onChange={(event) => setField("addressLine1", event.target.value)}
            />
          </Field>
          <Field
            label={t("dashboard.companyForm.postalCode")}
            htmlFor="company-postal"
          >
            <Input
              id="company-postal"
              value={values.postalCode}
              onChange={(event) => setField("postalCode", event.target.value)}
            />
          </Field>
          <Button
            type="button"
            disabled={pending}
            onClick={() => void saveIdentity()}
          >
            {t("dashboard.profile.save")}
          </Button>
        </>
      ) : null}
      {tab === "taxonomy" ? (
        <>
          <Field
            label={t("dashboard.collections.categories")}
            htmlFor="company-categories"
          >
            <MultiSelect
              id="company-categories"
              values={categoryIds}
              placeholder={t("dashboard.create.chooseTarget")}
              options={taxonomy.categories.map((item) => ({
                value: item.id,
                label: taxonomyLabel(item),
              }))}
              onChange={setCategoryIds}
            />
          </Field>
          <Field label={t("dashboard.workspace.tags")} htmlFor="company-tags">
            <MultiSelect
              id="company-tags"
              values={tagIds}
              placeholder={t("dashboard.create.chooseTarget")}
              options={taxonomy.tags.map((item) => ({
                value: item.id,
                label: taxonomyLabel(item),
              }))}
              onChange={setTagIds}
            />
          </Field>
          <Field
            label={t("dashboard.collections.serviceRegions")}
            htmlFor="company-regions"
          >
            <MultiSelect
              id="company-regions"
              values={serviceRegionIds}
              placeholder={t("dashboard.create.chooseTarget")}
              options={taxonomy.regions.map((item) => ({
                value: item.id,
                label: taxonomyLabel(item),
              }))}
              onChange={setServiceRegionIds}
            />
          </Field>
          <Button
            type="button"
            disabled={pending}
            onClick={() => void saveTaxonomy()}
          >
            {t("dashboard.profile.save")}
          </Button>
        </>
      ) : null}
      {tab === "identifiers" ? (
        <>
          <p className="text-muted text-sm">
            {t("dashboard.workspace.identifiersHint")}
          </p>
          {identifiers.map((row, index) => (
            <div
              key={row.id ?? `identifier-${index}`}
              className="border-line space-y-3 rounded-xl border p-4"
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <Field
                  label={t("dashboard.workspace.identifierKind")}
                  htmlFor={`identifier-kind-${index}`}
                >
                  <Select
                    value={row.kind}
                    onValueChange={(value) =>
                      setIdentifiers((current) =>
                        current.map((item, position) =>
                          position === index
                            ? { ...item, kind: value as IdentifierKind }
                            : item,
                        ),
                      )
                    }
                  >
                    <SelectTrigger
                      id={`identifier-kind-${index}`}
                      aria-label={t("dashboard.workspace.identifierKind")}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {identifierKinds.map((kind) => (
                        <SelectItem key={kind} value={kind}>
                          {t(`dashboard.workspace.identifierKinds.${kind}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field
                  label={t("dashboard.workspace.identifierCountry")}
                  htmlFor={`identifier-country-${index}`}
                >
                  <Input
                    id={`identifier-country-${index}`}
                    value={row.countryCode}
                    maxLength={2}
                    onChange={(event) =>
                      setIdentifiers((current) =>
                        current.map((item, position) =>
                          position === index
                            ? { ...item, countryCode: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </Field>
                <Field
                  label={t("dashboard.workspace.identifierValue")}
                  htmlFor={`identifier-value-${index}`}
                >
                  <Input
                    id={`identifier-value-${index}`}
                    value={row.rawValue}
                    onChange={(event) =>
                      setIdentifiers((current) =>
                        current.map((item, position) =>
                          position === index
                            ? { ...item, rawValue: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </Field>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={row.isPrimary}
                    onChange={(event) =>
                      setIdentifiers((current) =>
                        current.map((item, position) => ({
                          ...item,
                          isPrimary:
                            position === index ? event.target.checked : false,
                        })),
                      )
                    }
                  />
                  {t("dashboard.workspace.identifierPrimary")}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={row.isPublic}
                    onChange={(event) =>
                      setIdentifiers((current) =>
                        current.map((item, position) =>
                          position === index
                            ? { ...item, isPublic: event.target.checked }
                            : item,
                        ),
                      )
                    }
                  />
                  {t("dashboard.workspace.identifierPublic")}
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    setIdentifiers((current) =>
                      current.filter((_, position) => position !== index),
                    )
                  }
                >
                  {t("dashboard.workspace.remove")}
                </Button>
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setIdentifiers((current) => [
                  ...current,
                  {
                    countryCode: profile.countryCode || "IT",
                    kind: "VAT",
                    rawValue: "",
                    isPrimary: current.length === 0,
                    isPublic: false,
                  },
                ])
              }
            >
              {t("dashboard.workspace.addIdentifier")}
            </Button>
            <Button
              type="button"
              disabled={pending}
              onClick={() => void saveIdentifiers()}
            >
              {t("dashboard.profile.save")}
            </Button>
          </div>
        </>
      ) : null}
      {tab === "services" ? (
        <>
          <p className="text-muted text-sm">
            {t("dashboard.workspace.servicesHint")}
          </p>
          {services.map((row, index) => (
            <div
              key={row.id ?? `service-${index}`}
              className="border-line space-y-3 rounded-xl border p-4"
            >
              <Field
                label={t("dashboard.workspace.serviceName")}
                htmlFor={`service-name-${index}`}
              >
                <Input
                  id={`service-name-${index}`}
                  value={row.name}
                  onChange={(event) =>
                    setServices((current) =>
                      current.map((item, position) =>
                        position === index
                          ? { ...item, name: event.target.value }
                          : item,
                      ),
                    )
                  }
                />
              </Field>
              <Field
                label={t("dashboard.publish.description")}
                htmlFor={`service-description-${index}`}
              >
                <Textarea
                  id={`service-description-${index}`}
                  value={row.description}
                  onChange={(event) =>
                    setServices((current) =>
                      current.map((item, position) =>
                        position === index
                          ? { ...item, description: event.target.value }
                          : item,
                      ),
                    )
                  }
                />
              </Field>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() =>
                  setServices((current) =>
                    current.filter((_, position) => position !== index),
                  )
                }
              >
                {t("dashboard.workspace.remove")}
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setServices((current) => [
                  ...current,
                  { name: "", description: "" },
                ])
              }
            >
              {t("dashboard.workspace.addService")}
            </Button>
            <Button
              type="button"
              disabled={pending}
              onClick={() => void saveServices()}
            >
              {t("dashboard.profile.save")}
            </Button>
          </div>
        </>
      ) : null}
      {tab === "certifications" ? (
        <>
          <p className="text-muted text-sm">
            {t("dashboard.workspace.certificationsHint")}
          </p>
          {certifications.map((row, index) => (
            <div
              key={row.id ?? `certification-${index}`}
              className="border-line space-y-3 rounded-xl border p-4"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label={t("dashboard.workspace.certificationName")}
                  htmlFor={`certification-name-${index}`}
                >
                  <Input
                    id={`certification-name-${index}`}
                    value={row.name}
                    onChange={(event) =>
                      setCertifications((current) =>
                        current.map((item, position) =>
                          position === index
                            ? { ...item, name: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </Field>
                <Field
                  label={t("dashboard.workspace.certificationIssuer")}
                  htmlFor={`certification-issuer-${index}`}
                >
                  <Input
                    id={`certification-issuer-${index}`}
                    value={row.issuer}
                    onChange={(event) =>
                      setCertifications((current) =>
                        current.map((item, position) =>
                          position === index
                            ? { ...item, issuer: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </Field>
                <Field
                  label={t("dashboard.workspace.certificationIssuedAt")}
                  htmlFor={`certification-issued-${index}`}
                >
                  <Input
                    id={`certification-issued-${index}`}
                    type="date"
                    value={row.issuedAt}
                    onChange={(event) =>
                      setCertifications((current) =>
                        current.map((item, position) =>
                          position === index
                            ? { ...item, issuedAt: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </Field>
                <Field
                  label={t("dashboard.workspace.certificationExpiresAt")}
                  htmlFor={`certification-expires-${index}`}
                >
                  <Input
                    id={`certification-expires-${index}`}
                    type="date"
                    value={row.expiresAt}
                    onChange={(event) =>
                      setCertifications((current) =>
                        current.map((item, position) =>
                          position === index
                            ? { ...item, expiresAt: event.target.value }
                            : item,
                        ),
                      )
                    }
                  />
                </Field>
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() =>
                  setCertifications((current) =>
                    current.filter((_, position) => position !== index),
                  )
                }
              >
                {t("dashboard.workspace.remove")}
              </Button>
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setCertifications((current) => [
                  ...current,
                  { name: "", issuer: "", issuedAt: "", expiresAt: "" },
                ])
              }
            >
              {t("dashboard.workspace.addCertification")}
            </Button>
            <Button
              type="button"
              disabled={pending}
              onClick={() => void saveCertifications()}
            >
              {t("dashboard.profile.save")}
            </Button>
          </div>
        </>
      ) : null}
      {tab === "visibility" ? (
        <>
          {visibilityKeys.map((key) => (
            <label key={key} className="flex items-center gap-3 text-sm">
              <Checkbox
                checked={visibility[key]}
                onChange={(event) =>
                  setVisibility((current) => ({
                    ...current,
                    [key]: event.target.checked,
                  }))
                }
              />
              {t(`dashboard.workspace.visibility.${key}`)}
            </label>
          ))}
          <Button
            type="button"
            disabled={pending}
            onClick={() => void saveVisibility()}
          >
            {t("dashboard.profile.save")}
          </Button>
        </>
      ) : null}
      {tab === "capabilities" ? (
        <div className="space-y-3">
          {profile.capabilities.map((item) => (
            <div
              key={item.capability}
              className="flex items-center justify-between text-sm"
            >
              <span>{item.capability}</span>
              <span className="text-muted">{item.status}</span>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => void requestCapability("SUPPLIER")}
          >
            {t("dashboard.workspace.requestSupplier")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => void requestCapability("EQUIPMENT_PROVIDER")}
          >
            {t("dashboard.workspace.requestEquipment")}
          </Button>
        </div>
      ) : null}
      {message ? <p className="text-muted text-sm">{message}</p> : null}
    </Card>
  )
}
