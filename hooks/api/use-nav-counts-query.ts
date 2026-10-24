import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  navCountsApi,
  type AdminNavCounts,
  type BuyerNavCounts,
  type NavCountsRole,
  type SupplierNavCounts,
} from "@/lib/api/nav-counts"
import { isApiEnabled } from "@/lib/api/config"
import { useHydrated } from "@/hooks/use-hydrated"

export const navCountsKeys = {
  all: ["nav-counts"] as const,
  role: (role: NavCountsRole) => [...navCountsKeys.all, role] as const,
}

export const useNavCountsQuery = <R extends NavCountsRole>(
  role: R,
  enabled = true,
) => {
  const hydrated = useHydrated()
  return useQuery({
    queryKey: navCountsKeys.role(role),
    queryFn: () => navCountsApi.get(role),
    enabled: hydrated && enabled && isApiEnabled(),
    refetchInterval: 60_000,
    staleTime: 15_000,
  })
}

export const useBuyerNavCounts = (enabled = true) =>
  useNavCountsQuery("buyer", enabled)

export const useSupplierNavCounts = (enabled = true) =>
  useNavCountsQuery("supplier", enabled)

export const useAdminNavCounts = (enabled = true) =>
  useNavCountsQuery("admin", enabled)

export const useInvalidateNavCounts = () => {
  const queryClient = useQueryClient()
  return (role?: NavCountsRole) => {
    if (role) {
      void queryClient.invalidateQueries({ queryKey: navCountsKeys.role(role) })
      return
    }
    void queryClient.invalidateQueries({ queryKey: navCountsKeys.all })
  }
}

export const emptyBuyerNavCounts = (): BuyerNavCounts => ({
  rfqs: 0,
  deals: 0,
  messages: 0,
  approvals: 0,
})

export const emptySupplierNavCounts = (): SupplierNavCounts => ({
  rfqs: 0,
  deals: 0,
  messages: 0,
  catalog: 0,
})

export const emptyAdminNavCounts = (): AdminNavCounts => ({
  companies: 0,
  moderation: 0,
  support: 0,
  chats: 0,
  disputes: 0,
  finance: 0,
})
