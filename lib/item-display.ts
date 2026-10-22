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
