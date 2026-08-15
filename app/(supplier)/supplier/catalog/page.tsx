"use client"

import { useState } from "react"
import Link from "next/link"
import { Boxes, Plus } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useItemsStore } from "@/lib/store/items-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { isApiEnabled } from "@/lib/api/config"
import { useSupplierCatalogQuery } from "@/hooks/api/use-supplier-catalog-query"
import { CatalogItemsTable } from "@/components/supplier/catalog/catalog-items-table"
import { Button } from "@/components/ui/button"
import {
  PageEmptyState,
  PageFrame,
  PageHeader,
  PageSurface,
  SegmentedControl,
} from "@/components/layout"
import type { ItemStatus } from "@/types"

type Tab = "all" | ItemStatus

const tabs: { value: Tab; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "draft", label: "Черновики" },
  { value: "pending_review", label: "На модерации" },
  { value: "changes_requested", label: "Нужны правки" },
  { value: "active", label: "Активные" },
  { value: "hidden", label: "Скрытые" },
  { value: "archived", label: "Архив" },
]

export default function SupplierCatalogPage() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const getItemsBySupplier = useItemsStore((s) => s.getItemsBySupplier)
  const getItemsByStatus = useItemsStore((s) => s.getItemsByStatus)
  const [tab, setTab] = useState<Tab>("all")
  const useApi = isApiEnabled()

  const apiStatus: ItemStatus | undefined = tab === "all" ? undefined : tab
  const { data: apiItems, isLoading } = useSupplierCatalogQuery(
    apiStatus,
    hydrated && useApi,
  )

  const localItems = !hydrated
    ? []
    : tab === "all"
      ? getItemsBySupplier(actorId)
      : getItemsByStatus(actorId, tab)

  const items = useApi ? (apiItems ?? []) : localItems

  return (
    <PageFrame>
      <PageHeader
        title="Каталог"
        description="Мои товары и услуги"
        actions={
          <Button asChild size="lg">
            <Link href="/supplier/catalog/new">
              <Plus size={17} />
              Добавить позицию
            </Link>
          </Button>
        }
      />

      <SegmentedControl
        value={tab}
        options={tabs}
        onChange={setTab}
        ariaLabel="Статус позиции"
      />

      {!hydrated || (useApi && isLoading) ? (
        <PageSurface className="animate-pulse p-12">
          <div className="mx-auto h-4 w-1/3 rounded bg-secondary" />
        </PageSurface>
      ) : items.length === 0 ? (
        <PageSurface>
          <PageEmptyState
            icon={<Boxes size={32} />}
            title="Каталог пуст"
            description="Добавьте товары или услуги для отображения в профиле"
          />
          <div className="flex justify-center pb-10">
            <Button asChild size="lg">
              <Link href="/supplier/catalog/new">
                <Plus size={15} />
                Добавить позицию
              </Link>
            </Button>
          </div>
        </PageSurface>
      ) : (
        <PageSurface>
          <CatalogItemsTable items={items} />
        </PageSurface>
      )}
    </PageFrame>
  )
}
