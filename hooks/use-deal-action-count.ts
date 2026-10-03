"use client"

import { useAuthStore } from "@/lib/store/auth-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { isApiEnabled } from "@/lib/api/config"
import { getActorId } from "@/lib/auth-display"
import { useContractsQuery, useSupplierContractsQuery } from "@/hooks/api/use-contracts-query"
import { dealNeedsAction, type DealRole } from "@/lib/process/deal-stages"
import type { ContractWithRelations } from "@/types"

/** Number of deals where the current user must act (pay, accept, submit work). */
export const useDealActionCount = (role: DealRole): number => {
  const hydrated = useHydrated()
  const actorId = getActorId(useAuthStore((s) => s.user))
  const useApi = isApiEnabled()
  useContractsStore((s) => s.contracts)
  const getContractsForBuyer = useContractsStore((s) => s.getContractsForBuyer)
  const getContractsByTab = useContractsStore((s) => s.getContractsByTab)

  const { data: buyerContracts } = useContractsQuery(hydrated && useApi && role === "buyer")
  const { data: supplierContracts } = useSupplierContractsQuery(
    hydrated && useApi && role === "supplier",
  )

  if (!hydrated) return 0

  const contracts: ContractWithRelations[] = useApi
    ? (((role === "buyer" ? buyerContracts : supplierContracts) ?? []) as ContractWithRelations[])
    : role === "buyer"
      ? getContractsForBuyer(actorId)
      : getContractsByTab(actorId, "all")

  return contracts.filter((c) => dealNeedsAction(role, c)).length
}
