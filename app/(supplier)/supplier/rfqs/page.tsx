"use client"

import { useState } from "react"
import { Inbox } from "lucide-react"
import { cn } from "@/lib/utils"
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
    <div className="max-w-[1100px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Inbox size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Заявки заказчиков</h1>
          <p className="text-sm text-muted-foreground">Открытые заявки, на которые можно откликнуться</p>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-5 bg-card border border-border rounded-xl p-1 w-fit">
        {(["all", "product", "service"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setTypeFilter(value)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
              typeFilter === value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {value === "all" ? "Все" : value === "product" ? "Товары" : "Услуги"}
          </button>
        ))}
      </div>

      {isEmpty ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Inbox size={32} className="text-primary mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">
            {isLoading ? "Загрузка заявок..." : "Открытых заявок нет"}
          </p>
          {!isLoading && (
            <p className="text-xs text-muted-foreground mt-1">
              Новые заявки заказчиков появятся здесь
            </p>
          )}
        </div>
      ) : (
        <RfqBoardTable
          rfqs={filtered}
          actorId={actorId}
          hasProposal={hasProposal}
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
    </div>
  )
}
