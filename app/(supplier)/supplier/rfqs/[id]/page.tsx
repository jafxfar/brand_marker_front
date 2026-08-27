"use client"

import { use, useState } from "react"
import Link from "next/link"
import { PageFrame, PageHeader, PageSurface } from "@/components/layout"
import { useRfqsStore } from "@/lib/store/rfqs-store"
import { useProposalsStore } from "@/lib/store/proposals-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useAuthStore } from "@/lib/store/auth-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { getRfqBuyerName, getRfqBuyerSummary } from "@/lib/buyer-display"
import { getRfqCategoryLabel } from "@/lib/mock/rfq-categories"
import { getRfqRequirements } from "@/lib/rfq-requirements"
import { rfqStatusMeta, rfqTypeLabel } from "@/lib/rfq-display"
import { formatIsoDate, formatRfqBudget } from "@/lib/format"
import { isApiEnabled } from "@/lib/api/config"
import {
  useSubmitSupplierProposalMutation,
  useSupplierProposalsQuery,
  useSupplierRfqQuery,
} from "@/hooks/api/use-supplier-rfqs-query"
import { RfqDescriptionSection } from "@/components/rfq/rfq-description-section"
import { RfqRequirementsSection } from "@/components/rfq/rfq-requirements-section"
import { RfqAttachmentsSection } from "@/components/rfq/rfq-attachments-section"
import { RfqBuyerProfileCard } from "@/components/supplier/rfq/rfq-buyer-profile-card"
import { RfqProposalsList } from "@/components/supplier/rfq/rfq-proposals-list"
import { RfqSubmitProposalCard } from "@/components/supplier/rfq/rfq-submit-proposal-card"
import { ProposalDialog } from "@/components/supplier/proposal-dialog"
import type { Currency } from "@/types"

type PageProps = {
  params: Promise<{ id: string }>
}

export default function SupplierRfqDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const getRfqWithRelations = useRfqsStore((s) => s.getRfqWithRelations)
  const getProposalForRfq = useProposalsStore((s) => s.getProposalForRfq)
  const getProposalsForRfq = useProposalsStore((s) => s.getProposalsForRfq)
  const submitProposalLocal = useProposalsStore((s) => s.submitProposal)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const [dialogOpen, setDialogOpen] = useState(false)

  const useApi = isApiEnabled()
  const { data: apiRfq, isLoading } = useSupplierRfqQuery(id, hydrated && useApi)
  const { data: apiProposals } = useSupplierProposalsQuery(hydrated && useApi)
  const submitProposalMutation = useSubmitSupplierProposalMutation()

  const localRfq = hydrated ? getRfqWithRelations(id) : undefined
  const rfq = useApi ? apiRfq : localRfq
  const myProposal = useApi
    ? apiProposals?.find((p) => p.rfq_id === id)
    : rfq
      ? getProposalForRfq(rfq.id, actorId)
      : undefined
  const proposals = rfq ? (useApi ? [] : getProposalsForRfq(rfq.id)) : []
  const buyer = rfq ? getRfqBuyerSummary(rfq, getCompany) : undefined
  const buyerName = rfq ? getRfqBuyerName(rfq, getCompany) : "Заказчик"

  if (!hydrated || (useApi && isLoading)) {
    return (
      <PageFrame className="animate-pulse">
        <div className="h-8 w-1/3 rounded-xl bg-secondary" />
        <div className="h-48 rounded-xl bg-secondary" />
      </PageFrame>
    )
  }

  if (!rfq) {
    return (
      <PageFrame>
        <PageHeader title="Заявка не найдена" backHref="/supplier/rfqs" backLabel="Вернуться к заявкам заказчиков" />
      </PageFrame>
    )
  }

  const meta = rfqStatusMeta[rfq.status]
  const requirements = getRfqRequirements(rfq)

  const handleSubmitProposal = (values: {
    price: number
    delivery_time: string
    message: string
  }) => {
    if (useApi) {
      void submitProposalMutation.mutateAsync({
        rfqId: rfq.id,
        data: {
          price: values.price,
          currency: rfq.currency,
          delivery_time: values.delivery_time,
          message: values.message,
        },
      })
      setDialogOpen(false)
      return
    }
    submitProposalLocal({
      rfq_id: rfq.id,
      supplier_actor_id: actorId,
      price: values.price,
      currency: rfq.currency as Currency,
      delivery_time: values.delivery_time,
      message: values.message,
    })
  }

  return (
    <PageFrame>
      <PageHeader
        title={rfq.title}
        description={`${getRfqCategoryLabel(rfq.category_id)} · ${buyerName}`}
        backHref="/supplier/rfqs"
        backLabel="Назад к маркетплейсу"
      />

      <PageSurface className="p-6">
        <div className="mb-6 flex flex-wrap gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.className}`}>
            {meta.label}
          </span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-foreground">
            {rfqTypeLabel[rfq.type]}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-border pt-6">
          <div>
            <p className="text-xs text-muted-foreground">Бюджет</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {formatRfqBudget(rfq.budget_type, rfq.budget_from, rfq.budget_to, rfq.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Дедлайн откликов</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
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
          {!useApi && (
            <RfqProposalsList
              proposals={proposals}
              currentActorId={actorId}
              getSupplierName={(supplierId) =>
                getCompany(supplierId)?.title ?? `Исполнитель #${supplierId}`
              }
            />
          )}
        </div>

        <div className="space-y-4">
          <RfqBuyerProfileCard buyer={buyer} />
          <RfqSubmitProposalCard
            myProposal={myProposal}
            buyerName={buyerName}
            onSubmit={() => setDialogOpen(true)}
          />
        </div>
      </div>

      <ProposalDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        rfqTitle={rfq.title}
        budgetType={rfq.budget_type}
        budgetFrom={rfq.budget_from}
        budgetTo={rfq.budget_to}
        currency={rfq.currency}
        defaultPrice={rfq.budget_from ?? rfq.budget_to}
        onSubmit={handleSubmitProposal}
      />
    </PageFrame>
  )
}
