import type { CatalogItemWithRelations } from "@/types"

export type ScoreLevel = {
  label: string
  textClass: string
  barClass: string
}

/** Heuristic card quality 0–100 aligned with template pScore weights. */
export const scoreCatalogItem = (item: CatalogItemWithRelations): number => {
  const titleLen = item.title.trim().length
  const photos = item.media.filter((m) => m.media_type === "image").length
  const hasVideo = item.media.some((m) => m.media_type === "video")
  const attrs = item.attributes.length
  const descLen = (item.description ?? "").trim().length
  const priceOk = Boolean(
    item.pricing &&
      (item.pricing.fixed_price ||
        item.pricing.hourly_rate ||
        item.pricing.monthly_rate ||
        item.pricing.tiers.length > 0),
  )
  const docs = item.media.filter((m) => m.media_type === "document").length

  let total = 0
  if (titleLen >= 20 && titleLen <= 120) total += 10
  if (item.category_id) total += 10
  if (photos >= 3) total += 15
  else if (photos >= 1) total += 8
  if (hasVideo) total += 5
  if (attrs >= 5) total += 15
  else if (attrs >= 2) total += 8
  if (priceOk) total += 10
  if (descLen >= 150) total += 15
  else if (descLen >= 40) total += 8
  if (docs > 0) total += 5
  // packing/lead/sample unavailable in API — partial credit if active
  if (item.status === "active") total += 10
  return Math.min(100, total)
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
