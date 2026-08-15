"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { MultiSelect } from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateProfileCollectionsAction } from "@/features/dashboard/actions/portal.actions"
import type { PortalProfileCollections } from "@/features/dashboard/data/portal-client"

const skillLevels = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"] as const

const proficiencies = [
  "BASIC",
  "CONVERSATIONAL",
  "PROFESSIONAL",
  "NATIVE",
] as const

type SkillLevel = (typeof skillLevels)[number]
type Proficiency = (typeof proficiencies)[number]

function labelOf(translations: unknown, slug: string) {
  if (!translations || typeof translations !== "object") return slug
  const record = translations as Record<string, { name?: string } | string>
  const en = record.en
  if (typeof en === "string") return en
  if (en && typeof en === "object" && en.name) return en.name
  return slug
}

function asSkillLevel(value: string | null): SkillLevel | null {
  return skillLevels.includes(value as SkillLevel)
    ? (value as SkillLevel)
    : null
}

function asProficiency(value: string | null): Proficiency | null {
  return proficiencies.includes(value as Proficiency)
    ? (value as Proficiency)
    : null
}

export function ProfileCollectionsEditor({
  collections,
}: {
  collections: PortalProfileCollections
}) {
  const t = useTranslations()
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()

  const [skillIds, setSkillIds] = useState<string[]>(
    collections.skills.map((item) => item.skillId),
  )
  const [skillLevelById, setSkillLevelById] = useState<
    Record<string, SkillLevel | null>
  >(
    Object.fromEntries(
      collections.skills.map((item) => [
        item.skillId,
        asSkillLevel(item.level),
      ]),
    ),
  )
  const [languageCodes, setLanguageCodes] = useState<string[]>(
    collections.languages.map((item) => item.languageCode),
  )
  const [proficiencyByCode, setProficiencyByCode] = useState<
    Record<string, Proficiency | null>
  >(
    Object.fromEntries(
      collections.languages.map((item) => [
        item.languageCode,
        asProficiency(item.proficiency),
      ]),
    ),
  )
  const [categoryIds, setCategoryIds] = useState<string[]>(
    collections.categoryIds,
  )
  const [serviceRegionIds, setServiceRegionIds] = useState<string[]>(
    collections.serviceRegionIds,
  )

  const skillLabel = (id: string) => {
    const option = collections.catalogue.skills.find((item) => item.id === id)
    return option ? labelOf(option.translations, option.slug) : id
  }
  const languageLabel = (code: string) =>
    collections.catalogue.languages.find((item) => item.code === code)?.name ??
    code

  async function save() {
    setPending(true)
    setMessage(undefined)
    const result = await updateProfileCollectionsAction({
      skills: skillIds.map((skillId) => ({
        skillId,
        level: skillLevelById[skillId] ?? null,
      })),
      languages: languageCodes.map((languageCode) => ({
        languageCode,
        proficiency: proficiencyByCode[languageCode] ?? null,
      })),
      categoryIds,
      serviceRegionIds,
      version: collections.version,
    })
    setPending(false)
    if (!result.ok) {
      setMessage(result.message)
      return
    }
    setMessage(t("dashboard.profile.saved"))
    router.refresh()
  }

  return (
    <div className="space-y-5 rounded-[24px] border border-line/70 bg-canvas/55 p-5">
      <div>
        <h2 className="text-brand-navy text-lg font-semibold">
          {t("dashboard.collections.title")}
        </h2>
        <p className="text-muted mt-1 text-sm">
          {t("dashboard.collections.hint")}
        </p>
      </div>

      <Field label={t("dashboard.collections.skills")} htmlFor="profile-skills">
        <MultiSelect
          id="profile-skills"
          values={skillIds}
          placeholder={t("dashboard.create.chooseTarget")}
          options={collections.catalogue.skills.map((item) => ({
            value: item.id,
            label: labelOf(item.translations, item.slug),
          }))}
          onChange={setSkillIds}
        />
      </Field>
      {skillIds.length ? (
        <div className="space-y-3">
          {skillIds.map((skillId) => (
            <div
              key={skillId}
              className="grid gap-2 sm:grid-cols-[1fr_200px] sm:items-center"
            >
              <span className="text-ink text-sm">{skillLabel(skillId)}</span>
              <Select
                value={skillLevelById[skillId] ?? ""}
                onValueChange={(value) =>
                  setSkillLevelById((current) => ({
                    ...current,
                    [skillId]: asSkillLevel(value),
                  }))
                }
              >
                <SelectTrigger aria-label={t("dashboard.collections.level")}>
                  <SelectValue placeholder={t("dashboard.collections.level")} />
                </SelectTrigger>
                <SelectContent>
                  {skillLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {t(`dashboard.collections.levels.${level}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      ) : null}

      <Field
        label={t("dashboard.collections.languages")}
        htmlFor="profile-languages"
      >
        <MultiSelect
          id="profile-languages"
          values={languageCodes}
          placeholder={t("dashboard.create.chooseTarget")}
          options={collections.catalogue.languages.map((item) => ({
            value: item.code,
            label: item.name,
          }))}
          onChange={setLanguageCodes}
        />
      </Field>
      {languageCodes.length ? (
        <div className="space-y-3">
          {languageCodes.map((code) => (
            <div
              key={code}
              className="grid gap-2 sm:grid-cols-[1fr_200px] sm:items-center"
            >
              <span className="text-ink text-sm">{languageLabel(code)}</span>
              <Select
                value={proficiencyByCode[code] ?? ""}
                onValueChange={(value) =>
                  setProficiencyByCode((current) => ({
                    ...current,
                    [code]: asProficiency(value),
                  }))
                }
              >
                <SelectTrigger
                  aria-label={t("dashboard.collections.proficiency")}
                >
                  <SelectValue
                    placeholder={t("dashboard.collections.proficiency")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {proficiencies.map((level) => (
                    <SelectItem key={level} value={level}>
                      {t(`dashboard.collections.proficiencies.${level}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      ) : null}

      <Field
        label={t("dashboard.collections.categories")}
        htmlFor="profile-categories"
      >
        <MultiSelect
          id="profile-categories"
          values={categoryIds}
          placeholder={t("dashboard.create.chooseTarget")}
          options={collections.catalogue.categories.map((item) => ({
            value: item.id,
            label: labelOf(item.translations, item.slug),
          }))}
          onChange={setCategoryIds}
        />
      </Field>

      <Field
        label={t("dashboard.collections.serviceRegions")}
        htmlFor="profile-regions"
      >
        <MultiSelect
          id="profile-regions"
          values={serviceRegionIds}
          placeholder={t("dashboard.create.chooseTarget")}
          options={collections.catalogue.serviceRegions.map((item) => ({
            value: item.id,
            label: `${item.label} (${item.countryCode})`,
          }))}
          onChange={setServiceRegionIds}
        />
      </Field>

      {message ? <p className="text-muted text-sm">{message}</p> : null}
      <Button type="button" disabled={pending} onClick={() => void save()}>
        {t("dashboard.profile.save")}
      </Button>
    </div>
  )
}
