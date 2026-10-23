import type { ItemPricing, ItemStatus, PricingType } from "@/types"
import { formatCurrency } from "@/lib/format"

export const itemStatusMeta: Record<
  ItemStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Черновик",
    className: "bg-muted text-muted-foreground",
  },
  pending_review: {
    label: "На модерации",
    className: "bg-info/10 text-info",
  },
  changes_requested: {
    label: "Отклонено",
    className: "bg-destructive/10 text-destructive",
  },
  active: {
    label: "Активна",
    className: "bg-primary/10 text-primary",
  },
  hidden: {
    label: "Скрыта",
    className: "bg-slate-200 text-slate-700",
  },
  archived: {
    label: "В архиве",
    className: "bg-warning/10 text-warning",
  },
  deleted: {
    label: "Удалена",
    className: "bg-destructive/10 text-destructive",
  },
}

export const catalogReportReasonLabels = {
  spam: "Спам",
  fraud: "Мошенничество",
  counterfeit: "Подделка",
  abuse: "Оскорбления / злоупотребление",
  other: "Другое",
} as const

export const pricingTypeMeta: Record<PricingType, string> = {
  fixed: "Фиксированная",
  tiered: "Ступенчатая",
  hourly: "Почасовая",
  monthly: "Ежемесячная",
}

export const catalogItemTypeLabel = {
  product: "Товар",
  service: "Услуга",
} as const

export const resolveListPrice = (
  pricing: ItemPricing | null,
): { price: number; currency: string } | null => {
  if (!pricing) return null
  const { currency } = pricing

  if (pricing.pricing_type === "fixed" && pricing.fixed_price != null) {
    return { price: pricing.fixed_price, currency }
  }
  if (pricing.pricing_type === "hourly" && pricing.hourly_rate != null) {
    return { price: pricing.hourly_rate, currency }
  }
  if (pricing.pricing_type === "monthly" && pricing.monthly_rate != null) {
    return { price: pricing.monthly_rate, currency }
  }
  if (pricing.pricing_type === "tiered" && pricing.tiers.length > 0) {
    const min = pricing.tiers.reduce(
      (lowest, tier) => (tier.price < lowest ? tier.price : lowest),
      pricing.tiers[0]!.price,
    )
    return { price: min, currency }
  }
  return null
}

export const formatItemPricing = (pricing: ItemPricing | null): string => {
  if (!pricing) return "—"

  const { currency } = pricing

  if (pricing.pricing_type === "fixed" && pricing.fixed_price != null) {
    return formatCurrency(pricing.fixed_price, currency)
  }

  if (pricing.pricing_type === "hourly" && pricing.hourly_rate != null) {
    return `${formatCurrency(pricing.hourly_rate, currency)}/час`
  }

  if (pricing.pricing_type === "monthly" && pricing.monthly_rate != null) {
    return `${formatCurrency(pricing.monthly_rate, currency)}/мес`
  }

  if (pricing.pricing_type === "tiered" && pricing.tiers.length > 0) {
    const min = pricing.tiers.reduce(
      (lowest, tier) => (tier.price < lowest ? tier.price : lowest),
      pricing.tiers[0]!.price,
    )
    return `от ${formatCurrency(min, currency)}`
  }

  return "—"
}

export type PricingTierRange = {
  minQty: number
  maxQty: number | null
  price: number
}

export const getPricingMoq = (pricing: ItemPricing | null): number => {
  if (!pricing) return 1
  if (pricing.pricing_type === "tiered" && pricing.tiers.length > 0) {
    return pricing.tiers.reduce(
      (lowest, tier) => (tier.min_qty < lowest ? tier.min_qty : lowest),
      pricing.tiers[0]!.min_qty,
    )
  }
  return 1
}

export const getSortedTiers = (pricing: ItemPricing | null): PricingTierRange[] => {
  if (!pricing || pricing.pricing_type !== "tiered" || pricing.tiers.length === 0) {
    return []
  }
  const sorted = [...pricing.tiers].sort((a, b) => a.min_qty - b.min_qty)
  return sorted.map((tier, index) => {
    const next = sorted[index + 1]
    return {
      minQty: tier.min_qty,
      maxQty: next ? next.min_qty - 1 : null,
      price: tier.price,
    }
  })
}

/** Unit price for a given quantity (tiered ladder or fixed/hourly/monthly). */
export const priceForQty = (
  pricing: ItemPricing | null,
  qty: number,
): number | null => {
  if (!pricing) return null

  if (pricing.pricing_type === "tiered" && pricing.tiers.length > 0) {
    const sorted = [...pricing.tiers].sort((a, b) => a.min_qty - b.min_qty)
    let unit = sorted[0]!.price
    for (const tier of sorted) {
      if (qty >= tier.min_qty) unit = tier.price
    }
    return unit
  }

  if (pricing.pricing_type === "fixed" && pricing.fixed_price != null) {
    return pricing.fixed_price
  }
  if (pricing.pricing_type === "hourly" && pricing.hourly_rate != null) {
    return pricing.hourly_rate
  }
  if (pricing.pricing_type === "monthly" && pricing.monthly_rate != null) {
    return pricing.monthly_rate
  }
  return null
}

export const activeTierIndex = (
  pricing: ItemPricing | null,
  qty: number,
): number => {
  const tiers = getSortedTiers(pricing)
  if (tiers.length === 0) return -1
  let active = 0
  for (let i = 0; i < tiers.length; i++) {
    if (qty >= tiers[i]!.minQty) active = i
  }
  return active
}

/** Base (highest) unit price — first tier or list price — for volume savings. */
export const baseUnitPrice = (pricing: ItemPricing | null): number | null => {
  if (!pricing) return null
  if (pricing.pricing_type === "tiered" && pricing.tiers.length > 0) {
    const sorted = [...pricing.tiers].sort((a, b) => a.min_qty - b.min_qty)
    return sorted[0]!.price
  }
  return priceForQty(pricing, 1)
}

export const findAttrValue = (
  attributes: { name: string; value: string }[],
  names: string[],
): string | null => {
  const lowered = names.map((n) => n.toLowerCase())
  const hit = attributes.find((a) =>
    lowered.some((n) => a.name.toLowerCase().includes(n)),
  )
  return hit?.value ?? null
}
