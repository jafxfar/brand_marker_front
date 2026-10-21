"use client"

import { useMemo, useState } from "react"
import { Inbox } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useRfqsStore } from "@/lib/store/rfqs-store"
import { useProposalsStore } from "@/lib/store/proposals-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { getRfqBuyerName, getRfqBuyerRating } from "@/lib/buyer-display"
import { isApiEnabled } from "@/lib/api/config"
import { isRfqInvitedFor } from "@/lib/rfq-display"
import {
  filterRfqsBySource,
  isCatalogOfferRfq,
  sortSupplierBoardRfqs,
  type SupplierRfqSourceFilter,
} from "@/lib/rfq-board"
import {
  useSubmitSupplierProposalMutation,
  useSupplierProposalsQuery,
  useSupplierRfqBoardQuery,
} from "@/hooks/api/use-supplier-rfqs-query"
import { RfqBoardTable } from "@/components/supplier/rfq/rfq-board-table"
import { ListPagination } from "@/components/list-pagination"
import { ProposalDialog } from "@/components/supplier/proposal-dialog"
import {
  PageEmptyState,
  PageFrame,
  PageHeader,
  PageSurface,
  SegmentedControl,
} from "@/components/layout"
import type { Currency, ProposalStatus, RfqType, RfqWithRelations } from "@/types"

type TypeFilter = "all" | RfqType

export default function SupplierRfqsPage() {
  const hydrated = useHydrated()
  const [page, setPage] = useState(1)
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const getOpenRfqs = useRfqsStore((s) => s.getOpenRfqs)
  const getRfq = useRfqsStore((s) => s.getRfq)
  const submitProposalLocal = useProposalsStore((s) => s.submitProposal)
  const localProposals = useProposalsStore((s) => s.proposals)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [sourceFilter, setSourceFilter] = useState<SupplierRfqSourceFilter>("all")
  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const useApi = isApiEnabled()
  const { data: apiRfqs, isLoading } = useSupplierRfqBoardQuery(hydrated && useApi, { page })
  const { data: apiProposals } = useSupplierProposalsQuery(hydrated && useApi)
  const submitProposalMutation = useSubmitSupplierProposalMutation()

  const localRfqs = hydrated ? getOpenRfqs() : []
  const openRfqs: RfqWithRelations[] = useApi ? (apiRfqs?.items ?? []) : localRfqs
  const totalPages = useApi ? (apiRfqs?.total_pages ?? 0) : 1

  const sourceCounts = useMemo(() => {
    const catalog = openRfqs.filter(isCatalogOfferRfq).length
    return {
      all: openRfqs.length,
      marketplace: openRfqs.length - catalog,
      catalog,
    }
  }, [openRfqs])

  const filtered = useMemo(() => {
    const byType =
      typeFilter === "all" ? openRfqs : openRfqs.filter((r) => r.type === typeFilter)
    const bySource = filterRfqsBySource(byType, sourceFilter)
    return sortSupplierBoardRfqs(bySource, actorId, isRfqInvitedFor)
  }, [openRfqs, typeFilter, sourceFilter, actorId])

  const selectedRfq = selectedRfqId
    ? (useApi ? openRfqs.find((r) => r.id === selectedRfqId) : getRfq(selectedRfqId))
    : undefined

  const proposalItems = apiProposals?.items ?? []

  const getMyProposal = (rfqId: string) => {
    const boardStatus = openRfqs.find((r) => r.id === rfqId)?.my_proposal_status
    const proposal = useApi
      ? proposalItems.find((p) => p.rfq_id === rfqId && p.status !== "withdrawn")
      : localProposals.find(
          (p) =>
            p.rfq_id === rfqId &&
            p.supplier_actor_id === actorId &&
            p.status !== "withdrawn",
        )
    const status = (proposal?.status ?? boardStatus) as ProposalStatus | null | undefined
    if (!status || status === "withdrawn") return undefined
    return {
      price: proposal?.price ?? 0,
      currency: proposal?.currency ?? "TJS",
      status,
    }
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

  const emptyTitle = isLoading
    ? "Загрузка заявок..."
    : sourceFilter === "catalog"
      ? "Нет запросов на ваши товары и услуги"
      : sourceFilter === "marketplace"
        ? "Нет заявок заказчиков"
        : "Открытых заявок нет"

  const emptyDescription = !isLoading
    ? sourceFilter === "catalog"
      ? "Когда заказчик нажмёт «Купить с гарантией» или «Торговаться» по вашей позиции, запрос появится здесь"
      : "Новые заявки заказчиков и запросы из каталога появятся здесь"
    : undefined

  const isEmpty = !hydrated || isLoading || filtered.length === 0

  return (
    <PageFrame>
      <PageHeader
        title="Заявки"
        description="Заявки заказчиков с маркетплейса и запросы на покупку или торг по вашим товарам и услугам"
      />

      <SegmentedControl
        value={sourceFilter}
        options={[
          { value: "all", label: "Все", count: sourceCounts.all },
          {
            value: "marketplace",
            label: "Заявки заказчиков",
            count: sourceCounts.marketplace,
          },
          {
            value: "catalog",
            label: "На мои товары и услуги",
            count: sourceCounts.catalog,
          },
        ]}
        onChange={(value) => {
          setSourceFilter(value)
          setPage(1)
        }}
        ariaLabel="Источник заявки"
      />

      <SegmentedControl
        value={typeFilter}
        options={[
          { value: "all", label: "Все типы" },
          { value: "product", label: "Товары" },
          { value: "service", label: "Услуги" },
        ]}
        onChange={setTypeFilter}
        ariaLabel="Тип заявки"
      />

      {isEmpty ? (
        <PageSurface>
          <PageEmptyState
            icon={<Inbox />}
            title={emptyTitle}
            description={emptyDescription}
          />
        </PageSurface>
      ) : (
        <RfqBoardTable
          rfqs={filtered}
          actorId={actorId}
          getMyProposal={getMyProposal}
          getBuyerName={(rfq) => getRfqBuyerName(rfq, getCompany)}
          getBuyerRating={(rfq) => getRfqBuyerRating(rfq, getCompany)}
          onSubmitProposal={handleOpenProposal}
        />
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

      <ListPagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </PageFrame>
  )
}
