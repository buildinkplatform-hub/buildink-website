"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"

import { ConfirmationDialog } from "@/components/feedback/confirmation-dialog"
import { CityLocationField } from "@/components/forms/city-location-field"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  createEquipmentAction,
  updateEntityAction,
} from "@/features/dashboard/actions/portal.actions"
import { portalDetailPath } from "@/features/dashboard/config/portal-routes"
import type {
  PortalEquipmentItem,
  PortalTaxonomyItem,
} from "@/features/dashboard/data/portal-client"
import {
  eurosToMinor,
  minorToEuros,
} from "@/features/dashboard/lib/marketplace-money"
import { Link, useRouter } from "@/i18n/navigation"
import { equipmentWebsiteSchema } from "@/shared/marketplace/portal-form-schemas"

const listingTypes = ["RENT", "SALE", "RENT_AND_SALE"] as const
const conditions = ["NEW", "EXCELLENT", "GOOD", "FAIR", "NEEDS_REPAIR"] as const

export function EquipmentForm({
  mode,
  equipment,
  companyId,
  categories,
}: {
  mode: "create" | "edit"
  equipment?: PortalEquipmentItem
  companyId?: string
  categories: PortalTaxonomyItem[]
}) {
  const t = useTranslations()
  const router = useRouter()
  const createKey = useMemo(() => crypto.randomUUID(), [])
  const [name, setName] = useState(equipment?.name ?? "")
  const [description, setDescription] = useState(equipment?.description ?? "")
  const [listingType, setListingType] = useState(
    equipment?.listingType ?? "RENT",
  )
  const [condition, setCondition] = useState(equipment?.condition ?? "GOOD")
  const [categoryId, setCategoryId] = useState(equipment?.categoryId ?? "")
  const [cityId, setCityId] = useState(equipment?.cityId ?? "")
  const [brand, setBrand] = useState(equipment?.brand ?? "")
  const [model, setModel] = useState(equipment?.model ?? "")
  const [serialNumber, setSerialNumber] = useState(equipment?.serialNumber ?? "")
  const [year, setYear] = useState(
    equipment?.yearManufactured ? String(equipment.yearManufactured) : "",
  )
  const [rate, setRate] = useState(minorToEuros(equipment?.dailyRateMinor))
  const [weeklyRate, setWeeklyRate] = useState(
    minorToEuros(equipment?.weeklyRateMinor),
  )
  const [monthlyRate, setMonthlyRate] = useState(
    minorToEuros(equipment?.monthlyRateMinor),
  )
  const [salePrice, setSalePrice] = useState(
    minorToEuros(equipment?.salePriceMinor),
  )
  const [ratePublic, setRatePublic] = useState(equipment?.ratePublic ?? false)
  const [operatorIncluded, setOperatorIncluded] = useState(
    equipment?.operatorIncluded ?? false,
  )
  const [deliveryAvailable, setDeliveryAvailable] = useState(
    equipment?.deliveryAvailable ?? false,
  )
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<string>()
  const [confirmOpen, setConfirmOpen] = useState(false)

  function body(publish = false) {
    return {
      name,
      description: description || null,
      listingType,
      condition: condition || null,
      categoryId: categoryId || null,
      cityId: cityId || null,
      brand: brand || null,
      model: model || null,
      serialNumber: serialNumber || null,
      yearManufactured: year ? Number(year) : null,
      dailyRateMinor: eurosToMinor(rate) || null,
      weeklyRateMinor: eurosToMinor(weeklyRate) || null,
      monthlyRateMinor: eurosToMinor(monthlyRate) || null,
      salePriceMinor: eurosToMinor(salePrice) || null,
      ratePublic,
      operatorIncluded,
      deliveryAvailable,
      currency: equipment?.currency ?? "EUR",
      publish,
    }
  }

  async function save(publish: boolean) {
    const parsed = equipmentWebsiteSchema.safeParse(body(publish))
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message)
      return
    }
    setPending(true)
    setMessage(undefined)
    const result =
      mode === "edit" && equipment?.version
        ? await updateEntityAction(
            "equipment",
            equipment.id,
            parsed.data,
            equipment.version,
          )
        : await createEquipmentAction(parsed.data, createKey, companyId)
    setPending(false)
    if (!result.ok) {
      setMessage(result.message)
      return
    }
    const created =
      "data" in result ? (result.data as { id?: string } | undefined) : undefined
    const id = equipment?.id ?? created?.id
    if (id) router.push(portalDetailPath("equipment", id))
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-4 p-5">
        <Field label={t("dashboard.publish.name")} htmlFor="equip-name" required>
          <Input
            id="equip-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field
          label={t("dashboard.publish.description")}
          htmlFor="equip-description"
        >
          <Textarea
            id="equip-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("dashboard.publish.listingType")} htmlFor="equip-type">
            <Select
              value={listingType}
              onValueChange={(value) =>
                setListingType(value as (typeof listingTypes)[number])
              }
            >
              <SelectTrigger id="equip-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {listingTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {t(
                      type === "RENT"
                        ? "dashboard.publish.rent"
                        : type === "SALE"
                          ? "dashboard.publish.sale"
                          : "dashboard.publish.rentAndSale",
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label={t("dashboard.fields.condition")} htmlFor="equip-condition">
            <Select
              value={condition}
              onValueChange={(value) =>
                setCondition(value as (typeof conditions)[number])
              }
            >
              <SelectTrigger id="equip-condition">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {conditions.map((item) => (
                  <SelectItem key={item} value={item}>
                    {t(`dashboard.publish.conditions.${item}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <Field label={t("dashboard.publish.category")} htmlFor="equip-category">
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="equip-category">
              <SelectValue placeholder={t("dashboard.create.chooseTarget")} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name ?? item.label ?? item.slug ?? item.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={t("dashboard.publish.location")} htmlFor="equip-location">
          <CityLocationField
            cityId={cityId || undefined}
            onChange={setCityId}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("dashboard.publish.brand")} htmlFor="equip-brand">
            <Input
              id="equip-brand"
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
            />
          </Field>
          <Field label={t("dashboard.fields.model")} htmlFor="equip-model">
            <Input
              id="equip-model"
              value={model}
              onChange={(event) => setModel(event.target.value)}
            />
          </Field>
          <Field
            label={t("dashboard.fields.serialNumber")}
            htmlFor="equip-serial"
          >
            <Input
              id="equip-serial"
              value={serialNumber}
              onChange={(event) => setSerialNumber(event.target.value)}
            />
          </Field>
          <Field label={t("dashboard.publish.year")} htmlFor="equip-year">
            <Input
              id="equip-year"
              type="number"
              min={1900}
              max={2100}
              value={year}
              onChange={(event) => setYear(event.target.value)}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("dashboard.create.price")} htmlFor="equip-rate">
            <Input
              id="equip-rate"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </Field>
          <Field label={t("dashboard.publish.weeklyRate")} htmlFor="equip-weekly">
            <Input
              id="equip-weekly"
              value={weeklyRate}
              onChange={(event) => setWeeklyRate(event.target.value)}
            />
          </Field>
          <Field
            label={t("dashboard.publish.monthlyRate")}
            htmlFor="equip-monthly"
          >
            <Input
              id="equip-monthly"
              value={monthlyRate}
              onChange={(event) => setMonthlyRate(event.target.value)}
            />
          </Field>
          <Field label={t("dashboard.fields.salePrice")} htmlFor="equip-sale">
            <Input
              id="equip-sale"
              value={salePrice}
              onChange={(event) => setSalePrice(event.target.value)}
            />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={ratePublic}
            onChange={(event) => setRatePublic(event.target.checked)}
          />
          {t("dashboard.publish.ratePublic")}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={operatorIncluded}
            onChange={(event) => setOperatorIncluded(event.target.checked)}
          />
          {t("dashboard.publish.operatorIncluded")}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={deliveryAvailable}
            onChange={(event) => setDeliveryAvailable(event.target.checked)}
          />
          {t("dashboard.publish.deliveryAvailable")}
        </label>
      </Card>
      {message ? <p className="text-danger text-sm">{message}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={pending || !name}
          onClick={() => void save(false)}
        >
          {mode === "edit"
            ? t("dashboard.edit.save")
            : t("dashboard.publish.saveDraft")}
        </Button>
        {mode === "create" ? (
          <>
            <Button
              type="button"
              disabled={pending || !name}
              onClick={() => setConfirmOpen(true)}
            >
              {t("dashboard.publish.publish")}
            </Button>
            <ConfirmationDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title={t("dashboard.publish.publish")}
              description={t("dashboard.publish.confirmEquipment")}
              confirmLabel={t("dashboard.publish.publish")}
              cancelLabel={t("common.cancel")}
              pending={pending}
              onConfirm={() => void save(true)}
            />
          </>
        ) : null}
        <Button type="button" variant="secondary" asChild>
          <Link
            href={
              equipment
                ? portalDetailPath("equipment", equipment.id)
                : "/dashboard/equipment"
            }
          >
            {t("common.cancel")}
          </Link>
        </Button>
      </div>
    </div>
  )
}
