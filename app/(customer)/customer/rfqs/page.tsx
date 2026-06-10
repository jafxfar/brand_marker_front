"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useRfqsStore } from "@/lib/store/rfqs-store"
import { useProposalsStore } from "@/lib/store/proposals-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { BUYER_RFQ_LIST_TABS, type BuyerRfqListTab } from "@/lib/buyer-rfq-display"
import { RfqListTable } from "@/components/cabinet/rfq/rfq-list-table"
import { cn } from "@/lib/utils"

export default function MyRfqsPage() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const [tab, setTab] = useState<BuyerRfqListTab>("collecting")
  const getRfqsByBuyerTab = useRfqsStore((s) => s.getRfqsByBuyerTab)
  const getProposalsForRfq = useProposalsStore((s) => s.getProposalsForRfq)

  const rfqs = hydrated ? getRfqsByBuyerTab(actorId, tab) : []

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Мои RFQ</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Управление запросами и статусами
          </p>
        </div>
        <Link
          href="/customer/rfqs/new"
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-primary hover:bg-primary-dark text-primary-foreground text-sm font-bold transition-colors"
        >
          <Plus size={17} /> Создать RFQ
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {BUYER_RFQ_LIST_TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setTab(item.value)}
            className={cn(
              "h-9 px-4 rounded-xl text-sm font-semibold transition-colors",
              tab === item.value
                ? "bg-primary text-primary-foreground"
                : "bg-white border border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <RfqListTable
          rfqs={rfqs}
          hydrated={hydrated}
          getProposalCount={(rfqId) => getProposalsForRfq(rfqId).length}
        />
      </div>
    </div>
  )
}
