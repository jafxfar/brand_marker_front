import { buildPageQuery, type Page, type PageParams } from "@/lib/pagination"
import type { Invoice, Withdrawal, WithdrawalDestination } from "@/types"
import { apiFetch } from "../client"

const PREFIX = "/supplier/finance"

export const supplierFinanceApi = {
  destinations: (params: PageParams = {}) =>
    apiFetch<Page<WithdrawalDestination>>(
      `${PREFIX}/destinations${buildPageQuery(params)}`,
    ),

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

  withdrawals: (params: PageParams = {}) =>
    apiFetch<Page<Withdrawal>>(`${PREFIX}/withdrawals${buildPageQuery(params)}`),

  requestWithdrawal: (data: {
    destination_id: number
    amount: number
    bank: "alif" | "dc" | "eskhata"
  }) =>
    apiFetch<Withdrawal>(`${PREFIX}/withdrawals`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  invoices: (params: PageParams = {}) =>
    apiFetch<Page<Invoice>>(`${PREFIX}/invoices${buildPageQuery(params)}`),
}
