"use client"

import { Suspense, useCallback, useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AdminCatalogContent } from "@/components/admin/catalog/catalog-list-panel"
import { AdminReportsContent } from "@/components/admin/moderation/reports-list-panel"
import { AdminProposalsContent } from "@/components/admin/proposals/proposals-list-panel"
import { AdminRfqsContent } from "@/components/admin/rfqs/rfqs-list-panel"
import { PageFrame, PageHeader, SegmentedControl } from "@/components/layout"
import { useAdminPermission } from "@/hooks/use-admin-permission"
import { pickHubTab, type AdminHubTabOption } from "@/lib/admin-hub"

type ModerationTab = "catalog" | "reports" | "rfqs" | "proposals"

const ALL_TABS: AdminHubTabOption<ModerationTab>[] = [
  { value: "catalog", label: "Товары", permission: "admin_catalog.view" },
  { value: "reports", label: "Жалобы", permission: "admin_reports.view" },
  { value: "rfqs", label: "Заявки", permission: "admin_rfqs.view" },
  { value: "proposals", label: "КП", permission: "admin_proposals.view" },
]

const HubSkeleton = () => (
  <PageFrame className="animate-pulse" aria-label="Загрузка">
    <div className="h-16 w-80 max-w-full rounded-xl bg-muted" />
    <div className="h-12 rounded-xl bg-muted" />
    <div className="h-96 rounded-xl bg-muted" />
  </PageFrame>
)

const ModerationHub = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const canCatalog = useAdminPermission("admin_catalog.view")
  const canReports = useAdminPermission("admin_reports.view")
  const canRfqs = useAdminPermission("admin_rfqs.view")
  const canProposals = useAdminPermission("admin_proposals.view")

  const can = useCallback(
    (permission: string) => {
      if (permission === "admin_catalog.view") return canCatalog
      if (permission === "admin_reports.view") return canReports
      if (permission === "admin_rfqs.view") return canRfqs
      if (permission === "admin_proposals.view") return canProposals
      return false
    },
    [canCatalog, canProposals, canReports, canRfqs],
  )

  const tabs = useMemo(
    () => ALL_TABS.filter((tab) => !tab.permission || can(tab.permission)),
    [can],
  )

  const tab = pickHubTab(searchParams.get("tab"), tabs.length ? tabs : ALL_TABS, can)

  const setTab = useCallback(
    (next: ModerationTab) => {
      const params = new URLSearchParams()
      params.set("tab", next)
      if (next === "catalog" && searchParams.get("view")) {
        params.set("view", searchParams.get("view")!)
      }
      if (next === "catalog" && searchParams.get("status")) {
        params.set("status", searchParams.get("status")!)
      }
      router.replace(`${pathname}?${params.toString()}`)
    },
    [pathname, router, searchParams],
  )

  return (
    <PageFrame>
      <PageHeader
        title="Модерация"
        description="Новые товары и услуги публикуются только после одобрения модератора"
      />

      <SegmentedControl
        value={tab}
        options={tabs}
        onChange={setTab}
        ariaLabel="Разделы модерации"
      />

      {tab === "catalog" ? (
        <AdminCatalogContent embedded />
      ) : tab === "rfqs" ? (
        <AdminRfqsContent embedded />
      ) : tab === "proposals" ? (
        <AdminProposalsContent embedded />
      ) : (
        <AdminReportsContent embedded />
      )}
    </PageFrame>
  )
}

export default function AdminModerationPage() {
  return (
    <Suspense fallback={<HubSkeleton />}>
      <ModerationHub />
    </Suspense>
  )
}
