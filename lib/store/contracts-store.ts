import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ContractWithRelations, Message, WorkSubmissionType } from "@/types"
import { mockContracts } from "@/lib/mock/contracts"
import { mockRfqs } from "@/lib/mock/rfqs"
import {
  PENDING_MILESTONE_STATUSES,
  filterContractsByTab,
  getEscrowSummary,
  type ContractListTab,
  type EscrowSummary,
} from "@/lib/contract-display"

export type IncomingMessage = {
  message: Message
  contract: ContractWithRelations
  senderName: string
}

type SubmitWorkInput = {
  note: string
  fileNames: string[]
}

interface ContractsState {
  contracts: ContractWithRelations[]
  lastReadAt: Record<number, string>
  getContract: (id: number) => ContractWithRelations | undefined
  getContractsForSupplier: (actorId: number) => ContractWithRelations[]
  getContractsByTab: (actorId: number, tab: ContractListTab) => ContractWithRelations[]
  getActiveContracts: (actorId: number) => ContractWithRelations[]
  getRevenue: (actorId: number) => number
  getPendingPaymentsAmount: (actorId: number) => number
  getPendingMilestones: (actorId: number) => Array<{
    contract: ContractWithRelations
    milestoneId: number
    title: string
    amount: number
    currency: string
    status: string
  }>
  getIncomingMessages: (
    actorId: number,
    currentUserId: number,
    getCompanyName: (id: number) => string,
  ) => IncomingMessage[]
  getUnreadMessageCount: (actorId: number, currentUserId: number) => number
  markConversationRead: (contractId: number) => void
  getEscrowSummary: (contract: ContractWithRelations) => EscrowSummary
  submitWork: (contractId: number, input: SubmitWorkInput) => void
  openDispute: (contractId: number, reason: string) => void
  addMessage: (contractId: number, senderId: number, text: string) => void
}

const normalizeContract = (
  contract: ContractWithRelations,
): ContractWithRelations => ({
  ...contract,
  files: contract.files ?? [],
  submissions: contract.submissions ?? [],
})

const normalizeContracts = (
  contracts: ContractWithRelations[],
): ContractWithRelations[] => contracts.map(normalizeContract)

const getSupplierMilestones = (
  contracts: ContractWithRelations[],
  actorId: number,
) =>
  contracts
    .filter((c) => c.supplier_actor_id === actorId)
    .flatMap((c) =>
      (c.payment_plan?.milestones ?? []).map((m) => ({ contract: c, milestone: m })),
    )

const getSubmissionType = (contract: ContractWithRelations): WorkSubmissionType => {
  const rfq = mockRfqs.find((r) => r.id === contract.rfq_id)
  if (rfq?.type === "product") return "delivery"
  if (rfq?.type === "service") return "work"
  if (contract.status === "delivered") return "delivery"
  return "work"
}

const nextMessageId = (contracts: ContractWithRelations[]): number => {
  let maxId = 0
  for (const contract of contracts) {
    for (const message of contract.conversation?.messages ?? []) {
      if (message.id > maxId) maxId = message.id
    }
  }
  return maxId + 1
}

const nextSubmissionId = (contracts: ContractWithRelations[]): number => {
  let maxId = 0
  for (const contract of contracts) {
    for (const submission of contract.submissions) {
      if (submission.id > maxId) maxId = submission.id
    }
  }
  return maxId + 1
}

export const useContractsStore = create<ContractsState>()(
  persist(
    (set, get) => ({
      contracts: mockContracts,
      lastReadAt: {},

      getContract: (id) => {
        const contract = get().contracts.find((c) => c.id === id)
        return contract ? normalizeContract(contract) : undefined
      },

      getContractsForSupplier: (actorId) =>
        normalizeContracts(
          get().contracts.filter((c) => c.supplier_actor_id === actorId),
        ),

      getContractsByTab: (actorId, tab) =>
        filterContractsByTab(
          normalizeContracts(
            get().contracts.filter((c) => c.supplier_actor_id === actorId),
          ),
          tab,
        ),

      getActiveContracts: (actorId) =>
        get().contracts.filter(
          (c) =>
            c.supplier_actor_id === actorId &&
            ["active", "pending_payment", "delivered"].includes(c.status),
        ),

      getRevenue: (actorId) =>
        getSupplierMilestones(get().contracts, actorId)
          .filter(({ milestone }) => milestone.status === "released")
          .reduce((sum, { milestone }) => sum + milestone.amount, 0),

      getPendingPaymentsAmount: (actorId) =>
        getSupplierMilestones(get().contracts, actorId)
          .filter(({ milestone }) =>
            PENDING_MILESTONE_STATUSES.includes(milestone.status),
          )
          .reduce((sum, { milestone }) => sum + milestone.amount, 0),

      getPendingMilestones: (actorId) =>
        getSupplierMilestones(get().contracts, actorId)
          .filter(({ milestone }) =>
            PENDING_MILESTONE_STATUSES.includes(milestone.status),
          )
          .map(({ contract, milestone }) => ({
            contract,
            milestoneId: milestone.id,
            title: milestone.title,
            amount: milestone.amount,
            currency: contract.currency,
            status: milestone.status,
          })),

      getIncomingMessages: (actorId, currentUserId, getCompanyName) => {
        const supplierContracts = get().contracts.filter(
          (c) => c.supplier_actor_id === actorId,
        )
        const incoming: IncomingMessage[] = []

        for (const contract of supplierContracts) {
          const messages = contract.conversation?.messages ?? []
          for (const message of messages) {
            if (message.sender_id === actorId || message.sender_id === currentUserId) {
              continue
            }
            incoming.push({
              message,
              contract,
              senderName: getCompanyName(message.sender_id),
            })
          }
        }

        return incoming.sort(
          (a, b) => b.message.id - a.message.id,
        )
      },

      getUnreadMessageCount: (actorId, currentUserId) => {
        const { lastReadAt } = get()
        const incoming = get().getIncomingMessages(
          actorId,
          currentUserId,
          () => "",
        )
        return incoming.filter((item) => {
          const readAt = lastReadAt[item.contract.id]
          if (!readAt) return true
          return item.message.id > Number(readAt)
        }).length
      },

      markConversationRead: (contractId) =>
        set((state) => {
          const contract = state.contracts.find((c) => c.id === contractId)
          const lastMessage = contract?.conversation?.messages.at(-1)
          if (!lastMessage) return state
          return {
            lastReadAt: {
              ...state.lastReadAt,
              [contractId]: String(lastMessage.id),
            },
          }
        }),

      getEscrowSummary: (contract) => getEscrowSummary(contract),

      submitWork: (contractId, input) =>
        set((state) => ({
          contracts: state.contracts.map((contract) => {
            if (contract.id !== contractId) return contract
            const submission = {
              id: nextSubmissionId(state.contracts),
              contract_id: contractId,
              type: getSubmissionType(contract),
              note: input.note,
              status: "pending" as const,
              submitted_at: new Date().toISOString(),
              file_names: input.fileNames,
            }
            return {
              ...contract,
              submissions: [...contract.submissions, submission],
            }
          }),
        })),

      openDispute: (contractId, reason) =>
        set((state) => ({
          contracts: state.contracts.map((contract) => {
            if (contract.id !== contractId) return contract
            const milestones = contract.payment_plan?.milestones.map((milestone) => {
              if (!["funded", "submitted", "in_progress"].includes(milestone.status)) {
                return milestone
              }
              return { ...milestone, status: "disputed" as const }
            })
            const disputeMessage = {
              id: nextMessageId(state.contracts),
              conversation_id: contract.conversation?.id ?? contractId,
              sender_id: contract.supplier_actor_id,
              text: `Открыт спор: ${reason}`,
              attachment: null,
            }
            return {
              ...contract,
              status: "disputed" as const,
              payment_plan: contract.payment_plan
                ? { ...contract.payment_plan, milestones: milestones ?? [] }
                : null,
              conversation: contract.conversation
                ? {
                    ...contract.conversation,
                    messages: [...contract.conversation.messages, disputeMessage],
                  }
                : {
                    id: contractId,
                    contract_id: contractId,
                    messages: [disputeMessage],
                  },
            }
          }),
        })),

      addMessage: (contractId, senderId, text) =>
        set((state) => ({
          contracts: state.contracts.map((contract) => {
            if (contract.id !== contractId) return contract
            const message = {
              id: nextMessageId(state.contracts),
              conversation_id: contract.conversation?.id ?? contractId,
              sender_id: senderId,
              text,
              attachment: null,
            }
            return {
              ...contract,
              conversation: contract.conversation
                ? {
                    ...contract.conversation,
                    messages: [...contract.conversation.messages, message],
                  }
                : {
                    id: contractId,
                    contract_id: contractId,
                    messages: [message],
                  },
            }
          }),
        })),
    }),
    { name: "bm-contracts" },
  ),
)
