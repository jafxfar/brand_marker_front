"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Pencil, Plus, Send } from "lucide-react"
import { PageFrame, PageHeader, PageSurface } from "@/components/layout"
import { Button } from "@/components/ui/button"
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
import { useCategoryOptions } from "@/hooks/use-category-options"
import { getRfqRequirements } from "@/lib/rfq-requirements"
import { rfqTypeLabel } from "@/lib/rfq-display"
import { formatCurrency, formatIsoDate, formatRfqBudget } from "@/lib/format"
import { getRfqTimeline } from "@/lib/process/rfq-timeline"
import { DEAL_NEXT_STEP, getDealPhase } from "@/lib/process/deal-stages"
import {
  ConfirmActionDialog,
  DealStageBar,
  NextActionCard,
  ProcessTimeline,
} from "@/components/process"
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
  const { getRfqCategoryLabel } = useCategoryOptions()

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
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false)

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
  const { getSupplier, getName: getSupplierName } = usePublicSuppliersByActor([
    ...proposals.map((p) => p.supplier_actor_id),
    ...(contract ? [contract.supplier_actor_id] : []),
  ])

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

  const visibleProposals = proposals.filter(
    (p) => !["withdrawn", "archived"].includes(p.status),
  )
  const timeline = getRfqTimeline(rfq, visibleProposals.length, contract)
  const summary = [
    getRfqCategoryLabel(rfq.category_id),
    rfqTypeLabel[rfq.type],
    `бюджет ${formatRfqBudget(rfq.budget_type, rfq.budget_from, rfq.budget_to, rfq.currency)}`,
    rfq.status === "draft" ? null : `приём до ${formatIsoDate(rfq.deadline)}`,
  ]
    .filter(Boolean)
    .join(" · ")

  const renderStatusPanel = () => {
    if (rfq.status === "draft") {
      return (
        <NextActionCard
          hot
          title="Опубликуйте заявку"
          text="Пока заявка в черновике, исполнители её не видят. Проверьте описание и опубликуйте — первые предложения обычно приходят в течение дня."
          actions={
            <>
              <Button onClick={handlePublish} disabled={publishMutation.isPending}>
                <Send /> Опубликовать заявку
              </Button>
              <Button asChild variant="outline">
                <Link href={`/customer/rfqs/${rfq.id}/edit`}>
                  <Pencil /> Изменить
                </Link>
              </Button>
            </>
          }
        />
      )
    }

    if (contract) {
      const phase = getDealPhase(contract)
      const supplierName = getSupplierName(contract.supplier_actor_id)
      return (
        <section className="grid gap-3 rounded-2xl border border-border bg-card p-5">
          <span className="text-sm text-muted-foreground">По заявке идёт сделка</span>
          <b className="text-[17px]">
            {supplierName} · {formatCurrency(contract.agreed_amount, contract.currency)}
          </b>
          <DealStageBar contract={contract} />
          <p className="text-sm">{DEAL_NEXT_STEP.buyer[phase]}</p>
          <div>
            <Button asChild>
              <Link href={`/customer/contracts/${contract.id}`}>
                Открыть сделку <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      )
    }

    if (rfq.status === "expired") {
      return (
        <NextActionCard
          title="Срок приёма предложений истёк"
          text="Исполнители больше не могут откликнуться. Если вы ещё ищете исполнителя, создайте новую заявку — это займёт пару минут."
          actions={
            <>
              <Button asChild>
                <Link href="/customer/rfqs/new">
                  <Plus /> Новая заявка
                </Link>
              </Button>
              <Button variant="outline" onClick={() => setCloseConfirmOpen(true)}>
                Закрыть заявку
              </Button>
            </>
          }
        />
      )
    }

    if (canManageProposals) {
      return (
        <ProposalsPreviewPanel
          rfqId={rfq.id}
          proposals={visibleProposals}
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
      )
    }

    return (
      <PageSurface className="p-5">
        <p className="text-muted-foreground">
          {rfq.status === "cancelled" ? "Заявка закрыта." : "Заявка завершена."}
        </p>
      </PageSurface>
    )
  }

  return (
    <PageFrame>
      <PageHeader
        title={rfq.title}
        description={summary}
        backHref="/customer/rfqs"
        backLabel="Мои заявки"
        actions={<RfqStatusBadge status={rfq.status} />}
      />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="grid gap-5">
          <PageSurface className="p-5">
            <ProcessTimeline steps={timeline} label="Как идёт заявка" />
          </PageSurface>
          <RfqDescriptionSection description={rfq.description} />
          <RfqRequirementsSection requirements={requirements} />
          <RfqAttachmentsSection attachments={rfq.attachments} />
          {canManageProposals && (
            <button
              type="button"
              onClick={() => setCloseConfirmOpen(true)}
              disabled={closeMutation.isPending}
              className="justify-self-start px-2 text-sm font-semibold text-destructive hover:underline disabled:opacity-50"
            >
              Закрыть заявку
            </button>
          )}
        </div>

        <div className="grid gap-3">{renderStatusPanel()}</div>
      </div>

      <ConfirmActionDialog
        open={closeConfirmOpen}
        onOpenChange={setCloseConfirmOpen}
        title="Закрыть заявку?"
        description="Исполнители больше не смогут присылать предложения. Вернуть заявку в работу будет нельзя."
        confirmLabel="Закрыть заявку"
        cancelLabel="Не закрывать"
        destructive
        onConfirm={handleClose}
      />

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
