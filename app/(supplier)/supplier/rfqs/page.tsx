"use client"

import { useState } from "react"
import { Inbox } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useRfqsStore } from "@/lib/store/rfqs-store"
import { useProposalsStore } from "@/lib/store/proposals-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { getRfqBuyerName, getRfqBuyerRating } from "@/lib/buyer-display"
import { isApiEnabled } from "@/lib/api/config"
import {
  hasSupplierProposalForRfq,
  useSubmitSupplierProposalMutation,
  useSupplierProposalsQuery,
  useSupplierRfqBoardQuery,
} from "@/hooks/api/use-supplier-rfqs-query"
import { RfqBoardTable } from "@/components/supplier/rfq/rfq-board-table"
import { ProposalDialog } from "@/components/supplier/proposal-dialog"
import {
  PageEmptyState,
  PageFrame,
  PageHeader,
  PageSurface,
  SegmentedControl,
} from "@/components/layout"
import type { Currency } from "@/types"
import type { RfqType, RfqWithRelations } from "@/types"

type TypeFilter = "all" | RfqType

export default function SupplierRfqsPage() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const getOpenRfqs = useRfqsStore((s) => s.getOpenRfqs)
  const getRfq = useRfqsStore((s) => s.getRfq)
  const hasProposalLocal = useProposalsStore((s) => s.hasProposal)
  const submitProposalLocal = useProposalsStore((s) => s.submitProposal)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const useApi = isApiEnabled()
  const { data: apiRfqs, isLoading } = useSupplierRfqBoardQuery(hydrated && useApi)
  const { data: apiProposals } = useSupplierProposalsQuery(hydrated && useApi)
  const submitProposalMutation = useSubmitSupplierProposalMutation()

  const localRfqs = hydrated ? getOpenRfqs() : []
  const openRfqs: RfqWithRelations[] = useApi ? (apiRfqs ?? []) : localRfqs
  const filtered = typeFilter === "all"
    ? openRfqs
    : openRfqs.filter((r) => r.type === typeFilter)

  const selectedRfq = selectedRfqId
    ? (useApi ? apiRfqs?.find((r) => r.id === selectedRfqId) : getRfq(selectedRfqId))
    : undefined

  const hasProposal = (rfqId: string, supplierActorId: number) => {
    if (useApi) return hasSupplierProposalForRfq(apiProposals, rfqId)
    return hasProposalLocal(rfqId, supplierActorId)
  }

  const handleOpenProposal = (rfqId: string) => {
    setSelectedRfqId(rfqId)
    setDialogOpen(true)
  }

  const handleSubmitProposal = (values: {
    price: number
    delivery_time: string
    message: string
  }) => {
    if (!selectedRfq) return
    if (useApi) {
      void submitProposalMutation.mutateAsync({
        rfqId: selectedRfq.id,
        data: {
          price: values.price,
          currency: selectedRfq.currency,
          delivery_time: values.delivery_time,
          message: values.message,
        },
      })
      setDialogOpen(false)
      return
    }
    submitProposalLocal({
      rfq_id: selectedRfq.id,
      supplier_actor_id: actorId,
      price: values.price,
      currency: selectedRfq.currency as Currency,
      delivery_time: values.delivery_time,
      message: values.message,
    })
  }

  const isEmpty = !hydrated || isLoading || filtered.length === 0

  return (
    <PageFrame>
      <PageHeader
        title="Заявки заказчиков"
        description="Открытые заявки, на которые можно откликнуться"
      />

      <SegmentedControl
        value={typeFilter}
        options={[
          { value: "all", label: "Все" },
          { value: "product", label: "Товары" },
          { value: "service", label: "Услуги" },
        ]}
        onChange={setTypeFilter}
        ariaLabel="Тип заявки"
      />

      {isEmpty ? (
        <PageSurface>
          <PageEmptyState
            icon={<Inbox size={32} />}
            title={isLoading ? "Загрузка заявок..." : "Открытых заявок нет"}
            description={!isLoading ? "Новые заявки заказчиков появятся здесь" : undefined}
          />
        </PageSurface>
      ) : (
        <PageSurface>
          <RfqBoardTable
            rfqs={filtered}
            actorId={actorId}
            hasProposal={hasProposal}
            getBuyerName={(rfq) => getRfqBuyerName(rfq, getCompany)}
            getBuyerRating={(rfq) => getRfqBuyerRating(rfq, getCompany)}
            onSubmitProposal={handleOpenProposal}
          />
        </PageSurface>
      )}

      {selectedRfq && (
        <ProposalDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          rfqTitle={selectedRfq.title}
          budgetType={selectedRfq.budget_type}
          budgetFrom={selectedRfq.budget_from}
          budgetTo={selectedRfq.budget_to}
          currency={selectedRfq.currency}
          defaultPrice={selectedRfq.budget_from ?? selectedRfq.budget_to}
          onSubmit={handleSubmitProposal}
        />
      )}
    </PageFrame>
  )
}
