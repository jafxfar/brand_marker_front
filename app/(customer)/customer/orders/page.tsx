"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Plus, FileText, ShoppingCart, Users, Truck, ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useOrdersStore } from "@/lib/store/orders-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { formatPrice, formatRelativeTime } from "@/lib/format"
import { orderStatusMeta } from "@/lib/order-display"
import type { OrderStatus } from "@/types"

type Filter = "all" | "active" | "completed"

const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "active", label: "Активные" },
  { value: "completed", label: "Завершённые" },
]

const activeStatuses: OrderStatus[] = ["published", "in_progress", "disputed"]

export default function OrdersListPage() {
  const hydrated = useHydrated()
  const orders = useOrdersStore((s) => s.orders)
  const [filter, setFilter] = useState<Filter>("all")

  const filtered = orders.filter((o) => {
    if (filter === "active") return activeStatuses.includes(o.status)
    if (filter === "completed") return ["completed", "cancelled"].includes(o.status)
    return true
  })

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">Мои заказы</h1>
          <p className="text-sm text-muted-foreground mt-1">Управляйте заказами и откликами поставщиков</p>
        </div>
        <Link
          href="/customer/orders/new"
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-primary hover:bg-[oklch(0.58_0.22_38)] text-white text-sm font-bold transition-colors"
        >
          <Plus size={17} /> Создать заказ
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 mb-5 bg-white border border-border rounded-xl p-1 w-fit">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
              filter === f.value ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!hydrated ? null : filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <FileText size={26} className="text-primary" />
          </div>
          <p className="text-base font-bold text-foreground">Заказов не найдено</p>
          <p className="text-sm text-muted-foreground mt-1 mb-5">
            {filter === "all" ? "Создайте первый заказ — товар или услугу" : "В этой категории пока пусто"}
          </p>
          <Link
            href="/customer/orders/new"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-[oklch(0.58_0.22_38)] transition-colors"
          >
            <Plus size={16} /> Создать заказ
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const meta = orderStatusMeta[o.status]
            return (
              <Link
                key={o.id}
                href={`/customer/orders/${o.id}`}
                className="flex items-center gap-4 bg-white border border-border rounded-2xl p-4 hover:border-primary/30 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  {o.kind === "product" ? (
                    <ShoppingCart size={20} className="text-primary" />
                  ) : (
                    <FileText size={20} className="text-primary" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {o.title}
                    </h3>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0", meta.className)}>
                      {meta.label}
                    </span>
                  </div>
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                    <span>{o.category}</span>
                    <span className="flex items-center gap-1">
                      <Users size={11} /> {o.offers.length} откликов
                    </span>
                    {o.needsDelivery && (
                      <span className="flex items-center gap-1">
                        <Truck size={11} /> доставка
                      </span>
                    )}
                    <span>{formatRelativeTime(o.createdAt)}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 hidden sm:block">
                  <div className="text-sm font-black text-primary">{formatPrice(o.budget)}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {o.kind === "product" ? "Товар" : "Услуга"}
                  </div>
                </div>
                <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
