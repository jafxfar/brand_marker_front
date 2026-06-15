import { apiFetch } from "./client"

const PREFIX = "/buyer/payments"

export type PaymentHistoryItem = {
  contract_id: number
  milestone_id: number
  title: string
  amount: number
  currency: string
  status: string
  event: string
  created_at: string
}

export type PendingPaymentsResponse = {
  count: number
  items: Array<{
    contract_id: number
    milestone_id: number
    title: string
    amount: number
    currency: string
    status: string
  }>
}

export type PaymentMilestonesResponse = {
  id: number
  contract_id: number
  payment_type: string
  milestones: Array<{
    id: number
    contract_id: number
    title: string
    percentage: number
    amount: number
    trigger: string
    status: string
  }>
} | null

export const paymentsApi = {
  history: () => apiFetch<PaymentHistoryItem[]>(`${PREFIX}/history`),

  pending: () => apiFetch<PendingPaymentsResponse>(`${PREFIX}/pending`),

  getMilestones: (contractId: number) =>
    apiFetch<PaymentMilestonesResponse>(`${PREFIX}/contracts/${contractId}/milestones`),

  fundMilestone: (milestoneId: number) =>
    apiFetch<{ id: number; status: string }>(`${PREFIX}/milestones/${milestoneId}/fund`, {
      method: "POST",
    }),

  approveMilestone: (milestoneId: number) =>
    apiFetch<{ id: number; status: string }>(`${PREFIX}/milestones/${milestoneId}/approve`, {
      method: "POST",
    }),

  mockConfirm: (milestoneId: number) =>
    apiFetch<unknown>(`${PREFIX}/mock/confirm/${milestoneId}`, {
      method: "POST",
    }),
}
