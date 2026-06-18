import type { ContractWithRelations, Message, Proposal, RfqWithRelations } from "@/types"
import type { IncomingProposalItem } from "@/lib/store/proposals-store"

const ACTIVE_CONTRACT_STATUSES = ["pending_payment", "active", "delivered"] as const

export const getActiveBuyerContracts = (
  contracts: ContractWithRelations[],
): ContractWithRelations[] =>
  contracts.filter((c) =>
    (ACTIVE_CONTRACT_STATUSES as readonly string[]).includes(c.status),
  )

export type BuyerIncomingMessage = {
  message: Message
  contract: ContractWithRelations
  senderName: string
}

export const getBuyerIncomingMessages = (
  contracts: ContractWithRelations[],
  buyerActorId: number,
  getSupplierName: (supplierId: number) => string,
): BuyerIncomingMessage[] =>
  contracts
    .flatMap((contract) => {
      const messages = contract.conversation?.messages ?? []
      if (messages.length === 0) return []
      const lastMessage = messages[messages.length - 1]!
      const isSupplier = lastMessage.sender_id === contract.supplier_actor_id
      if (!isSupplier) return []
      return [
        {
          message: lastMessage,
          contract,
          senderName: getSupplierName(contract.supplier_actor_id),
        },
      ]
    })
    .sort((a, b) => b.message.id - a.message.id)

export const getBuyerUnreadMessageCount = (
  contracts: ContractWithRelations[],
  buyerActorId: number,
): number =>
  contracts.reduce((count, contract) => {
    const messages = contract.conversation?.messages ?? []
    const unread = messages.filter(
      (m) => m.sender_id !== buyerActorId,
    ).length
    return count + unread
  }, 0)

export const getBuyerIncomingProposals = (
  rfqs: RfqWithRelations[],
  proposalsByRfq: Map<string, Proposal[]>,
  buyerActorId: number,
): IncomingProposalItem[] => {
  const items: IncomingProposalItem[] = []
  for (const rfq of rfqs) {
    if (String(rfq.actor_id) !== String(buyerActorId)) continue
    const proposals = proposalsByRfq.get(rfq.id) ?? []
    for (const proposal of proposals) {
      if (proposal.status !== "submitted") continue
      items.push({
        proposal,
        rfqId: rfq.id,
        rfqTitle: rfq.title,
      })
    }
  }
  return items.sort(
    (a, b) =>
      new Date(b.proposal.created_at).getTime() -
      new Date(a.proposal.created_at).getTime(),
  )
}

export const getBuyerNewProposalsCount = (
  rfqs: RfqWithRelations[],
  proposalsByRfq: Map<string, Proposal[]>,
  buyerActorId: number,
): number =>
  getBuyerIncomingProposals(rfqs, proposalsByRfq, buyerActorId).length
