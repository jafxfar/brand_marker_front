"use client"

import Link from "next/link"
import { Users, FileText, ChevronRight } from "lucide-react"
import { useHydrated } from "@/hooks/use-hydrated"
import { isApiEnabled } from "@/lib/api/config"
import { useSupplierCustomersQuery } from "@/hooks/api/use-supplier-orders-query"
import { useOrdersStore } from "@/lib/store/orders-store"
import { formatPrice } from "@/lib/format"
import type { Order } from "@/types"

interface CustomerGroup {
  id: string
  name: string
  city?: string
  orders: Order[]
  totalBudget: number
}

export default function SupplierCustomersPage() {
  const hydrated = useHydrated()
  const useApi = isApiEnabled()
  const orders = useOrdersStore((s) => s.orders)
  const { data: apiCustomers, isLoading } = useSupplierCustomersQuery(hydrated && useApi)

  const localGroups = new Map<string, CustomerGroup>()
  if (!useApi) {
    for (const o of orders) {
      const id = o.customerId ?? "unknown"
      const existing = localGroups.get(id)
      if (existing) {
        existing.orders.push(o)
        existing.totalBudget += o.budget
      } else {
        localGroups.set(id, {
          id,
          name: o.customerName ?? "Заказчик",
          city: o.customerCity,
          orders: [o],
          totalBudget: o.budget,
        })
      }
    }
  }
  const localCustomers = Array.from(localGroups.values())

  if (!hydrated || (useApi && isLoading)) {
    return (
      <div className="max-w-[900px] mx-auto animate-pulse">
        <div className="h-10 bg-secondary rounded w-1/3 mb-6" />
        <div className="h-32 bg-secondary rounded-xl" />
      </div>
    )
  }

  const customers = useApi
    ? (apiCustomers ?? []).map((c) => ({
        id: String(c.buyer_actor_id),
        name: c.buyer_name,
        orders: [] as Order[],
        totalBudget: c.total_budget,
        orderCount: c.order_count,
      }))
    : localCustomers.map((c) => ({ ...c, orderCount: c.orders.length }))

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Users size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Заказчики</h1>
          <p className="text-sm text-muted-foreground">Клиенты по завершённым и активным сделкам</p>
        </div>
      </div>

      {customers.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Users size={32} className="text-primary mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground">Заказчиков пока нет</p>
          <p className="text-xs text-muted-foreground mt-1">
            Заказчики появятся после принятых заказов
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <Users size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{customer.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {customer.orderCount} заказов · {formatPrice(customer.totalBudget)}
                </p>
              </div>
              {!useApi && customer.orders[0] && (
                <Link
                  href={`/supplier/orders/${customer.orders[0].id}`}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                >
                  Сделки <ChevronRight size={14} />
                </Link>
              )}
              {useApi && (
                <FileText size={18} className="text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
