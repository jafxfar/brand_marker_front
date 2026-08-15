import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { RfqAttachment, RfqCreate, RfqStatus, RfqUpdate, RfqWithRelations } from "@/types"
import { mockRfqsWithRelations } from "@/lib/mock/rfqs"
import { API_MODE } from "@/lib/api/config"
import { OPEN_RFQ_STATUSES } from "@/lib/rfq-display"
import {
  ACTIVE_RFQ_STATUSES,
  type BuyerRfqStatusFilter,
  getRfqStatusesForBuyerFilter,
} from "@/lib/buyer-rfq-display"

type AttachmentInput = {
  file_name: string
  file_url: string
  file_type: string
}

interface RfqsState {
  rfqs: RfqWithRelations[]
  getRfq: (id: string) => RfqWithRelations | undefined
  getRfqWithRelations: (id: string) => RfqWithRelations | undefined
  getOpenRfqs: () => RfqWithRelations[]
  getNewRfqsForSupplier: (actorId: number, hasProposal: (rfqId: string) => boolean) => RfqWithRelations[]
  getRfqsByBuyer: (actorId: number) => RfqWithRelations[]
  getActiveRfqsByBuyer: (actorId: number) => RfqWithRelations[]
  getRfqsByBuyerTab: (actorId: number, filter: BuyerRfqStatusFilter) => RfqWithRelations[]
  createRfq: (input: RfqCreate, actorId: number, createdBy: string) => RfqWithRelations
  updateRfq: (id: string, patch: RfqUpdate) => void
  updateRfqStatus: (id: string, status: RfqStatus) => void
  publishRfq: (id: string) => void
  closeRfq: (id: string) => void
  addAttachment: (rfqId: string, file: AttachmentInput) => void
  removeAttachment: (rfqId: string, attachmentId: string) => void
  inviteSupplierToRfq: (rfqId: string, supplierId: number) => void
  getInvitableRfqsForBuyer: (actorId: number) => RfqWithRelations[]
}

export const useRfqsStore = create<RfqsState>()(
  persist(
    (set, get) => ({
      rfqs: API_MODE ? [] : mockRfqsWithRelations,

      getRfq: (id) => get().rfqs.find((r) => r.id === id),

      getRfqWithRelations: (id) => get().rfqs.find((r) => r.id === id),

      getOpenRfqs: () =>
        get().rfqs.filter((r) => OPEN_RFQ_STATUSES.includes(r.status)),

      getNewRfqsForSupplier: (_actorId, hasProposal) =>
        get().rfqs.filter(
          (r) =>
            OPEN_RFQ_STATUSES.includes(r.status) && !hasProposal(r.id),
        ),

      getRfqsByBuyer: (actorId) =>
        get()
          .rfqs.filter((r) => r.actor_id === String(actorId))
          .sort(
            (a, b) =>
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
          ),

      getActiveRfqsByBuyer: (actorId) =>
        get()
          .rfqs.filter(
            (r) =>
              r.actor_id === String(actorId) &&
              ACTIVE_RFQ_STATUSES.includes(r.status),
          )
          .sort(
            (a, b) =>
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
          ),

      getRfqsByBuyerTab: (actorId, filter) => {
        const statuses = getRfqStatusesForBuyerFilter(filter)
        return get()
          .rfqs.filter(
            (r) =>
              r.actor_id === String(actorId) &&
              (statuses === null || statuses.includes(r.status)),
          )
          .sort(
            (a, b) =>
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
          )
      },

      createRfq: (input, actorId, createdBy) => {
        const now = new Date().toISOString()
        const id = `rfq-${Date.now()}`
        const rfq = {
          ...input,
          id,
          actor_id: String(actorId),
          created_by: createdBy,
          status: input.status ?? "draft",
          created_at: now,
          updated_at: now,
          attachments: [],
        } as RfqWithRelations
        set((state) => ({ rfqs: [rfq, ...state.rfqs] }))
        return rfq
      },

      updateRfq: (id, patch) =>
        set((state) => ({
          rfqs: state.rfqs.map((r) => {
            if (r.id !== id) return r
            if (r.status !== "draft") return r
            return {
              ...r,
              ...patch,
              updated_at: new Date().toISOString(),
            } as RfqWithRelations
          }),
        })),

      updateRfqStatus: (id, status) =>
        set((state) => ({
          rfqs: state.rfqs.map((r) =>
            r.id === id
              ? { ...r, status, updated_at: new Date().toISOString() }
              : r,
          ),
        })),

      publishRfq: (id) =>
        set((state) => ({
          rfqs: state.rfqs.map((r) =>
            r.id === id && r.status === "draft"
              ? {
                  ...r,
                  status: "receiving_proposals" as RfqStatus,
                  updated_at: new Date().toISOString(),
                }
              : r,
          ),
        })),

      closeRfq: (id) =>
        set((state) => ({
          rfqs: state.rfqs.map((r) =>
            r.id === id && !["completed", "cancelled"].includes(r.status)
              ? {
                  ...r,
                  status: "cancelled" as RfqStatus,
                  updated_at: new Date().toISOString(),
                }
              : r,
          ),
        })),

      addAttachment: (rfqId, file) =>
        set((state) => ({
          rfqs: state.rfqs.map((r) => {
            if (r.id !== rfqId) return r
            const attachment: RfqAttachment = {
              id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              rfq_id: rfqId,
              ...file,
            }
            return {
              ...r,
              attachments: [...r.attachments, attachment],
              updated_at: new Date().toISOString(),
            }
          }),
        })),

      removeAttachment: (rfqId, attachmentId) =>
        set((state) => ({
          rfqs: state.rfqs.map((r) =>
            r.id === rfqId
              ? {
                  ...r,
                  attachments: r.attachments.filter((a) => a.id !== attachmentId),
                  updated_at: new Date().toISOString(),
                }
              : r,
          ),
        })),

      inviteSupplierToRfq: (rfqId, supplierId) =>
        set((state) => ({
          rfqs: state.rfqs.map((r) => {
            if (r.id !== rfqId) return r
            const invited = r.invited_supplier_ids ?? []
            if (invited.includes(supplierId)) return r
            return {
              ...r,
              visibility: "invited_only" as const,
              invited_supplier_ids: [...invited, supplierId],
              updated_at: new Date().toISOString(),
            }
          }),
        })),

      getInvitableRfqsForBuyer: (actorId) =>
        get()
          .rfqs.filter(
            (r) =>
              r.actor_id === String(actorId) &&
              ["draft", "published", "receiving_proposals"].includes(r.status),
          )
          .sort(
            (a, b) =>
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
          ),

    }),
    {
      name: "bm-rfqs",
      merge: (persisted, current) => {
        if (API_MODE) return current
        return { ...current, ...(persisted as Partial<RfqsState>) }
      },
    },
  ),
)
