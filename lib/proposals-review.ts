import type { Proposal, ProposalStatus } from "@/types"
import type { ProposalSortMode } from "@/components/cabinet/rfq/proposals-review-toolbar"

const STATUS_PRIORITY: Record<ProposalStatus, number> = {
  shortlisted: 0,
  submitted: 1,
  viewed: 2,
  accepted: 3,
  rejected: 4,
  withdrawn: 5,
}

export const sortProposalsForReview = (
  proposals: Proposal[],
  sortMode: ProposalSortMode,
): Proposal[] => {
  const sorted = [...proposals]

  if (sortMode === "price_asc") {
    return sorted.sort((a, b) => a.price - b.price)
  }
  if (sortMode === "price_desc") {
    return sorted.sort((a, b) => b.price - a.price)
  }
  if (sortMode === "date_desc") {
    return sorted.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
  }

  return sorted.sort((a, b) => {
    const priorityDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]
    if (priorityDiff !== 0) return priorityDiff
    return a.price - b.price
  })
}

export const filterProposalsByStatus = (
  proposals: Proposal[],
  status: ProposalStatus | "all",
): Proposal[] => {
  if (status === "all") return proposals
  return proposals.filter((p) => p.status === status)
}
