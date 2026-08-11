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
    className: "bg-info/10 text-info",
  },
  viewed: {
    label: "Просмотрено",
    className: "bg-muted text-muted-foreground",
  },
  shortlisted: {
    label: "В избранном",
    className: "bg-warning/10 text-warning",
  },
  accepted: {
    label: "Принято",
    className: "bg-primary/10 text-primary",
  },
  rejected: {
    label: "Отклонено",
    className: "bg-destructive/10 text-destructive",
  },
  withdrawn: {
    label: "Отозвано",
    className: "bg-muted text-muted-foreground",
  },
}
