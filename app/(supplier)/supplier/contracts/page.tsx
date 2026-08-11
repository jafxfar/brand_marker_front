"use client"

import { useState } from "react"
import { FileCheck } from "lucide-react"
import { cn } from "@/lib/utils"
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
  active: "Активные контракты появятся после принятия предложений",
  completed: "Завершённые контракты отобразятся здесь",
  disputed: "Спорных контрактов нет",
  cancelled: "Отменённых контрактов нет",
}

export default function SupplierContractsPage() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const getContractsByTab = useContractsStore((s) => s.getContractsByTab)
  const getCompany = useCompaniesStore((s) => s.getCompany)
  const [tab, setTab] = useState<ContractListTab>("active")
  const useApi = isApiEnabled()
  const { data: apiContracts, isLoading } = useSupplierContractsQuery(hydrated && useApi)

  const localContracts = hydrated ? getContractsByTab(actorId, tab) : []
  const contracts: ContractWithRelations[] = useApi
    ? filterContractsByTab((apiContracts ?? []) as ContractWithRelations[], tab)
    : localContracts

  const isEmpty = !hydrated || isLoading || contracts.length === 0

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <FileCheck size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Контракты</h1>
          <p className="text-sm text-muted-foreground">Управление сделками как поставщик</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1 mb-5 bg-card border border-border rounded-xl p-1 w-fit">
        {CONTRACT_LIST_TABS.map((t) => (
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

      {isEmpty ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <FileCheck size={32} className="text-primary mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">
            {isLoading ? "Загрузка контрактов..." : "Контрактов нет"}
          </p>
          {!isLoading && (
            <p className="text-xs text-muted-foreground mt-1">{emptyMessages[tab]}</p>
          )}
        </div>
      ) : (
        <ContractsListTable
          contracts={contracts}
          getBuyerName={(id) => getCompany(id)?.title ?? "Заказчик"}
        />
      )}
    </div>
  )
}
