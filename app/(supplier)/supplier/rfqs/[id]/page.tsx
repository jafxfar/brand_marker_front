"use client"

import { use, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, FileText } from "lucide-react"
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
      <div className="max-w-[900px] mx-auto animate-pulse space-y-4">
        <div className="h-8 bg-secondary rounded-xl w-1/3" />
        <div className="h-48 bg-secondary rounded-2xl" />
      </div>
    )
  }

  if (!rfq) {
    return (
      <div className="max-w-[900px] mx-auto text-center py-16">
        <p className="text-sm font-semibold text-foreground">Заявка не найдена</p>
        <Link href="/supplier/rfqs" className="text-sm text-primary hover:underline mt-2 inline-block">
          Вернуться к заявкам заказчиков
        </Link>
      </div>
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
    <div className="max-w-[900px] mx-auto space-y-6">
      <Link
        href="/supplier/rfqs"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} /> Назад к маркетплейсу
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
              {getRfqCategoryLabel(rfq.category_id)} · {buyerName}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.className}`}>
                {meta.label}
              </span>
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
          {!useApi && (
            <RfqProposalsList
              proposals={proposals}
              currentActorId={actorId}
              getSupplierName={(supplierId) =>
                getCompany(supplierId)?.title ?? `Поставщик #${supplierId}`
              }
            />
          )}
        </div>

        <div className="space-y-4">
          <RfqBuyerProfileCard buyer={buyer} />
          <RfqSubmitProposalCard
            myProposal={myProposal}
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
    </div>
  )
}
