"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { MultiSelect } from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  updatePersonaAction,
  updateVisibilityAction,
} from "@/features/dashboard/actions/portal.actions"
import type { PortalVisibility } from "@/features/dashboard/data/portal-client"
import type { PersonaUpdateContract } from "@/features/dashboard/query/portal-contracts"

type PersonaPayload = Awaited<
  ReturnType<
    typeof import("@/features/dashboard/data/portal-client").getPortalPersona
  >
>
type WorkerUpdateContract = NonNullable<PersonaUpdateContract["worker"]>
type SubcontractorUpdateContract = NonNullable<
  PersonaUpdateContract["subcontractor"]
>
type ServiceProviderUpdateContract = NonNullable<
  PersonaUpdateContract["serviceProvider"]
>

function labelOf(translations: unknown, slug: string) {
  if (!translations || typeof translations !== "object") return slug
  const record = translations as Record<string, { name?: string } | string>
  const en = record.en
  if (typeof en === "string") return en
  if (en && typeof en === "object" && en.name) return en.name
  return slug
}

const availabilityStatuses = [
  "AVAILABLE",
  "LIMITED",
  "UNAVAILABLE",
  "OPEN_TO_OFFERS",
  "NOT_DISCLOSED",
] as const

const employmentTypes = [
  "FULL_TIME",
  "PART_TIME",
  "TEMPORARY",
  "CONTRACT",
  "SEASONAL",
  "APPRENTICE",
  "DAY_LABOUR",
] as const

const workArrangements = ["ON_SITE", "HYBRID", "REMOTE", "MOBILE"] as const

const payIntervals = ["HOURLY", "DAILY", "WEEKLY", "MONTHLY", "FIXED"] as const

function EnumSelect<T extends string>({
  id,
  value,
  options,
  onChange,
  labelFor,
  placeholder,
}: {
  id: string
  value: string
  options: readonly T[]
  onChange: (value: T) => void
  labelFor: (option: T) => string
  placeholder: string
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as T)}>
      <SelectTrigger id={id}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {labelFor(option)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <Checkbox
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      {label}
    </label>
  )
}

/** Minor units are stored as integer strings; the form edits major units. */
function toMajor(minor: string | null | undefined) {
  if (!minor) return ""
  return (Number(minor) / 100).toString()
}

function toMinor(major: string) {
  const parsed = Number(major)
  if (!major.trim() || Number.isNaN(parsed) || parsed < 0) return null
  return String(Math.round(parsed * 100))
}

export function PersonaEditor({
  persona,
  profileVersion,
}: {
  persona: PersonaPayload
  profileVersion: number
}) {
  const t = useTranslations()
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()

  if (persona.accountType === "WORKER") {
    return (
      <WorkerFields
        persona={persona}
        profileVersion={profileVersion}
        pending={pending}
        setPending={setPending}
        message={message}
        setMessage={setMessage}
        onSaved={() => router.refresh()}
        t={t}
      />
    )
  }
  if (persona.accountType === "SUBCONTRACTOR") {
    return (
      <ContractorFields
        persona={persona}
        profileVersion={profileVersion}
        pending={pending}
        setPending={setPending}
        message={message}
        setMessage={setMessage}
        onSaved={() => router.refresh()}
        t={t}
      />
    )
  }
  if (persona.accountType === "SERVICE_PROVIDER") {
    return (
      <ServiceFields
        persona={persona}
        profileVersion={profileVersion}
        pending={pending}
        setPending={setPending}
        message={message}
        setMessage={setMessage}
        onSaved={() => router.refresh()}
        t={t}
      />
    )
  }
  if (persona.accountType === "PROJECT_OWNER") {
    return (
      <ProjectOwnerFields
        persona={persona}
        profileVersion={profileVersion}
        pending={pending}
        setPending={setPending}
        message={message}
        setMessage={setMessage}
        onSaved={() => router.refresh()}
        t={t}
      />
    )
  }
  return (
    <p className="text-muted text-sm">
      {t("dashboard.persona.companyManaged")}
    </p>
  )
}

function WorkerFields({
  persona,
  profileVersion,
  pending,
  setPending,
  message,
  setMessage,
  onSaved,
  t,
}: EditorProps) {
  const worker = persona.worker
  const [professionId, setProfessionId] = useState(worker?.professionId ?? "")
  const [years, setYears] = useState(String(worker?.yearsExperience ?? 0))
  const [availability, setAvailability] = useState(worker?.availability ?? "")
  const [availabilityStatus, setAvailabilityStatus] = useState<string>(
    worker?.availabilityStatus ?? "NOT_DISCLOSED",
  )
  const [availableFrom, setAvailableFrom] = useState(
    worker?.availableFrom ?? "",
  )
  const [bio, setBio] = useState(worker?.bio ?? "")
  const [employment, setEmployment] = useState<string[]>(
    worker?.preferredEmploymentTypes ?? [],
  )
  const [arrangement, setArrangement] = useState<string>(
    worker?.preferredWorkArrangement ?? "",
  )
  const [willingToTravel, setWillingToTravel] = useState(
    worker?.willingToTravel ?? false,
  )
  const [travelRadius, setTravelRadius] = useState(
    worker?.travelRadiusKm === null || worker?.travelRadiusKm === undefined
      ? ""
      : String(worker.travelRadiusKm),
  )
  const [ownTransport, setOwnTransport] = useState(
    worker?.hasOwnTransport ?? false,
  )
  const [permits, setPermits] = useState(
    (worker?.workPermitCountries ?? []).join(", "),
  )
  const [pay, setPay] = useState(toMajor(worker?.expectedPayMinMinor))
  const [payCurrency, setPayCurrency] = useState(
    worker?.expectedPayCurrency ?? "",
  )
  const [payInterval, setPayInterval] = useState<string>(
    worker?.expectedPayInterval ?? "",
  )
  return (
    <div className="space-y-4 rounded-[24px] border border-line/70 bg-canvas/55 p-5">
      <h2 className="text-brand-navy text-lg font-semibold">
        {t("dashboard.persona.worker")}
      </h2>
      <Field label={t("dashboard.persona.profession")} htmlFor="profession">
        <Select value={professionId} onValueChange={setProfessionId}>
          <SelectTrigger id="profession">
            <SelectValue placeholder={t("dashboard.create.chooseTarget")} />
          </SelectTrigger>
          <SelectContent>
            {persona.professions.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {labelOf(item.translations, item.slug)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label={t("dashboard.persona.years")} htmlFor="years">
        <Input
          id="years"
          value={years}
          onChange={(event) => setYears(event.target.value)}
        />
      </Field>
      <Field
        label={t("dashboard.persona.availabilityStatus")}
        htmlFor="availability-status"
      >
        <EnumSelect
          id="availability-status"
          value={availabilityStatus}
          options={availabilityStatuses}
          onChange={setAvailabilityStatus}
          placeholder={t("dashboard.create.chooseTarget")}
          labelFor={(option) =>
            t(`dashboard.persona.availabilityStatuses.${option}`)
          }
        />
      </Field>
      <Field
        label={t("dashboard.persona.availableFrom")}
        htmlFor="available-from"
      >
        <Input
          id="available-from"
          type="date"
          value={availableFrom}
          onChange={(event) => setAvailableFrom(event.target.value)}
        />
      </Field>
      <Field label={t("dashboard.persona.availability")} htmlFor="availability">
        <Input
          id="availability"
          value={availability}
          onChange={(event) => setAvailability(event.target.value)}
        />
      </Field>
      <Field
        label={t("dashboard.persona.employmentTypes")}
        htmlFor="employment-types"
      >
        <MultiSelect
          id="employment-types"
          values={employment}
          placeholder={t("dashboard.create.chooseTarget")}
          options={employmentTypes.map((value) => ({
            value,
            label: t(`dashboard.persona.employmentTypeValues.${value}`),
          }))}
          onChange={setEmployment}
        />
      </Field>
      <Field
        label={t("dashboard.persona.workArrangement")}
        htmlFor="work-arrangement"
      >
        <EnumSelect
          id="work-arrangement"
          value={arrangement}
          options={workArrangements}
          onChange={setArrangement}
          placeholder={t("dashboard.create.chooseTarget")}
          labelFor={(option) =>
            t(`dashboard.persona.workArrangementValues.${option}`)
          }
        />
      </Field>
      <CheckboxField
        label={t("dashboard.persona.willingToTravel")}
        checked={willingToTravel}
        onChange={setWillingToTravel}
      />
      <Field
        label={t("dashboard.persona.travelRadius")}
        htmlFor="travel-radius"
      >
        <Input
          id="travel-radius"
          inputMode="numeric"
          value={travelRadius}
          onChange={(event) => setTravelRadius(event.target.value)}
        />
      </Field>
      <CheckboxField
        label={t("dashboard.persona.ownTransport")}
        checked={ownTransport}
        onChange={setOwnTransport}
      />
      <Field
        label={t("dashboard.persona.workPermits")}
        htmlFor="work-permits"
        hint={t("dashboard.persona.workPermitsHint")}
      >
        <Input
          id="work-permits"
          value={permits}
          onChange={(event) => setPermits(event.target.value)}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label={t("dashboard.persona.expectedPay")}
          htmlFor="expected-pay"
          hint={t("dashboard.persona.expectedPayHint")}
        >
          <Input
            id="expected-pay"
            inputMode="decimal"
            value={pay}
            onChange={(event) => setPay(event.target.value)}
          />
        </Field>
        <Field
          label={t("dashboard.persona.payCurrency")}
          htmlFor="pay-currency"
        >
          <Input
            id="pay-currency"
            maxLength={3}
            value={payCurrency}
            onChange={(event) =>
              setPayCurrency(event.target.value.toUpperCase())
            }
          />
        </Field>
        <Field
          label={t("dashboard.persona.payInterval")}
          htmlFor="pay-interval"
        >
          <EnumSelect
            id="pay-interval"
            value={payInterval}
            options={payIntervals}
            onChange={setPayInterval}
            placeholder={t("dashboard.create.chooseTarget")}
            labelFor={(option) =>
              t(`dashboard.persona.payIntervalValues.${option}`)
            }
          />
        </Field>
      </div>
      <Field label={t("dashboard.persona.bio")} htmlFor="bio">
        <Textarea
          id="bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
        />
      </Field>
      {message ? <p className="text-muted text-sm">{message}</p> : null}
      <Button
        type="button"
        disabled={pending}
        onClick={() =>
          void savePersona(
            {
              worker: {
                professionId: professionId || null,
                yearsExperience: Number(years) || 0,
                availability: availability || null,
                availabilityStatus:
                  availabilityStatus as WorkerUpdateContract["availabilityStatus"],
                availableFrom: availableFrom || null,
                bio: bio || null,
                preferredEmploymentTypes: employment as NonNullable<
                  WorkerUpdateContract["preferredEmploymentTypes"]
                >,
                preferredWorkArrangement:
                  (arrangement as WorkerUpdateContract["preferredWorkArrangement"]) ||
                  null,
                willingToTravel,
                travelRadiusKm: travelRadius ? Number(travelRadius) : null,
                hasOwnTransport: ownTransport,
                workPermitCountries: permits
                  .split(",")
                  .map((code) => code.trim().toUpperCase())
                  .filter((code) => code.length === 2),
                expectedPayMinMinor: toMinor(pay),
                expectedPayCurrency: payCurrency || null,
                expectedPayInterval:
                  (payInterval as WorkerUpdateContract["expectedPayInterval"]) ||
                  null,
              },
            },
            profileVersion,
            setPending,
            setMessage,
            t("dashboard.profile.saved"),
            onSaved,
          )
        }
      >
        {t("dashboard.profile.save")}
      </Button>
    </div>
  )
}

function ContractorFields({
  persona,
  profileVersion,
  pending,
  setPending,
  message,
  setMessage,
  onSaved,
  t,
}: EditorProps) {
  const subcontractor = persona.subcontractor
  const [tradingName, setTradingName] = useState(
    subcontractor?.tradingName ?? "",
  )
  const [categoryId, setCategoryId] = useState(
    subcontractor?.primaryCategoryId ?? "",
  )
  const [years, setYears] = useState(
    String(subcontractor?.yearsExperience ?? 0),
  )
  const [capability, setCapability] = useState(
    subcontractor?.capabilityStatement ?? "",
  )
  const [availabilityStatus, setAvailabilityStatus] = useState<string>(
    subcontractor?.availabilityStatus ?? "NOT_DISCLOSED",
  )
  const [availableFrom, setAvailableFrom] = useState(
    subcontractor?.availableFrom ?? "",
  )
  const [maxProjects, setMaxProjects] = useState(
    subcontractor?.maxConcurrentProjects == null
      ? ""
      : String(subcontractor.maxConcurrentProjects),
  )
  const [crewSize, setCrewSize] = useState(
    subcontractor?.crewSize == null ? "" : String(subcontractor.crewSize),
  )
  const [travelRadius, setTravelRadius] = useState(
    subcontractor?.travelRadiusKm == null
      ? ""
      : String(subcontractor.travelRadiusKm),
  )
  const [emergencyCallout, setEmergencyCallout] = useState(
    subcontractor?.emergencyCallout ?? false,
  )
  return (
    <div className="space-y-4 rounded-[24px] border border-line/70 bg-canvas/55 p-5">
      <h2 className="text-brand-navy text-lg font-semibold">
        {t("dashboard.persona.contractor")}
      </h2>
      <Field label={t("dashboard.persona.tradingName")} htmlFor="trading-name">
        <Input
          id="trading-name"
          value={tradingName}
          onChange={(event) => setTradingName(event.target.value)}
        />
      </Field>
      <Field label={t("dashboard.persona.trade")} htmlFor="trade">
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger id="trade">
            <SelectValue placeholder={t("dashboard.create.chooseTarget")} />
          </SelectTrigger>
          <SelectContent>
            {(persona.categories ?? []).map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {labelOf(item.translations, item.slug)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label={t("dashboard.persona.years")} htmlFor="years">
        <Input
          id="years"
          value={years}
          onChange={(event) => setYears(event.target.value)}
        />
      </Field>
      <Field
        label={t("dashboard.persona.availabilityStatus")}
        htmlFor="sub-availability-status"
      >
        <EnumSelect
          id="sub-availability-status"
          value={availabilityStatus}
          options={availabilityStatuses}
          onChange={setAvailabilityStatus}
          placeholder={t("dashboard.create.chooseTarget")}
          labelFor={(option) =>
            t(`dashboard.persona.availabilityStatuses.${option}`)
          }
        />
      </Field>
      <Field
        label={t("dashboard.persona.availableFrom")}
        htmlFor="sub-available-from"
      >
        <Input
          id="sub-available-from"
          type="date"
          value={availableFrom}
          onChange={(event) => setAvailableFrom(event.target.value)}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label={t("dashboard.persona.maxConcurrentProjects")}
          htmlFor="max-projects"
        >
          <Input
            id="max-projects"
            inputMode="numeric"
            value={maxProjects}
            onChange={(event) => setMaxProjects(event.target.value)}
          />
        </Field>
        <Field label={t("dashboard.persona.crewSize")} htmlFor="crew-size">
          <Input
            id="crew-size"
            inputMode="numeric"
            value={crewSize}
            onChange={(event) => setCrewSize(event.target.value)}
          />
        </Field>
        <Field
          label={t("dashboard.persona.travelRadius")}
          htmlFor="sub-travel-radius"
        >
          <Input
            id="sub-travel-radius"
            inputMode="numeric"
            value={travelRadius}
            onChange={(event) => setTravelRadius(event.target.value)}
          />
        </Field>
      </div>
      <CheckboxField
        label={t("dashboard.persona.emergencyCallout")}
        checked={emergencyCallout}
        onChange={setEmergencyCallout}
      />
      <Field label={t("dashboard.persona.capability")} htmlFor="capability">
        <Textarea
          id="capability"
          value={capability}
          onChange={(event) => setCapability(event.target.value)}
        />
      </Field>
      {message ? <p className="text-muted text-sm">{message}</p> : null}
      <Button
        type="button"
        disabled={pending}
        onClick={() =>
          void savePersona(
            {
              subcontractor: {
                tradingName: tradingName || null,
                primaryCategoryId: categoryId || null,
                yearsExperience: Number(years) || 0,
                capabilityStatement: capability || null,
                availabilityStatus:
                  availabilityStatus as SubcontractorUpdateContract["availabilityStatus"],
                availableFrom: availableFrom || null,
                maxConcurrentProjects: maxProjects ? Number(maxProjects) : null,
                crewSize: crewSize ? Number(crewSize) : null,
                travelRadiusKm: travelRadius ? Number(travelRadius) : null,
                emergencyCallout,
              },
            },
            profileVersion,
            setPending,
            setMessage,
            t("dashboard.profile.saved"),
            onSaved,
          )
        }
      >
        {t("dashboard.profile.save")}
      </Button>
    </div>
  )
}

function ServiceFields({
  persona,
  profileVersion,
  pending,
  setPending,
  message,
  setMessage,
  onSaved,
  t,
}: EditorProps) {
  const provider = persona.serviceProvider
  const [identity, setIdentity] = useState(provider?.providerIdentity ?? "")
  const [title, setTitle] = useState(provider?.professionalTitle ?? "")
  const [licence, setLicence] = useState(provider?.licenceNumber ?? "")
  const [years, setYears] = useState(String(provider?.yearsExperience ?? 0))
  const [background, setBackground] = useState(
    provider?.professionalBackground ?? "",
  )
  const [capability, setCapability] = useState(
    provider?.capabilityStatement ?? "",
  )
  const [tradingName, setTradingName] = useState(provider?.tradingName ?? "")
  const [licenceCountry, setLicenceCountry] = useState(
    provider?.licenceCountryCode ?? "",
  )
  const [professionalBody, setProfessionalBody] = useState(
    provider?.professionalBody ?? "",
  )
  const [availabilityStatus, setAvailabilityStatus] = useState<string>(
    provider?.availabilityStatus ?? "NOT_DISCLOSED",
  )
  const [availableFrom, setAvailableFrom] = useState(
    provider?.availableFrom ?? "",
  )
  const [rate, setRate] = useState(toMajor(provider?.hourlyRateMinMinor))
  const [rateCurrency, setRateCurrency] = useState(provider?.rateCurrency ?? "")
  const [remoteServices, setRemoteServices] = useState(
    provider?.remoteServices ?? false,
  )
  return (
    <div className="space-y-4 rounded-[24px] border border-line/70 bg-canvas/55 p-5">
      <h2 className="text-brand-navy text-lg font-semibold">
        {t("dashboard.persona.service")}
      </h2>
      <Field label={t("dashboard.persona.identity")} htmlFor="identity">
        <Input
          id="identity"
          value={identity}
          onChange={(event) => setIdentity(event.target.value)}
        />
      </Field>
      <Field
        label={t("dashboard.persona.tradingName")}
        htmlFor="sp-trading-name"
      >
        <Input
          id="sp-trading-name"
          value={tradingName}
          onChange={(event) => setTradingName(event.target.value)}
        />
      </Field>
      <Field label={t("dashboard.persona.title")} htmlFor="title">
        <Input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("dashboard.persona.licence")} htmlFor="licence">
          <Input
            id="licence"
            value={licence}
            onChange={(event) => setLicence(event.target.value)}
          />
        </Field>
        <Field
          label={t("dashboard.persona.licenceCountry")}
          htmlFor="licence-country"
        >
          <Input
            id="licence-country"
            maxLength={2}
            value={licenceCountry}
            onChange={(event) =>
              setLicenceCountry(event.target.value.toUpperCase())
            }
          />
        </Field>
      </div>
      <Field
        label={t("dashboard.persona.professionalBody")}
        htmlFor="professional-body"
      >
        <Input
          id="professional-body"
          value={professionalBody}
          onChange={(event) => setProfessionalBody(event.target.value)}
        />
      </Field>
      <Field label={t("dashboard.persona.years")} htmlFor="years">
        <Input
          id="years"
          value={years}
          onChange={(event) => setYears(event.target.value)}
        />
      </Field>
      <Field
        label={t("dashboard.persona.availabilityStatus")}
        htmlFor="sp-availability-status"
      >
        <EnumSelect
          id="sp-availability-status"
          value={availabilityStatus}
          options={availabilityStatuses}
          onChange={setAvailabilityStatus}
          placeholder={t("dashboard.create.chooseTarget")}
          labelFor={(option) =>
            t(`dashboard.persona.availabilityStatuses.${option}`)
          }
        />
      </Field>
      <Field
        label={t("dashboard.persona.availableFrom")}
        htmlFor="sp-available-from"
      >
        <Input
          id="sp-available-from"
          type="date"
          value={availableFrom}
          onChange={(event) => setAvailableFrom(event.target.value)}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t("dashboard.persona.hourlyRate")}
          htmlFor="hourly-rate"
          hint={t("dashboard.persona.expectedPayHint")}
        >
          <Input
            id="hourly-rate"
            inputMode="decimal"
            value={rate}
            onChange={(event) => setRate(event.target.value)}
          />
        </Field>
        <Field
          label={t("dashboard.persona.rateCurrency")}
          htmlFor="rate-currency"
        >
          <Input
            id="rate-currency"
            maxLength={3}
            value={rateCurrency}
            onChange={(event) =>
              setRateCurrency(event.target.value.toUpperCase())
            }
          />
        </Field>
      </div>
      <CheckboxField
        label={t("dashboard.persona.remoteServices")}
        checked={remoteServices}
        onChange={setRemoteServices}
      />
      <Field label={t("dashboard.persona.background")} htmlFor="background">
        <Textarea
          id="background"
          value={background}
          onChange={(event) => setBackground(event.target.value)}
        />
      </Field>
      <Field label={t("dashboard.persona.capability")} htmlFor="capability">
        <Textarea
          id="capability"
          value={capability}
          onChange={(event) => setCapability(event.target.value)}
        />
      </Field>
      {message ? <p className="text-muted text-sm">{message}</p> : null}
      <Button
        type="button"
        disabled={pending}
        onClick={() =>
          void savePersona(
            {
              serviceProvider: {
                providerIdentity: identity,
                tradingName: tradingName || null,
                professionalTitle: title || null,
                licenceNumber: licence || null,
                licenceCountryCode: licenceCountry || null,
                professionalBody: professionalBody || null,
                availabilityStatus:
                  availabilityStatus as ServiceProviderUpdateContract["availabilityStatus"],
                availableFrom: availableFrom || null,
                hourlyRateMinMinor: toMinor(rate),
                rateCurrency: rateCurrency || null,
                remoteServices,
                yearsExperience: Number(years) || 0,
                professionalBackground: background,
                capabilityStatement: capability,
              },
            },
            profileVersion,
            setPending,
            setMessage,
            t("dashboard.profile.saved"),
            onSaved,
          )
        }
      >
        {t("dashboard.profile.save")}
      </Button>
    </div>
  )
}

function ProjectOwnerFields({
  persona,
  profileVersion,
  pending,
  setPending,
  message,
  setMessage,
  onSaved,
  t,
}: EditorProps) {
  const owner = persona.projectOwner
  const [background, setBackground] = useState(owner?.background ?? "")
  const [description, setDescription] = useState(owner?.description ?? "")
  const [organizationName, setOrganizationName] = useState(
    owner?.organizationName ?? "",
  )
  const [website, setWebsite] = useState(owner?.website ?? "")
  const [years, setYears] = useState(String(owner?.yearsExperience ?? 0))
  const [budgetMin, setBudgetMin] = useState(
    toMajor(owner?.typicalBudgetMinMinor),
  )
  const [budgetMax, setBudgetMax] = useState(
    toMajor(owner?.typicalBudgetMaxMinor),
  )
  const [budgetCurrency, setBudgetCurrency] = useState(
    owner?.budgetCurrency ?? "",
  )
  const [acceptsIntroductions, setAcceptsIntroductions] = useState(
    owner?.acceptsIntroductions ?? true,
  )
  const [regions, setRegions] = useState<string[]>(
    owner?.serviceRegionIds ?? [],
  )
  return (
    <div className="space-y-4 rounded-[24px] border border-line/70 bg-canvas/55 p-5">
      <h2 className="text-brand-navy text-lg font-semibold">
        {t("dashboard.persona.projectOwner")}
      </h2>
      <Field label={t("dashboard.workspace.name")} htmlFor="org-name">
        <Input
          id="org-name"
          value={organizationName}
          onChange={(event) => setOrganizationName(event.target.value)}
        />
      </Field>
      <Field
        label={t("dashboard.persona.background")}
        htmlFor="owner-background"
      >
        <Textarea
          id="owner-background"
          value={background}
          onChange={(event) => setBackground(event.target.value)}
        />
      </Field>
      <Field
        label={t("dashboard.publish.description")}
        htmlFor="owner-description"
      >
        <Textarea
          id="owner-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>
      <Field label={t("dashboard.workspace.website")} htmlFor="owner-website">
        <Input
          id="owner-website"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </Field>
      <Field label={t("dashboard.persona.years")} htmlFor="owner-years">
        <Input
          id="owner-years"
          value={years}
          onChange={(event) => setYears(event.target.value)}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label={t("dashboard.persona.typicalBudgetMin")}
          htmlFor="owner-budget-min"
        >
          <Input
            id="owner-budget-min"
            inputMode="decimal"
            value={budgetMin}
            onChange={(event) => setBudgetMin(event.target.value)}
          />
        </Field>
        <Field
          label={t("dashboard.persona.typicalBudgetMax")}
          htmlFor="owner-budget-max"
        >
          <Input
            id="owner-budget-max"
            inputMode="decimal"
            value={budgetMax}
            onChange={(event) => setBudgetMax(event.target.value)}
          />
        </Field>
        <Field
          label={t("dashboard.persona.budgetCurrency")}
          htmlFor="owner-budget-currency"
        >
          <Input
            id="owner-budget-currency"
            maxLength={3}
            value={budgetCurrency}
            onChange={(event) =>
              setBudgetCurrency(event.target.value.toUpperCase())
            }
          />
        </Field>
      </div>
      <CheckboxField
        label={t("dashboard.persona.acceptsIntroductions")}
        checked={acceptsIntroductions}
        onChange={setAcceptsIntroductions}
      />
      <Field label={t("dashboard.persona.regions")} htmlFor="owner-regions">
        <MultiSelect
          id="owner-regions"
          values={regions}
          placeholder={t("dashboard.create.chooseTarget")}
          options={(persona.regions ?? []).map((item) => ({
            value: item.id,
            label: item.label,
          }))}
          onChange={setRegions}
        />
      </Field>
      {message ? <p className="text-muted text-sm">{message}</p> : null}
      <Button
        type="button"
        disabled={pending}
        onClick={() =>
          void savePersona(
            {
              projectOwner: {
                background: background || null,
                description: description || null,
                organizationName: organizationName || null,
                website: website || null,
                typicalBudgetMinMinor: toMinor(budgetMin),
                typicalBudgetMaxMinor: toMinor(budgetMax),
                budgetCurrency: budgetCurrency || null,
                acceptsIntroductions,
                yearsExperience: Number(years) || 0,
                serviceRegionIds: regions,
              },
            },
            profileVersion,
            setPending,
            setMessage,
            t("dashboard.profile.saved"),
            onSaved,
          )
        }
      >
        {t("dashboard.profile.save")}
      </Button>
    </div>
  )
}

export function VisibilityEditor({
  visibility,
}: {
  visibility: PortalVisibility
}) {
  const t = useTranslations()
  const router = useRouter()
  const [values, setValues] = useState(visibility)
  const [pending, setPending] = useState(false)
  const fields: Array<Exclude<keyof PortalVisibility, "version">> = [
    "publicProfileVisible",
    "websiteVisible",
    "profileImageVisible",
    "emailVisible",
    "phoneVisible",
    "exactAddressVisible",
    "generalLocationVisible",
    "displayNameVisible",
    "biographyVisible",
    "skillsVisible",
    "languagesVisible",
    "portfolioVisible",
    "reviewsVisible",
    "availabilityVisible",
    "lastActiveVisible",
    "searchEngineIndexable",
  ]
  return (
    <div className="space-y-4 rounded-[24px] border border-line/70 bg-canvas/55 p-5">
      <h2 className="text-brand-navy text-lg font-semibold">
        {t("dashboard.visibility.title")}
      </h2>
      <p className="text-muted text-sm">{t("dashboard.visibility.hint")}</p>
      {fields.map((field) => (
        <label key={field} className="flex items-center gap-3 text-sm">
          <Checkbox
            checked={Boolean(values[field])}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                [field]: event.target.checked,
              }))
            }
          />
          {t(`dashboard.visibility.${field}`)}
        </label>
      ))}
      <Button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true)
          const result = await updateVisibilityAction(values)
          setPending(false)
          if (result.ok) router.refresh()
        }}
      >
        {t("dashboard.profile.save")}
      </Button>
    </div>
  )
}

type Translate = ReturnType<typeof useTranslations>

type EditorProps = {
  persona: PersonaPayload
  profileVersion: number
  pending: boolean
  setPending: (value: boolean) => void
  message?: string
  setMessage: (value?: string) => void
  onSaved: () => void
  t: Translate
}

async function savePersona(
  input: PersonaUpdateContract,
  version: number,
  setPending: (value: boolean) => void,
  setMessage: (value?: string) => void,
  saved: string,
  onSaved: () => void,
) {
  setPending(true)
  const result = await updatePersonaAction(input, version)
  setPending(false)
  setMessage(result.ok ? saved : result.message)
  if (result.ok) onSaved()
}
