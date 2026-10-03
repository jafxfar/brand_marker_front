"use client"

import { Suspense } from "react"
import { FileCheck } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { usePublicSuppliersByActor } from "@/hooks/api/use-supplier-name"
import { useHydrated } from "@/hooks/use-hydrated"
import { useUrlTab } from "@/hooks/use-url-tab"
import { getActorId } from "@/lib/auth-display"
import {
  BUYER_CONTRACT_LIST_TABS,
  buyerContractEmptyMessages,
  type BuyerContractListTab,
} from "@/lib/buyer-contract-display"
import { DealList } from "@/components/contracts/deal-list"
import { filterDealsByTab } from "@/lib/process/deal-stages"
import { isApiEnabled } from "@/lib/api/config"
import { useContractsQuery } from "@/hooks/api/use-contracts-query"
import {
  PageEmptyState,
  PageFrame,
  PageHeader,
  SegmentedControl,
} from "@/components/layout"
import type { ContractWithRelations } from "@/types"

const BUYER_CONTRACT_TAB_VALUES = BUYER_CONTRACT_LIST_TABS.map((option) => option.value)

const BuyerContractsContent = () => {
  const hydrated = useHydrated()
  const actorId = getActorId(useAuthStore((s) => s.user))
  const getContractsForBuyer = useContractsStore((s) => s.getContractsForBuyer)
  const [tab, setTab] = useUrlTab<BuyerContractListTab>("tab", BUYER_CONTRACT_TAB_VALUES, "active")
  const useApi = isApiEnabled()
  const { data: apiContracts } = useContractsQuery(hydrated && useApi)

  const allContracts: ContractWithRelations[] = useApi
    ? ((apiContracts ?? []) as ContractWithRelations[])
    : hydrated
      ? getContractsForBuyer(actorId)
      : []
  const contracts = filterDealsByTab(allContracts, tab, "buyer")
  const { getName: getSupplierName } = usePublicSuppliersByActor(
    contracts.map((c) => c.supplier_actor_id),
  )

  return (
    <PageFrame>
      <PageHeader
        title="Мои сделки"
        description="Этап каждой сделки и что нужно сделать дальше"
      />

      <SegmentedControl
        value={tab}
        options={BUYER_CONTRACT_LIST_TABS}
        onChange={setTab}
        ariaLabel="Фильтр сделок"
      />

      {!hydrated || contracts.length === 0 ? (
        <PageEmptyState
          variant="card"
          icon={<FileCheck />}
          title="Сделок пока нет"
          description={buyerContractEmptyMessages[tab]}
        />
      ) : (
        <DealList
          contracts={contracts}
          role="buyer"
          getCounterpartName={(c) => getSupplierName(c.supplier_actor_id)}
        />
      )}
    </PageFrame>
  )
}

export default function BuyerContractsPage() {
  return (
    <Suspense fallback={null}>
      <BuyerContractsContent />
    </Suspense>
  )
}
