"use client"

import Link from "next/link"
import { Plus, ShoppingBag, ChevronRight } from "lucide-react"
import { useHydrated } from "@/hooks/use-hydrated"
import { isApiEnabled } from "@/lib/api/config"
import { useOrdersStore } from "@/lib/store/orders-store"
import { useBuyerOrdersQuery } from "@/hooks/api/use-buyer-orders-query"
import { formatPrice, formatRelativeIso } from "@/lib/format"
import { orderStatusMeta } from "@/lib/order-display"
import { apiOrderToLocal, type Order } from "@/types"

export default function BuyerOrdersPage() {
  const hydrated = useHydrated()
  const useApi = isApiEnabled()
  const localOrders = useOrdersStore((s) => s.orders)
  const { data: apiOrders, isLoading } = useBuyerOrdersQuery(hydrated && useApi)

  const orders: Order[] = useApi
    ? (apiOrders ?? []).map(apiOrderToLocal)
    : localOrders

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
            <ShoppingBag size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Мои заказы</h1>
            <p className="text-sm text-muted-foreground">Маркетплейс-заказы и отклики поставщиков</p>
          </div>
        </div>
        <Link
          href="/customer/orders/new"
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold transition-colors"
        >
          <Plus size={17} /> Создать заказ
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {useApi && isLoading ? (
          <p className="p-8 text-sm text-muted-foreground text-center">Загрузка…</p>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-semibold text-foreground">Заказов пока нет</p>
            <p className="text-xs text-muted-foreground mt-1">
              Создайте заказ или оформите корзину из каталога поставщиков
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {orders.map((order) => {
              const meta = orderStatusMeta[order.status]
              const createdAt =
                typeof order.createdAt === "string"
                  ? formatRelativeIso(order.createdAt)
                  : formatRelativeIso(new Date(order.createdAt).toISOString())
              return (
                <Link
                  key={order.id}
                  href={`/customer/orders/${order.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-foreground truncate">{order.title}</p>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.className}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatPrice(order.budget)} · {order.offers.length} откликов · {createdAt}
                    </p>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
