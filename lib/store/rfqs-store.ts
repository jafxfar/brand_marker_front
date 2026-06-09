import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { RfqWithRelations } from "@/types"
import { mockRfqsWithRelations } from "@/lib/mock/rfqs"
import { OPEN_RFQ_STATUSES } from "@/lib/rfq-display"

interface RfqsState {
  rfqs: RfqWithRelations[]
  getRfq: (id: string) => RfqWithRelations | undefined
  getRfqWithRelations: (id: string) => RfqWithRelations | undefined
  getOpenRfqs: () => RfqWithRelations[]
  getNewRfqsForSupplier: (actorId: number, hasProposal: (rfqId: string) => boolean) => RfqWithRelations[]
}

export const useRfqsStore = create<RfqsState>()(
  persist(
    (set, get) => ({
      rfqs: mockRfqsWithRelations,

      getRfq: (id) => get().rfqs.find((r) => r.id === id),

      getRfqWithRelations: (id) => get().rfqs.find((r) => r.id === id),

      getOpenRfqs: () =>
        get().rfqs.filter((r) => OPEN_RFQ_STATUSES.includes(r.status)),

      getNewRfqsForSupplier: (_actorId, hasProposal) =>
        get().rfqs.filter(
          (r) =>
            OPEN_RFQ_STATUSES.includes(r.status) && !hasProposal(r.id),
        ),
    }),
    { name: "bm-rfqs" },
  ),
)
