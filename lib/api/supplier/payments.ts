import { buildPageQuery, type Page, type PageParams } from "@/lib/pagination"
import { apiFetch } from "../client"
import type { PaymentHistoryItem, PendingPaymentsResponse } from "../payments"

const PREFIX = "/supplier/payments"

export type SupplierBalanceResponse = {
  available: number
  pending: number
  escrow_locked: number
  currency: string
}

export const supplierPaymentsApi = {
  history: (params: PageParams = {}) =>
    apiFetch<Page<PaymentHistoryItem>>(`${PREFIX}/history${buildPageQuery(params)}`),

  pending: () => apiFetch<PendingPaymentsResponse>(`${PREFIX}/pending`),

  balance: () => apiFetch<SupplierBalanceResponse>(`${PREFIX}/balance`),

  getMilestones: (contractId: number) =>
    apiFetch<import("../payments").PaymentMilestonesResponse>(
      `${PREFIX}/contracts/${contractId}/milestones`,
    ),
}
