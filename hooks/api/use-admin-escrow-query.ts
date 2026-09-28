import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { adminApi, type AdminEscrowParams } from "@/lib/api/admin"

export const adminEscrowKeys = {
  all: ["admin-escrow"] as const,
  list: (params: AdminEscrowParams) => [...adminEscrowKeys.all, "list", params] as const,
}

export const useAdminEscrowQuery = (params: AdminEscrowParams) =>
  useQuery({
    queryKey: adminEscrowKeys.list(params),
    queryFn: () => adminApi.getEscrow(params),
    placeholderData: keepPreviousData,
  })
