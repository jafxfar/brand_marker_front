"use client"

import { useState } from "react"
import Link from "next/link"
import { Boxes, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/store/auth-store"
import { useItemsStore } from "@/lib/store/items-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { getActorId } from "@/lib/auth-display"
import { CatalogItemsTable } from "@/components/supplier/catalog/catalog-items-table"
import type { ItemStatus } from "@/types"

type Tab = "all" | ItemStatus

const tabs: { value: Tab; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "draft", label: "Черновики" },
  { value: "active", label: "Активные" },
  { value: "archived", label: "Архив" },
]

export default function SupplierCatalogPage() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const actorId = getActorId(user)
  const getItemsBySupplier = useItemsStore((s) => s.getItemsBySupplier)
  const getItemsByStatus = useItemsStore((s) => s.getItemsByStatus)
  const [tab, setTab] = useState<Tab>("all")

  const items =
    hydrated && tab === "all"
      ? getItemsBySupplier(actorId)
      : hydrated
        ? getItemsByStatus(actorId, tab)
        : []

  return (
    <div className="max-w-[1100px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <Boxes size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Каталог</h1>
            <p className="text-sm text-muted-foreground">Мои товары и услуги</p>
          </div>
        </div>
        <Link
          href="/supplier/catalog/new"
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-primary hover:bg-primary-dark text-primary-foreground text-sm font-bold transition-colors"
        >
          <Plus size={17} /> Создать позицию
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-1 mb-5 bg-white border border-border rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
              tab === t.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!hydrated ? (
        <div className="bg-white border border-border rounded-2xl p-12 animate-pulse">
          <div className="h-4 bg-secondary rounded w-1/3 mx-auto" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <Boxes size={32} className="text-primary mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">Позиций нет</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            {tab === "all"
              ? "Создайте первую позицию в каталоге"
              : "Нет позиций для выбранного фильтра"}
          </p>
          <Link
            href="/supplier/catalog/new"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-bold"
          >
            <Plus size={15} /> Создать позицию
          </Link>
        </div>
      ) : (
        <CatalogItemsTable items={items} />
      )}
    </div>
  )
}
