import { buildPageQuery, type Page, type PageParams } from "@/lib/pagination"
import type {
  ProposalAcceptInput,
  ProposalMessage,
  ProposalMessageThread,
  ProposalWithRelations,
} from "@/types"
import { apiFetch } from "./client"

const RFQ_PREFIX = "/buyer/rfqs"
const PROPOSAL_PREFIX = "/buyer/proposals"

export const proposalsApi = {
  listForRfq: (rfqId: string, params: PageParams = {}) =>
    apiFetch<Page<ProposalWithRelations>>(
      `${RFQ_PREFIX}/${rfqId}/proposals${buildPageQuery(params)}`,
    ),

  shortlist: (id: number) =>
    apiFetch<ProposalWithRelations>(`${PROPOSAL_PREFIX}/${id}/shortlist`, { method: "POST" }),

  reject: (id: number) =>
    apiFetch<ProposalWithRelations>(`${PROPOSAL_PREFIX}/${id}/reject`, { method: "POST" }),

  accept: (id: number, body: ProposalAcceptInput) =>
    apiFetch<{ proposal: ProposalWithRelations; contract_id: number }>(
      `${PROPOSAL_PREFIX}/${id}/accept`,
      { method: "POST", body: JSON.stringify(body) },
    ),

  withdrawOffer: (id: number) =>
    apiFetch<ProposalWithRelations>(`${PROPOSAL_PREFIX}/${id}/withdraw`, {
      method: "POST",
    }),

  listMessageThreads: () =>
    apiFetch<ProposalMessageThread[]>(`${PROPOSAL_PREFIX}/message-threads`),

  getMessageThread: (id: number) =>
    apiFetch<ProposalMessageThread>(`${PROPOSAL_PREFIX}/${id}/thread`),

  listMessages: (id: number) =>
    apiFetch<ProposalMessage[]>(`${PROPOSAL_PREFIX}/${id}/messages`),

  sendMessage: (id: number, text: string) =>
    apiFetch<ProposalMessage>(`${PROPOSAL_PREFIX}/${id}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
}
