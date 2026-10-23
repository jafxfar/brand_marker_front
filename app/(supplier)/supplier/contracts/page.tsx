"use client"

import { Suspense, useMemo, useState } from "react"
import { Briefcase } from "lucide-react"
import {
  PageEmptyState,
  PageFrame,
  PageHeader,
  SegmentedControl,
} from "@/components/layout"
import { useAuthStore } from "@/lib/store/auth-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { useUrlTab } from "@/hooks/use-url-tab"
import { getActorId } from "@/lib/auth-display"
import { isApiEnabled } from "@/lib/api/config"
import { useSupplierContractsQuery } from "@/hooks/api/use-contracts-query"
import { filterDealsByTab, type DealListTab } from "@/lib/process/deal-stages"
import { DealList } from "@/components/contracts/deal-list"
import { ListPagination } from "@/components/list-pagination"
import type { ContractWithRelations } from "@/types"

type SupplierDealTab = Extract<DealListTab, "active" | "completed">

const TAB_VALUES: SupplierDealTab[] = ["active", "completed"]

const emptyMessages: Record<SupplierDealTab, string> = {
  active: "Сделка появится, когда покупатель выберет ваше КП.",
  completed: "Здесь будут сделки, по которым вы получили оплату",
}

const SupplierContractsContent = () => {
  const hydrated = useHydrated()
  const [page, setPage] = useState(1)
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const getContractsByTab = useContractsStore((s) => s.getContractsByTab)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const [tab, setTab] = useUrlTab<SupplierDealTab>("tab", TAB_VALUES, "active")
  const useApi = isApiEnabled()
  const { data: apiContracts, isLoading } = useSupplierContractsQuery(hydrated && useApi, {
    page,
  })

  const allContracts: ContractWithRelations[] = useApi
    ? ((apiContracts?.items ?? []) as ContractWithRelations[])
    : hydrated
      ? getContractsByTab(actorId, "all")
      : []

  const activeCount = useMemo(
    () => filterDealsByTab(allContracts, "active", "supplier").length,
    [allContracts],
  )
  const completedCount = useMemo(
    () => filterDealsByTab(allContracts, "completed", "supplier").length,
    [allContracts],
  )

  const contracts = filterDealsByTab(allContracts, tab, "supplier")
  const totalPages = useApi ? (apiContracts?.total_pages ?? 0) : 1
  const isEmpty = !hydrated || isLoading || contracts.length === 0

  return (
    <PageFrame>
      <PageHeader
        title="Сделки"
        description="Заказы, которые вы выполняете"
      />

      <SegmentedControl
        value={tab}
        options={[
          { value: "active", label: "В работе", count: activeCount },
          { value: "completed", label: "Завершённые", count: completedCount },
        ]}
        onChange={setTab}
        ariaLabel="Фильтр сделок"
      />

      {isEmpty ? (
        <PageEmptyState
          variant="card"
          icon={<Briefcase />}
          title={isLoading ? "Загружаем сделки..." : "Сделок нет"}
          description={!isLoading ? emptyMessages[tab] : undefined}
        />
      ) : (
        <DealList
          contracts={contracts}
          role="supplier"
          getCounterpartName={(c) => getCompany(c.buyer_actor_id)?.title ?? "Заказчик"}
        />
      )}

      <ListPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </PageFrame>
  )
}

export default function SupplierContractsPage() {
  return (
    <Suspense fallback={null}>
      <SupplierContractsContent />
    </Suspense>
  )
}
