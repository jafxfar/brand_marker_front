import type { Invoice, Withdrawal, WithdrawalDestination } from "@/types"
import { apiFetch } from "../client"

const PREFIX = "/supplier/finance"

export const supplierFinanceApi = {
  destinations: () => apiFetch<WithdrawalDestination[]>(`${PREFIX}/destinations`),

  createDestination: (data: {
    type: string
    label: string
    details: string
    is_default?: boolean
  }) =>
    apiFetch<WithdrawalDestination>(`${PREFIX}/destinations`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  withdrawals: () => apiFetch<Withdrawal[]>(`${PREFIX}/withdrawals`),

  requestWithdrawal: (data: { destination_id: number; amount: number }) =>
    apiFetch<Withdrawal>(`${PREFIX}/withdrawals`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  invoices: () => apiFetch<Invoice[]>(`${PREFIX}/invoices`),
}
