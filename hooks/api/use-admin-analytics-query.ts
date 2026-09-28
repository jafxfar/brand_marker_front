import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { adminApi, type AdminAnalyticsPeriod } from "@/lib/api/admin"

export const adminAnalyticsKeys = {
  all: ["admin-analytics"] as const,
  period: (period: AdminAnalyticsPeriod) => [...adminAnalyticsKeys.all, period] as const,
}

export const useAdminAnalyticsQuery = (period: AdminAnalyticsPeriod) =>
  useQuery({
    queryKey: adminAnalyticsKeys.period(period),
    queryFn: () => adminApi.getAnalytics(period),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })
