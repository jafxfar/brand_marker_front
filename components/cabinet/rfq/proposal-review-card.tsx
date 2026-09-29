"use client"

import { useState } from "react"
import type { Proposal, PublicSupplier } from "@/types"
import { proposalStatusMeta } from "@/lib/proposal-display"
import { formatDeliveryTime, formatMoneyDisplay } from "@/lib/format"
import { SupplierProposalInfo } from "@/components/cabinet/rfq/supplier-proposal-info"
import { ProposalChatDialog } from "@/components/cabinet/rfq/proposal-chat-dialog"
import { Banknote, Clock, MessageSquare } from "lucide-react"

type ProposalReviewCardProps = {
  proposal: Proposal
  supplier: PublicSupplier | undefined
  supplierName: string
  canManage: boolean
  onShortlist: () => void
  onReject: () => void
  onAccept: () => void
}

export const ProposalReviewCard = ({
  proposal,
  supplier,
  supplierName,
  canManage,
  onShortlist,
  onReject,
  onAccept,
}: ProposalReviewCardProps) => {
  const meta = proposalStatusMeta[proposal.status]
  const isFinal = ["accepted", "rejected", "withdrawn", "archived"].includes(proposal.status)
  const [chatOpen, setChatOpen] = useState(false)

  const handleOpenChat = () => setChatOpen(true)

  return (
    <article className="bg-card border border-border rounded-xl p-5 sm:p-6">
      <SupplierProposalInfo
        supplier={supplier}
        supplierId={proposal.supplier_actor_id}
        supplierName={supplierName}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-5 border-t border-border">
        <div className="flex items-start gap-2 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
            <Banknote size={16} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Цена</p>
            <p className="text-sm font-bold text-primary mt-0.5 truncate" title={formatMoneyDisplay(proposal.price, proposal.currency)}>
              {formatMoneyDisplay(proposal.price, proposal.currency)}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
            <Clock size={16} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Срок поставки / работ</p>
            <p className="text-sm font-semibold text-foreground mt-0.5 truncate" title={formatDeliveryTime(proposal.delivery_time)}>
              {formatDeliveryTime(proposal.delivery_time)}
            </p>
          </div>
        </div>
        <div className="flex items-center sm:justify-end">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${meta.className}`}>
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

      <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-border">
        {canManage && !isFinal && proposal.status !== "shortlisted" && (
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
          onClick={handleOpenChat}
          aria-label="Обсудить проект"
          className="h-10 px-4 rounded-xl border border-border text-sm font-bold hover:bg-secondary transition-colors inline-flex items-center gap-2"
        >
          <MessageSquare size={16} /> Обсудить проект
        </button>
        {canManage && !isFinal && (
          <>
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
              className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              Принять
            </button>
          </>
        )}
      </div>

      <ProposalChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        proposalId={proposal.id}
        proposalStatus={proposal.status}
        side="buyer"
        peerName={supplierName}
      />
    </article>
  )
}
