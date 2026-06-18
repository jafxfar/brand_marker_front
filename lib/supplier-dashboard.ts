import type { ContractWithRelations, ProposalWithRelations, RfqWithRelations } from "@/types"
import { hasSupplierProposalForRfq } from "@/hooks/api/use-supplier-rfqs-query"

const ACTIVE_CONTRACT_STATUSES = ["pending_payment", "active", "delivered"] as const

export const getActiveSupplierContracts = (
  contracts: ContractWithRelations[],
): ContractWithRelations[] =>
  contracts.filter((c) =>
    (ACTIVE_CONTRACT_STATUSES as readonly string[]).includes(c.status),
  )

export const getSupplierRevenue = (contracts: ContractWithRelations[]): number =>
  contracts.reduce((sum, contract) => {
    const released =
      contract.payment_plan?.milestones
        .filter((m) => m.status === "released")
        .reduce((s, m) => s + m.amount, 0) ?? 0
    return sum + released
  }, 0)

export const getNewRfqsWithoutProposal = (
  rfqs: RfqWithRelations[],
  proposals: ProposalWithRelations[] | undefined,
): RfqWithRelations[] =>
  rfqs.filter((rfq) => !hasSupplierProposalForRfq(proposals, rfq.id))

export type SupplierIncomingMessage = {
  message: { id: number; sender_id: number; text: string }
  contract: ContractWithRelations
  senderName: string
}

export const getSupplierIncomingMessages = (
  contracts: ContractWithRelations[],
  supplierActorId: number,
  getBuyerName: (buyerId: number) => string,
): SupplierIncomingMessage[] =>
  contracts
    .flatMap((contract) => {
      const messages = contract.conversation?.messages ?? []
      if (messages.length === 0) return []
      const lastMessage = messages[messages.length - 1]!
      const isBuyer = lastMessage.sender_id === contract.buyer_actor_id
      if (!isBuyer) return []
      return [
        {
          message: lastMessage,
          contract,
          senderName: getBuyerName(contract.buyer_actor_id),
        },
      ]
    })
    .sort((a, b) => b.message.id - a.message.id)

export const getSupplierUnreadMessageCount = (
  contracts: ContractWithRelations[],
  supplierActorId: number,
): number =>
  contracts.reduce((count, contract) => {
    const messages = contract.conversation?.messages ?? []
    const unread = messages.filter(
      (m) => m.sender_id !== supplierActorId,
    ).length
    return count + unread
  }, 0)

export type SupplierPendingMilestone = {
  contract: { id: number; title: string }
  milestoneId: number
  title: string
  amount: number
  currency: string
  status: string
}

export const getSupplierPendingMilestonesFromContracts = (
  contracts: ContractWithRelations[],
): SupplierPendingMilestone[] => {
  const items: SupplierPendingMilestone[] = []
  for (const contract of contracts) {
    for (const m of contract.payment_plan?.milestones ?? []) {
      if (m.status === "funded" || m.status === "released") {
        items.push({
          contract: { id: contract.id, title: contract.title },
          milestoneId: m.id,
          title: m.title,
          amount: m.amount,
          currency: contract.currency,
          status: m.status,
        })
      }
    }
  }
  return items
}

export const getSupplierPendingAmount = (
  milestones: SupplierPendingMilestone[],
): number => milestones.reduce((sum, m) => sum + m.amount, 0)

export const getSupplierPendingMilestonesFromApi = (
  items: Array<{
    contract_id: number
    milestone_id: number
    title: string
    amount: number
    currency: string
    status: string
  }>,
  contracts: ContractWithRelations[],
): SupplierPendingMilestone[] =>
  items.map((item) => {
    const contract = contracts.find((c) => c.id === item.contract_id)
    return {
      contract: {
        id: item.contract_id,
        title: contract?.title ?? `Контракт #${item.contract_id}`,
      },
      milestoneId: item.milestone_id,
      title: item.title,
      amount: item.amount,
      currency: item.currency,
      status: item.status,
    }
  })
