"use client"

import type { Proposal } from "@/types"
import { proposalStatusMeta } from "@/lib/proposal-display"
import { formatCurrency } from "@/lib/format"

type ProposalActionCardProps = {
  proposal: Proposal
  supplierName: string
  canManage: boolean
  onShortlist: () => void
  onReject: () => void
  onAccept: () => void
}

export const ProposalActionCard = ({
  proposal,
  supplierName,
  canManage,
  onShortlist,
  onReject,
  onAccept,
}: ProposalActionCardProps) => {
  const meta = proposalStatusMeta[proposal.status]
  const isFinal = ["accepted", "rejected", "withdrawn"].includes(proposal.status)

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{supplierName}</p>
          {proposal.message && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{proposal.message}</p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-primary">
            {formatCurrency(proposal.price, proposal.currency)}
          </p>
          {proposal.delivery_time && (
            <p className="text-[11px] text-muted-foreground mt-0.5">{proposal.delivery_time}</p>
          )}
          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${meta.className}`}>
            {meta.label}
          </span>
        </div>
      </div>

      {canManage && !isFinal && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
          {proposal.status !== "shortlisted" && (
            <button
              type="button"
              onClick={onShortlist}
              className="h-9 px-3 rounded-xl border border-border text-xs font-bold hover:bg-secondary transition-colors"
            >
              В избранное
            </button>
          )}
          <button
            type="button"
            onClick={onReject}
            className="h-9 px-3 rounded-xl border border-destructive/30 text-destructive text-xs font-bold hover:bg-destructive/5 transition-colors"
          >
            Отклонить
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="h-9 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
          >
            Принять
          </button>
        </div>
      )}
    </div>
  )
}
