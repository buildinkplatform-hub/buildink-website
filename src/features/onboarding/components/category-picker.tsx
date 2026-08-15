"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { CategoryOption } from "@/shared/types/platform"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"

export function CategoryPicker({
  id,
  value,
  categories,
  onChange,
  onBlur,
  categoryPlaceholder = "Select category",
  subcategoryPlaceholder = "Select subcategory",
}: {
  id: string
  value?: string | string[]
  categories: CategoryOption[]
  onChange: (value: string) => void
  onBlur?: () => void
  categoryPlaceholder?: string
  subcategoryPlaceholder?: string
}) {
  const t = useTranslations("common")
  const normalizedValue = Array.isArray(value) ? (value[0] ?? "") : (value ?? "")
  const parentForValue = useMemo(
    () =>
      categories.find((category) =>
        category.children.some((child) => child.slug === normalizedValue),
      ) ?? categories.find((category) => category.slug === normalizedValue),
    [categories, normalizedValue],
  )
  const [selectedParentSlug, setSelectedParentSlug] = useState(
    parentForValue?.slug ?? "",
  )

  const selectedParent = categories.find(
    (category) => category.slug === selectedParentSlug,
  )
  const childOptions = selectedParent?.children ?? []

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Select
        value={selectedParentSlug}
        onValueChange={(slug) => {
          const parent = categories.find((category) => category.slug === slug)
          setSelectedParentSlug(slug)
          onChange(parent?.children.length ? "" : slug)
        }}
      >
        <SelectTrigger id={id} onBlur={onBlur}>
          <SelectValue placeholder={categoryPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.slug}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={
          childOptions.some((child) => child.slug === normalizedValue)
            ? normalizedValue
            : ""
        }
        onValueChange={onChange}
        disabled={!selectedParent || !childOptions.length}
      >
        <SelectTrigger aria-label={t("subcategory")}>
          <SelectValue placeholder={subcategoryPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {childOptions.map((category) => (
            <SelectItem key={category.id} value={category.slug}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
