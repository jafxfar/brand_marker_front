"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { useQueries } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store/auth-store"
import { useRfqsStore } from "@/lib/store/rfqs-store"
import { useProposalsStore } from "@/lib/store/proposals-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { BUYER_RFQ_LIST_TABS, type BuyerRfqListTab } from "@/lib/buyer-rfq-display"
import { RfqListTable } from "@/components/cabinet/rfq/rfq-list-table"
import { cn } from "@/lib/utils"
import { isApiEnabled } from "@/lib/api/config"
import { useRfqsQuery } from "@/hooks/api/use-rfqs-query"
import { proposalsApi } from "@/lib/api/proposals"
import { proposalKeys } from "@/hooks/api/use-proposals-query"

export default function MyRfqsPage() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const [tab, setTab] = useState<BuyerRfqListTab>("draft")
  const getRfqsByBuyerTab = useRfqsStore((s) => s.getRfqsByBuyerTab)
  const getProposalsForRfq = useProposalsStore((s) => s.getProposalsForRfq)
  const useApi = isApiEnabled()
  const { data: apiRfqs, isLoading } = useRfqsQuery(tab, hydrated && useApi)

  const localRfqs = hydrated ? getRfqsByBuyerTab(actorId, tab) : []
  const rfqs = useApi ? (apiRfqs ?? []) : localRfqs

  const proposalQueries = useQueries({
    queries: (useApi ? rfqs : []).map((rfq) => ({
      queryKey: proposalKeys.forRfq(rfq.id),
      queryFn: () => proposalsApi.listForRfq(rfq.id),
      enabled: hydrated && useApi,
    })),
  })

  const getProposalCount = (rfqId: string) => {
    if (!useApi) return getProposalsForRfq(rfqId).length
    const index = rfqs.findIndex((r) => r.id === rfqId)
    return proposalQueries[index]?.data?.length ?? 0
  }

  return (
    <div className="max-w-[900px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Мои заявки</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ваши запросы поставщикам и их статусы
          </p>
        </div>
        <Link
          href="/customer/rfqs/new"
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-primary hover:bg-primary-dark text-primary-foreground text-sm font-bold transition-colors"
        >
          <Plus size={17} /> Создать заявку
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
        {useApi && isLoading ? (
          <p className="p-8 text-sm text-muted-foreground text-center">Загрузка…</p>
        ) : (
          <RfqListTable
            rfqs={rfqs}
            hydrated={hydrated}
            getProposalCount={getProposalCount}
          />
        )}
      </div>
    </div>
  )
}
