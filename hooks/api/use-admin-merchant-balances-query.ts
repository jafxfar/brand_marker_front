import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { adminApi, type AdminMerchantBalancesParams } from "@/lib/api/admin"

export const adminMerchantBalancesKeys = {
  all: ["admin-merchant-balances"] as const,
  list: (params: AdminMerchantBalancesParams) =>
    [...adminMerchantBalancesKeys.all, "list", params] as const,
}

export const useAdminMerchantBalancesQuery = (params: AdminMerchantBalancesParams) =>
  useQuery({
    queryKey: adminMerchantBalancesKeys.list(params),
    queryFn: () => adminApi.getMerchantBalances(params),
    placeholderData: keepPreviousData,
  })
