import { useQuery } from "@tanstack/react-query"
import { adminApi } from "@/lib/api/admin"

export const adminDashboardKeys = {
  all: ["admin-dashboard"] as const,
  detail: () => [...adminDashboardKeys.all, "detail"] as const,
}

export const useAdminDashboardQuery = () =>
  useQuery({
    queryKey: adminDashboardKeys.detail(),
    queryFn: adminApi.getDashboard,
    staleTime: 30_000,
  })
