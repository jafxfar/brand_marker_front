"use client"

import { useState } from "react"
import type { Proposal } from "@/types"
import { ProposalActionCard } from "@/components/cabinet/rfq/proposal-action-card"
import { AcceptProposalDialog } from "@/components/cabinet/rfq/accept-proposal-dialog"

type BuyerProposalsPanelProps = {
  proposals: Proposal[]
  canManage: boolean
  getSupplierName: (supplierId: number) => string
  onShortlist: (proposalId: number) => void
  onReject: (proposalId: number) => void
  onAccept: (proposalId: number) => void
}

export const BuyerProposalsPanel = ({
  proposals,
  canManage,
  getSupplierName,
  onShortlist,
  onReject,
  onAccept,
}: BuyerProposalsPanelProps) => {
  const [acceptTarget, setAcceptTarget] = useState<Proposal | null>(null)

  return (
    <section className="bg-white border border-border rounded-2xl p-6">
      <h2 className="text-base font-bold text-foreground mb-4">
        Предложения поставщиков
        {proposals.length > 0 && (
          <span className="ml-2 text-sm font-normal text-muted-foreground">({proposals.length})</span>
        )}
      </h2>

      {proposals.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Пока нет предложений. Опубликуйте RFQ и дождитесь откликов поставщиков.
        </p>
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => (
            <ProposalActionCard
              key={proposal.id}
              proposal={proposal}
              supplierName={getSupplierName(proposal.supplier_actor_id)}
              canManage={canManage}
              onShortlist={() => onShortlist(proposal.id)}
              onReject={() => onReject(proposal.id)}
              onAccept={() => setAcceptTarget(proposal)}
            />
          ))}
        </div>
      )}

      {acceptTarget && (
        <AcceptProposalDialog
          open={!!acceptTarget}
          onOpenChange={(open) => !open && setAcceptTarget(null)}
          supplierName={getSupplierName(acceptTarget.supplier_actor_id)}
          price={acceptTarget.price}
          currency={acceptTarget.currency}
          onConfirm={() => onAccept(acceptTarget.id)}
        />
      )}
    </section>
  )
}
