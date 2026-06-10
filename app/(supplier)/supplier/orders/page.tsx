"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Inbox, ShoppingCart, FileText, Users, Truck, ChevronRight, MapPin,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/store/auth-store"
import { useOrdersStore } from "@/lib/store/orders-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { formatPrice, formatRelativeTime } from "@/lib/format"
import { orderStatusMeta } from "@/lib/order-display"
import type { Order } from "@/types"

type Tab = "available" | "responded" | "deals"

const tabs: { value: Tab; label: string }[] = [
  { value: "available", label: "Доступные" },
  { value: "responded", label: "Мои отклики" },
  { value: "deals", label: "В работе" },
]

export default function SupplierOrdersPage() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const orders = useOrdersStore((s) => s.orders)
  const [tab, setTab] = useState<Tab>("available")

  const myId = user?.id
  const respondedTo = (o: Order) => o.offers.some((of) => of.supplierId === myId)
  const isMyDeal = (o: Order) =>
    !!o.acceptedOfferId && o.offers.some((of) => of.id === o.acceptedOfferId && of.supplierId === myId)

  const lists: Record<Tab, Order[]> = {
    available: orders.filter((o) => o.status === "published"),
    responded: orders.filter(respondedTo),
    deals: orders.filter(isMyDeal),
  }
  const filtered = lists[tab]

  const emptyText: Record<Tab, string> = {
    available: "Открытых заказов пока нет. Заказы заказчиков появятся здесь.",
    responded: "Вы ещё не откликались на заказы.",
    deals: "Нет принятых заказов в работе.",
  }

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Inbox size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Заказы</h1>
          <p className="text-sm text-muted-foreground">Откликайтесь на заказы и ведите сделки</p>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-5 bg-white border border-border rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
              tab === t.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {hydrated && lists[t.value].length > 0 && (
              <span className={cn("ml-1.5", tab === t.value ? "text-white/80" : "text-muted-foreground/60")}>
                {lists[t.value].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {!hydrated ? null : filtered.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Inbox size={26} className="text-primary" />
          </div>
          <p className="text-base font-bold text-foreground">Пусто</p>
          <p className="text-sm text-muted-foreground mt-1">{emptyText[tab]}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((o) => {
            const meta = orderStatusMeta[o.status]
            const responded = respondedTo(o)
            return (
              <Link
                key={o.id}
                href={`/supplier/orders/${o.id}`}
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
                    {tab === "available" && responded ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex-shrink-0">
                        Вы откликнулись
                      </span>
                    ) : (
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0", meta.className)}>
                        {meta.label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                    <span>{o.category}</span>
                    {o.customerName && <span>{o.customerName}</span>}
                    {o.customerCity && (
                      <span className="flex items-center gap-1"><MapPin size={11} /> {o.customerCity}</span>
                    )}
                    <span className="flex items-center gap-1"><Users size={11} /> {o.offers.length} откликов</span>
                    {o.needsDelivery && (
                      <span className="flex items-center gap-1"><Truck size={11} /> доставка</span>
                    )}
                    <span>{formatRelativeTime(o.createdAt)}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 hidden sm:block">
                  <div className="text-sm font-black text-primary">{formatPrice(o.budget)}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{o.kind === "product" ? "Товар" : "Услуга"}</div>
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
