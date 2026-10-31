import type { ContractWithRelations } from "@/types"
import type { PaymentMilestoneStatus } from "@/types/payment"

const HELD: PaymentMilestoneStatus[] = [
  "funded",
  "submitted",
  "in_progress",
]

/** Buyer: money already with the bank partner, waiting for acceptance. */
export function sumEscrowHeld(contracts: ContractWithRelations[]): number {
  return contracts.reduce((sum, contract) => {
    const milestones = contract.payment_plan?.milestones ?? []
    return (
      sum +
      milestones
        .filter((m) => HELD.includes(m.status))
        .reduce((s, m) => s + m.amount, 0)
    )
  }, 0)
}

/** Buyer: milestones waiting for payment. */
export function sumAwaitingPayment(contracts: ContractWithRelations[]): number {
  return contracts.reduce((sum, contract) => {
    const milestones = contract.payment_plan?.milestones ?? []
    return (
      sum +
      milestones
        .filter((m) => m.status === "awaiting_payment")
        .reduce((s, m) => s + m.amount, 0)
    )
  }, 0)
}
