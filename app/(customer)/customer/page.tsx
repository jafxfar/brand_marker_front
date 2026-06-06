"use client"

import Link from "next/link"
import {
  FileText, Clock, Users, Wallet, Plus, Store, ArrowRight,
  ShoppingCart, type LucideIcon,
} from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useOrdersStore } from "@/lib/store/orders-store"
import { useCartStore } from "@/lib/store/cart-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { formatPrice, formatRelativeTime } from "@/lib/format"
import { orderStatusMeta } from "@/lib/order-display"

function StatCard({
  Icon, label, value, accent,
}: {
  Icon: LucideIcon; label: string; value: string; accent: string
}) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${accent}`}>
        <Icon size={18} />
      </div>
      <div className="text-2xl font-black text-foreground leading-none">{value}</div>
      <div className="text-xs text-muted-foreground mt-1.5">{label}</div>
    </div>
  )
}

export default function CustomerDashboard() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const orders = useOrdersStore((s) => s.orders)
  const cartTotal = useCartStore((s) => s.items.reduce((sum, i) => sum + i.price * i.qty, 0))

  const activeOrders = orders.filter((o) =>
    ["published", "in_progress", "disputed"].includes(o.status),
  )
  const totalOffers = orders.reduce((sum, o) => sum + o.offers.length, 0)
  const inEscrow = orders.reduce(
    (sum, o) => (o.payment?.escrow === "held" ? sum + (o.payment.amount - o.payment.releasedAmount) : sum),
    0,
  )
  const recentOrders = orders.slice(0, 5)

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">
            Здравствуйте{hydrated && user ? `, ${user.name}` : ""}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Обзор ваших заказов и активности на платформе
          </p>
        </div>
        <Link
          href="/customer/orders/new"
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-primary hover:bg-[oklch(0.58_0.22_38)] text-white text-sm font-bold transition-colors"
        >
          <Plus size={17} /> Создать заказ
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          Icon={FileText}
          label="Всего заказов"
          value={hydrated ? String(orders.length) : "—"}
          accent="bg-blue-100 text-blue-600"
        />
        <StatCard
          Icon={Clock}
          label="Активных заказов"
          value={hydrated ? String(activeOrders.length) : "—"}
          accent="bg-amber-100 text-amber-600"
        />
        <StatCard
          Icon={Users}
          label="Получено откликов"
          value={hydrated ? String(totalOffers) : "—"}
          accent="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          Icon={Wallet}
          label="В эскроу"
          value={hydrated ? formatPrice(inEscrow) : "—"}
          accent="bg-violet-100 text-violet-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 bg-white border border-border rounded-2xl">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-base font-bold text-foreground">Последние заказы</h2>
            <Link href="/customer/orders" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
              Все заказы <ArrowRight size={14} />
            </Link>
          </div>

          {!hydrated || recentOrders.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
                <FileText size={22} className="text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">Заказов пока нет</p>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Создайте первый заказ — товар или услугу
              </p>
              <Link
                href="/customer/orders/new"
                className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-[oklch(0.58_0.22_38)] transition-colors"
              >
                <Plus size={15} /> Создать заказ
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentOrders.map((o) => {
                const meta = orderStatusMeta[o.status]
                return (
                  <Link
                    key={o.id}
                    href={`/customer/orders/${o.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                      {o.kind === "product" ? (
                        <ShoppingCart size={17} className="text-primary" />
                      ) : (
                        <FileText size={17} className="text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{o.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {o.category} · {formatRelativeTime(o.createdAt)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-primary">{formatPrice(o.budget)}</div>
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${meta.className}`}>
                        {meta.label}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <Link
            href="/customer/suppliers"
            className="block bg-white border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-3">
              <Store size={18} className="text-primary" />
            </div>
            <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
              Каталог поставщиков
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Найдите проверенных поставщиков товаров и услуг
            </p>
          </Link>

          <Link
            href="/customer/cart"
            className="block rounded-2xl p-5 text-white hover:-translate-y-px transition-all"
            style={{ background: "linear-gradient(135deg, oklch(0.22 0.055 255) 0%, oklch(0.3 0.09 255) 100%)" }}
          >
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
              <ShoppingCart size={18} className="text-white" />
            </div>
            <p className="text-sm font-bold">Корзина</p>
            <p className="text-xs text-white/70 mt-1">
              {hydrated && cartTotal > 0 ? `Сумма: ${formatPrice(cartTotal)}` : "Корзина пуста"}
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
