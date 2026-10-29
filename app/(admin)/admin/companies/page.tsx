"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AdminCompaniesContent } from "@/components/admin/companies/companies-list-panel"
import { PageFrame } from "@/components/layout"

const LEGACY_VERIFICATION_TABS = new Set(["verification", "changes"])

const ListSkeleton = () => (
  <PageFrame className="animate-pulse" aria-label="Загрузка">
    <div className="h-16 w-80 max-w-full rounded-xl bg-muted" />
    <div className="h-28 rounded-xl bg-muted" />
    <div className="h-96 rounded-xl bg-muted" />
  </PageFrame>
)

const CompaniesPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const legacyTab = searchParams.get("tab")
  const redirecting = legacyTab != null && LEGACY_VERIFICATION_TABS.has(legacyTab)

  useEffect(() => {
    if (!redirecting) return
    const params = new URLSearchParams(searchParams.toString())
    if (legacyTab === "verification") params.delete("tab")
    const qs = params.toString()
    router.replace(qs ? `/admin/verification?${qs}` : "/admin/verification")
  }, [legacyTab, redirecting, router, searchParams])

  if (redirecting) return <ListSkeleton />
  return <AdminCompaniesContent />
}

export default function AdminCompaniesPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <CompaniesPage />
    </Suspense>
  )
}
