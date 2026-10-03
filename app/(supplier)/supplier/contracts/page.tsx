"use client"

import { Suspense } from "react"
import { FileCheck } from "lucide-react"
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
import { CONTRACT_LIST_TABS, type ContractListTab } from "@/lib/contract-display"
import { filterDealsByTab } from "@/lib/process/deal-stages"
import { DealList } from "@/components/contracts/deal-list"
import type { ContractWithRelations } from "@/types"

const emptyMessages: Record<ContractListTab, string> = {
  all: "Сделка начнётся, когда заказчик выберет ваше предложение",
  active: "Сделка начнётся, когда заказчик выберет ваше предложение",
  completed: "Здесь будут сделки, по которым вы получили оплату",
  disputed: "Споров нет — и хорошо",
  cancelled: "Отменённых сделок нет",
}

const CONTRACT_TAB_VALUES = CONTRACT_LIST_TABS.map((option) => option.value)

const SupplierContractsContent = () => {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const getContractsByTab = useContractsStore((s) => s.getContractsByTab)

  const getCompany = useCompaniesStore((s) => s.getCompany)
  const [tab, setTab] = useUrlTab<ContractListTab>("tab", CONTRACT_TAB_VALUES, "all")
  const useApi = isApiEnabled()
  const { data: apiContracts, isLoading } = useSupplierContractsQuery(hydrated && useApi)

  const allContracts: ContractWithRelations[] = useApi
    ? ((apiContracts ?? []) as ContractWithRelations[])
    : hydrated
      ? getContractsByTab(actorId, "all")
      : []
  const contracts = filterDealsByTab(allContracts, tab, "supplier")

  const isEmpty = !hydrated || isLoading || contracts.length === 0

  return (
    <PageFrame>
      <PageHeader
        title="Мои сделки"
        description="Этап каждой сделки и что нужно сделать дальше"
      />

      <SegmentedControl
        value={tab}
        options={CONTRACT_LIST_TABS}
        onChange={setTab}
        ariaLabel="Фильтр сделок"
      />

      {isEmpty ? (
        <PageEmptyState
          variant="card"
          icon={<FileCheck />}
          title={isLoading ? "Загружаем сделки..." : "Сделок пока нет"}
          description={!isLoading ? emptyMessages[tab] : undefined}
        />
      ) : (
        <DealList
          contracts={contracts}
          role="supplier"
          getCounterpartName={(c) => getCompany(c.buyer_actor_id)?.title ?? "Заказчик"}
        />
      )}
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
