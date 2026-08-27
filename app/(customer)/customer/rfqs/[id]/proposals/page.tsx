"use client"

import { use, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PageEmptyState, PageFrame, PageHeader, PageSurface } from "@/components/layout"
import { useAuthStore } from "@/lib/store/auth-store"
import { useRfqsStore } from "@/lib/store/rfqs-store"
import { useProposalsStore } from "@/lib/store/proposals-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { usePublicSuppliersByActor } from "@/hooks/api/use-supplier-name"
import { getActorId } from "@/lib/auth-display"
import { isApiEnabled } from "@/lib/api/config"
import { useRfqQuery } from "@/hooks/api/use-rfqs-query"
import {
  useAcceptProposalMutation,
  useProposalsForRfqQuery,
  useRejectProposalMutation,
  useShortlistProposalMutation,
} from "@/hooks/api/use-proposals-query"
import { formatIsoDate, formatRfqBudget } from "@/lib/format"
import { RfqStatusBadge } from "@/components/rfq/rfq-status-badge"
import { ProposalReviewCard } from "@/components/cabinet/rfq/proposal-review-card"
import {
  ProposalsReviewToolbar,
  type ProposalSortMode,
} from "@/components/cabinet/rfq/proposals-review-toolbar"
import { AcceptProposalDialog } from "@/components/cabinet/rfq/accept-proposal-dialog"
import { filterProposalsByStatus, sortProposalsForReview } from "@/lib/proposals-review"
import type { Proposal, ProposalAcceptInput, ProposalStatus, RfqWithRelations } from "@/types"

type PageProps = {
  params: Promise<{ id: string }>
}

const MANAGE_PROPOSAL_STATUSES = ["published", "receiving_proposals"] as const

export default function ProposalsReviewPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const hydrated = useHydrated()
  const actorId = getActorId(useAuthStore((s) => s.user))
  const useApi = isApiEnabled()

  const getRfqWithRelations = useRfqsStore((s) => s.getRfqWithRelations)
  const getProposalsForRfq = useProposalsStore((s) => s.getProposalsForRfq)
  const updateProposalStatus = useProposalsStore((s) => s.updateProposalStatus)
  const acceptProposalLocal = useProposalsStore((s) => s.acceptProposal)

  const { data: apiRfq, isLoading: rfqLoading } = useRfqQuery(id, hydrated && useApi)
  const { data: apiProposals = [] } = useProposalsForRfqQuery(id, hydrated && useApi)
  const shortlistMutation = useShortlistProposalMutation()
  const rejectMutation = useRejectProposalMutation()
  const acceptMutation = useAcceptProposalMutation()

  const [sortMode, setSortMode] = useState<ProposalSortMode>("priority")
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | "all">("all")
  const [acceptTarget, setAcceptTarget] = useState<Proposal | null>(null)

  const localRfq = hydrated ? getRfqWithRelations(id) : undefined
  const rfq: RfqWithRelations | undefined = useApi ? apiRfq : localRfq
  const allProposals = useApi
    ? apiProposals
    : rfq
      ? getProposalsForRfq(rfq.id)
      : []

  const proposals = useMemo(
    () =>
      sortProposalsForReview(
        filterProposalsByStatus(allProposals, statusFilter),
        sortMode,
      ),
    [allProposals, statusFilter, sortMode],
  )
  const { getSupplier, getName: getSupplierName } = usePublicSuppliersByActor(
    allProposals.map((p) => p.supplier_actor_id),
  )

  if (!hydrated || (useApi && rfqLoading)) {
    return (
      <PageFrame className="animate-pulse">
        <div className="h-8 w-1/3 rounded-xl bg-secondary" />
        <div className="h-32 rounded-xl bg-secondary" />
      </PageFrame>
    )
  }

  if (!rfq || rfq.actor_id !== String(actorId)) {
    return (
      <PageFrame>
        <PageHeader title="Заявка не найдена" backHref="/customer/rfqs" backLabel="К списку заявок" />
      </PageFrame>
    )
  }

  const canManage = MANAGE_PROPOSAL_STATUSES.includes(
    rfq.status as (typeof MANAGE_PROPOSAL_STATUSES)[number],
  )

  const handleAccept = async (proposalId: number, terms: ProposalAcceptInput) => {
    if (useApi) {
      const result = await acceptMutation.mutateAsync({ id: proposalId, terms })
      router.push(`/customer/contracts/${result.contract_id}`)
      return
    }
    const contractId = acceptProposalLocal(proposalId, rfq.id, actorId, terms)
    if (contractId) {
      router.push(`/customer/contracts/${contractId}`)
    }
  }

  return (
    <PageFrame>
      <PageHeader
        title="Обзор предложений"
        description={rfq.title}
        backHref={`/customer/rfqs/${rfq.id}`}
        backLabel="Назад к заявке"
        actions={<RfqStatusBadge status={rfq.status} />}
      />

      <PageSurface className="p-6">
        <div className="flex flex-col gap-1 sm:text-right">
          <p className="text-sm text-muted-foreground">Бюджет</p>
          <p className="font-bold text-primary">
            {formatRfqBudget(rfq.budget_type, rfq.budget_from, rfq.budget_to, rfq.currency)}
          </p>
          <p className="text-xs text-muted-foreground">
            Дедлайн: {formatIsoDate(rfq.deadline)}
          </p>
        </div>
      </PageSurface>

      <ProposalsReviewToolbar
        total={proposals.length}
        sortMode={sortMode}
        statusFilter={statusFilter}
        onSortChange={setSortMode}
        onStatusFilterChange={setStatusFilter}
      />

      {proposals.length === 0 ? (
        <PageSurface>
          <PageEmptyState
            title="Предложений нет"
            description={
              statusFilter !== "all"
                ? "Попробуйте сменить фильтр"
                : "Дождитесь откликов исполнителей"
            }
          />
        </PageSurface>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <ProposalReviewCard
              key={proposal.id}
              proposal={proposal}
              supplier={getSupplier(proposal.supplier_actor_id)}
              supplierName={getSupplierName(proposal.supplier_actor_id)}
              canManage={canManage}
              onShortlist={() => {
                if (useApi) {
                  shortlistMutation.mutate(proposal.id)
                  return
                }
                updateProposalStatus(proposal.id, "shortlisted")
              }}
              onReject={() => {
                if (useApi) {
                  rejectMutation.mutate(proposal.id)
                  return
                }
                updateProposalStatus(proposal.id, "rejected")
              }}
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
          onConfirm={(terms) => void handleAccept(acceptTarget.id, terms)}
        />
      )}
    </PageFrame>
  )
}
