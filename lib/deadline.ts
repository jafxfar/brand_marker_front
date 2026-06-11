import type { ContractStatus } from "@/types"

export type TimeRemaining = {
  days: number
  hours: number
  minutes: number
  expired: boolean
  overdue: boolean
  totalMs: number
}

const DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/

export const parseDueDateEndOfDay = (iso: string): Date => {
  if (DATE_ONLY_RE.test(iso)) {
    const [year, month, day] = iso.split("-").map(Number)
    return new Date(year, month - 1, day, 23, 59, 59, 999)
  }
  return new Date(iso)
}

const splitRemainingMinutes = (totalMinutes: number) => {
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)
  const minutes = totalMinutes % 60
  return { days, hours, minutes }
}

export const getTimeRemaining = (iso: string, now = Date.now()): TimeRemaining => {
  const endMs = parseDueDateEndOfDay(iso).getTime()
  const diffMs = endMs - now

  if (diffMs <= 0) {
    const overdueMinutes = Math.floor(Math.abs(diffMs) / 60000)
    const { days, hours, minutes } = splitRemainingMinutes(overdueMinutes)
    return {
      days,
      hours,
      minutes,
      expired: true,
      overdue: true,
      totalMs: diffMs,
    }
  }

  const remainingMinutes = Math.floor(diffMs / 60000)
  const { days, hours, minutes } = splitRemainingMinutes(remainingMinutes)
  return {
    days,
    hours,
    minutes,
    expired: false,
    overdue: false,
    totalMs: diffMs,
  }
}

export const formatCountdownParts = (remaining: Pick<TimeRemaining, "days" | "hours" | "minutes">): string => {
  const parts: string[] = []
  if (remaining.days > 0) parts.push(`${remaining.days} дн`)
  if (remaining.hours > 0) parts.push(`${remaining.hours} ч`)
  if (remaining.minutes > 0 || parts.length === 0) parts.push(`${remaining.minutes} мин`)
  return parts.join(" ")
}

export const formatCountdownLabel = (remaining: TimeRemaining): string => {
  if (!remaining.expired) return formatCountdownParts(remaining)
  const overdueLabel = formatCountdownParts(remaining)
  if (overdueLabel === "0 мин") return "Просрочен"
  return `Просрочен на ${overdueLabel}`
}

const ACTIVE_COUNTDOWN_STATUSES: ContractStatus[] = [
  "pending_payment",
  "active",
  "delivered",
  "disputed",
]

export const shouldShowContractCountdown = (status: ContractStatus): boolean =>
  ACTIVE_COUNTDOWN_STATUSES.includes(status)

export const isUrgentDeadline = (remaining: TimeRemaining): boolean =>
  !remaining.expired && remaining.totalMs < 24 * 60 * 60 * 1000
