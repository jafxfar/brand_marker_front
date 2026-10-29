"use client"

import { Suspense } from "react"
import { AdminCatalogItemsPage } from "@/components/admin/catalog/catalog-items-page"
import { PageFrame } from "@/components/layout"

const PageSkeleton = () => (
  <PageFrame className="animate-pulse" aria-label="Загрузка каталога">
    <div className="h-16 w-80 max-w-full rounded-xl bg-muted" />
    <div className="h-40 rounded-xl bg-muted" />
    <div className="h-96 rounded-xl bg-muted" />
  </PageFrame>
)

export default function AdminCatalogPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AdminCatalogItemsPage />
    </Suspense>
  )
}
