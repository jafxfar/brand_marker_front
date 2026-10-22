"use client"

import { useAuthStore } from "@/lib/store/auth-store"
import { useContractsStore } from "@/lib/store/contracts-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { isApiEnabled } from "@/lib/api/config"
import { getActorId } from "@/lib/auth-display"
import { useContractsQuery, useSupplierContractsQuery } from "@/hooks/api/use-contracts-query"
import { getBuyerUnreadMessageCount } from "@/lib/buyer-dashboard"
import { getSupplierUnreadMessageCount } from "@/lib/supplier-dashboard"
import type { ContractWithRelations } from "@/types"

type MessagesRole = "buyer" | "supplier"

/** Unread contract chat messages for the current user (not platform notifications). */
export const useUnreadMessagesCount = (role: MessagesRole): number => {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const userId = user?.userId ?? 0
  const useApi = isApiEnabled()
  useContractsStore((s) => s.contracts)
  const getUnreadMessageCountForBuyer = useContractsStore((s) => s.getUnreadMessageCountForBuyer)
  const getUnreadMessageCount = useContractsStore((s) => s.getUnreadMessageCount)

  const { data: buyerContracts } = useContractsQuery(hydrated && useApi && role === "buyer")
  const { data: supplierContracts } = useSupplierContractsQuery(
    hydrated && useApi && role === "supplier",
  )

  if (!hydrated) return 0

  if (!useApi) {
    return role === "buyer"
      ? getUnreadMessageCountForBuyer(actorId)
      : getUnreadMessageCount(actorId, actorId)
  }

  if (!userId) return 0

  const contracts = (
    (role === "buyer" ? buyerContracts?.items : supplierContracts?.items) ?? []
  ) as ContractWithRelations[]

  return role === "buyer"
    ? getBuyerUnreadMessageCount(contracts, userId)
    : getSupplierUnreadMessageCount(contracts, userId)
}
