"use client"

import { useState } from "react"
import { FileCheck } from "lucide-react"
import {
  PageEmptyState,
  PageFrame,
  PageHeader,
  PageSurface,
  SegmentedControl,
} from "@/components/layout"
import { useAuthStore } from "@/lib/store/auth-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { isApiEnabled } from "@/lib/api/config"
import { useSupplierContractsQuery } from "@/hooks/api/use-contracts-query"
import {
  CONTRACT_LIST_TABS,
  filterContractsByTab,
  type ContractListTab,
} from "@/lib/contract-display"
import { ContractsListTable } from "@/components/supplier/contracts/contracts-list-table"
import type { ContractWithRelations } from "@/types"

const emptyMessages: Record<ContractListTab, string> = {
  all: "Договоров нет",
  active: "Активные договоры появятся после принятия предложений",
  completed: "Завершённые договоры отобразятся здесь",
  disputed: "Спорных договоров нет",
  cancelled: "Отменённых договоров нет",
}

export default function SupplierContractsPage() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const getContractsByTab = useContractsStore((s) => s.getContractsByTab)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const [tab, setTab] = useState<ContractListTab>("all")
  const useApi = isApiEnabled()
  const { data: apiContracts, isLoading } = useSupplierContractsQuery(hydrated && useApi)

  const localContracts = hydrated ? getContractsByTab(actorId, tab) : []
  const contracts: ContractWithRelations[] = useApi
    ? filterContractsByTab((apiContracts ?? []) as ContractWithRelations[], tab)
    : localContracts

  const isEmpty = !hydrated || isLoading || contracts.length === 0

  return (
    <PageFrame>
      <PageHeader
        title="Договоры"
        description="Управление сделками как исполнитель"
      />

      <SegmentedControl
        value={tab}
        options={CONTRACT_LIST_TABS}
        onChange={setTab}
        ariaLabel="Статус договора"
      />

      {isEmpty ? (
        <PageSurface>
          <PageEmptyState
            icon={<FileCheck size={32} />}
            title={isLoading ? "Загрузка договоров..." : "Договоров нет"}
            description={!isLoading ? emptyMessages[tab] : undefined}
          />
        </PageSurface>
      ) : (
        <PageSurface>
          <ContractsListTable
            contracts={contracts}
            getBuyerName={(id) => getCompany(id)?.title ?? "Заказчик"}
          />
        </PageSurface>
      )}
    </PageFrame>
  )
}
