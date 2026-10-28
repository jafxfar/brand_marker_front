import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { adminApi, type AdminGatewayLogParams } from "@/lib/api/admin"

export const adminGatewayLogKeys = {
  all: ["admin-gateway-logs"] as const,
  list: (params: AdminGatewayLogParams) => [...adminGatewayLogKeys.all, "list", params] as const,
  detail: (logId: number) => [...adminGatewayLogKeys.all, "detail", logId] as const,
}

export const useAdminGatewayLogsQuery = (params: AdminGatewayLogParams) =>
  useQuery({
    queryKey: adminGatewayLogKeys.list(params),
    queryFn: () => adminApi.getGatewayLogs(params),
    placeholderData: keepPreviousData,
  })

export const useAdminGatewayLogQuery = (logId: number | null) =>
  useQuery({
    queryKey: adminGatewayLogKeys.detail(logId ?? 0),
    queryFn: () => adminApi.getGatewayLog(logId as number),
    enabled: Boolean(logId),
  })
