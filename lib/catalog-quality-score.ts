import type { CatalogItemWithRelations, PricingType } from "@/types"

export type ScoreLevel = {
  label: string
  textClass: string
  barClass: string
}

export type CatalogScoreSection = "s1" | "s2" | "s3" | "s4" | "s5" | "s6"

export type CatalogScoreItem = {
  label: string
  pts: number
  ok: boolean
  section: CatalogScoreSection
}

export type CatalogScoreResult = {
  total: number
  items: CatalogScoreItem[]
}

export type CatalogDraftScoreInput = {
  title: string
  categoryId: number | null
  description: string
  attributesCount: number
  photoCount: number
  hasVideo: boolean
  documentCount: number
  pricingType: PricingType
  fixedPrice: string
  hourlyRate: string
  monthlyRate: string
  tiers: Array<{ min_qty: number; price: number }>
  status?: string | null
}

const positiveNumber = (raw: string): boolean => {
  const n = Number(raw)
  return Boolean(raw) && !Number.isNaN(n) && n > 0
}

const priceOkFromDraft = (input: CatalogDraftScoreInput): boolean => {
  if (input.pricingType === "fixed") return positiveNumber(input.fixedPrice)
  if (input.pricingType === "hourly") return positiveNumber(input.hourlyRate)
  if (input.pricingType === "monthly") return positiveNumber(input.monthlyRate)
  if (input.pricingType === "tiered") {
    return (
      input.tiers.length > 0 &&
      input.tiers.some((t) => t.min_qty >= 1 && t.price > 0)
    )
  }
  return false
}

const computeTotal = (input: CatalogDraftScoreInput): number => {
  const titleLen = input.title.trim().length
  const descLen = input.description.trim().length
  let total = 0
  if (titleLen >= 20 && titleLen <= 120) total += 10
  if (input.categoryId) total += 10
  if (input.photoCount >= 3) total += 15
  else if (input.photoCount >= 1) total += 8
  if (input.hasVideo) total += 5
  if (input.attributesCount >= 5) total += 15
  else if (input.attributesCount >= 2) total += 8
  if (priceOkFromDraft(input)) total += 10
  if (descLen >= 150) total += 15
  else if (descLen >= 40) total += 8
  if (input.documentCount > 0) total += 5
  if (input.status === "active") total += 10
  return Math.min(100, total)
}

/** Checklist score for live draft form (API-backed fields only). */
export const scoreCatalogDraft = (
  input: CatalogDraftScoreInput,
): CatalogScoreResult => {
  const titleLen = input.title.trim().length
  const descLen = input.description.trim().length

  const items: CatalogScoreItem[] = [
    {
      label: "Название 20–120 символов",
      pts: 10,
      ok: titleLen >= 20 && titleLen <= 120,
      section: "s1",
    },
    {
      label: "Категория выбрана",
      pts: 10,
      ok: Boolean(input.categoryId),
      section: "s1",
    },
    {
      label: "Не меньше 3 фото",
      pts: 15,
      ok: input.photoCount >= 3,
      section: "s2",
    },
    {
      label: "Видео товара",
      pts: 5,
      ok: input.hasVideo,
      section: "s2",
    },
    {
      label: "5 и больше характеристик",
      pts: 15,
      ok: input.attributesCount >= 5,
      section: "s3",
    },
    {
      label: "Цена указана",
      pts: 10,
      ok: priceOkFromDraft(input),
      section: "s4",
    },
    {
      label: "Подробное описание",
      pts: 15,
      ok: descLen >= 150,
      section: "s5",
    },
    {
      label: "Сертификаты или документы",
      pts: 5,
      ok: input.documentCount > 0,
      section: "s6",
    },
  ]

  if (input.status === "active") {
    items.push({
      label: "Опубликовано в каталоге",
      pts: 10,
      ok: true,
      section: "s1",
    })
  }

  return { total: computeTotal(input), items }
}

/** Heuristic card quality 0–100 aligned with template pScore weights. */
export const scoreCatalogItem = (item: CatalogItemWithRelations): number => {
  return scoreCatalogDraft({
    title: item.title,
    categoryId: item.category_id,
    description: item.description ?? "",
    attributesCount: item.attributes.length,
    photoCount: item.media.filter((m) => m.media_type === "image").length,
    hasVideo: item.media.some((m) => m.media_type === "video"),
    documentCount: item.media.filter((m) => m.media_type === "document").length,
    pricingType: item.pricing?.pricing_type ?? "fixed",
    fixedPrice:
      item.pricing?.fixed_price != null ? String(item.pricing.fixed_price) : "",
    hourlyRate:
      item.pricing?.hourly_rate != null ? String(item.pricing.hourly_rate) : "",
    monthlyRate:
      item.pricing?.monthly_rate != null ? String(item.pricing.monthly_rate) : "",
    tiers: item.pricing?.tiers ?? [],
    status: item.status,
  }).total
}

export const scoreLevel = (total: number): ScoreLevel => {
  if (total >= 80) {
    return {
      label: "Отличная карточка",
      textClass: "text-brand-700",
      barClass: "bg-brand-600",
    }
  }
  if (total >= 50) {
    return {
      label: "Хорошая, можно лучше",
      textClass: "text-amber-700",
      barClass: "bg-amber-500",
    }
  }
  return {
    label: "Слабая карточка",
    textClass: "text-red-600",
    barClass: "bg-red-500",
  }
}

export const sectionComplete = (
  result: CatalogScoreResult,
  section: CatalogScoreSection,
): boolean => {
  const sectionItems = result.items.filter((i) => i.section === section)
  if (sectionItems.length === 0) return false
  return sectionItems.every((i) => i.ok)
}
