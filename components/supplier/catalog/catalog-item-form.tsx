"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Briefcase } from "lucide-react"
import { cn } from "@/lib/utils"
import { catalogCategories } from "@/lib/mock/catalog-categories"
import type { CatalogItemInput, CatalogItemWithRelations, CatalogItemType } from "@/types"
import { AttributeFields, type AttributeFieldRow } from "@/components/supplier/catalog/attribute-fields"
import { MediaFields, type MediaFieldRow } from "@/components/supplier/catalog/media-fields"
import {
  PricingFields,
  type PricingFieldValues,
} from "@/components/supplier/catalog/pricing-fields"

type CatalogItemFormProps = {
  initial?: CatalogItemWithRelations
  onSubmit: (input: CatalogItemInput, status: "draft" | "active") => void
}

const defaultPricing: PricingFieldValues = {
  pricing_type: "fixed",
  currency: "RUB",
  fixed_price: "",
  hourly_rate: "",
  monthly_rate: "",
  tiers: [{ min_qty: 1, price: 0 }],
}

const pricingFromItem = (item?: CatalogItemWithRelations): PricingFieldValues => {
  if (!item?.pricing) return defaultPricing
  const p = item.pricing
  return {
    pricing_type: p.pricing_type,
    currency: p.currency,
    fixed_price: p.fixed_price != null ? String(p.fixed_price) : "",
    hourly_rate: p.hourly_rate != null ? String(p.hourly_rate) : "",
    monthly_rate: p.monthly_rate != null ? String(p.monthly_rate) : "",
    tiers: p.tiers.length > 0 ? p.tiers : [{ min_qty: 1, price: 0 }],
  }
}

export const CatalogItemForm = ({ initial, onSubmit }: CatalogItemFormProps) => {
  const [type, setType] = useState<CatalogItemType>(initial?.type ?? "product")
  const [title, setTitle] = useState(initial?.title ?? "")
  const [categoryId, setCategoryId] = useState(
    initial?.category_id ? String(initial.category_id) : "",
  )
  const [description, setDescription] = useState(initial?.description ?? "")
  const [attributes, setAttributes] = useState<AttributeFieldRow[]>(
    initial?.attributes.map((a) => ({
      name: a.name,
      value: a.value,
      value_type: a.value_type,
    })) ?? [],
  )
  const [media, setMedia] = useState<MediaFieldRow[]>(
    initial?.media.map((m) => ({
      file_name: m.file_name,
      file_url: m.file_url,
      media_type: m.media_type,
    })) ?? [],
  )
  const [pricing, setPricing] = useState<PricingFieldValues>(pricingFromItem(initial))
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (title.trim().length < 5) e.title = "Название не короче 5 символов"
    if (!categoryId) e.categoryId = "Выберите категорию"
    if (description.trim().length < 10) e.description = "Описание от 10 символов"

    if (pricing.pricing_type === "fixed") {
      const price = Number(pricing.fixed_price)
      if (!pricing.fixed_price || Number.isNaN(price) || price <= 0) {
        e.fixed_price = "Укажите цену"
      }
    }
    if (pricing.pricing_type === "hourly") {
      const rate = Number(pricing.hourly_rate)
      if (!pricing.hourly_rate || Number.isNaN(rate) || rate <= 0) {
        e.hourly_rate = "Укажите ставку"
      }
    }
    if (pricing.pricing_type === "monthly") {
      const rate = Number(pricing.monthly_rate)
      if (!pricing.monthly_rate || Number.isNaN(rate) || rate <= 0) {
        e.monthly_rate = "Укажите ставку"
      }
    }
    if (pricing.pricing_type === "tiered") {
      if (
        pricing.tiers.length === 0 ||
        pricing.tiers.some((t) => t.min_qty < 1 || t.price <= 0)
      ) {
        e.tiers = "Добавьте хотя бы одну ступень с ценой"
      }
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const buildInput = (status: "draft" | "active"): CatalogItemInput => ({
    type,
    category_id: Number(categoryId),
    title: title.trim(),
    description: description.trim(),
    status,
    attributes: attributes
      .filter((a) => a.name.trim())
      .map((a, index) => ({
        name: a.name.trim(),
        value: a.value.trim(),
        value_type: a.value_type,
        sort_order: index,
      })),
    media: media
      .filter((m) => m.file_name.trim())
      .map((m, index) => ({
        file_name: m.file_name.trim(),
        file_url: m.file_url.trim() || "#",
        media_type: m.media_type,
        sort_order: index,
      })),
    pricing: {
      pricing_type: pricing.pricing_type,
      currency: pricing.currency,
      fixed_price:
        pricing.pricing_type === "fixed" ? Number(pricing.fixed_price) : null,
      hourly_rate:
        pricing.pricing_type === "hourly" ? Number(pricing.hourly_rate) : null,
      monthly_rate:
        pricing.pricing_type === "monthly" ? Number(pricing.monthly_rate) : null,
      tiers: pricing.pricing_type === "tiered" ? pricing.tiers : [],
    },
  })

  const handleSubmit = (status: "draft" | "active") => {
    if (!validate()) return
    onSubmit(buildInput(status), status)
  }

  const inputClass = (field: string) =>
    cn(
      "w-full h-11 px-4 rounded-xl border bg-white text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20",
      errors[field] ? "border-destructive" : "border-input focus:border-primary",
    )

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      <Link
        href="/supplier/catalog"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} /> К каталогу
      </Link>

      <div>
        <h1 className="text-2xl font-black text-foreground">
          {initial ? "Редактирование позиции" : "Создание позиции"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Заполните данные товара или услуги для каталога
        </p>
      </div>

      <section className="bg-white border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-foreground">Тип</h2>
        <div className="grid grid-cols-2 gap-3 max-w-md">
          {(["product", "service"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setType(value)}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl border text-left transition-colors",
                type === value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30",
              )}
            >
              {value === "product" ? (
                <ShoppingCart size={20} className="text-primary" />
              ) : (
                <Briefcase size={20} className="text-primary" />
              )}
              <span className="text-sm font-semibold">
                {value === "product" ? "Товар" : "Услуга"}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-foreground">Основное</h2>
        <div>
          <label htmlFor="item-title" className="block text-sm font-medium mb-1.5">
            Название
          </label>
          <input
            id="item-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass("title")}
          />
          {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
        </div>
        <div>
          <label htmlFor="item-category" className="block text-sm font-medium mb-1.5">
            Категория
          </label>
          <select
            id="item-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputClass("categoryId")}
          >
            <option value="">Выберите категорию</option>
            {catalogCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-xs text-destructive mt-1">{errors.categoryId}</p>
          )}
        </div>
        <div>
          <label htmlFor="item-description" className="block text-sm font-medium mb-1.5">
            Описание
          </label>
          <textarea
            id="item-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className={cn(
              "w-full px-4 py-3 rounded-xl border bg-white text-sm outline-none resize-none transition-all focus:ring-2 focus:ring-primary/20",
              errors.description ? "border-destructive" : "border-input focus:border-primary",
            )}
          />
          {errors.description && (
            <p className="text-xs text-destructive mt-1">{errors.description}</p>
          )}
        </div>
      </section>

      <section className="bg-white border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-foreground">Атрибуты</h2>
        <AttributeFields attributes={attributes} onChange={setAttributes} errors={errors} />
      </section>

      <section className="bg-white border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-foreground">Медиа</h2>
        <p className="text-xs text-muted-foreground">
          Изображения, документы и видео (демо — без реальной загрузки)
        </p>
        <MediaFields media={media} onChange={setMedia} />
      </section>

      <section className="bg-white border border-border rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-foreground">Ценообразование</h2>
        <PricingFields values={pricing} onChange={setPricing} errors={errors} />
      </section>

      <div className="flex flex-col sm:flex-row gap-3 pb-8">
        <button
          type="button"
          onClick={() => handleSubmit("draft")}
          className="h-11 px-5 rounded-xl border border-border text-sm font-bold hover:bg-secondary transition-colors"
        >
          Сохранить черновик
        </button>
        <button
          type="button"
          onClick={() => handleSubmit("active")}
          className="h-11 px-5 rounded-xl bg-primary hover:bg-[oklch(0.58_0.22_38)] text-white text-sm font-bold transition-colors"
        >
          Опубликовать
        </button>
      </div>
    </div>
  )
}
