import type { Currency } from "./proposal"

export const WITHDRAWAL_DESTINATION_TYPES = ["bank", "wallet"] as const

export type WithdrawalDestinationType =
  (typeof WITHDRAWAL_DESTINATION_TYPES)[number]

export type WithdrawalDestination = {
  id: number
  actor_id: number
  type: WithdrawalDestinationType
  label: string
  details: string
  is_default: boolean
}

export const WITHDRAWAL_STATUSES = [
  "pending",
  "processing",
  "completed",
  "failed",
  "cancelled",
] as const

export type WithdrawalStatus = (typeof WITHDRAWAL_STATUSES)[number]

export type Withdrawal = {
  id: number
  actor_id: number
  destination_id: number
  amount: number
  currency: Currency
  status: WithdrawalStatus
  created_at: string
  completed_at: string | null
}

export const INVOICE_STATUSES = [
  "draft",
  "issued",
  "paid",
  "overdue",
  "cancelled",
] as const

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]

export type Invoice = {
  id: number
  actor_id: number
  contract_id: number | null
  number: string
  title: string
  amount: number
  currency: Currency
  status: InvoiceStatus
  issued_at: string
  due_at: string | null
  paid_at: string | null
}

export type SupplierBalanceSummary = {
  available: number
  pending: number
  escrowLocked: number
  currency: Currency
}

export type WithdrawalCreate = Omit<Withdrawal, "id" | "created_at" | "completed_at" | "status"> & {
  status?: WithdrawalStatus
}

export type BuyerInvoice = Invoice & {
  buyer_actor_id: number
}

export type BuyerRefund = {
  id: number
  buyer_actor_id: number
  contract_id: number
  amount: number
  currency: Currency
  reason: string
  created_at: string
}
