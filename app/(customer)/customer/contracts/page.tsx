"use client"

import { useState } from "react"
import { FileCheck } from "lucide-react"
import { cn } from "@/lib/utils"
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
    <div className="max-w-[1000px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <FileCheck size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Контракты</h1>
          <p className="text-sm text-muted-foreground">Управление сделками как заказчик</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 mb-5 bg-white border border-border rounded-xl p-1 w-fit">
        {BUYER_CONTRACT_LIST_TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
              tab === t.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!hydrated || contracts.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <FileCheck size={32} className="text-primary mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">Контрактов нет</p>
          <p className="text-xs text-muted-foreground mt-1">{buyerContractEmptyMessages[tab]}</p>
        </div>
      ) : (
        <BuyerContractsListTable
          contracts={contracts}
          getSupplierName={(id) => getCompany(id)?.title ?? "Поставщик"}
        />
      )}
    </div>
  )
}
