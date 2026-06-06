"use client"

import Link from "next/link"
import {
  Boxes, Inbox, CheckCircle2, Wallet, Plus, Crown, ArrowRight,
  ShoppingCart, FileText, type LucideIcon,
} from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useOrdersStore } from "@/lib/store/orders-store"
import { useListingsStore } from "@/lib/store/listings-store"
import { useSubscriptionStore } from "@/lib/store/subscription-store"
import { useHydrated } from "@/hooks/use-hydrated"
import { formatPrice, formatRelativeTime } from "@/lib/format"
import { orderStatusMeta } from "@/lib/order-display"
import { planName } from "@/lib/subscription"

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

export default function SupplierDashboard() {
  const hydrated = useHydrated()
  const user = useAuthStore((s) => s.user)
  const orders = useOrdersStore((s) => s.orders)
  const listings = useListingsStore((s) => s.items)
  const plan = useSubscriptionStore((s) => s.plan)
  const isActive = useSubscriptionStore((s) => s.isActive)

  const myId = user?.id
  const myListings = listings.filter((l) => l.supplierId === myId)
  const myOffers = orders.flatMap((o) =>
    o.offers.filter((of) => of.supplierId === myId).map((of) => ({ order: o, offer: of })),
  )
  const myDeals = orders.filter(
    (o) => o.acceptedOfferId && o.offers.some((of) => of.id === o.acceptedOfferId && of.supplierId === myId),
  )
  const available = orders.filter((o) => o.status === "published")

  const inEscrow = myDeals.reduce(
    (sum, o) => (o.payment?.escrow === "held" ? sum + (o.payment.amount - o.payment.releasedAmount) : sum),
    0,
  )
  const earned = myDeals.reduce(
    (sum, o) => (o.payment ? sum + o.payment.releasedAmount : sum),
    0,
  )

  const subActive = hydrated && isActive()

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">
            Здравствуйте{hydrated && user ? `, ${user.company?.trim() || user.name}` : ""}!
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Обзор ваших позиций, откликов и сделок
          </p>
        </div>
        <Link
          href="/supplier/listings/new"
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-primary hover:bg-[oklch(0.58_0.22_38)] text-white text-sm font-bold transition-colors"
        >
          <Plus size={17} /> Добавить позицию
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard Icon={Boxes} label="Товаров и услуг" value={hydrated ? String(myListings.length) : "—"} accent="bg-blue-100 text-blue-600" />
        <StatCard Icon={Inbox} label="Моих откликов" value={hydrated ? String(myOffers.length) : "—"} accent="bg-amber-100 text-amber-600" />
        <StatCard Icon={CheckCircle2} label="Принятых сделок" value={hydrated ? String(myDeals.length) : "—"} accent="bg-emerald-100 text-emerald-600" />
        <StatCard Icon={Wallet} label="Заработано" value={hydrated ? formatPrice(earned) : "—"} accent="bg-violet-100 text-violet-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available orders */}
        <div className="lg:col-span-2 bg-white border border-border rounded-2xl">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="text-base font-bold text-foreground">Доступные заказы</h2>
            <Link href="/supplier/orders" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
              Все заказы <ArrowRight size={14} />
            </Link>
          </div>

          {!hydrated || available.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
                <Inbox size={22} className="text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">Открытых заказов нет</p>
              <p className="text-xs text-muted-foreground mt-1">
                Новые заказы заказчиков появятся здесь
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {available.slice(0, 5).map((o) => {
                const meta = orderStatusMeta[o.status]
                const responded = o.offers.some((of) => of.supplierId === myId)
                return (
                  <Link
                    key={o.id}
                    href={`/supplier/orders/${o.id}`}
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
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${responded ? "bg-emerald-100 text-emerald-700" : meta.className}`}>
                        {responded ? "Вы откликнулись" : meta.label}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Side cards */}
        <div className="space-y-4">
          <Link
            href="/supplier/subscription"
            className="block rounded-2xl p-5 text-white hover:-translate-y-px transition-all"
            style={{ background: "linear-gradient(135deg, oklch(0.22 0.055 255) 0%, oklch(0.3 0.09 255) 100%)" }}
          >
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
              <Crown size={18} className="text-orange-300" />
            </div>
            <p className="text-sm font-bold">Продвижение</p>
            <p className="text-xs text-white/70 mt-1">
              {subActive ? `Активен тариф «${planName(plan)}»` : "Оформите подписку для продвижения"}
            </p>
          </Link>

          <Link
            href="/supplier/listings"
            className="block bg-white border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-3">
              <Boxes size={18} className="text-primary" />
            </div>
            <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
              Мои товары и услуги
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Управляйте каталогом и ценами
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
