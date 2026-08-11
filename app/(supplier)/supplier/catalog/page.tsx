"use client"

import { useState } from "react"
import Link from "next/link"
import { Boxes, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/store/auth-store"
import { useItemsStore } from "@/lib/store/items-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { isApiEnabled } from "@/lib/api/config"
import { useSupplierCatalogQuery } from "@/hooks/api/use-supplier-catalog-query"
import { CatalogItemsTable } from "@/components/supplier/catalog/catalog-items-table"
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
    <div className="max-w-[1100px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Boxes size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Каталог</h1>
            <p className="text-sm text-muted-foreground">Мои товары и услуги</p>
          </div>
        </div>
        <Link
          href="/supplier/catalog/new"
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-colors"
        >
          <Plus size={17} />
          Добавить позицию
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-1 mb-5 bg-card border border-border rounded-xl p-1 w-fit max-w-full">
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cn(
              "px-3 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap",
              tab === t.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!hydrated || (useApi && isLoading) ? (
        <div className="bg-card border border-border rounded-xl p-12 animate-pulse">
          <div className="h-4 bg-secondary rounded w-1/3 mx-auto" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Boxes size={32} className="text-primary mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">Каталог пуст</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Добавьте товары или услуги для отображения в профиле
          </p>
          <Link
            href="/supplier/catalog/new"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold"
          >
            <Plus size={15} />
            Добавить позицию
          </Link>
        </div>
      ) : (
        <CatalogItemsTable items={items} />
      )}
    </div>
  )
}
