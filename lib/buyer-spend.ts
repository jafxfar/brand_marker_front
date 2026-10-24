import type { PaymentHistoryItem } from "@/lib/api/payments"

const MONTH_LABELS = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
]

/** Aggregate funded/released payments into last 6 calendar months. */
export const buildSpendSeriesFromHistory = (
  items: PaymentHistoryItem[],
  now = new Date(),
): [string, number][] => {
  const buckets = new Map<string, number>()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    buckets.set(key, 0)
  }

  for (const item of items) {
    if (item.event !== "funded" && item.event !== "released") continue
    if (item.status === "refunded") continue
    const d = new Date(item.created_at)
    if (Number.isNaN(d.getTime())) continue
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (!buckets.has(key)) continue
    buckets.set(key, (buckets.get(key) ?? 0) + Number(item.amount || 0))
  }

  return Array.from(buckets.entries()).map(([key, amount]) => {
    const month = Number(key.split("-")[1])
    return [MONTH_LABELS[month] ?? key, Math.round(amount)] as [string, number]
  })
}
