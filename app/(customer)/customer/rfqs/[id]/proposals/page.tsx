"use client"

import { use, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useRfqsStore } from "@/lib/store/rfqs-store"
import { useProposalsStore } from "@/lib/store/proposals-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { formatIsoDate, formatRfqBudget } from "@/lib/format"
import { RfqStatusBadge } from "@/components/rfq/rfq-status-badge"
import { ProposalReviewCard } from "@/components/cabinet/rfq/proposal-review-card"
import {
  ProposalsReviewToolbar,
  type ProposalSortMode,
} from "@/components/cabinet/rfq/proposals-review-toolbar"
import { AcceptProposalDialog } from "@/components/cabinet/rfq/accept-proposal-dialog"
import { filterProposalsByStatus, sortProposalsForReview } from "@/lib/proposals-review"
import type { Proposal, ProposalStatus } from "@/types"

type PageProps = {
  params: Promise<{ id: string }>
}

const MANAGE_PROPOSAL_STATUSES = ["published", "receiving_proposals"] as const

export default function ProposalsReviewPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const hydrated = useHydrated()
  const actorId = getActorId(useAuthStore((s) => s.user))
  const getRfqWithRelations = useRfqsStore((s) => s.getRfqWithRelations)
  const getProposalsForRfq = useProposalsStore((s) => s.getProposalsForRfq)
  const updateProposalStatus = useProposalsStore((s) => s.updateProposalStatus)
  const acceptProposal = useProposalsStore((s) => s.acceptProposal)
  const getCompany = useCompaniesStore((s) => s.getCompany)

  const [sortMode, setSortMode] = useState<ProposalSortMode>("priority")
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | "all">("all")
  const [acceptTarget, setAcceptTarget] = useState<Proposal | null>(null)

  const rfq = hydrated ? getRfqWithRelations(id) : undefined
  const allProposals = rfq ? getProposalsForRfq(rfq.id) : []

  const proposals = useMemo(
    () => sortProposalsForReview(
      filterProposalsByStatus(allProposals, statusFilter),
      sortMode,
    ),
    [allProposals, statusFilter, sortMode],
  )

  if (!hydrated) {
    return (
      <div className="max-w-[900px] mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-secondary rounded-xl w-1/3" />
        <div className="h-32 bg-secondary rounded-2xl" />
      </div>
    )
  }

  if (!rfq || rfq.actor_id !== String(actorId)) {
    return (
      <div className="max-w-[900px] mx-auto text-center py-16">
        <p className="text-sm font-semibold text-foreground">RFQ не найден</p>
        <Link href="/customer/rfqs" className="text-sm text-primary hover:underline mt-2 inline-block">
          К списку RFQ
        </Link>
      </div>
    )
  }

  const canManage = MANAGE_PROPOSAL_STATUSES.includes(
    rfq.status as (typeof MANAGE_PROPOSAL_STATUSES)[number],
  )

  const handleAccept = (proposalId: number) => {
    const contractId = acceptProposal(proposalId, rfq.id, actorId)
    if (contractId) {
      router.push(`/customer/contracts/${contractId}`)
    }
  }

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      <Link
        href={`/customer/rfqs/${rfq.id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} /> Назад к RFQ
      </Link>

      <div className="bg-white border border-border rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-foreground">Обзор предложений</h1>
            <p className="text-sm text-muted-foreground mt-1">{rfq.title}</p>
            <div className="mt-2">
              <RfqStatusBadge status={rfq.status} />
            </div>
          </div>
          <div className="text-sm sm:text-right">
            <p className="text-muted-foreground">Бюджет</p>
            <p className="font-bold text-primary">
              {formatRfqBudget(rfq.budget_type, rfq.budget_from, rfq.budget_to, rfq.currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Дедлайн: {formatIsoDate(rfq.deadline)}
            </p>
          </div>
        </div>
      </div>

      <ProposalsReviewToolbar
        total={proposals.length}
        sortMode={sortMode}
        statusFilter={statusFilter}
        onSortChange={setSortMode}
        onStatusFilterChange={setStatusFilter}
      />

      {proposals.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-10 text-center">
          <p className="text-sm font-semibold text-foreground">Предложений нет</p>
          <p className="text-xs text-muted-foreground mt-1">
            {statusFilter !== "all"
              ? "Попробуйте сменить фильтр"
              : "Дождитесь откликов поставщиков"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <ProposalReviewCard
              key={proposal.id}
              proposal={proposal}
              supplier={getCompany(proposal.supplier_actor_id)}
              canManage={canManage}
              onShortlist={() => updateProposalStatus(proposal.id, "shortlisted")}
              onReject={() => updateProposalStatus(proposal.id, "rejected")}
              onAccept={() => setAcceptTarget(proposal)}
            />
          ))}
        </div>
      )}

      {acceptTarget && (
        <AcceptProposalDialog
          open={!!acceptTarget}
          onOpenChange={(open) => !open && setAcceptTarget(null)}
          supplierName={
            getCompany(acceptTarget.supplier_actor_id)?.title ??
            `Поставщик #${acceptTarget.supplier_actor_id}`
          }
          price={acceptTarget.price}
          currency={acceptTarget.currency}
          onConfirm={() => handleAccept(acceptTarget.id)}
        />
      )}
    </div>
  )
}
