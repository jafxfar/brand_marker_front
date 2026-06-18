"use client"

import type { CompanyWithRelations, Proposal } from "@/types"
import { proposalStatusMeta } from "@/lib/proposal-display"
import { formatCurrency } from "@/lib/format"
import { SupplierProposalInfo } from "@/components/cabinet/rfq/supplier-proposal-info"
import { Clock, Banknote } from "lucide-react"

type ProposalReviewCardProps = {
  proposal: Proposal
  supplier: CompanyWithRelations | undefined
  canManage: boolean
  onShortlist: () => void
  onReject: () => void
  onAccept: () => void
}

export const ProposalReviewCard = ({
  proposal,
  supplier,
  canManage,
  onShortlist,
  onReject,
  onAccept,
}: ProposalReviewCardProps) => {
  const meta = proposalStatusMeta[proposal.status]
  const isFinal = ["accepted", "rejected", "withdrawn"].includes(proposal.status)

  return (
    <article className="bg-white border border-border rounded-2xl p-5 sm:p-6">
      <SupplierProposalInfo
        supplier={supplier}
        supplierId={proposal.supplier_actor_id}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-border">
        <div className="flex items-start gap-2">
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
            <Banknote size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Цена</p>
            <p className="text-sm font-bold text-primary mt-0.5">
              {formatCurrency(proposal.price, proposal.currency)}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
            <Clock size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Срок поставки / работ</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">
              {proposal.delivery_time ?? "Не указан"}
            </p>
          </div>
        </div>
        <div className="flex items-center sm:justify-end">
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${meta.className}`}>
            {meta.label}
          </span>
        </div>
      </div>

      {proposal.message && (
        <div className="mt-5 pt-5 border-t border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Сообщение</p>
          <p className="text-sm text-foreground leading-relaxed">{proposal.message}</p>
        </div>
      )}

      {canManage && !isFinal && (
        <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-border">
          {proposal.status !== "shortlisted" && (
            <button
              type="button"
              onClick={onShortlist}
              className="h-10 px-4 rounded-xl border border-border text-sm font-bold hover:bg-secondary transition-colors"
            >
              В избранное
            </button>
          )}
          <button
            type="button"
            onClick={onReject}
            className="h-10 px-4 rounded-xl border border-destructive/30 text-destructive text-sm font-bold hover:bg-destructive/5 transition-colors"
          >
            Отклонить
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary-dark transition-colors"
          >
            Принять
          </button>
        </div>
      )}
    </article>
  )
}
