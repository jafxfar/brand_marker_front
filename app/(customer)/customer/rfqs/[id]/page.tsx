"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ShoppingCart, FileText, FileCheck, Pencil } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useRfqsStore } from "@/lib/store/rfqs-store"
import { useProposalsStore } from "@/lib/store/proposals-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
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
  const getCompany = useCompaniesStore((s) => s.getCompany)

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

  if (!hydrated || (useApi && isLoading)) {
    return (
      <div className="max-w-[900px] mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-secondary rounded-xl w-1/3" />
        <div className="h-48 bg-secondary rounded-2xl" />
      </div>
    )
  }

  if (!rfq || rfq.actor_id !== String(actorId)) {
    return (
      <div className="max-w-[900px] mx-auto text-center py-16">
        <p className="text-sm font-semibold text-foreground">Заявка не найдена</p>
        <Link href="/customer/rfqs" className="text-sm text-primary hover:underline mt-2 inline-block">
          Вернуться к списку
        </Link>
      </div>
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
    <div className="max-w-[900px] mx-auto space-y-6">
      <Link
        href="/customer/rfqs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} /> Назад к моим заявкам
      </Link>

      <div className="bg-white border border-border rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
            {rfq.type === "product" ? (
              <ShoppingCart size={20} className="text-primary" />
            ) : (
              <FileText size={20} className="text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-foreground">{rfq.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {getRfqCategoryLabel(rfq.category_id)}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <RfqStatusBadge status={rfq.status} />
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-foreground">
                {rfqTypeLabel[rfq.type]}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RfqDescriptionSection description={rfq.description} />
          <RfqRequirementsSection requirements={requirements} />
          <RfqAttachmentsSection attachments={rfq.attachments} />
          <ProposalsPreviewPanel
            rfqId={rfq.id}
            proposals={proposals}
            canManage={canManageProposals}
            getCompany={getCompany}
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
            <section className="bg-white border border-border rounded-2xl p-6 space-y-3">
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
                className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                Опубликовать
              </button>
            </section>
          )}

          {contract && (
            <Link
              href={`/customer/contracts/${contract.id}`}
              className="block bg-white border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors"
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
          supplierName={
            getCompany(acceptTarget.supplier_actor_id)?.title ??
            `Поставщик #${acceptTarget.supplier_actor_id}`
          }
          price={acceptTarget.price}
          currency={acceptTarget.currency}
          onConfirm={(terms) => void handleAccept(acceptTarget.id, terms)}
        />
      )}
    </div>
  )
}
