"use client"

import { Suspense, useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AdminEscrowContent } from "@/components/admin/finance/escrow-list-panel"
import { AdminFinanceContent } from "@/components/admin/finance/finance-list-panel"
import { PageFrame, PageHeader, SegmentedControl } from "@/components/layout"
import { pickHubTab } from "@/lib/admin-hub"

type FinanceHubTab = "ledger" | "escrow"

const HUB_TABS: { value: FinanceHubTab; label: string }[] = [
  { value: "ledger", label: "Операции" },
  { value: "escrow", label: "Escrow" },
]

const HubSkeleton = () => (
  <PageFrame className="animate-pulse" aria-label="Загрузка">
    <div className="h-16 w-80 max-w-full rounded-xl bg-muted" />
    <div className="h-12 rounded-xl bg-muted" />
    <div className="h-96 rounded-xl bg-muted" />
  </PageFrame>
)

const FinanceHub = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tab = pickHubTab(searchParams.get("tab"), HUB_TABS, () => true)

  const setTab = useCallback(
    (next: FinanceHubTab) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete("page")
      params.delete("query")
      if (next === "escrow") {
        params.set("tab", "escrow")
        params.delete("view")
      } else {
        params.delete("tab")
      }
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname)
    },
    [pathname, router, searchParams],
  )

  return (
    <PageFrame>
      <PageHeader
        title="Выплаты"
        description="Выплаты поставщикам и средства на гарантии площадки"
      />

      <SegmentedControl
        value={tab}
        options={HUB_TABS}
        onChange={setTab}
        ariaLabel="Разделы выплат"
      />

      {tab === "escrow" ? (
        <AdminEscrowContent embedded />
      ) : (
        <AdminFinanceContent embedded />
      )}
    </PageFrame>
  )
}

export default function AdminFinancePage() {
  return (
    <Suspense fallback={<HubSkeleton />}>
      <FinanceHub />
    </Suspense>
  )
}
