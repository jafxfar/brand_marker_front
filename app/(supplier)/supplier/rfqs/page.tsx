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
import { RfqBoardTable } from "@/components/supplier/rfq/rfq-board-table"
import { ProposalDialog } from "@/components/supplier/proposal-dialog"
import type { Currency } from "@/types"
import type { RfqType } from "@/types"

type TypeFilter = "all" | RfqType

export default function SupplierRfqsPage() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const getOpenRfqs = useRfqsStore((s) => s.getOpenRfqs)
  const getRfq = useRfqsStore((s) => s.getRfq)
  const hasProposal = useProposalsStore((s) => s.hasProposal)
  const submitProposal = useProposalsStore((s) => s.submitProposal)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const openRfqs = hydrated ? getOpenRfqs() : []
  const filtered = typeFilter === "all"
    ? openRfqs
    : openRfqs.filter((r) => r.type === typeFilter)

  const selectedRfq = selectedRfqId ? getRfq(selectedRfqId) : undefined

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
    submitProposal({
      rfq_id: selectedRfq.id,
      supplier_actor_id: actorId,
      price: values.price,
      currency: selectedRfq.currency as Currency,
      delivery_time: values.delivery_time,
      message: values.message,
    })
  }

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Inbox size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Маркетплейс RFQ</h1>
          <p className="text-sm text-muted-foreground">Доска открытых запросов от заказчиков</p>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-5 bg-white border border-border rounded-xl p-1 w-fit">
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

      {!hydrated || filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <Inbox size={32} className="text-primary mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">Открытых RFQ нет</p>
          <p className="text-xs text-muted-foreground mt-1">
            Новые запросы заказчиков появятся на доске
          </p>
        </div>
      ) : (
        <RfqBoardTable
          rfqs={filtered}
          actorId={actorId}
          hasProposal={hasProposal}
          getBuyerRating={(buyerId) => getCompany(buyerId)?.rating ?? 0}
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
