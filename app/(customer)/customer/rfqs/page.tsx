"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageFrame, PageHeader, PageToolbar, PageSurface, PageEmptyState } from "@/components/layout"
import { useQueries } from "@tanstack/react-query"
import { useAuthStore } from "@/lib/store/auth-store"
import { useRfqsStore } from "@/lib/store/rfqs-store"
import { useProposalsStore } from "@/lib/store/proposals-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import {
  BUYER_RFQ_STATUS_FILTER_OPTIONS,
  type BuyerRfqStatusFilter,
} from "@/lib/buyer-rfq-display"
import { RfqListTable } from "@/components/cabinet/rfq/rfq-list-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { isApiEnabled } from "@/lib/api/config"
import { useRfqsQuery } from "@/hooks/api/use-rfqs-query"
import { proposalsApi } from "@/lib/api/proposals"
import { proposalKeys } from "@/hooks/api/use-proposals-query"

export default function MyRfqsPage() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const [statusFilter, setStatusFilter] = useState<BuyerRfqStatusFilter>("all")
  const getRfqsByBuyerTab = useRfqsStore((s) => s.getRfqsByBuyerTab)
  const getProposalsForRfq = useProposalsStore((s) => s.getProposalsForRfq)
  const useApi = isApiEnabled()
  const { data: apiRfqs, isLoading } = useRfqsQuery(statusFilter, hydrated && useApi)

  const localRfqs = hydrated ? getRfqsByBuyerTab(actorId, statusFilter) : []
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

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as BuyerRfqStatusFilter)
  }

  return (
    <PageFrame>
      <PageHeader
        title="Мои заявки"
        description="Ваши запросы исполнителям и их статусы"
        actions={
          <Button asChild size="lg">
            <Link href="/customer/rfqs/new">
              <Plus size={17} /> Создать заявку
            </Link>
          </Button>
        }
      />

      <PageToolbar label="Статус" htmlFor="rfq-status-filter">
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger
            id="rfq-status-filter"
            className="w-[220px]"
            aria-label="Фильтр по статусу заявки"
          >
            <SelectValue placeholder="Все статусы" />
          </SelectTrigger>
          <SelectContent>
            {BUYER_RFQ_STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PageToolbar>

      <PageSurface>
        {useApi && isLoading ? (
          <PageEmptyState title="Загрузка…" />
        ) : (
          <RfqListTable
            rfqs={rfqs}
            hydrated={hydrated}
            getProposalCount={getProposalCount}
          />
        )}
      </PageSurface>
    </PageFrame>
  )
}
