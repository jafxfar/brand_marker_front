"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FileCheck, Pencil } from "lucide-react"
import { PageFrame, PageHeader, PageSurface } from "@/components/layout"
import { useAuthStore } from "@/lib/store/auth-store"
import { useRfqsStore } from "@/lib/store/rfqs-store"
import { useProposalsStore } from "@/lib/store/proposals-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { usePublicSuppliersByActor } from "@/hooks/api/use-supplier-name"
import { getActorId } from "@/lib/auth-display"
import { isApiEnabled } from "@/lib/api/config"
import {
  useCloseRfqMutation,
  usePublishRfqMutation,
  useRfqQuery,
} from "@/hooks/api/use-rfqs-query"
import {
  useAcceptProposalMutation,
  useProposalsForRfqQuery,
  useRejectProposalMutation,
  useShortlistProposalMutation,
} from "@/hooks/api/use-proposals-query"
import { useContractsQuery } from "@/hooks/api/use-contracts-query"
import { getRfqCategoryLabel } from "@/lib/mock/rfq-categories"
import { getRfqRequirements } from "@/lib/rfq-requirements"
import { rfqTypeLabel } from "@/lib/rfq-display"
import { formatIsoDate, formatRfqBudget } from "@/lib/format"
import { RfqDescriptionSection } from "@/components/rfq/rfq-description-section"
import { RfqRequirementsSection } from "@/components/rfq/rfq-requirements-section"
import { RfqAttachmentsSection } from "@/components/rfq/rfq-attachments-section"
import { RfqStatusBadge } from "@/components/rfq/rfq-status-badge"
import { ProposalsPreviewPanel } from "@/components/cabinet/rfq/proposals-preview-panel"
import { AcceptProposalDialog } from "@/components/cabinet/rfq/accept-proposal-dialog"
import type { Proposal, ProposalAcceptInput, RfqWithRelations } from "@/types"

type PageProps = {
  params: Promise<{ id: string }>
}

const MANAGE_PROPOSAL_STATUSES = ["published", "receiving_proposals"] as const

export default function BuyerRfqDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const useApi = isApiEnabled()

  const getRfqWithRelations = useRfqsStore((s) => s.getRfqWithRelations)
  const publishRfqLocal = useRfqsStore((s) => s.publishRfq)
  const closeRfqLocal = useRfqsStore((s) => s.closeRfq)
  const getProposalsForRfq = useProposalsStore((s) => s.getProposalsForRfq)
  const updateProposalStatus = useProposalsStore((s) => s.updateProposalStatus)
  const acceptProposalLocal = useProposalsStore((s) => s.acceptProposal)
  const getContractByRfqId = useContractsStore((s) => s.getContractByRfqId)

  const { data: apiRfq, isLoading } = useRfqQuery(id, hydrated && useApi)
  const { data: apiProposals = [] } = useProposalsForRfqQuery(id, hydrated && useApi)
  const { data: apiContracts = [] } = useContractsQuery(hydrated && useApi)

  const publishMutation = usePublishRfqMutation()
  const closeMutation = useCloseRfqMutation()
  const shortlistMutation = useShortlistProposalMutation()
  const rejectMutation = useRejectProposalMutation()
  const acceptMutation = useAcceptProposalMutation()

  const [acceptTarget, setAcceptTarget] = useState<Proposal | null>(null)

  const localRfq = hydrated ? getRfqWithRelations(id) : undefined
  const rfq: RfqWithRelations | undefined = useApi ? apiRfq : localRfq
  const proposals = useApi
    ? apiProposals
    : rfq
      ? getProposalsForRfq(rfq.id)
      : []
  const contract = useApi
    ? apiContracts.find((c) => c.rfq_id === id)
    : rfq
      ? getContractByRfqId(rfq.id)
      : undefined
  const { getSupplier, getName: getSupplierName } = usePublicSuppliersByActor(
    proposals.map((p) => p.supplier_actor_id),
  )

  if (!hydrated || (useApi && isLoading)) {
    return (
      <PageFrame className="animate-pulse">
        <div className="h-8 w-1/3 rounded-xl bg-secondary" />
        <div className="h-48 rounded-xl bg-secondary" />
      </PageFrame>
    )
  }

  if (!rfq || rfq.actor_id !== String(actorId)) {
    return (
      <PageFrame>
        <PageHeader title="Заявка не найдена" backHref="/customer/rfqs" backLabel="Вернуться к списку" />
      </PageFrame>
    )
  }

  const requirements = getRfqRequirements(rfq)
  const canManageProposals = MANAGE_PROPOSAL_STATUSES.includes(
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

  const handlePublish = () => {
    if (useApi) {
      publishMutation.mutate(rfq.id)
      return
    }
    publishRfqLocal(rfq.id)
  }

  const handleClose = () => {
    if (useApi) {
      closeMutation.mutate(rfq.id)
      return
    }
    closeRfqLocal(rfq.id)
  }

  const handleShortlist = (proposalId: number) => {
    if (useApi) {
      shortlistMutation.mutate(proposalId)
      return
    }
    updateProposalStatus(proposalId, "shortlisted")
  }

  const handleReject = (proposalId: number) => {
    if (useApi) {
      rejectMutation.mutate(proposalId)
      return
    }
    updateProposalStatus(proposalId, "rejected")
  }

  return (
    <PageFrame>
      <PageHeader
        title={rfq.title}
        description={getRfqCategoryLabel(rfq.category_id)}
        backHref="/customer/rfqs"
        backLabel="Назад к моим заявкам"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <RfqStatusBadge status={rfq.status} />
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-foreground">
              {rfqTypeLabel[rfq.type]}
            </span>
          </div>
        }
      />

      <PageSurface className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Бюджет</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">
              {formatRfqBudget(rfq.budget_type, rfq.budget_from, rfq.budget_to, rfq.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Дедлайн откликов</p>
            <p className="text-sm font-semibold text-foreground mt-0.5">
              {formatIsoDate(rfq.deadline)}
            </p>
          </div>
        </div>
      </PageSurface>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RfqDescriptionSection description={rfq.description} />
          <RfqRequirementsSection requirements={requirements} />
          <RfqAttachmentsSection attachments={rfq.attachments} />
          <ProposalsPreviewPanel
            rfqId={rfq.id}
            proposals={proposals}
            canManage={canManageProposals}
            getSupplier={getSupplier}
            getSupplierName={getSupplierName}
            onShortlist={handleShortlist}
            onReject={handleReject}
            onAccept={(proposalId) => {
              const target = proposals.find((p) => p.id === proposalId)
              if (target) setAcceptTarget(target)
            }}
          />
        </div>

        <div className="space-y-4">
          {rfq.status === "draft" && (
            <section className="bg-card border border-border rounded-xl p-6 space-y-3">
              <h2 className="text-base font-bold text-foreground">Действия</h2>
              <Link
                href={`/customer/rfqs/${rfq.id}/edit`}
                className="flex items-center justify-center gap-2 w-full h-10 rounded-xl border border-border text-sm font-bold hover:bg-secondary transition-colors"
              >
                <Pencil size={16} /> Редактировать
              </Link>
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishMutation.isPending}
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Опубликовать
              </button>
            </section>
          )}

          {contract && (
            <Link
              href={`/customer/contracts/${contract.id}`}
              className="block bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                  <FileCheck size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Контракт создан</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Перейти к чату и оплате
                  </p>
                </div>
              </div>
            </Link>
          )}

          {canManageProposals && (
            <button
              type="button"
              onClick={handleClose}
              disabled={closeMutation.isPending}
              className="w-full h-10 rounded-xl border border-destructive/30 text-destructive text-sm font-bold hover:bg-destructive/5 transition-colors disabled:opacity-50"
            >
              Закрыть заявку
            </button>
          )}
        </div>
      </div>

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
