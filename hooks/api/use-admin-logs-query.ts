import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { adminApi, type AdminLogParams } from "@/lib/api/admin"

export const adminLogKeys = {
  all: ["admin-logs"] as const,
  list: (params: AdminLogParams) => [...adminLogKeys.all, "list", params] as const,
  detail: (logId: number) => [...adminLogKeys.all, "detail", logId] as const,
}

export const useAdminLogsQuery = (params: AdminLogParams) =>
  useQuery({
    queryKey: adminLogKeys.list(params),
    queryFn: () => adminApi.getLogs(params),
    placeholderData: keepPreviousData,
  })

export const useAdminLogQuery = (logId: number | null) =>
  useQuery({
    queryKey: adminLogKeys.detail(logId ?? 0),
    queryFn: () => adminApi.getLog(logId as number),
    enabled: Boolean(logId),
  })
