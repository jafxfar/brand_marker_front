import type { ProposalWithRelations } from "@/types"
import { apiFetch } from "./client"

const RFQ_PREFIX = "/buyer/rfqs"
const PROPOSAL_PREFIX = "/buyer/proposals"

export const proposalsApi = {
  listForRfq: (rfqId: string) =>
    apiFetch<ProposalWithRelations[]>(`${RFQ_PREFIX}/${rfqId}/proposals`),

  shortlist: (id: number) =>
    apiFetch<ProposalWithRelations>(`${PROPOSAL_PREFIX}/${id}/shortlist`, { method: "POST" }),

  reject: (id: number) =>
    apiFetch<ProposalWithRelations>(`${PROPOSAL_PREFIX}/${id}/reject`, { method: "POST" }),

  accept: (id: number) =>
    apiFetch<{ proposal: ProposalWithRelations; contract_id: number }>(
      `${PROPOSAL_PREFIX}/${id}/accept`,
      { method: "POST" },
    ),
}
