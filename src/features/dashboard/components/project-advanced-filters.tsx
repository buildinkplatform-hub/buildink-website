"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { DatePicker } from "@/components/ui/date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils/cn"
import type { PortalTaxonomyItem } from "@/features/dashboard/data/portal-client"

function taxonomyLabel(item: PortalTaxonomyItem, locale: string) {
  if (item.name) return item.name
  if (item.label) return item.label
  if (item.translations && typeof item.translations === "object") {
    const translations = item.translations as Record<string, unknown>
    const translated = translations[locale] ?? translations.en
    if (typeof translated === "string") return translated
    if (translated && typeof translated === "object" && "name" in translated) {
      return String((translated as { name: unknown }).name)
    }
  }
  return item.slug ?? item.id
}

export function ProjectAdvancedFilters({
  categories,
  cities,
  tags,
  categoryId,
  cityId,
  tagId,
  deadlineFrom,
  deadlineTo,
  locale,
  labels,
  className,
}: {
  categories: PortalTaxonomyItem[]
  cities: PortalTaxonomyItem[]
  tags: PortalTaxonomyItem[]
  categoryId?: string
  cityId?: string
  tagId?: string
  deadlineFrom?: string
  deadlineTo?: string
  locale: string
  labels: {
    category: string
    tag: string
    allCategories: string
    allLocations: string
    allTags: string
    deadlineFrom: string
    deadlineTo: string
  }
  className?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateFilter(
    key: "categoryId" | "cityId" | "tagId" | "deadlineFrom" | "deadlineTo",
    value: string,
  ) {
    const next = new URLSearchParams(searchParams.toString())
    if (!value || value === "all") next.delete(key)
    else next.set(key, value)
    next.delete("page")
    const query = next.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    })
  }

  return (
    <div className={cn("grid gap-3 md:grid-cols-2 xl:grid-cols-5", className)}>
      <Select
        value={categoryId ?? "all"}
        onValueChange={(value) => updateFilter("categoryId", value)}
      >
        <SelectTrigger aria-label={labels.category}>
          <SelectValue placeholder={labels.allCategories} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{labels.allCategories}</SelectItem>
          {categories.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {taxonomyLabel(item, locale)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={cityId ?? "all"}
        onValueChange={(value) => updateFilter("cityId", value)}
      >
        <SelectTrigger aria-label={labels.allLocations}>
          <SelectValue placeholder={labels.allLocations} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{labels.allLocations}</SelectItem>
          {cities.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {taxonomyLabel(item, locale)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={tagId ?? "all"}
        onValueChange={(value) => updateFilter("tagId", value)}
      >
        <SelectTrigger aria-label={labels.tag}>
          <SelectValue placeholder={labels.allTags} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{labels.allTags}</SelectItem>
          {tags.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {taxonomyLabel(item, locale)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DatePicker
        id="project-deadline-from"
        value={deadlineFrom}
        onChange={(value) => updateFilter("deadlineFrom", value)}
        placeholder={labels.deadlineFrom}
      />
      <DatePicker
        id="project-deadline-to"
        value={deadlineTo}
        onChange={(value) => updateFilter("deadlineTo", value)}
        placeholder={labels.deadlineTo}
        fromDate={deadlineFrom ? new Date(deadlineFrom) : undefined}
      />
    </div>
  )
}
