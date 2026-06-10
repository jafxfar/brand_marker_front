import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Proposal, ProposalCreate, ProposalStatus } from "@/types"
import { mockProposals } from "@/lib/mock/proposals"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useRfqsStore } from "@/lib/store/rfqs-store"

export type IncomingProposalItem = {
  proposal: Proposal
  rfqId: string
  rfqTitle: string
}

interface ProposalsState {
  proposals: Proposal[]
  hasProposal: (rfqId: string, actorId: number) => boolean
  getProposalForRfq: (rfqId: string, actorId: number) => Proposal | undefined
  getProposalsBySupplier: (actorId: number) => Proposal[]
  getProposalsForRfq: (rfqId: string) => Proposal[]
  getIncomingProposalsForBuyer: (
    actorId: number,
    getRfqTitle: (rfqId: string) => string,
    getRfqActorId: (rfqId: string) => string | undefined,
  ) => IncomingProposalItem[]
  getNewProposalsCountForBuyer: (
    actorId: number,
    getRfqActorId: (rfqId: string) => string | undefined,
  ) => number
  updateProposalStatus: (id: number, status: ProposalStatus) => void
  submitProposal: (input: ProposalCreate) => Proposal
  acceptProposal: (proposalId: number, rfqId: string, buyerActorId: number) => number
}

const nextProposalId = (proposals: Proposal[]): number =>
  proposals.reduce((max, p) => Math.max(max, p.id), 0) + 1

export const useProposalsStore = create<ProposalsState>()(
  persist(
    (set, get) => ({
      proposals: mockProposals,

      hasProposal: (rfqId, actorId) =>
        get().proposals.some(
          (p) => p.rfq_id === rfqId && p.supplier_actor_id === actorId,
        ),

      getProposalForRfq: (rfqId, actorId) =>
        get().proposals.find(
          (p) => p.rfq_id === rfqId && p.supplier_actor_id === actorId,
        ),

      getProposalsBySupplier: (actorId) =>
        get()
          .proposals.filter((p) => p.supplier_actor_id === actorId)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          ),

      getProposalsForRfq: (rfqId) =>
        get().proposals
          .filter((p) => p.rfq_id === rfqId)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          ),

      getIncomingProposalsForBuyer: (actorId, getRfqTitle, getRfqActorId) =>
        get()
          .proposals.filter((p) => {
            const ownerId = getRfqActorId(p.rfq_id)
            return ownerId === String(actorId) && p.status === "submitted"
          })
          .map((proposal) => ({
            proposal,
            rfqId: proposal.rfq_id,
            rfqTitle: getRfqTitle(proposal.rfq_id),
          }))
          .sort(
            (a, b) =>
              new Date(b.proposal.created_at).getTime() -
              new Date(a.proposal.created_at).getTime(),
          ),

      getNewProposalsCountForBuyer: (actorId, getRfqActorId) =>
        get().proposals.filter((p) => {
          const ownerId = getRfqActorId(p.rfq_id)
          return ownerId === String(actorId) && p.status === "submitted"
        }).length,

      updateProposalStatus: (id, status) =>
        set((state) => ({
          proposals: state.proposals.map((p) =>
            p.id === id ? { ...p, status } : p,
          ),
        })),

      submitProposal: (input) => {
        const proposal: Proposal = {
          ...input,
          id: nextProposalId(get().proposals),
          status: input.status ?? "submitted",
          created_at: new Date().toISOString(),
        }
        set((state) => ({ proposals: [proposal, ...state.proposals] }))
        return proposal
      },

      acceptProposal: (proposalId, rfqId, buyerActorId) => {
        const proposal = get().proposals.find((p) => p.id === proposalId)
        const rfq = useRfqsStore.getState().getRfqWithRelations(rfqId)
        if (!proposal || !rfq) return 0

        const contractId = useContractsStore.getState().createContractFromProposal({
          rfq_id: rfqId,
          proposal_id: proposalId,
          buyer_actor_id: buyerActorId,
          supplier_actor_id: proposal.supplier_actor_id,
          title: rfq.title,
          description: rfq.description,
          agreed_amount: proposal.price,
          currency: proposal.currency,
        })

        set((state) => ({
          proposals: state.proposals.map((p) => {
            if (p.rfq_id !== rfqId) return p
            if (p.id === proposalId) return { ...p, status: "accepted" as ProposalStatus }
            if (!["rejected", "withdrawn"].includes(p.status)) {
              return { ...p, status: "rejected" as ProposalStatus }
            }
            return p
          }),
        }))

        useRfqsStore.getState().updateRfqStatus(rfqId, "contract_created")

        return contractId
      },
    }),
    { name: "bm-proposals" },
  ),
)
