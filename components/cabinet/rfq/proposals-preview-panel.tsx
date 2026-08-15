"use client"

import Link from "next/link"
import { ArrowRight, Inbox } from "lucide-react"
import type { Proposal, PublicSupplier } from "@/types"
import { ProposalReviewCard } from "@/components/cabinet/rfq/proposal-review-card"

type ProposalsPreviewPanelProps = {
  rfqId: string
  proposals: Proposal[]
  canManage: boolean
  getSupplier: (actorId: number) => PublicSupplier | undefined
  getSupplierName: (actorId: number) => string
  onShortlist: (proposalId: number) => void
  onReject: (proposalId: number) => void
  onAccept: (proposalId: number) => void
}

export const ProposalsPreviewPanel = ({
  rfqId,
  proposals,
  canManage,
  getSupplier,
  getSupplierName,
  onShortlist,
  onReject,
  onAccept,
}: ProposalsPreviewPanelProps) => (
  <section className="bg-card border border-border rounded-xl p-6">
    <div className="flex items-center justify-between gap-3 mb-4">
      <h2 className="text-sm font-semibold text-foreground">
        Предложения
        {proposals.length > 0 && (
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({proposals.length})
          </span>
        )}
      </h2>
      {proposals.length > 0 && (
        <Link
          href={`/customer/rfqs/${rfqId}/proposals`}
          className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
        >
          Все предложения <ArrowRight size={14} />
        </Link>
      )}
    </div>

    {proposals.length === 0 ? (
      <div className="py-8 text-center">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Inbox size={18} className="text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          Пока нет предложений. Опубликуйте заявку и дождитесь откликов.
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        {proposals.slice(0, 2).map((proposal) => (
          <ProposalReviewCard
            key={proposal.id}
            proposal={proposal}
            supplier={getSupplier(proposal.supplier_actor_id)}
            supplierName={getSupplierName(proposal.supplier_actor_id)}
            canManage={canManage}
            onShortlist={() => onShortlist(proposal.id)}
            onReject={() => onReject(proposal.id)}
            onAccept={() => onAccept(proposal.id)}
          />
        ))}
        {proposals.length > 2 && (
          <Link
            href={`/customer/rfqs/${rfqId}/proposals`}
            className="block text-center text-sm font-semibold text-primary hover:underline py-2"
          >
            Ещё {proposals.length - 2} предложений
          </Link>
        )}
      </div>
    )}
  </section>
)
