import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { adminDashboardKeys } from "@/hooks/api/use-admin-dashboard-query"
import {
  adminApi,
  type AdminReportAction,
  type AdminReportParams,
  type AdminReportTargetType,
} from "@/lib/api/admin"

export const adminReportKeys = {
  all: ["admin-reports"] as const,
  lists: () => [...adminReportKeys.all, "list"] as const,
  list: (params: AdminReportParams) => [...adminReportKeys.lists(), params] as const,
  details: () => [...adminReportKeys.all, "detail"] as const,
  detail: (targetType: AdminReportTargetType, reportId: number) =>
    [...adminReportKeys.details(), targetType, reportId] as const,
}

export const useAdminReportsQuery = (params: AdminReportParams) =>
  useQuery({
    queryKey: adminReportKeys.list(params),
    queryFn: () => adminApi.getReports(params),
    placeholderData: keepPreviousData,
  })

export const useAdminReportQuery = (
  targetType: AdminReportTargetType | string,
  reportId: number,
) =>
  useQuery({
    queryKey: adminReportKeys.detail(targetType as AdminReportTargetType, reportId),
    queryFn: () =>
      adminApi.getReport(targetType as AdminReportTargetType, reportId),
    enabled:
      Number.isInteger(reportId) &&
      reportId > 0 &&
      ["catalog", "rfq", "proposal"].includes(targetType),
  })

export const useAdminReportActionMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      targetType,
      reportId,
      action,
      reason,
    }: {
      targetType: AdminReportTargetType
      reportId: number
      action: AdminReportAction
      reason?: string
    }) => adminApi.applyReportAction(targetType, reportId, action, reason),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminReportKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: adminReportKeys.detail(
            variables.targetType,
            variables.reportId,
          ),
        }),
        queryClient.invalidateQueries({ queryKey: adminDashboardKeys.all }),
      ])
    },
  })
}
