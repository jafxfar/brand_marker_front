"use client"

import { useState } from "react"
import { FileCheck } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useCompaniesStore } from "@/lib/store/companies-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import {
  BUYER_CONTRACT_LIST_TABS,
  buyerContractEmptyMessages,
  type BuyerContractListTab,
} from "@/lib/buyer-contract-display"
import { BuyerContractsListTable } from "@/components/cabinet/contracts/buyer-contracts-list-table"
import { isApiEnabled } from "@/lib/api/config"
import { useContractsQuery } from "@/hooks/api/use-contracts-query"
import { filterContractsByTab } from "@/lib/contract-display"
import {
  PageEmptyState,
  PageFrame,
  PageHeader,
  PageSurface,
  SegmentedControl,
} from "@/components/layout"
import type { ContractWithRelations } from "@/types"

export default function BuyerContractsPage() {
  const hydrated = useHydrated()
  const actorId = getActorId(useAuthStore((s) => s.user))
  const getContractsByTabForBuyer = useContractsStore((s) => s.getContractsByTabForBuyer)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const [tab, setTab] = useState<BuyerContractListTab>("active")
  const useApi = isApiEnabled()
  const { data: apiContracts } = useContractsQuery(hydrated && useApi)

  const localContracts = hydrated ? getContractsByTabForBuyer(actorId, tab) : []
  const contracts: ContractWithRelations[] = useApi
    ? filterContractsByTab((apiContracts ?? []) as ContractWithRelations[], tab)
    : localContracts

  return (
    <PageFrame>
      <PageHeader
        title="Контракты"
        description="Управление сделками как заказчик"
      />

      <SegmentedControl
        value={tab}
        options={BUYER_CONTRACT_LIST_TABS}
        onChange={setTab}
        ariaLabel="Фильтр контрактов"
      />

      {!hydrated || contracts.length === 0 ? (
        <PageSurface>
          <PageEmptyState
            icon={<FileCheck size={32} />}
            title="Контрактов нет"
            description={buyerContractEmptyMessages[tab]}
          />
        </PageSurface>
      ) : (
        <PageSurface>
          <BuyerContractsListTable
            contracts={contracts}
            getSupplierName={(id) => getCompany(id)?.title ?? "Исполнитель"}
          />
        </PageSurface>
      )}
    </PageFrame>
  )
}
