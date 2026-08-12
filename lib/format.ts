import type { Currency } from "@/types"

export const formatPrice = (value: number): string =>
  formatCurrency(value, "TJS")

export const formatCurrency = (value: number, currency: Currency | string = "TJS"): string =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value)

export const formatIsoDate = (iso: string): string =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso))

export const formatRating = (value: number): string =>
  value.toFixed(1)

export const formatRelativeTime = (timestamp: number): string => {
  const diffMs = Date.now() - timestamp
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return "только что"
  if (minutes < 60) return `${minutes} мин назад`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ч назад`
  const days = Math.floor(hours / 24)
  return `${days} дн назад`
}

export const formatRelativeIso = (iso: string): string =>
  formatRelativeTime(new Date(iso).getTime())

export const formatRfqBudget = (
  budgetType: string,
  budgetFrom: number | null,
  budgetTo: number | null,
  currency: string,
): string => {
  if (budgetType === "open") return "Открытый бюджет"
  if (budgetType === "fixed" && budgetFrom != null) {
    return formatCurrency(budgetFrom, currency)
  }
  if (budgetType === "range" && budgetFrom != null && budgetTo != null) {
    return `${formatCurrency(budgetFrom, currency)} – ${formatCurrency(budgetTo, currency)}`
  }
  if (budgetFrom != null) return formatCurrency(budgetFrom, currency)
  return "Не указан"
}
