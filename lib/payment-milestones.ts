import type { PaymentMilestoneInput, PaymentType } from "@/types"

/**
 * Возвращает суммы по процентам так, чтобы их сумма точно равнялась amount:
 * остаток округления поглощается последним этапом.
 */
export const splitAmounts = (percentages: number[], amount: number): number[] => {
  if (percentages.length === 0) return []
  const amounts = percentages.map((pct) => Math.round((pct / 100) * amount))
  const allocated = amounts.slice(0, -1).reduce((sum, value) => sum + value, 0)
  amounts[amounts.length - 1] = amount - allocated
  return amounts
}

/**
 * Этапы оплаты по умолчанию для выбранного типа.
 * Зеркало бэкендового _default_milestones (contracts/service.py).
 */
export const buildDefaultMilestones = (
  paymentType: PaymentType,
): PaymentMilestoneInput[] => {
  if (paymentType === "full_prepayment") {
    return [{ title: "Полная предоплата", percentage: 100, trigger: "contract_signed" }]
  }
  if (paymentType === "full_postpayment") {
    return [{ title: "Оплата после приёмки", percentage: 100, trigger: "delivery_accepted" }]
  }
  if (paymentType === "split_payment") {
    return [
      { title: "Предоплата 50%", percentage: 50, trigger: "contract_signed" },
      { title: "Оплата 50% после приёмки", percentage: 50, trigger: "delivery_accepted" },
    ]
  }
  return [
    { title: "Этап 1 — подписание", percentage: 30, trigger: "contract_signed" },
    { title: "Этап 2 — промежуточная сдача", percentage: 40, trigger: "delivery_accepted" },
    { title: "Этап 3 — финальная приёмка", percentage: 30, trigger: "delivery_accepted" },
  ]
}

export const PERCENTAGE_TOLERANCE = 0.5

export const sumPercentages = (milestones: PaymentMilestoneInput[]): number =>
  milestones.reduce((sum, m) => sum + (Number.isFinite(m.percentage) ? m.percentage : 0), 0)

export const isMilestonesValid = (milestones: PaymentMilestoneInput[]): boolean => {
  if (milestones.length === 0) return false
  if (milestones.some((m) => !m.title.trim() || !(m.percentage > 0))) return false
  return Math.abs(sumPercentages(milestones) - 100) <= PERCENTAGE_TOLERANCE
}
