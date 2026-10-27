import type { CatalogItemType } from "@/types"
import type { AttributeFieldRow } from "@/components/supplier/catalog/attribute-fields"
import type { MediaFieldRow } from "@/components/supplier/catalog/media-fields"
import type { PricingFieldValues } from "@/components/supplier/catalog/pricing-fields"

export type CatalogFormScoreInput = {
  type: CatalogItemType
  title: string
  categoryId: string
  description: string
  unit: string
  moq: string
  lead: string
  attributes: AttributeFieldRow[]
  media: MediaFieldRow[]
  pricing: PricingFieldValues
  invoice: boolean
}

export type ScoreItem = {
  id: string
  label: string
  points: number
  ok: boolean
  sectionId: string
}

export type CatalogFormScore = {
  total: number
  level: string
  levelClass: string
  barClass: string
  items: ScoreItem[]
}

const priceOk = (pricing: PricingFieldValues): boolean => {
  if (pricing.pricing_type === "fixed") {
    const n = Number(pricing.fixed_price)
    return Number.isFinite(n) && n > 0
  }
  if (pricing.pricing_type === "hourly") {
    const n = Number(pricing.hourly_rate)
    return Number.isFinite(n) && n > 0
  }
  if (pricing.pricing_type === "monthly") {
    const n = Number(pricing.monthly_rate)
    return Number.isFinite(n) && n > 0
  }
  const good = pricing.tiers.filter((t) => t.min_qty >= 1 && t.price > 0)
  return good.length >= 1
}

export const scoreLevelMeta = (
  total: number,
): { level: string; levelClass: string; barClass: string } => {
  if (total >= 80) {
    return {
      level: "Отлично — карточка готова к проверке",
      levelClass: "text-brand-700",
      barClass: "bg-brand-600",
    }
  }
  if (total >= 50) {
    return {
      level: "Нормально — можно улучшить",
      levelClass: "text-amber-700",
      barClass: "bg-amber-500",
    }
  }
  return {
    level: "Слабо — заполните обязательные поля",
    levelClass: "text-red-700",
    barClass: "bg-red-500",
  }
}

export const computeCatalogFormScore = (
  input: CatalogFormScoreInput,
): CatalogFormScore => {
  const images = input.media.filter((m) => m.media_type === "image" && m.file_url)
  const docs = input.media.filter((m) => m.media_type === "document" && m.file_url)
  const videos = input.media.filter((m) => m.media_type === "video" && m.file_url)
  const attrsFilled = input.attributes.filter(
    (a) => a.name.trim() && a.value.trim(),
  ).length
  const descLen = input.description.trim().length
  const titleLen = input.title.trim().length

  const items: ScoreItem[] = [
    {
      id: "title",
      label: "Название 20–120 символов",
      points: 15,
      ok: titleLen >= 20 && titleLen <= 120,
      sectionId: "s1",
    },
    {
      id: "category",
      label: "Категория выбрана",
      points: 10,
      ok: Boolean(input.categoryId),
      sectionId: "s1",
    },
    {
      id: "photos",
      label: "Не меньше 1 фото",
      points: 15,
      ok: images.length >= 1,
      sectionId: "s2",
    },
    {
      id: "photos3",
      label: "3 и больше фото",
      points: 10,
      ok: images.length >= 3,
      sectionId: "s2",
    },
    {
      id: "video",
      label: "Видео (необязательно)",
      points: 5,
      ok: videos.length >= 1,
      sectionId: "s2",
    },
    {
      id: "attrs",
      label: "3 и больше характеристик",
      points: 15,
      ok: attrsFilled >= 3,
      sectionId: "s3",
    },
    {
      id: "price",
      label: "Указана цена",
      points: 15,
      ok: priceOk(input.pricing),
      sectionId: "s4",
    },
    {
      id: "desc",
      label: "Описание от 80 символов",
      points: 10,
      ok: descLen >= 80,
      sectionId: "s5",
    },
    {
      id: "lead",
      label: input.type === "service" ? "Срок оказания" : "Срок отгрузки",
      points: 5,
      ok: input.lead.trim().length >= 2,
      sectionId: "s6",
    },
    {
      id: "docs",
      label: "Документ или сертификат",
      points: 5,
      ok: docs.length >= 1 || input.invoice,
      sectionId: "s2",
    },
  ]

  const total = Math.min(
    100,
    items.reduce((sum, item) => sum + (item.ok ? item.points : 0), 0),
  )
  const meta = scoreLevelMeta(total)
  return { total, items, ...meta }
}

export const ATTR_UNIT = "Единица измерения"
export const ATTR_MOQ = "Мин. заказ"
export const ATTR_LEAD = "Срок"

export const UNITS = ["шт", "кг", "м²", "комплект", "коробка", "проект", "час"] as const

export const FORM_SECTIONS = [
  { id: "s1", title: "Основное" },
  { id: "s2", title: "Фото и документы" },
  { id: "s3", title: "Характеристики" },
  { id: "s4", title: "Цена и заказ" },
  { id: "s5", title: "Описание" },
  { id: "s6", title: "Сроки и условия" },
] as const
