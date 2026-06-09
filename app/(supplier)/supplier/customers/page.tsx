"use client"

import Link from "next/link"
import { Users, MapPin, FileText, ChevronRight, User } from "lucide-react"
import { useOrdersStore } from "@/lib/store/orders-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { formatPrice, formatRelativeTime } from "@/lib/format"
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
  const orders = useOrdersStore((s) => s.orders)

  const groups = new Map<string, CustomerGroup>()
  for (const o of orders) {
    const id = o.customerId ?? "unknown"
    const existing = groups.get(id)
    if (existing) {
      existing.orders.push(o)
      existing.totalBudget += o.budget
    } else {
      groups.set(id, {
        id,
        name: o.customerName ?? "Заказчик",
        city: o.customerCity,
        orders: [o],
        totalBudget: o.budget,
      })
    }
  }
  const customers = Array.from(groups.values())

  return (
    <div className="max-w-[1000px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Users size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Заказчики</h1>
          <p className="text-sm text-muted-foreground">Компании, разместившие заказы на платформе</p>
        </div>
      </div>

      {!hydrated ? null : customers.length === 0 ? (
        <div className="bg-white border border-border rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Users size={26} className="text-primary" />
          </div>
          <p className="text-base font-bold text-foreground">Заказчиков пока нет</p>
          <p className="text-sm text-muted-foreground mt-1">
            Как только появятся заказы, здесь отобразятся их авторы
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {customers.map((c) => (
            <div key={c.id} className="bg-white border border-border rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <User size={22} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{c.name}</p>
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                    {c.city && <span className="flex items-center gap-1"><MapPin size={11} /> {c.city}</span>}
                    <span className="flex items-center gap-1"><FileText size={11} /> {c.orders.length} заказов</span>
                    <span>Общий бюджет: {formatPrice(c.totalBudget)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-border pt-3 space-y-1">
                {c.orders.map((o) => (
                  <Link
                    key={o.id}
                    href={`/supplier/orders/${o.id}`}
                    className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-secondary/60 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                        {o.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {o.category} · {formatRelativeTime(o.createdAt)}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-primary flex-shrink-0">{formatPrice(o.budget)}</span>
                    <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
