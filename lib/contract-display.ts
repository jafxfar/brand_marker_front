import type { ContractStatus, ContractWithRelations, WorkSubmissionStatus } from "@/types"
import type { PaymentMilestoneStatus } from "@/types"
import { formatCurrency } from "@/lib/format"

export type ContractListTab = "active" | "completed" | "disputed" | "cancelled"

export const CONTRACT_LIST_TABS: { value: ContractListTab; label: string }[] = [
  { value: "active", label: "Активные" },
  { value: "completed", label: "Завершённые" },
  { value: "disputed", label: "Спорные" },
  { value: "cancelled", label: "Отменённые" },
]

const ACTIVE_STATUSES: ContractStatus[] = [
  "active",
  "pending_payment",
  "delivered",
]

export const filterContractsByTab = (
  contracts: ContractWithRelations[],
  tab: ContractListTab,
): ContractWithRelations[] => {
  if (tab === "active") {
    return contracts.filter((c) => ACTIVE_STATUSES.includes(c.status))
  }
  if (tab === "completed") {
    return contracts.filter((c) => c.status === "completed")
  }
  if (tab === "disputed") {
    return contracts.filter((c) => c.status === "disputed")
  }
  return contracts.filter((c) => c.status === "cancelled")
}

export type EscrowSummary = {
  held: number
  released: number
  disputed: number
  currency: string
}

const HELD_STATUSES: PaymentMilestoneStatus[] = [
  "funded",
  "submitted",
  "in_progress",
  "awaiting_payment",
]

export const getEscrowSummary = (
  contract: ContractWithRelations,
): EscrowSummary => {
  const milestones = contract.payment_plan?.milestones ?? []
  return milestones.reduce(
    (acc, milestone) => {
      if (milestone.status === "released") {
        acc.released += milestone.amount
      } else if (milestone.status === "disputed") {
        acc.disputed += milestone.amount
      } else if (HELD_STATUSES.includes(milestone.status)) {
        acc.held += milestone.amount
      }
      return acc
    },
    {
      held: 0,
      released: 0,
      disputed: 0,
      currency: contract.currency,
    },
  )
}

export const escrowSummaryMeta = {
  held: { label: "В эскроу", className: "bg-blue-100 text-blue-700" },
  released: { label: "Выплачено", className: "bg-emerald-100 text-emerald-700" },
  disputed: { label: "Заморожено", className: "bg-red-100 text-red-700" },
} as const

export const contractStatusMeta: Record<
  ContractStatus,
  { label: string; className: string }
> = {
  pending_payment: {
    label: "Ожидает оплаты",
    className: "bg-amber-100 text-amber-700",
  },
  active: {
    label: "Активен",
    className: "bg-emerald-100 text-emerald-700",
  },
  delivered: {
    label: "Доставлен",
    className: "bg-blue-100 text-blue-700",
  },
  completed: {
    label: "Завершён",
    className: "bg-muted text-muted-foreground",
  },
  cancelled: {
    label: "Отменён",
    className: "bg-muted text-muted-foreground",
  },
  disputed: {
    label: "Спор",
    className: "bg-red-100 text-red-700",
  },
}

export const milestoneStatusMeta: Record<
  PaymentMilestoneStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Ожидает",
    className: "bg-muted text-muted-foreground",
  },
  awaiting_payment: {
    label: "Ожидает оплаты",
    className: "bg-amber-100 text-amber-700",
  },
  funded: {
    label: "В эскроу",
    className: "bg-blue-100 text-blue-700",
  },
  in_progress: {
    label: "В работе",
    className: "bg-violet-100 text-violet-700",
  },
  submitted: {
    label: "На проверке",
    className: "bg-amber-100 text-amber-700",
  },
  approved: {
    label: "Одобрен",
    className: "bg-emerald-100 text-emerald-700",
  },
  released: {
    label: "Выплачен",
    className: "bg-emerald-100 text-emerald-700",
  },
  refunded: {
    label: "Возвращён",
    className: "bg-blue-100 text-blue-700",
  },
  disputed: {
    label: "Спор",
    className: "bg-red-100 text-red-700",
  },
  overdue: {
    label: "Просрочен",
    className: "bg-red-100 text-red-700",
  },
  cancelled: {
    label: "Отменён",
    className: "bg-muted text-muted-foreground",
  },
}

export const workSubmissionStatusMeta: Record<
  WorkSubmissionStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "На проверке",
    className: "bg-amber-100 text-amber-700",
  },
  accepted: {
    label: "Принято",
    className: "bg-emerald-100 text-emerald-700",
  },
  rejected: {
    label: "Отклонено",
    className: "bg-red-100 text-red-700",
  },
}

export const getSubmissionTypeLabel = (type: "delivery" | "work"): string =>
  type === "delivery" ? "Доставка" : "Выполнение работ"

export const formatEscrowSummary = (summary: EscrowSummary): string => {
  const parts: string[] = []
  if (summary.held > 0) {
    parts.push(`${escrowSummaryMeta.held.label}: ${formatCurrency(summary.held, summary.currency)}`)
  }
  if (summary.released > 0) {
    parts.push(`${escrowSummaryMeta.released.label}: ${formatCurrency(summary.released, summary.currency)}`)
  }
  if (summary.disputed > 0) {
    parts.push(`${escrowSummaryMeta.disputed.label}: ${formatCurrency(summary.disputed, summary.currency)}`)
  }
  return parts.length > 0 ? parts.join(" · ") : "Нет движений"
}

export const PENDING_MILESTONE_STATUSES: PaymentMilestoneStatus[] = [
  "awaiting_payment",
  "funded",
  "submitted",
  "in_progress",
]

export const getMilestoneProgress = (contract: ContractWithRelations): number => {
  const milestones = contract.payment_plan?.milestones ?? []
  if (milestones.length === 0) return 0
  const released = milestones
    .filter((m) => m.status === "released")
    .reduce((sum, m) => sum + m.percentage, 0)
  return released
}
