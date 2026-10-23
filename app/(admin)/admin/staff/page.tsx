"use client"

import { Suspense, useCallback, useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AdminRolesPanel } from "@/components/admin/roles/roles-panel"
import { AdminStaffPanel } from "@/components/admin/staff/staff-panel"
import { PageFrame, PageHeader, SegmentedControl } from "@/components/layout"
import { useAdminPermission } from "@/hooks/use-admin-permission"
import { hasPermission } from "@/lib/admin-permissions"
import { pickHubTab, type AdminHubTabOption } from "@/lib/admin-hub"
import { useAuthStore } from "@/lib/store/auth-store"

type AccessHubTab = "staff" | "roles"

const ALL_TABS: AdminHubTabOption<AccessHubTab>[] = [
  { value: "staff", label: "Сотрудники", permission: "admin_staff.view" },
  { value: "roles", label: "Роли", permission: "roles.manage" },
]

const HubSkeleton = () => (
  <PageFrame className="animate-pulse" aria-label="Загрузка">
    <div className="h-16 w-80 max-w-full rounded-xl bg-muted" />
    <div className="h-12 rounded-xl bg-muted" />
    <div className="h-96 rounded-xl bg-muted" />
  </PageFrame>
)

const AccessHub = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const canStaff = useAdminPermission("admin_staff.view")
  const canRoles = hasPermission(user, "roles.manage")

  const can = useCallback(
    (permission: string) => {
      if (permission === "admin_staff.view") return canStaff
      if (permission === "roles.manage") return canRoles
      return false
    },
    [canRoles, canStaff],
  )

  const tabs = useMemo(
    () => ALL_TABS.filter((tab) => !tab.permission || can(tab.permission)),
    [can],
  )

  const tab = pickHubTab(searchParams.get("tab"), tabs.length ? tabs : ALL_TABS, can)

  const setTab = useCallback(
    (next: AccessHubTab) => {
      const params = new URLSearchParams()
      if (next !== "staff") params.set("tab", next)
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname)
    },
    [pathname, router],
  )

  return (
    <PageFrame>
      <PageHeader
        title="Доступ"
        description="Сотрудники панели и матрица ролей"
      />

      <SegmentedControl
        value={tab}
        options={tabs}
        onChange={setTab}
        ariaLabel="Доступ к панели"
      />

      {tab === "roles" ? <AdminRolesPanel embedded /> : <AdminStaffPanel embedded />}
    </PageFrame>
  )
}

export default function AdminStaffPage() {
  return (
    <Suspense fallback={<HubSkeleton />}>
      <AccessHub />
    </Suspense>
  )
}
