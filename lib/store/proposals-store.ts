import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Proposal, ProposalCreate } from "@/types"
import { mockProposals } from "@/lib/mock/proposals"

interface ProposalsState {
  proposals: Proposal[]
  hasProposal: (rfqId: string, actorId: number) => boolean
  getProposalForRfq: (rfqId: string, actorId: number) => Proposal | undefined
  getProposalsBySupplier: (actorId: number) => Proposal[]
  getProposalsForRfq: (rfqId: string) => Proposal[]
  submitProposal: (input: ProposalCreate) => Proposal
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
    }),
    { name: "bm-proposals" },
  ),
)
