import type { ProposalStatus } from "@/types"

export const MY_PROPOSAL_FILTER_STATUSES = [
  "submitted",
  "shortlisted",
  "accepted",
  "rejected",
  "withdrawn",
] as const

export type MyProposalFilterStatus = (typeof MY_PROPOSAL_FILTER_STATUSES)[number]

export const myProposalTabLabels: Record<MyProposalFilterStatus, string> = {
  submitted: "Отправлено",
  shortlisted: "В избранном",
  accepted: "Принято",
  rejected: "Отклонено",
  withdrawn: "Отозвано",
}

export const proposalStatusMeta: Record<
  ProposalStatus,
  { label: string; className: string }
> = {
  submitted: {
    label: "Отправлено",
    className: "bg-blue-100 text-blue-700",
  },
  viewed: {
    label: "Просмотрено",
    className: "bg-violet-100 text-violet-700",
  },
  shortlisted: {
    label: "В избранном",
    className: "bg-amber-100 text-amber-700",
  },
  accepted: {
    label: "Принято",
    className: "bg-emerald-100 text-emerald-700",
  },
  rejected: {
    label: "Отклонено",
    className: "bg-red-100 text-red-700",
  },
  withdrawn: {
    label: "Отозвано",
    className: "bg-muted text-muted-foreground",
  },
}
