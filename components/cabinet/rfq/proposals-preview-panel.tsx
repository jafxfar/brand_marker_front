"use client"

import Link from "next/link"
import { ArrowRight, Inbox } from "lucide-react"
import type { CompanyWithRelations, Proposal } from "@/types"
import { ProposalReviewCard } from "@/components/cabinet/rfq/proposal-review-card"

type ProposalsPreviewPanelProps = {
  rfqId: string
  proposals: Proposal[]
  canManage: boolean
  getCompany: (id: number) => CompanyWithRelations | undefined
  onShortlist: (proposalId: number) => void
  onReject: (proposalId: number) => void
  onAccept: (proposalId: number) => void
}

export const ProposalsPreviewPanel = ({
  rfqId,
  proposals,
  canManage,
  getCompany,
  onShortlist,
  onReject,
  onAccept,
}: ProposalsPreviewPanelProps) => (
  <section className="bg-white border border-border rounded-2xl p-6">
    <div className="flex items-center justify-between gap-3 mb-4">
      <h2 className="text-base font-bold text-foreground">
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
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3">
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
            supplier={getCompany(proposal.supplier_actor_id)}
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
