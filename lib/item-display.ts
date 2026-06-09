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
  active: {
    label: "Активна",
    className: "bg-emerald-100 text-emerald-700",
  },
  archived: {
    label: "В архиве",
    className: "bg-amber-100 text-amber-700",
  },
}

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
