import type { ProposalMessage, ProposalUpdate, ProposalWithRelations, RfqWithRelations } from "@/types"
import { apiFetch } from "../client"

const RFQ_PREFIX = "/supplier/rfqs"
const PROPOSAL_PREFIX = "/supplier/proposals"

export const supplierRfqsApi = {
  board: () => apiFetch<RfqWithRelations[]>(`${RFQ_PREFIX}/board`),

  get: (id: string) => apiFetch<RfqWithRelations>(`${RFQ_PREFIX}/${id}`),

  submitProposal: (rfqId: string, data: {
    price: number
    currency: string
    delivery_time?: string
    message?: string
  }) =>
    apiFetch<ProposalWithRelations>(`${RFQ_PREFIX}/${rfqId}/proposals`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
}

export const supplierProposalsApi = {
  list: () => apiFetch<ProposalWithRelations[]>(`${PROPOSAL_PREFIX}/`),

  update: (id: number, data: ProposalUpdate) =>
    apiFetch<ProposalWithRelations>(`${PROPOSAL_PREFIX}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  withdraw: (id: number) =>
    apiFetch<ProposalWithRelations>(`${PROPOSAL_PREFIX}/${id}/withdraw`, { method: "POST" }),

  listMessages: (id: number) =>
    apiFetch<ProposalMessage[]>(`${PROPOSAL_PREFIX}/${id}/messages`),

  sendMessage: (id: number, text: string) =>
    apiFetch<ProposalMessage>(`${PROPOSAL_PREFIX}/${id}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
}
