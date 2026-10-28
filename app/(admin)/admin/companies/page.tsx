"use client"

import { Suspense, useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AdminCompaniesContent } from "@/components/admin/companies/companies-list-panel"
import { CompanyChangesQueuePanel } from "@/components/admin/companies/company-changes-queue-panel"
import { AdminVerificationContent } from "@/components/admin/companies/verification-queue-panel"
import {
  PageFrame,
  PageHeader,
  SegmentedControl,
} from "@/components/layout"
import { useAdminDashboardQuery } from "@/hooks/api/use-admin-dashboard-query"
import {
  emptyAdminNavCounts,
  useAdminNavCounts,
} from "@/hooks/api/use-nav-counts-query"
import { pickHubTab } from "@/lib/admin-hub"

type CompaniesHubTab = "list" | "verification" | "changes"

const HUB_TABS: { value: CompaniesHubTab; label: string }[] = [
  { value: "verification", label: "Ждут проверки" },
  { value: "list", label: "Все компании" },
  { value: "changes", label: "Изменения данных" },
]

const HubSkeleton = () => (
  <PageFrame className="animate-pulse" aria-label="Загрузка">
    <div className="h-16 w-80 max-w-full rounded-xl bg-muted" />
    <div className="h-12 rounded-xl bg-muted" />
    <div className="h-96 rounded-xl bg-muted" />
  </PageFrame>
)

const CompaniesHub = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tab = pickHubTab(searchParams.get("tab"), HUB_TABS, () => true)
  const dashboardQuery = useAdminDashboardQuery()
  const navCounts = useAdminNavCounts().data ?? emptyAdminNavCounts()

  const setTab = useCallback(
    (next: CompaniesHubTab) => {
      const params = new URLSearchParams()
      if (next !== "list") params.set("tab", next)
      if (next === "list" && searchParams.get("status")) {
        params.set("status", searchParams.get("status")!)
      }
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname)
    },
    [pathname, router, searchParams],
  )

  const changesCount = dashboardQuery.data?.metrics.pending_company_changes ?? 0

  return (
    <PageFrame>
      <PageHeader
        title="Проверка компаний"
        description="Подтверждайте только после сверки всех пунктов"
      />

      <SegmentedControl
        value={tab}
        options={HUB_TABS.map((option) => {
          if (option.value === "verification" && navCounts.companies > 0) {
            return { ...option, count: navCounts.companies }
          }
          if (option.value === "changes") {
            return { ...option, count: changesCount }
          }
          return option
        })}
        onChange={setTab}
        ariaLabel="Разделы проверки компаний"
      />

      {tab === "verification" ? (
        <AdminVerificationContent embedded />
      ) : tab === "changes" ? (
        <CompanyChangesQueuePanel embedded />
      ) : (
        <AdminCompaniesContent embedded />
      )}
    </PageFrame>
  )
}

export default function AdminCompaniesPage() {
  return (
    <Suspense fallback={<HubSkeleton />}>
      <CompaniesHub />
    </Suspense>
  )
}
